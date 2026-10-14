#!/usr/bin/env python3
"""Fail-closed gates for an enrolled Catena Media Lineups scene."""

import hashlib
import importlib.util
import json
import math
import os
import re
import sys
import time
from pathlib import Path

SOURCE_ROOT = Path(__file__).resolve().parents[2]
if str(SOURCE_ROOT) not in sys.path:
    sys.path.insert(0, str(SOURCE_ROOT))

from tools.lineups_motion import CueContract, CueContractError
from tools.lineups_motion.discovery import validate_discovery, validate_scene_discovery
from tools.lineups_motion.timing_evidence import validate_timing_receipt
from tools.lineups_motion.assets import validate_alpha_assets
from tools.lineups_motion.media_evidence import validate_media
from tools.lineups_motion.templates import (
    validate_callout, validate_manifest_binding, validate_manifest_readback, validate_cinematic, quick_action_duration,
    validate_source_guards, load_source_guards,
)


FIGMA_MUTATIONS = {
    "mcp__codex_apps__figma_use_figma",
    "mcp__codex_apps__figma_weave_run_tool",
}
FIGMA_EXPORT = "mcp__codex_apps__figma_export_video"
PREMIERE_IMPORT = "mcp__premiere_pro__import_media"
PREMIERE_PLACEMENT = {
    "mcp__premiere_pro__add_to_timeline",
    "mcp__premiere_pro__insert_from_source",
    "mcp__premiere_pro__overwrite_clip",
    "mcp__premiere_pro__overwrite_from_source",
    "mcp__premiere_pro__replace_clip",
    "mcp__premiere_pro__replace_clip_media",
    "mcp__premiere_pro__move_clip",
    "mcp__premiere_pro__move_clip_to_track",
    "mcp__premiere_pro__set_clip_start_time",
    "mcp__premiere_pro__trim_clip",
}
PREMIERE_TRANSITIONS = {
    "mcp__premiere_pro__add_transition",
    "mcp__premiere_pro__add_transition_to_clip",
    "mcp__premiere_pro__batch_add_transitions",
}
PREMIERE_EFFECTS = {
    "mcp__premiere_pro__add_adjustment_layer",
    "mcp__premiere_pro__apply_audio_effect",
    "mcp__premiere_pro__apply_audio_effect_to_all_clips",
    "mcp__premiere_pro__apply_effect",
    "mcp__premiere_pro__batch_apply_effect",
    "mcp__premiere_pro__color_correct",
    "mcp__premiere_pro__crop_clip",
    "mcp__premiere_pro__set_blend_mode",
    "mcp__premiere_pro__set_effect_property",
}
PREMIERE_LUTS = {"mcp__premiere_pro__apply_lut"}
PREMIERE_OPACITY = {
    "mcp__premiere_pro__set_clip_opacity",
    "mcp__premiere_pro__set_clip_properties",
}
PREMIERE_DESTRUCTIVE = {
    "mcp__premiere_pro__delete_multiple_project_items",
    "mcp__premiere_pro__delete_project_item",
    "mcp__premiere_pro__extract_selection",
    "mcp__premiere_pro__lift_selection",
    "mcp__premiere_pro__razor_all_tracks",
    "mcp__premiere_pro__razor_timeline_at_time",
    "mcp__premiere_pro__remove_from_timeline",
    "mcp__premiere_pro__remove_selected_clips",
    "mcp__premiere_pro__ripple_delete",
}
PREMIERE_READBACK = {
    "mcp__premiere_pro__get_project_item_info",
    "mcp__premiere_pro__find_items_by_media_path",
    "mcp__premiere_pro__get_full_sequence_info",
    "mcp__premiere_pro__get_clip_properties",
}

APPROVED_OPTIONS = {
    "quick action photo": {"quick action photo"},
    "quick stat": {"Single-frame statement", "Two-photo progression"},
    "stat breakdown": {"stat breakdown"},
    "comparison": {"Cinematic 2-up", "Simple comparison", "Full comparison: 2", "Full comparison: 3", "Full comparison: 4"},
    "year-by-year": {"Trend table", "Simple board"},
    "asset swap": {"asset swap"},
    "recurring board": {"Rank Reveal", "Super Bowl Bubble Board"},
}
NO_FOOTBALL_FIELD_HASH = "6c84d05a7f038c5e3f9f14a4103cd9b533251e70"
LINEUPS_FIGMA_FILE_KEY = "o7E24iymIT80MTXGYIogVH"
RANK_REVEAL_SOURCE_COMPONENT_ID = "1277:558"
RANK_REVEAL_SOURCE_NAME = "Recurring Board / Rank Reveal / 10 Teams"


def is_data_driven(manifest):
    scene = manifest.get("scene") or {}
    return scene.get("lane") in {"stat breakdown", "year-by-year", "recurring board"} or (
        scene.get("lane") == "comparison" and scene.get("approvedOption") != "Cinematic 2-up"
    )


def validate_data_background(manifest):
    if not is_data_driven(manifest):
        return
    background = required(manifest, "figma.background")
    if background.get("setting") != "Field Night / No football" or background.get("imageHash") != NO_FOOTBALL_FIELD_HASH:
        raise EnforcementError("data-driven scenes require the approved no-football Field Night background")
    if background.get("locked") is not True or background.get("separateFromArtwork") is not True:
        raise EnforcementError("data-driven background must be locked and separate from editable artwork inside Figma")
    if not background.get("nodeId"):
        raise EnforcementError("data-driven background needs its Figma node ID")


def is_rank_reveal(manifest):
    scene = manifest.get("scene") or {}
    return scene.get("lane") == "recurring board" and scene.get("approvedOption") == "Rank Reveal"


def validate_rank_reveal(manifest, cues, motion_tracks, frame_duration):
    if not is_rank_reveal(manifest):
        return

    figma = manifest.get("figma") or {}
    motion = manifest.get("motion") or {}
    contract = figma.get("rankReveal") or {}

    if figma.get("fileKey") != LINEUPS_FIGMA_FILE_KEY:
        raise EnforcementError("Rank Reveal must use the canonical Lineups Figma file")
    if figma.get("sourceComponentId") != RANK_REVEAL_SOURCE_COMPONENT_ID:
        raise EnforcementError("Rank Reveal must use the normalized canonical source component")
    if contract.get("canonicalSourceComponentId") != RANK_REVEAL_SOURCE_COMPONENT_ID or contract.get("canonicalSourceName") != RANK_REVEAL_SOURCE_NAME:
        raise EnforcementError("Rank Reveal canonical source identity is missing or stale")
    if contract.get("stateOrder") != "10-to-1-cumulative":
        raise EnforcementError("Rank Reveal state order must be 10-to-1 cumulative")
    if contract.get("boardEntranceOrder") != [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]:
        raise EnforcementError("Rank Reveal board entrance order must stay 10 through 1")
    if contract.get("logoWrapperDimensions") != {"width": 96, "height": 78}:
        raise EnforcementError("Rank Reveal logos must use normalized 96 x 78 wrappers")
    if contract.get("motionWorkingCopyMode") != "detached-from-canonical-instance":
        raise EnforcementError("Rank Reveal motion must use a detached working copy of the canonical instance")

    revealed_rank = contract.get("revealedRank")
    if isinstance(revealed_rank, bool) or not isinstance(revealed_rank, int) or not 1 <= revealed_rank <= 10:
        raise EnforcementError("Rank Reveal revealedRank must be an integer from 1 to 10")
    expected_visible = list(range(10, revealed_rank - 1, -1))
    if contract.get("visibleRanks") != expected_visible:
        raise EnforcementError("Rank Reveal visibleRanks must preserve every prior 10-to-1 reveal")

    assignments = contract.get("logoAssignments")
    if not isinstance(assignments, list) or len(assignments) != 10:
        raise EnforcementError("Rank Reveal needs exactly ten normalized logo assignments")
    ranks = set()
    component_ids = set()
    for assignment in assignments:
        rank = assignment.get("rank")
        component_id = str(assignment.get("componentId") or "")
        component_name = str(assignment.get("componentName") or "")
        if rank in ranks or rank not in range(1, 11):
            raise EnforcementError("Rank Reveal logo assignments must cover unique ranks 1 through 10")
        if not assignment.get("team") or not component_id or component_id in component_ids:
            raise EnforcementError("Rank Reveal logo assignments need unique component IDs and team names")
        if not component_name.startswith("Asset/Team Logo/Normalized/"):
            raise EnforcementError("Rank Reveal cannot assign a raw or non-normalized logo component")
        ranks.add(rank)
        component_ids.add(component_id)
    if ranks != set(range(1, 11)):
        raise EnforcementError("Rank Reveal logo assignments must cover ranks 1 through 10")

    if motion.get("engine") != "figma" or motion.get("engineVersion") != "figma-motion":
        raise EnforcementError("Rank Reveal uses Figma Motion as its sole motion engine")
    if motion.get("timingValidator") != "manim":
        raise EnforcementError("Rank Reveal requires Manim as the transcript timing validator")
    board_cues = [cue for cue in cues if cue.get("action") == "stagger-board-rows-10-to-1"]
    team_cues = [cue for cue in cues if cue.get("action") == f"reveal-rank-{revealed_rank}-content"]
    if len(team_cues) != 1:
        raise EnforcementError("each Rank Reveal scene needs one transcript-proven team-content cue")

    if revealed_rank == 10:
        if len(board_cues) != 1:
            raise EnforcementError("Rank 10 needs one scene-start board cascade before its transcript-proven team-content cue")
        board_cue = board_cues[0]
        board_time = finite_number(board_cue.get("sceneTime"), "Rank Reveal board cue sceneTime")
        if board_cue.get("triggerType") != "EDIT" or not values_match(board_time, 0):
            raise EnforcementError("Rank 10 board cascade must be an EDIT cue at scene time 0")
        board_tracks = [
            track for track in motion_tracks
            if track.get("cueId") == board_cue.get("cueId") and track.get("property") == "opacity"
        ]
        if len(board_tracks) != 10 or [track.get("rank") for track in board_tracks] != [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]:
            raise EnforcementError("Rank 10 board cue needs ten ordered Figma Motion opacity tracks from rank 10 through rank 1")
        starts = []
        completions = []
        for track in board_tracks:
            keyframes = track.get("keyframes") or []
            if len(keyframes) < 2:
                raise EnforcementError("Rank 10 board tracks need fade-in keyframes")
            starts.append(finite_number(keyframes[0].get("time"), "Rank Reveal board keyframe start"))
            completions.append(finite_number(keyframes[1].get("time"), "Rank Reveal board keyframe completion"))
        board_duration = finite_number(board_cue.get("duration"), "Rank Reveal board cue duration")
        if not values_match(starts[0], 0) or any(right <= left for left, right in zip(starts, starts[1:])):
            raise EnforcementError("Rank 10 row fades must begin at scene time 0 and stagger in 10-to-1 order")
        if not values_match(completions[-1], board_duration, frame_duration + TIMING_EPSILON):
            raise EnforcementError("Rank 10 row stagger must complete at the approved board-cue duration")
    else:
        if board_cues:
            raise EnforcementError("Ranks 9 through 1 must not replay the full-board cascade")
        if any(track.get("rank") is not None for track in motion_tracks):
            raise EnforcementError("Ranks 9 through 1 may animate only the newly revealed team text and logo")

    team_cue = team_cues[0]
    team_tracks = [
        track for track in motion_tracks
        if track.get("cueId") == team_cue.get("cueId") and track.get("property") == "opacity"
    ]
    if len(team_tracks) != 2:
        raise EnforcementError("Rank Reveal team cue needs Figma Motion opacity tracks for both team text and normalized logo")


