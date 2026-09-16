"""Manim-backed timing validation for Figma Motion Lineups scenes."""

from __future__ import annotations

import os
from pathlib import Path

from manim import config

from .cue_contract import CueContract, CueContractError


def validate_manim_timing_from_manifest(path: str | Path | None = None) -> CueContract:
    """Validate transcript cue math for a Figma Motion scene without rendering it."""
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
