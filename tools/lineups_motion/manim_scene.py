"""Manim scene helpers that execute the approved Lineups cue schedule."""

from __future__ import annotations

import os
from pathlib import Path

from manim import Scene, config

from .cue_contract import CueContract, CueContractError


def configure_manim_from_manifest(path: str | Path | None = None) -> CueContract:
    """Load one manifest and configure Manim before the scene is rendered."""
    manifest_path = path or os.environ.get("LINEUPS_MANIFEST_PATH")
    if not manifest_path:
        raise CueContractError("Set LINEUPS_MANIFEST_PATH or pass a manifest path")
    contract = CueContract.from_path(manifest_path)
    config.pixel_width = contract.pixel_width
    config.pixel_height = contract.pixel_height
    config.frame_rate = float(contract.frame_rate)
    config.frame_width = 16.0
    config.frame_height = 9.0
    return contract


class TranscriptTimedScene(Scene):
    """Base scene with cue-aware waits and animation durations."""

    cue_contract: CueContract | None = None

    def setup(self):
        super().setup()
        if self.cue_contract is None:
            raise CueContractError("Assign cue_contract = configure_manim_from_manifest(...) on the scene class")

    def wait_until_cue(self, cue_id: str):
        delay = self.cue_contract.delay_until(cue_id, float(self.time))
        if delay > 0:
            self.wait(delay)
        return self.cue_contract.cue(cue_id)

    def play_cue(self, cue_id: str, *animations, **kwargs):
        cue = self.wait_until_cue(cue_id)
        supplied = kwargs.pop("run_time", None)
        if supplied is not None and abs(float(supplied) - cue.duration) > 0.001:
            raise CueContractError(f"run_time for {cue_id} must equal the approved cue duration {cue.duration}")
        return self.play(*animations, run_time=cue.duration, **kwargs)