def response_backgrounds(value):
    for item in response_objects(value):
        if isinstance(item.get("background"), dict):
            yield item["background"]


BASE_FIGMA_SKILLS = {
    "figma-use",
    "singleton-figma-system",
    "file-hygiene",
    "layer-cleanup",
}
AUTO_LAYOUT_RE = re.compile(
    r"layoutMode|layoutSizingHorizontal|layoutSizingVertical|itemSpacing|padding(?:Top|Right|Bottom|Left)|Auto Layout|\bHug\b|\bFill\b",
    re.I,
)
ACCESSIBILITY_RE = re.compile(r"accessibility|wcag|contrast|colou?r", re.I)
TIMING_EPSILON = 0.001
ALIGNMENT_TOLERANCE = 2.0
PREVIOUS_STAGE = {
    "figma-to-export": None,
    "export-to-premiere": "figma-to-export",
    "premiere-import": "export-to-premiere",
    "premiere-placement": "premiere-import",
}


class EnforcementError(RuntimeError):
    pass


def canonical_bytes(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def sha256_value(value):
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def sha256_file(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def figma_skill_names(tool_input):
    return {
        item.strip().removeprefix("resource:")
        for item in str(tool_input.get("skillNames") or "").split(",")
        if item.strip()
    }


def validate_figma_skill_contract(tool_input):
    loaded = figma_skill_names(tool_input)
    required_skills = set(BASE_FIGMA_SKILLS)
    searchable = f"{tool_input.get('description', '')}\n{tool_input.get('code', '')}"
    if AUTO_LAYOUT_RE.search(searchable):
        required_skills.add("safe-auto-layout-conversion")
    if ACCESSIBILITY_RE.search(searchable):
        required_skills.add("accessibility-review")
    missing = sorted(required_skills - loaded)
    if missing:
        raise EnforcementError(f"Figma mutation is missing required skills: {', '.join(missing)}")


def repo_root(cwd):
    current = Path(cwd or os.getcwd()).resolve()
    for candidate in [current, *current.parents]:
        if (candidate / "config/cerebral-registry.json").exists():
            return candidate
    return current


def active_manifest_path(root):
    configured = os.environ.get("LINEUPS_MANIFEST_PATH")
    return Path(configured).expanduser().resolve() if configured else root / "config/lineups/active-scene.json"


def receipt_dir(root, manifest_path):
    configured = os.environ.get("LINEUPS_RECEIPT_DIR")
    if configured:
        return Path(configured).expanduser().resolve()
    return manifest_path.parent / "receipts"


def read_json(path, label):
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, json.JSONDecodeError) as error:
        raise EnforcementError(f"{label} could not be read: {error}") from error


def required(mapping, dotted):
    value = mapping
    for part in dotted.split("."):
        if not isinstance(value, dict) or part not in value:
            raise EnforcementError(f"manifest is missing {dotted}")
        value = value[part]
    return value


def finite_number(value, label):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        raise EnforcementError(f"{label} must be a finite number")
    return float(value)


def resolved_export_path(root, manifest):
    candidate = Path(required(manifest, "export.path")).expanduser()
    return candidate.resolve() if candidate.is_absolute() else (root / candidate).resolve()


def values_match(left, right, tolerance=TIMING_EPSILON):
    return abs(left - right) <= tolerance


def response_objects(value):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from response_objects(child)
    elif isinstance(value, list):
        for child in value:
            yield from response_objects(child)
    elif isinstance(value, str):
        try:
            parsed = json.loads(value)
        except (ValueError, TypeError):
            return
        if not isinstance(parsed, str):
            yield from response_objects(parsed)


def validate_focal_asset_readback(manifest, tool_response):
    if required(manifest, "scene.lane") != "asset swap":
        return
    expected_assets = [asset for asset in required(manifest, "figma.focalAssets") if asset.get("layoutRole")]
    if not expected_assets:
        return
    returned_assets = next(
        (item["focalAssets"] for item in response_objects(tool_response) if isinstance(item.get("focalAssets"), list)),
        None,
    )
    if returned_assets is None:
        raise EnforcementError("Figma readback is missing measured focal-asset opaque bounds")
    returned_by_id = {
        asset.get("nodeId"): asset
        for asset in returned_assets
        if isinstance(asset, dict) and asset.get("nodeId")
    }
    visible_centers = {}
    for expected in expected_assets:
        returned = returned_by_id.get(expected["nodeId"])
        role = expected["layoutRole"]
        if returned is None or returned.get("layoutRole") != role or returned.get("kind") != expected.get("kind"):
            raise EnforcementError(f"Figma readback does not identify the expected {role} focal asset")
        bounds = returned.get("opaqueBounds") or {}
        x = finite_number(bounds.get("x"), f"{role} opaqueBounds.x")
        width = finite_number(bounds.get("width"), f"{role} opaqueBounds.width")
        if width <= 0:
            raise EnforcementError(f"{role} opaque bounds must have positive width")
        visible_centers[role] = x + width / 2
    if {"left", "center", "right"}.issubset(visible_centers):
        if "logo" not in visible_centers:
            raise EnforcementError("Figma readback is missing the three-subject logo opaque bounds")
        if not values_match(visible_centers["center"], 960, ALIGNMENT_TOLERANCE) or not values_match(
            visible_centers["logo"], 960, ALIGNMENT_TOLERANCE
        ):
            raise EnforcementError("Figma opaque bounds do not place the logo and middle subject on the 960 px centerline")
        if visible_centers["left"] > 640 or visible_centers["right"] < 1280:
            raise EnforcementError("Figma opaque bounds do not place side subjects in the left and right thirds")


def premiere_clip_readback(tool_response, premiere):
    clip_id = premiere.get('timelineClipId')
    if not clip_id or str(clip_id).startswith('pending'):
        return None
    matches = []
    for container in response_objects(tool_response):
        if container.get("sequenceId") == premiere['sequenceId']:
            candidates = container.get('clips', [])
            if container.get('clipId') == clip_id:
                candidates = [container]
            matches.extend(candidate for candidate in candidates if candidate.get('clipId') == clip_id)
        if container.get('id') != premiere['sequenceId'] or not isinstance(container.get('videoTracks'), list):
            continue
        for index, track in enumerate(container['videoTracks']):
            for candidate in track.get('clips', []):
                if candidate.get('nodeId') == clip_id:
                    start = finite_number(candidate.get('start'), 'Premiere clip start')
                    end = finite_number(candidate.get('end'), 'Premiere clip end')
                    matches.append({**candidate, 'clipId': clip_id, 'trackIndex': track.get('index', index),
                                    'startTime': start, 'endTime': end, 'duration': end - start,
                                    'sourceIn': candidate.get('inPoint'), 'sourceOut': candidate.get('outPoint')})
    if len(matches) != 1:
        return None
    return matches[0]


def figma_scene_readback(tool_response, figma):
    expected_node_type = "INSTANCE" if figma.get("episodeUsesInstance") is True else "FRAME"
    pending_root = str(figma.get("rootNodeId") or "").startswith("pending:")
    matches = [
            item
            for item in response_objects(tool_response)
            if (
                (pending_root and item.get("plannedRootNodeId") == figma["rootNodeId"] and item.get("rootNodeId"))
                or item.get("rootNodeId") == figma["rootNodeId"]
            )
            and item.get("sourceComponentId") == figma["sourceComponentId"]
            and (
                (pending_root and item.get("episodeInstanceId") == item.get("rootNodeId"))
                or item.get("episodeInstanceId") == figma["episodeInstanceId"]
            )
            and item.get("nodeType") == expected_node_type
    ]
    return matches[0] if len(matches) == 1 else None


def validate_manifest(manifest, require_export=False):
    if manifest.get("schemaVersion") != 2:
        raise EnforcementError("manifest schemaVersion must be 2")
    if required(manifest, "enforcement.active") is not True:
        raise EnforcementError("manifest enforcement must be active")
    approved_hash = required(manifest, "enforcement.approvedToolInputSha256")
    if not isinstance(approved_hash, str) or len(approved_hash) != 64:
        raise EnforcementError("approved tool input hash is invalid")

    lane = required(manifest, "scene.lane")
    option = required(manifest, "scene.approvedOption")
    if lane not in APPROVED_OPTIONS or option not in APPROVED_OPTIONS[lane]:
        raise EnforcementError(f"{option!r} is not an approved option for the {lane!r} lane")
    if lane == 'comparison' and option != 'Cinematic 2-up' and manifest['scene'].get('comparisonKind') not in {'players', 'teams', 'periods'}:
        raise EnforcementError('comparison treatment must declare players, teams or periods before asset requirements')
    for field in ("episodeId", "sceneId", "setting"):
        if not required(manifest, f"scene.{field}"):
            raise EnforcementError(f"scene.{field} cannot be empty")

    validate_data_background(manifest)
    validate_cinematic(manifest)
    if lane == 'quick action photo' and manifest['scene'].get('editorialDuration') != quick_action_duration(required(manifest, 'motion.frameRate')):
        raise EnforcementError('Quick Action Photo requires requested 4.5 seconds and separate actual frame-rounded duration using nearest-half-up')

    figma = manifest.get("figma") or {}
    uses_instance = required(manifest, "figma.episodeUsesInstance")
    if uses_instance is not False:
        raise EnforcementError("episode motion must use a detached working copy of an approved canonical instance")
    if required(manifest, "figma.motionWorkingCopyMode") != "detached-from-canonical-instance":
        raise EnforcementError("episode motion must verify the canonical instance before detaching its working copy")
    for field in ("fileKey", "pageId", "rootNodeId", "sourceComponentId", "episodeInstanceId", "sourceRevision"):
        if not required(manifest, f"figma.{field}"):
            raise EnforcementError(f"figma.{field} cannot be empty")
    validate_manifest_binding(manifest)
    if str(figma.get("rootNodeId")).startswith("pending:") and figma.get("episodeInstanceId") != figma.get("rootNodeId"):
        raise EnforcementError("planned Figma scene initialization must use one matching pending scene token")
    if not required(manifest, "figma.exposedSlots"):
        raise EnforcementError("at least one exposed slot is required")
    if not required(manifest, "figma.allowedReplacementProperties"):
        raise EnforcementError("at least one allowed replacement property is required")

    asset_ledger = (manifest.get("figma") or {}).get("assetLedger")
    subject_count = None
    if lane == "asset swap":
        subject_count = finite_number(required(manifest, "scene.subjectCount"), "scene.subjectCount")
        if not subject_count.is_integer() or not 1 <= subject_count <= 4:
            raise EnforcementError("asset swap subjectCount must be an integer from 1 to 4")
        if not isinstance(asset_ledger, list) or not asset_ledger:
            raise EnforcementError("asset swap scenes require the episode asset ledger")
    if asset_ledger is not None:
        if not isinstance(asset_ledger, list):
            raise EnforcementError('episode asset ledger must be a list')
        source_ids = set()
        image_hashes = set()
        for entry in asset_ledger:
            source_id = str(entry.get("sourceId") or "")
            image_hash = str(entry.get("imageHash") or "")
            if not source_id or not image_hash or not entry.get("sceneId") or not entry.get("slotId"):
                raise EnforcementError("episode asset ledger entries need sceneId, slotId, sourceId, and imageHash")
            if source_id in source_ids or image_hash in image_hashes:
                raise EnforcementError("one source image may appear only once per episode")
            source_ids.add(source_id)
            image_hashes.add(image_hash)

    root_dimensions = required(manifest, "figma.rootDimensions")
    export_dimensions = required(manifest, "export.dimensions")
    if root_dimensions != {"width": 1920, "height": 1080}:
        raise EnforcementError("Figma root dimensions must be 1920 x 1080")
    if export_dimensions != root_dimensions:
        raise EnforcementError("export dimensions must match the Figma root dimensions")

    layout_roles = {}
    layout_kinds = {}
    for asset in required(manifest, "figma.focalAssets"):
        if asset.get("centered") is not True and not asset.get("approvedException"):
            raise EnforcementError(f"standalone focal asset {asset.get('nodeId', '<unknown>')} is off-center without an approved exception")
        role = asset.get("layoutRole")
        if role:
            center_x = finite_number(asset.get("centerX"), f"focal asset {asset.get('nodeId', '<unknown>')} centerX")
            if role in layout_roles:
                raise EnforcementError(f"three-subject layout has duplicate {role} roles")
            layout_roles[role] = center_x
            layout_kinds[role] = asset.get("kind")
    if subject_count == 3:
        expected_roles = {"left", "center", "right", "logo"}
        if set(layout_roles) != expected_roles:
            raise EnforcementError("three-subject layout requires exactly one left, center, right, and logo role")
        if layout_kinds["logo"] != "logo":
            raise EnforcementError("three-subject logo role must use kind logo")
        for role in ("left", "center", "right"):
            if layout_kinds[role] != "photo":
                raise EnforcementError(f"three-subject {role} role must use kind photo")
        if not values_match(layout_roles["center"], 960) or not values_match(layout_roles["logo"], 960):
            raise EnforcementError("the logo and middle subject must share the 960 px centerline")
        if layout_roles["left"] > 640 or layout_roles["right"] < 1280:
            raise EnforcementError("side subjects must occupy the left and right thirds")

    timing = required(manifest, "timing")
    if not timing.get("transcriptPhrase") or timing.get("anchorVerified") is not True:
        raise EnforcementError("the transcript phrase needs a verified anchor")
    if timing.get("transcriptSource") != "whisper" or timing.get("timestampResolution") != "word" or not timing.get("transcriptPath"):
        raise EnforcementError("Lineups motion requires the Whisper word-timestamp transcript before Figma")
    if timing.get("manimTimingValidated") is not True:
        raise EnforcementError("Lineups motion requires the Manim timing gate before Figma")
    anchor = finite_number(timing.get("verifiedAnchorTimestamp"), "verifiedAnchorTimestamp")
    entrances = timing.get("entranceTimes")
    if not isinstance(entrances, list) or not entrances:
        raise EnforcementError("entranceTimes must contain transcript-timed entrances")
    entrance_values = [finite_number(value, "entrance time") for value in entrances]
    last_entrance = finite_number(timing.get("lastEntrance"), "lastEntrance")
    content_end = finite_number(timing.get("contentEnd"), "contentEnd")
    padded_end = finite_number(timing.get("paddedCompositionEnd"), "paddedCompositionEnd")

    motion = required(manifest, "motion")
    engine = motion.get("engine")
    if engine != "figma" or motion.get("engineVersion") != "figma-motion":
        raise EnforcementError("Lineups motion uses Figma Motion as its sole visual engine")
    if motion.get("timingValidator") != "manim":
        raise EnforcementError("Lineups motion requires Manim transcript timing validation before Figma")
    frame_rate = motion.get("frameRate") or {}
    numerator = finite_number(frame_rate.get("numerator"), "motion.frameRate.numerator")
    denominator = finite_number(frame_rate.get("denominator"), "motion.frameRate.denominator")
    if numerator <= 0 or denominator <= 0 or not numerator.is_integer() or not denominator.is_integer():
        raise EnforcementError("motion frame rate must use positive integer numerator and denominator")
    frame_duration = denominator / numerator
    if motion.get("sourcePath") is not None or motion.get("sceneClass") is not None:
        raise EnforcementError("Lineups Manim timing validation cannot declare a render source or scene class")

    cues = motion.get("cues")
    if not isinstance(cues, list) or not cues:
        raise EnforcementError("motion.cues must contain at least one transcript-timed cue")
    cue_ids = set()
    cue_scene_times = []
    previous_scene_time = -1.0
    for cue in cues:
        cue_id = cue.get("cueId")
        if not cue_id or cue_id in cue_ids:
            raise EnforcementError("motion cue IDs must be present and unique")
        cue_ids.add(cue_id)
        if not cue.get("elementId") or not cue.get("triggerText") or not cue.get("action"):
            raise EnforcementError(f"motion cue {cue_id} is missing its element, trigger, or action")
        if cue.get("triggerType") not in {"WORD", "PHRASE", "EDIT"}:
            raise EnforcementError(f"motion cue {cue_id} has an invalid trigger type")
        transcript_time = finite_number(cue.get("transcriptTimestamp"), f"motion cue {cue_id} transcriptTimestamp")
        scene_time = finite_number(cue.get("sceneTime"), f"motion cue {cue_id} sceneTime")
        duration = finite_number(cue.get("duration"), f"motion cue {cue_id} duration")
        if min(transcript_time, scene_time, duration) < 0:
            raise EnforcementError(f"motion cue {cue_id} timing cannot be negative")
        if not values_match(transcript_time - anchor, scene_time):
            raise EnforcementError(f"motion cue {cue_id} sceneTime must equal transcriptTimestamp minus the verified anchor")
        if scene_time + TIMING_EPSILON < previous_scene_time:
            raise EnforcementError("motion cues must stay in scene-time order")
        if scene_time + duration > content_end + TIMING_EPSILON:
            raise EnforcementError(f"motion cue {cue_id} extends beyond contentEnd")
        previous_scene_time = scene_time
        cue_scene_times.append(scene_time)

    if len(entrance_values) != len(cue_scene_times) or any(
        not values_match(entrance, cue_time) for entrance, cue_time in zip(entrance_values, cue_scene_times)
    ):
        raise EnforcementError("entranceTimes must match motion cue sceneTime values in order")
    if anchor < 0 or min(entrance_values) < 0:
        raise EnforcementError("anchor and entrance times cannot be negative")
    if not values_match(max(entrance_values), last_entrance):
        raise EnforcementError("lastEntrance must equal the final entrance time")
    if last_entrance > content_end:
        raise EnforcementError("lastEntrance cannot follow contentEnd")
    minimum_padded_end = max(10.0, content_end + 2.0)
    if padded_end + TIMING_EPSILON < minimum_padded_end:
        raise EnforcementError("motion compositions must be at least ten seconds with at least two seconds of trim-safe padding")
    if timing.get("finalStateVisible") is not True or timing.get("noExitAnimation") is not True:
        raise EnforcementError("the final state must remain visible with no exit animation")

    try:
        CueContract(manifest)
    except CueContractError as error:
        raise EnforcementError(f"Manim timing gate rejected the cue contract: {error}") from error

    motion_tracks = required(manifest, "figma.motionTracks")
    if engine == "figma" and not motion_tracks:
        raise EnforcementError("Figma motion needs at least one motion track")
    for track in motion_tracks:
        duration = finite_number(track.get("duration"), "motion track duration")
        if duration > padded_end + TIMING_EPSILON:
            raise EnforcementError(f"motion track {track.get('nodeId', '<unknown>')} exceeds the root duration")
        keyframes = track.get("keyframes") or []
        for frame in keyframes:
            if finite_number(frame.get("time"), "keyframe time") > duration + 0.001:
                raise EnforcementError(f"motion track {track.get('nodeId', '<unknown>')} has a keyframe beyond its duration")
        if track.get("property") == "opacity":
            values = [finite_number(frame.get("value"), "opacity keyframe") for frame in keyframes]
            if len(values) > 1 and max(values) == 0:
                raise EnforcementError(f"opacity track {track.get('nodeId', '<unknown>')} remains 0 -> 0")
            revealed = False
            previous_value = None
            for value in values:
                if value > 0:
                    revealed = True
                if revealed and previous_value is not None and value + TIMING_EPSILON < previous_value:
                    raise EnforcementError(f"opacity track {track.get('nodeId', '<unknown>')} fades visible content back out")
                previous_value = value

    tracks_by_cue = {}
    for track in motion_tracks:
        cue_id = str(track.get("cueId") or "")
        if not cue_id:
            raise EnforcementError("every Figma Motion track must name its transcript cue ID")
        tracks_by_cue.setdefault(cue_id, []).append(track)
    for cue in cues:
        cue_duration = finite_number(cue.get("duration"), f"motion cue {cue.get('cueId')} duration")
        if cue_duration <= 0 or cue.get("action") == "stagger-board-rows-10-to-1":
            continue
        cue_time = finite_number(cue.get("sceneTime"), f"motion cue {cue.get('cueId')} sceneTime")
        matching = tracks_by_cue.get(cue.get("cueId"), [])
        if not matching:
            raise EnforcementError(f"motion cue {cue.get('cueId')} has no Figma Motion track")
        for track in matching:
            times = [finite_number(frame.get("time"), "motion keyframe time") for frame in track.get("keyframes") or []]
            if not any(values_match(value, cue_time) for value in times) or not any(
                values_match(value, cue_time + cue_duration, frame_duration + TIMING_EPSILON) for value in times
            ):
                raise EnforcementError(f"Figma Motion track {track.get('nodeId')} is not aligned to transcript cue {cue.get('cueId')}")

    validate_rank_reveal(manifest, cues, motion_tracks, frame_duration)

    policy = required(manifest, "policy")
    for field in ("transitionsApproved", "effectsApproved", "lutsApproved", "opacityChangesApproved"):
        if not isinstance(policy.get(field), bool):
            raise EnforcementError(f"policy.{field} must be explicit")
    if any(policy[field] for field in ("transitionsApproved", "effectsApproved", "lutsApproved", "opacityChangesApproved")) and not policy.get("approvalNote"):
        raise EnforcementError("an approved Premiere treatment needs an explicit approval note")

    if required(manifest, "ownership.eaglePath") != "Episode / 06 Motion Renders":
        raise EnforcementError("Eagle ownership must be Episode / 06 Motion Renders")
    if required(manifest, "ownership.duplicateFinalFolderIn23Projects") is not False:
        raise EnforcementError("a duplicate final render folder in 23Projects is forbidden")
    if not values_match(finite_number(required(manifest, "premiere.approvedStartTime"), "approvedStartTime"), anchor):
        raise EnforcementError("Premiere start time must equal the verified transcript anchor")
    approved_duration = finite_number(required(manifest, "premiere.approvedDuration"), "approvedDuration")
    approved_end = finite_number(required(manifest, "premiere.approvedEndTime"), "approvedEndTime")
    if approved_duration <= 0 or not values_match(approved_duration, padded_end):
        raise EnforcementError("Premiere duration must equal the approved render duration")
    if not values_match(approved_end, anchor + approved_duration):
        raise EnforcementError("Premiere end time must equal start time plus duration")
    editorial = (manifest.get('premiere') or {}).get('editorialTiming')
    if editorial is not None:
        start, duration, end, source_in, source_out = [finite_number(editorial.get(key), f'editorialTiming.{key}') for key in ('startTime', 'duration', 'endTime', 'sourceIn', 'sourceOut')]
        if (start < 0 or duration <= 0 or source_in < 0 or source_out > padded_end + TIMING_EPSILON
                or not values_match(end, start + duration) or not values_match(source_out - source_in, duration)):
            raise EnforcementError('editorial trims must preserve source In/Out within the padded render without retiming')

    review = required(manifest, "review")
    if review.get("status") != "approved" or review.get("reviewer") != "Jerami":
        raise EnforcementError("Jerami approval is required")

    if require_export:
        export = required(manifest, "export")
        if lane == "asset swap" and (
            export.get("artifactRole") != "final-premiere-render"
            or export.get("backgroundPolicy") != "football-visible-baked"
        ):
            raise EnforcementError("Asset Swap Premiere delivery must be the finished football-visible Premiere render")
        if export.get("validationStatus") != "passed":
            raise EnforcementError("export validation has not passed")
        proof = export.get("motionProof") or {}
        if proof.get("status") != "passed" or len(proof.get("sampleTimes") or []) < 2:
            raise EnforcementError("export needs a validation sample or deterministic motion proof")
        if proof.get("engine") != engine:
            raise EnforcementError("motion proof engine must match motion.engine")
        proof_times = [finite_number(value, "motion proof sample time") for value in proof.get("sampleTimes") or []]
        for cue_time in cue_scene_times:
            if not any(abs(sample_time - cue_time) <= frame_duration + TIMING_EPSILON for sample_time in proof_times):
                raise EnforcementError(f"motion proof is missing cue sample near {cue_time}")
        proof_frames = proof.get("frames") or []
        if len(proof_frames) < 2:
            raise EnforcementError("export needs at least two visible proof frames")
        for frame in proof_frames:
            frame_time = finite_number(frame.get("time"), "visible proof frame time")
            if frame_time not in proof_times or frame.get("width") != 1920 or frame.get("height") != 1080:
                raise EnforcementError("visible proof frames must be sampled 1920 x 1080 frames")
            if not isinstance(frame.get("sha256"), str) or len(frame["sha256"]) != 64:
                raise EnforcementError("visible proof frame hash is invalid")
        if not isinstance(export.get("fileSha256"), str) or len(export["fileSha256"]) != 64:
            raise EnforcementError("export file hash is invalid")


def manifest_hash(manifest):
    return sha256_value(manifest)


def receipt_path(directory, scene_id, stage):
    return directory / f"{scene_id}.{stage}.receipt.json"


def reserve_attempt(directory, manifest, stage, tool_input):
    # An uncertain mutation stays reserved across tool crashes and manifest edits.
    # Recovery reads existing media/clip IDs and reconciles; it never blindly replays.
    identity = sha256_value([manifest['scene']['episodeId'], manifest['scene']['sceneId'], stage])
    directory.mkdir(parents=True, exist_ok=True)
    intent = directory / f"{identity}.{stage}.intent.json"
    completed = receipt_path(directory, manifest['scene']['sceneId'], stage)
    if completed.exists():
        receipt = read_json(completed, f"{stage} existing receipt")
        if receipt.get('episodeId') == manifest['scene']['episodeId'] and receipt.get('status') == 'passed':
            raise EnforcementError(f'{stage} already completed; use readback to reconcile the existing item or clip')
    try:
        with intent.open('x', encoding='utf-8') as handle:
            json.dump({'episodeId': manifest['scene']['episodeId'], 'sceneId': manifest['scene']['sceneId'],
                       'stage': stage, 'manifestSha256': manifest_hash(manifest),
                       'inputSha256': sha256_value(tool_input), 'status': 'attempted'}, handle)
            handle.flush()
            os.fsync(handle.fileno())
    except FileExistsError as error:
        raise EnforcementError(f'{stage} already attempted; use live readback before any retry to prevent duplicates') from error


def load_receipt(root, manifest, directory, stage, previous_stage=None, require_artifact=False):
    path = receipt_path(directory, required(manifest, "scene.sceneId"), stage)
    receipt = read_json(path, f"{stage} receipt")
    stored_hash = receipt.get("receiptSha256")
    unsigned = dict(receipt)
    unsigned.pop("receiptSha256", None)
    actual_hash = sha256_value(unsigned)
    if stored_hash != actual_hash:
        raise EnforcementError(f"{stage} receipt hash is stale or invalid")
    if receipt.get("schemaVersion") != 1 or receipt.get("stage") != stage:
        raise EnforcementError(f"{stage} receipt contract is invalid")
    if receipt.get("episodeId") != required(manifest, "scene.episodeId") or receipt.get("sceneId") != required(manifest, "scene.sceneId"):
        raise EnforcementError(f"{stage} receipt identifies a different scene")
    if receipt.get("manifestSha256") != manifest_hash(manifest):
        raise EnforcementError(f"{stage} receipt was issued for a stale manifest")
    if receipt.get("status") != "passed":
        raise EnforcementError(f"{stage} receipt did not pass")
    review = receipt.get("review") or {}
    if review.get("status") != "approved" or review.get("reviewer") != "Jerami":
        raise EnforcementError(f"{stage} receipt lacks Jerami approval")
    if stage == "figma-to-export":
        validate_figma_stage(manifest, receipt.get("evidence") or {}, directory)
    if stage == "premiere-placement" and (directory / f"{manifest['scene']['sceneId']}.premiere-edit.intent.json").exists():
        raise EnforcementError('Premiere edit already attempted; recover live readback before further mutation or completion')
    if stage in {"figma-to-export", "export-to-premiere"}:
        evidence = receipt.get("evidence") or {}
        if evidence.get("sourceRevision") != required(manifest, "figma.sourceRevision"):
            raise EnforcementError(f"{stage} receipt does not bind the approved Figma source revision")
        if manifest.get("figma", {}).get("templateBinding"):
            validate_manifest_readback(manifest, evidence.get("calloutReadback") or {})
            validate_callout(evidence.get("sourceCallout") or {}, source=True)
        if evidence.get("proofFrames") != required(manifest, "export.motionProof.frames"):
            raise EnforcementError(f"{stage} receipt does not bind the current visible proof frames")
    if previous_stage:
        previous = load_receipt(root, manifest, directory, previous_stage, PREVIOUS_STAGE.get(previous_stage))
        if receipt.get("previousReceiptSha256") != previous.get("receiptSha256"):
            raise EnforcementError(f"{stage} receipt does not chain to the current {previous_stage} receipt")
    elif receipt.get("previousReceiptSha256") is not None:
        raise EnforcementError(f"{stage} receipt must start the receipt chain")
    if require_artifact:
        export_path = resolved_export_path(root, manifest)
        if not export_path.is_file():
            raise EnforcementError(f"exported render is missing at {export_path}")
        actual_artifact_hash = sha256_file(export_path)
        expected = required(manifest, "export.fileSha256")
        if actual_artifact_hash != expected or receipt.get("artifactSha256") != expected:
            raise EnforcementError("exported render hash does not match the manifest and receipt")
        validate_media(root, manifest)
    return receipt


def response_text(payload):
    return json.dumps(payload.get("tool_response"), sort_keys=True, ensure_ascii=False)


def validate_tool_response(response):
    objects = list(response_objects(response))
    if not objects:
        raise EnforcementError("the tool response is missing or malformed")
    for item in objects:
        if (item.get("isError") is True or ("success" in item and item["success"] is not True)
                or str(item.get("status", "")).lower() in {"failed", "error", "cancelled"}
                or item.get("error") not in (None, "", False)):
            raise EnforcementError("the tool response reports an error; recover live state before retrying")


def input_path_matches(root, manifest, tool_input):
    candidate = tool_input.get("filePath")
    if not candidate or not (manifest.get("export") or {}).get("path"):
        return False
    return Path(candidate).expanduser().resolve() == resolved_export_path(root, manifest)


def is_scoped(root, manifest, tool_name, tool_input, payload=None):
    figma = manifest.get("figma") or {}
    premiere = manifest.get("premiere") or {}
    premiere_identifiers = {
        premiere.get("projectItemId"), premiere.get("timelineClipId"), premiere.get("sequenceId"),
    } - {None, ""}
    if tool_name == "mcp__codex_apps__figma_weave_run_tool":
        return tool_input.get("fileKey") == figma.get("fileKey")
    if tool_name in FIGMA_MUTATIONS or tool_name == FIGMA_EXPORT:
        return tool_input.get("fileKey") == figma.get("fileKey")
    if tool_name == PREMIERE_IMPORT:
        return input_path_matches(root, manifest, tool_input)
    if tool_name in PREMIERE_READBACK and payload is not None:
        input_identifiers = {
            tool_input.get("projectItemId"),
            tool_input.get("clipId"),
            tool_input.get("sequenceId"),
        }
        if input_identifiers & premiere_identifiers:
            return True
        return any(
            (premiere.get("projectItemId") and item.get("projectItemId") == premiere["projectItemId"])
            or (premiere.get("timelineClipId") and item.get("clipId") == premiere["timelineClipId"])
            or (premiere.get("treePath") and item.get("treePath") == premiere["treePath"])
            for item in response_objects(payload.get("tool_response"))
        )
    identifiers = {
        tool_input.get("projectItemId"),
        tool_input.get("newProjectItemId"),
        tool_input.get("clipId"),
        tool_input.get("clipId1"),
        tool_input.get("clipId2"),
        tool_input.get("sequenceId"),
    }
    identifiers.update(tool_input.get("projectItemIds") or [])
    identifiers.update(tool_input.get("clipIds") or [])
    return bool(identifiers & premiere_identifiers)


def deny(reason):
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": f"Lineups enforcement denied the mutation: {reason}"}}))


def post_block(reason):
    print(json.dumps({"decision": "block", "reason": f"Lineups verification stopped progression: {reason}"}))


def post_context(message):
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext": message}}))


def registered_readback(tool_name, tool_input, manifest=None):
    if tool_name != 'mcp__codex_apps__figma_use_figma' or tool_input.get('fileKey') != LINEUPS_FIGMA_FILE_KEY:
        return False
    spec = importlib.util.spec_from_file_location('lineups_templates', SOURCE_ROOT / 'scripts/lineups-templates.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    registry, callout = module.load_registry(), module.load_callout_contract()
    bindings = [{'sceneId': 'canonical-callout', 'rootNodeId': callout['source']['componentId'],
                 'roleNodeIds': callout['source']['roleNodeIds']}]
    codes = [module.collector_code(registry['componentsPageId'], bindings, sources=True)]
    if manifest and manifest.get('figma', {}).get('templateBinding'):
        figma = manifest['figma']
        codes.append(module.collector_code(figma['pageId'], [{'sceneId': manifest['scene']['sceneId'],
            'rootNodeId': figma['rootNodeId'], 'roleNodeIds': figma['templateBinding']['roleNodeIds']}]))
    return (tool_input.get('code') in codes and tool_input.get('skillNames') in {'figma-use', 'figma-use,figma-use-motion'}
            and set(tool_input) <= {'code', 'description', 'fileKey', 'skillNames'})


def registered_source_locks(tool_name, tool_input):
    if tool_name != 'mcp__codex_apps__figma_use_figma' or tool_input.get('fileKey') != LINEUPS_FIGMA_FILE_KEY:
        return False
    spec = importlib.util.spec_from_file_location('lineups_templates', SOURCE_ROOT / 'scripts/lineups-templates.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return tool_input == module.source_lock_input()


def review_export_roster(root, manifest):
    """Episode-approved preview exports do not imply Premiere delivery approval."""
    episode_id = required(manifest, "scene.episodeId")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}-[a-z0-9-]+", episode_id):
        return None
    episode_dir = root / "config" / "lineups" / "episodes" / episode_id
    roster_path = episode_dir / "review-exports.json"
    if not roster_path.is_file():
        return None
    roster = read_json(roster_path, "review export roster")
    if (
        roster.get("schemaVersion") != 1
        or roster.get("episodeId") != episode_id
        or roster.get("status") != "approved"
        or roster.get("reviewer") != "Jerami"
        or roster.get("purpose") != "post-figma-review"
        or roster.get("fileKey") != required(manifest, "figma.fileKey")
        or roster.get("dimensions") != {"width": 1920, "height": 1080}
        or roster.get("fps") != 25
    ):
        raise EnforcementError("review export roster is incomplete or unapproved")
    scenes = roster.get("scenes") or []
    ids = [item.get("id") for item in scenes]
    nodes = [item.get("nodeId") for item in scenes]
    if len(scenes) != roster.get("expectedCount") or len(set(ids)) != len(ids) or len(set(nodes)) != len(nodes):
        raise EnforcementError("review export roster count or uniqueness failed")
    audit = read_json(episode_dir / "motion-scene-build-audit.json", "motion scene audit")
    listed = {item["id"]: item["nodeId"] for item in scenes}
    for item in audit.get("rankRevealScenes", []) + audit.get("supportingMotionScenes", []):
        if listed.get(item.get("sceneId")) != item.get("rootNodeId"):
            raise EnforcementError("review export roster drifted from the approved motion audit")
    quick_stats = [item for item in scenes if item.get("lane") == "quick stat"]
    if quick_stats:
        readback = read_json(episode_dir / "callout-readback.json", "Components-bound callout readback")
        bindings = read_json(episode_dir / "callout-bindings.json", "exact episode callout bindings")
        source = read_json(SOURCE_ROOT / "config/lineups/canonical-template-verification.json", "canonical template proof")
        if readback.get("fileKey") != roster["fileKey"] or readback.get("pageId") != roster.get("pageId") or bindings.get("pageId") != roster.get("pageId"):
            raise EnforcementError("review callout proof identifies a different file or episode page")
        validate_callout(source.get("callout") or {}, source=True)
        for item in quick_stats:
            matches = [row for row in readback.get("callouts", []) if row.get("rootNodeId") == item["nodeId"] and row.get("sceneId") == item["id"]]
            bound = [row for row in bindings.get("scenes", []) if row.get("rootNodeId") == item["nodeId"] and row.get("sceneId") == item["id"]]
            if len(matches) != 1 or len(bound) != 1:
                raise EnforcementError("review export is missing an exact Quick Stat source comparison")
            if bound[0].get("roleNodeIds") != {role: (matches[0].get(role) or {}).get("id") for role in ("wrapper", "panel", "text")}:
                raise EnforcementError("review callout nodes drifted from their registered episode bindings")
            validate_callout(matches[0], fit_override=matches[0].get("fitOverride"))
    return roster


def review_export_preflight(roster, tool_input, manifest):
    if tool_input.get("fileKey") != roster["fileKey"]:
        raise EnforcementError("review export uses the wrong Figma file")
    node_id, job_id = tool_input.get("nodeId"), tool_input.get("jobId")
    if bool(node_id) == bool(job_id):
        raise EnforcementError("review export requires one scene node or one polling job")
    if job_id:
        return
    if node_id != manifest['figma']['rootNodeId']:
        raise EnforcementError('review export must enroll and approve the exact scene node before export')
    if node_id not in {item["nodeId"] for item in roster["scenes"]}:
        raise EnforcementError("review export node is not in the approved episode roster")
    if tool_input.get("fps") != roster["fps"] or tool_input.get("quality") != "high":
        raise EnforcementError("review export must use the approved 25 fps high-quality preset")
    constraint = tool_input.get("constraint")
    if constraint is not None and constraint != {"type": "WIDTH", "value": 1920}:
        raise EnforcementError("review export cannot resize the 1920 x 1080 composition")


def preflight(root, manifest, directory, tool_name, tool_input):
    validate_scene_discovery(root, manifest)
    require_export = tool_name not in {"mcp__codex_apps__figma_use_figma", FIGMA_EXPORT}
    validate_manifest(manifest, require_export=require_export)
    validate_alpha_assets(root, manifest)
    validate_timing_receipt(root, manifest)
    figma = manifest["figma"]
    timing = manifest["timing"]
    premiere = manifest["premiere"]
    policy = manifest["policy"]

    if tool_name == "mcp__codex_apps__figma_weave_run_tool":
        raise EnforcementError("Weave is not an approved Lineups mutation path; use the hashed Figma transaction")
    if tool_name == "mcp__codex_apps__figma_use_figma":
        validate_figma_skill_contract(tool_input)
        if sha256_value(tool_input) != manifest["enforcement"]["approvedToolInputSha256"]:
            raise EnforcementError("Figma mutation input does not match the approved transaction hash")
        (directory / f"{manifest['scene']['sceneId']}.figma-readback.json").unlink(missing_ok=True)
        return
    if tool_name == FIGMA_EXPORT:
        if bool(tool_input.get('nodeId')) == bool(tool_input.get('jobId')):
            raise EnforcementError('export requires exactly one scene node or one bound polling job')
        if tool_input.get("nodeId") and tool_input.get("nodeId") != figma["rootNodeId"]:
            raise EnforcementError("export must target the manifest root node")
        load_receipt(root, manifest, directory, "figma-to-export")
        if tool_input.get('jobId'):
            job = read_json(directory / f"{sha256_value(tool_input['jobId'])}.figma-export.job.json", 'bound export job')
            if job != {'jobId': tool_input['jobId'], 'episodeId': manifest['scene']['episodeId'],
                       'sceneId': manifest['scene']['sceneId'], 'manifestSha256': manifest_hash(manifest)}:
                raise EnforcementError('export polling job belongs to a different scene, version or evidence')
        return
    if tool_name == PREMIERE_IMPORT:
        if tool_input.get("binName") != "06 Motion Renders":
            raise EnforcementError("Premiere import must target the 06 Motion Renders bin")
        load_receipt(root, manifest, directory, "export-to-premiere", "figma-to-export", require_artifact=True)
        reserve_attempt(directory, manifest, "premiere-import", tool_input)
        return
    if tool_name in PREMIERE_TRANSITIONS and not policy["transitionsApproved"]:
        raise EnforcementError("Premiere transitions are not approved for this scene")
    if tool_name in PREMIERE_EFFECTS and not policy["effectsApproved"]:
        raise EnforcementError("Premiere effects are not approved for this scene")
    if tool_name in PREMIERE_LUTS and not policy["lutsApproved"]:
        raise EnforcementError("Premiere LUTs are not approved for this scene")
    if tool_name in PREMIERE_OPACITY and not policy["opacityChangesApproved"]:
        raise EnforcementError("Premiere opacity changes are not approved for this scene")
    if tool_name in PREMIERE_DESTRUCTIVE:
        raise EnforcementError("destructive Premiere mutations are outside the approved Lineups transaction")
    if tool_name in PREMIERE_PLACEMENT:
        if tool_name == 'mcp__premiere_pro__replace_clip' and tool_input.get('newProjectItemId') != premiere.get('projectItemId'):
            raise EnforcementError('replacement uses the wrong approved project item')
        if tool_name == 'mcp__premiere_pro__replace_clip_media' and tool_input.get('filePath') != str(resolved_export_path(root, manifest)):
            raise EnforcementError('replacement uses the wrong approved media path')
        load_receipt(root, manifest, directory, "premiere-import", "export-to-premiere")
        if tool_name == "mcp__premiere_pro__add_to_timeline":
            if tool_input.get("projectItemId") != premiere["projectItemId"]:
                raise EnforcementError("timeline placement uses the wrong project item")
            if tool_input.get("sequenceId") != premiere["sequenceId"] or tool_input.get("trackIndex") != premiere["trackIndex"]:
                raise EnforcementError("timeline placement uses the wrong sequence or track")
            if abs(finite_number(tool_input.get("time"), "timeline placement time") - timing["verifiedAnchorTimestamp"]) > 0.001:
                raise EnforcementError("timeline placement must start at the verified transcript anchor")
            reserve_attempt(directory, manifest, "premiere-placement", tool_input)
            return
        load_receipt(root, manifest, directory, "premiere-placement", "premiere-import")
        editorial = premiere.get("editorialTiming")
        if editorial:
            fields = {"newTime": "startTime", "time": "startTime", "startTime": "startTime",
                      "duration": "duration", "endTime": "endTime", "inPoint": "sourceIn",
                      "outPoint": "sourceOut", "sourceIn": "sourceIn", "sourceOut": "sourceOut"}
            for key, expected_key in fields.items():
                if key in tool_input and not values_match(finite_number(tool_input[key], key), editorial[expected_key]):
                    raise EnforcementError("mutation would reset approved live editorial trims or source In/Out")
        movement_time = tool_input.get("newTime", tool_input.get("time"))
        if movement_time is not None and finite_number(movement_time, "movement time") + 0.001 < timing["verifiedAnchorTimestamp"]:
            raise EnforcementError("the clip cannot move before the verified transcript anchor")
        if tool_name == "mcp__premiere_pro__replace_clip" and tool_input.get("preserveEffects", True) is not False:
            raise EnforcementError("replace_clip must set preserveEffects=false while effects are forbidden")
        if tool_name in {'mcp__premiere_pro__replace_clip', 'mcp__premiere_pro__replace_clip_media', 'mcp__premiere_pro__trim_clip'}:
            if not editorial:
                raise EnforcementError('replacement requires approved live editorial trims and source In/Out')
            baseline = read_json(directory / f"{manifest['scene']['sceneId']}.premiere-readback.json", 'fresh Premiere source readback')
            age = time.time() - finite_number(baseline.get('measuredAt'), 'Premiere readback time')
            if baseline.get('manifestSha256') != manifest_hash(manifest) or baseline.get('status') != 'passed' or not -1 <= age <= 600:
                raise EnforcementError('replacement requires a fresh current Premiere source readback')
            marker = directory / f"{manifest['scene']['sceneId']}.premiere-edit.intent.json"
            with marker.open('x', encoding='utf-8') as handle:
                json.dump({'manifestSha256': manifest_hash(manifest), 'inputSha256': sha256_value(tool_input)}, handle)
                handle.flush()
                os.fsync(handle.fileno())
            (directory / f"{manifest['scene']['sceneId']}.premiere-readback.json").unlink(missing_ok=True)


def validate_figma_readback(manifest, tool_response):
    figma = manifest["figma"]
    scene_readback = figma_scene_readback(tool_response, figma)
    if scene_readback is None:
        raise EnforcementError("Figma readback did not confirm the root, source component, and episode instance")
    if scene_readback.get("sourceRevision") != figma["sourceRevision"]:
        raise EnforcementError("Figma readback did not confirm the current approved source revision")
    if scene_readback.get("rootDimensions") != figma["rootDimensions"]:
        raise EnforcementError("Figma readback is missing the actual approved scene dimensions")
    actual_tracks = scene_readback.get("motionTracks")
    if not isinstance(actual_tracks, list) or not actual_tracks:
        raise EnforcementError("Figma readback is missing measured motion tracks on the matching scene")
    def track_key(track):
        node_id = track.get('nodeId')
        planned = track.get('plannedNodeId')
        if planned and planned.startswith(manifest['scene']['sceneId'] + '/') and node_id:
            node_id = planned
        return (node_id, track.get("property"), track.get("cueId"))
    actual_by_key = {track_key(track): track for track in actual_tracks}
    expected_by_key = {track_key(track): track for track in figma["motionTracks"]}
    if len(actual_by_key) != len(actual_tracks) or set(actual_by_key) != set(expected_by_key):
        raise EnforcementError("Figma readback motion track identities differ from the approved scene")
    for key, expected in expected_by_key.items():
        actual = actual_by_key[key]
        actual_frames = actual.get("keyframes")
        if not isinstance(actual_frames, list) or len(actual_frames) != len(expected["keyframes"]):
            raise EnforcementError("Figma readback motion keyframes or duration differ from the approved scene")
        if not values_match(finite_number(actual.get("duration"), "measured duration"), expected["duration"], 0.0001):
            raise EnforcementError("Figma readback motion keyframes or duration differ from the approved scene")
        for measured, planned in zip(actual_frames, expected["keyframes"]):
            if set(measured) != set(planned) or any(
                not values_match(finite_number(measured[field], f"measured keyframe {field}"), planned[field],
                                 0.0001 if field == "time" or expected["property"] in {"x", "y"} else 0.000001)
                for field in planned
            ):
                raise EnforcementError("Figma readback motion keyframes or duration differ from the approved scene")
    validate_cinematic(manifest, scene_readback)
    if figma.get("templateBinding"):
        validate_manifest_readback(manifest, scene_readback.get("calloutReadback") or {})
        validate_callout(scene_readback.get("sourceCallout") or {}, source=True)
    if is_data_driven(manifest):
        background = dict(scene_readback.get("background") or {})
        expected_background = figma["background"]
        planned_id = background.pop("plannedNodeId", None)
        if str(expected_background["nodeId"]).startswith("pending:"):
            if (planned_id != expected_background["nodeId"] or not background.get("nodeId")
                    or str(background["nodeId"]).startswith("pending:") or background["nodeId"] == scene_readback["rootNodeId"]):
                raise EnforcementError("Figma background readback is missing its actual episode node binding")
            background["nodeId"] = planned_id
        if background != expected_background:
            raise EnforcementError("Figma readback did not confirm the locked no-football background and separate artwork")
    if is_rank_reveal(manifest):
        returned_contract = scene_readback.get("rankReveal")
        if returned_contract != figma["rankReveal"]:
            raise EnforcementError("Figma readback did not confirm the canonical source, normalized logos, and cumulative Rank Reveal state")
    validate_focal_asset_readback(manifest, scene_readback)
    return scene_readback


def validate_figma_stage(manifest, evidence, directory):
    measured = evidence.get("sceneReadback")
    validate_tool_response(measured)
    scene = validate_figma_readback(manifest, measured)
    record = read_json(directory / f"{manifest['scene']['sceneId']}.figma-readback.json", "successful Figma readback")
    if record != {"status": "passed", "manifestSha256": manifest_hash(manifest),
                  "readbackSha256": sha256_value(scene)}:
        raise EnforcementError("Figma stage receipt does not bind a successful current measured readback")


def postflight(root, manifest, directory, tool_name, payload):
    if tool_name == "mcp__codex_apps__figma_use_figma":
        (directory / f"{manifest['scene']['sceneId']}.figma-readback.json").unlink(missing_ok=True)
    if tool_name in {'mcp__premiere_pro__get_full_sequence_info', 'mcp__premiere_pro__get_clip_properties'}:
        (directory / f"{manifest['scene']['sceneId']}.premiere-readback.json").unlink(missing_ok=True)
    validate_manifest(manifest, require_export=tool_name not in {"mcp__codex_apps__figma_use_figma", FIGMA_EXPORT})
    validate_alpha_assets(root, manifest)
    validate_timing_receipt(root, manifest)
    validate_tool_response(payload.get("tool_response"))
    figma = manifest["figma"]
    premiere = manifest["premiere"]

    if tool_name == "mcp__codex_apps__figma_use_figma":
        scene_readback = validate_figma_readback(manifest, payload.get("tool_response"))
        directory.mkdir(parents=True, exist_ok=True)
        record = {"status": "passed", "manifestSha256": manifest_hash(manifest),
                  "readbackSha256": sha256_value(scene_readback)}
        target = directory / f"{manifest['scene']['sceneId']}.figma-readback.json"
        temporary = target.with_suffix(f".{os.getpid()}.tmp")
        temporary.write_text(json.dumps(record))
        temporary.replace(target)
        post_context("Lineups Figma mutation readback passed. Export still requires a current figma-to-export receipt.")
        return
    if tool_name == FIGMA_EXPORT:
        objects = list(response_objects(payload.get('tool_response')))
        jobs = {item['jobId'] for item in objects if isinstance(item.get('jobId'), str) and item.get('status') in {'processing', 'completed'}}
        downloads = [item.get('downloadUrl') or item.get('downloadPath') for item in objects]
        if len(jobs) > 1 or (not jobs and not any(isinstance(url, str) and url for url in downloads)):
            raise EnforcementError("Figma export response has no unique render job or MP4 result")
        if jobs:
            job_id = next(iter(jobs))
            requested_job = payload['tool_input'].get('jobId')
            if requested_job and requested_job != job_id:
                raise EnforcementError('export polling response identifies a different render job')
            if not requested_job and payload['tool_input'].get('nodeId') != figma['rootNodeId']:
                raise EnforcementError('export job did not originate from the approved scene node')
            directory.mkdir(parents=True, exist_ok=True)
            job_record = {'jobId': job_id, 'episodeId': manifest['scene']['episodeId'],
                          'sceneId': manifest['scene']['sceneId'], 'manifestSha256': manifest_hash(manifest)}
            job_path = directory / f'{sha256_value(job_id)}.figma-export.job.json'
            if job_path.exists() and read_json(job_path, 'bound export job') != job_record:
                raise EnforcementError('export job cannot be rebound to changed scene evidence')
            with job_path.open('w', encoding='utf-8') as handle:
                json.dump(job_record, handle)
        post_context("Lineups export response passed. Premiere import remains blocked until the file hash, motion proof, Eagle ownership, and export-to-premiere receipt pass.")
        return
    if tool_name == PREMIERE_IMPORT:
        expected_id = premiere.get('projectItemId')
        if not expected_id or str(expected_id).startswith('pending'):
            ids = {item.get('projectItemId') for item in response_objects(payload.get('tool_response')) if item.get('projectItemId')}
            if len(ids) != 1:
                raise EnforcementError('import may have succeeded; recover its project item by media-path readback before retrying')
            post_context(f'Lineups import returned {next(iter(ids))}. Bind this ID after readback; verify move, label, name and treePath before placement. Do not repeat the import.')
            return
        if not any(item.get("projectItemId") == expected_id for item in response_objects(payload.get("tool_response"))):
            raise EnforcementError("Premiere import response did not return the expected project item ID")
        post_context("Lineups import returned the expected project item. Timeline placement still requires exact treePath and label readback plus a premiere-import receipt.")
        return
    if tool_name in {"mcp__premiere_pro__get_project_item_info", "mcp__premiere_pro__find_items_by_media_path"}:
        matches = [item for item in response_objects(payload.get("tool_response"))
                   if item.get("projectItemId", item.get("nodeId")) == premiere.get("projectItemId")]
        if not any(item.get("treePath") == premiere["treePath"]
                   and item.get("labelReadback", item.get("colorLabel")) == premiere["labelReadback"]
                   and (not premiere.get("nameReadback") or item.get("name") == premiere["nameReadback"])
                   for item in matches):
            raise EnforcementError("Premiere import readback is missing the expected project item ID, treePath or label readback on the same item")
        post_context("Lineups Premiere import readback passed. Timeline placement still requires a current premiere-import receipt.")
        return
    if tool_name == "mcp__premiere_pro__add_to_timeline":
        expected_id = premiere.get('timelineClipId')
        if not expected_id or str(expected_id).startswith('pending'):
            ids = {item.get('clipId') or item.get('nodeId') for item in response_objects(payload.get('tool_response')) if item.get('clipId') or item.get('nodeId')}
            if len(ids) != 1:
                raise EnforcementError('placement may have succeeded; recover the clip by sequence readback before retrying')
            post_context(f'Lineups placement returned {next(iter(ids))}. Bind this ID after sequence readback. Preserve live trims and source In/Out. Do not repeat placement.')
            return
        if not any(item.get("clipId", item.get("nodeId")) == expected_id for item in response_objects(payload.get("tool_response"))):
            raise EnforcementError("timeline mutation did not return the expected clip ID")
        post_context("Lineups timeline mutation returned the expected clip. Completion still requires sequence readback and a premiere-placement receipt.")
        return
    if tool_name in {'mcp__premiere_pro__replace_clip', 'mcp__premiere_pro__replace_clip_media', 'mcp__premiere_pro__trim_clip'}:
        raise EnforcementError('Premiere edit requires fresh sequence or clip-property readback to confirm media identity, live trims and source In/Out before progression')
    if tool_name in {"mcp__premiere_pro__get_full_sequence_info", "mcp__premiere_pro__get_clip_properties"}:
        clip = premiere_clip_readback(payload.get("tool_response"), premiere)
        if clip is None:
            raise EnforcementError("Premiere placement readback is missing the exact clip in the exact sequence")
        actual_start = finite_number(clip.get("startTime"), "Premiere clip startTime")
        actual_duration = finite_number(clip.get("duration"), "Premiere clip duration")
        actual_end = finite_number(clip.get("endTime"), "Premiere clip endTime")
        expected = premiere.get('editorialTiming') or {'startTime': premiere['approvedStartTime'], 'duration': premiere['approvedDuration'], 'endTime': premiere['approvedEndTime']}
        if (
            clip.get("trackIndex") != premiere["trackIndex"]
            or not values_match(actual_start, expected['startTime'])
            or not values_match(actual_duration, expected['duration'])
            or not values_match(actual_end, expected['endTime'])
        ):
            raise EnforcementError("Premiere placement readback does not match the exact start, duration, end, and track")
        if premiere.get('editorialTiming'):
            for key in ('sourceIn', 'sourceOut'):
                if not values_match(finite_number(clip.get(key), f'Premiere clip {key}'), expected[key]):
                    raise EnforcementError('Premiere readback changed the live source In/Out')
            marker = directory / f"{manifest['scene']['sceneId']}.premiere-edit.intent.json"
            project_item_id = clip.get('projectItemId') or (clip.get('projectItem') or {}).get('nodeId')
            if marker.exists() and project_item_id != premiere['projectItemId']:
                raise EnforcementError('Premiere recovery readback is missing the approved project item identity')
            if project_item_id == premiere['projectItemId']:
                directory.mkdir(parents=True, exist_ok=True)
                record = {'status': 'passed', 'manifestSha256': manifest_hash(manifest), 'measuredAt': time.time(), 'clip': clip}
                target = directory / f"{manifest['scene']['sceneId']}.premiere-readback.json"
                temporary = target.with_suffix(f'.{os.getpid()}.tmp')
                temporary.write_text(json.dumps(record))
                temporary.replace(target)
                marker.unlink(missing_ok=True)
        post_context("Lineups Premiere placement readback passed. Record the chained premiere-placement receipt before marking the scene complete.")


def main():
    payload = json.load(sys.stdin)
    root = repo_root(payload.get("cwd"))
    manifest_path = active_manifest_path(root)
    event = payload.get("hook_event_name") or ""
    tool_name = str(payload.get("tool_name") or "")
    tool_input = payload.get("tool_input") or {}
    try:
        canonical_measurement = registered_readback(tool_name, tool_input)
        source_lock = registered_source_locks(tool_name, tool_input)
    except Exception as error:
        if tool_input.get("fileKey") == LINEUPS_FIGMA_FILE_KEY:
            if event == "PreToolUse":
                deny(str(error))
            elif event == "PostToolUse":
                post_block(str(error))
        return
    if source_lock:
        if event == 'PostToolUse':
            try:
                validate_tool_response(payload.get('tool_response'))
                measurements = [item for item in response_objects(payload.get('tool_response'))
                                if isinstance(item.get('sourceGuards'), list)]
                if len(measurements) != 1:
                    raise EnforcementError('source lock response requires one complete measured readback')
                validate_source_guards(measurements[0])
                changed = measurements[0].get('mutatedNodeIds')
                permitted = {row['protected']['background']['id'] for row in load_source_guards()['sources']}
                if not isinstance(changed, list) or len(set(changed)) != len(changed) or not set(changed) <= permitted:
                    raise EnforcementError('source lock response has missing or unexpected mutated node IDs')
                post_context('Lineups reviewed source backgrounds are locked. Geometry and native motion passed measured readback; episode approval remains separate.')
            except Exception as error:
                post_block(str(error))
        return
    if canonical_measurement:
        if event == 'PostToolUse':
            try:
                validate_tool_response(payload.get('tool_response'))
                post_context('Lineups source measurement returned. Validate the measured properties before binding or approving a scene.')
            except EnforcementError as error:
                post_block(str(error))
        return
    if not manifest_path.exists():
        if (
            event == "PreToolUse"
            and tool_name in FIGMA_MUTATIONS | {FIGMA_EXPORT}
            and tool_input.get("fileKey") == LINEUPS_FIGMA_FILE_KEY
        ):
            deny(
                "the Lineups Figma file requires an active scene manifest before mutation or export; "
                "review the transcript anchor and declare Manim timing validation plus the Figma Motion engine first"
            )
        return
    try:
        manifest = read_json(manifest_path, "active Lineups manifest")
        if registered_readback(tool_name, tool_input, manifest):
            if event == 'PostToolUse':
                validate_tool_response(payload.get('tool_response'))
                post_context('Lineups callout measurement returned. Validate the measured properties before scene approval.')
            return
        if not is_scoped(root, manifest, tool_name, tool_input, payload if event == "PostToolUse" else None):
            return
        if tool_name == FIGMA_EXPORT:
            if event == 'PreToolUse':
                validate_discovery(root, required(manifest, 'scene.episodeId'),
                                   (manifest.get('timing') or {}).get('transcriptPath'), manifest.get('discoveryPath'))
            roster = review_export_roster(root, manifest)
            if roster is not None:
                validate_manifest(manifest, require_export=False)
                validate_timing_receipt(root, manifest)
                if event == "PreToolUse":
                    review_export_preflight(roster, tool_input, manifest)
        directory = receipt_dir(root, manifest_path)
        if event == "PreToolUse":
            preflight(root, manifest, directory, tool_name, tool_input)
        elif event == "PostToolUse":
            postflight(root, manifest, directory, tool_name, payload)
    except Exception as error:  # Active enrollment must fail closed, including validator errors.
        if event == "PreToolUse":
            deny(str(error))
        elif event == "PostToolUse":
            post_block(str(error))


if __name__ == "__main__":
    if importlib.util.find_spec("manim") is None:
        timing_python = Path.home() / ".pyenv/versions/3.12.3/bin/python3"
        if timing_python.is_file() and timing_python.resolve() != Path(sys.executable).resolve():
            os.execv(str(timing_python), [str(timing_python), *sys.argv])
    main()
