"""Read and enforce the renderer-neutral Lineups cue contract."""

from __future__ import annotations

import json
import math
from dataclasses import dataclass
from fractions import Fraction
from pathlib import Path
from typing import Any


class CueContractError(ValueError):
    """Raised when a scene cannot safely execute the approved cue contract."""


@dataclass(frozen=True)
class Cue:
    cue_id: str
    element_id: str
    trigger_type: str
    trigger_text: str
    transcript_timestamp: float
    scene_time: float
    action: str
    duration: float


class CueContract:
    """A small runtime view of the manifest's motion section."""

    def __init__(self, manifest: dict[str, Any], source: Path | None = None):
        if manifest.get("schemaVersion") != 2:
            raise CueContractError("Lineups cue execution requires manifest schemaVersion 2")

        motion = manifest.get("motion") or {}
        if motion.get("engine") != "manim":
            raise CueContractError("CueContract can render only a motion.engine of manim")

        frame_rate = motion.get("frameRate") or {}
        numerator = frame_rate.get("numerator")
        denominator = frame_rate.get("denominator")
        if not isinstance(numerator, int) or numerator <= 0 or not isinstance(denominator, int) or denominator <= 0:
            raise CueContractError("motion.frameRate needs positive integer numerator and denominator")

        timing = manifest.get("timing") or {}
        anchor = self._number(timing.get("verifiedAnchorTimestamp"), "verifiedAnchorTimestamp")
        raw_cues = motion.get("cues")
        if not isinstance(raw_cues, list) or not raw_cues:
            raise CueContractError("motion.cues cannot be empty")

        cues: list[Cue] = []
        seen: set[str] = set()
        previous_time = -1.0
        for raw in raw_cues:
            cue_id = str(raw.get("cueId") or "")
            if not cue_id or cue_id in seen:
                raise CueContractError("motion cue IDs must be present and unique")
            seen.add(cue_id)
            scene_time = self._number(raw.get("sceneTime"), f"{cue_id}.sceneTime")
            transcript_time = self._number(raw.get("transcriptTimestamp"), f"{cue_id}.transcriptTimestamp")
            duration = self._number(raw.get("duration"), f"{cue_id}.duration")
            if min(scene_time, transcript_time, duration) < 0:
                raise CueContractError(f"motion cue {cue_id} timing cannot be negative")
            if abs((transcript_time - anchor) - scene_time) > 0.001:
                raise CueContractError(f"motion cue {cue_id} does not match the verified transcript anchor")
            if scene_time + 0.001 < previous_time:
                raise CueContractError("motion cues must stay in scene-time order")
            previous_time = scene_time
            cues.append(
                Cue(
                    cue_id=cue_id,
                    element_id=str(raw.get("elementId") or ""),
                    trigger_type=str(raw.get("triggerType") or ""),
                    trigger_text=str(raw.get("triggerText") or ""),
                    transcript_timestamp=transcript_time,
                    scene_time=scene_time,
                    action=str(raw.get("action") or ""),
                    duration=duration,
                )
            )

        self.manifest = manifest
        self.source = source
        self.engine_version = str(motion.get("engineVersion") or "")
        self.frame_rate = Fraction(numerator, denominator)
        self.frame_duration = float(1 / self.frame_rate)
        self.pixel_width = int((manifest.get("export") or {}).get("dimensions", {}).get("width", 1920))
        self.pixel_height = int((manifest.get("export") or {}).get("dimensions", {}).get("height", 1080))
        self._cues = tuple(cues)
        self._by_id = {cue.cue_id: cue for cue in cues}

    @classmethod
    def from_path(cls, path: str | Path) -> "CueContract":
        source = Path(path).expanduser().resolve()
        try:
            manifest = json.loads(source.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise CueContractError(f"Lineups manifest could not be read: {error}") from error
        return cls(manifest, source)

    @property
    def cues(self) -> tuple[Cue, ...]:
        return self._cues

    def cue(self, cue_id: str) -> Cue:
        try:
            return self._by_id[cue_id]
        except KeyError as error:
            raise CueContractError(f"Unknown Lineups cue: {cue_id}") from error

    def delay_until(self, cue_id: str, current_time: float) -> float:
        cue = self.cue(cue_id)
        current = self._number(current_time, "current scene time")
        delay = cue.scene_time - current
        if delay < -(self.frame_duration + 0.001):
            raise CueContractError(
                f"Scene passed cue {cue_id} by {abs(delay):.6f} seconds; repair the prior animation timing"
            )
        return max(0.0, delay)

    @staticmethod
    def _number(value: Any, label: str) -> float:
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
            raise CueContractError(f"{label} must be a finite number")
        return float(value)
