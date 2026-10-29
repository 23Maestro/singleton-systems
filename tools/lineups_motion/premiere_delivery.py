"""Validate an approved, already-rendered Premiere handoff across motion engines.

Authoring stays in the scene guard. Delivery binds the project as well as the
template-derived sequence ID, so another episode cannot inherit its receipts.
"""

import hashlib
import fcntl
import json
import math
import os
import time
from pathlib import Path


PREFIX = "mcp__premiere_pro__"
READS = {"get_project_info", "get_project_item_info", "get_clip_properties", "get_full_sequence_info", "list_sequence_tracks"}
WRITES = {"add_to_timeline", "trim_clip", "add_transition_to_clip", "move_clip"}


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def file_digest(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def read(path):
    return json.loads(Path(path).read_text())


def objects(value):
    if isinstance(value, dict):
        yield value
        if value.get("type") == "text":
            try:
                yield from objects(json.loads(value["text"]))
            except (ValueError, KeyError):
                pass
        for key, child in value.items():
            if key not in {"text", "structuredContent"}:
                yield from objects(child)
    elif isinstance(value, list):
        for child in value:
            yield from objects(child)


def save(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(f".{os.getpid()}.tmp")
    temporary.write_text(json.dumps(value, indent=2) + "\n")
    temporary.replace(path)


def require(condition, message):
    if not condition:
        raise ValueError("Premiere delivery: " + message)


def same(actual, expected):
    return type(actual) in (int, float) and math.isfinite(actual) and abs(actual - expected) < 0.001


def validate_binding(binding):
    unsigned = {k: v for k, v in binding.items() if k != "approval"}
    approval = binding.get("approval", {})
    require(binding.get("schemaVersion") == 1, "unknown binding version")
    require(approval.get("reviewer") == "Jerami" and approval.get("status") == "approved"
            and approval.get("source") and approval.get("bindingSha256") == digest(unsigned), "approval is missing or stale")
    rows = binding["scenes"]
    require(bool(rows) and len({r["sceneId"] for r in rows}) == len(rows)
            and len({r["projectItemId"] for r in rows}) == len(rows), "duplicate or empty scene roster")
    proof = binding["ingestProof"]
    require(file_digest(proof["path"]) == proof["sha256"], "ingest proof changed")
    result = next((x for x in objects(read(proof["path"])) if "items" in x and "project" in x), {})
    require(result.get("project") == binding["projectPath"] and result.get("count") == len(rows), "wrong project or incomplete ingest")
    for row in rows:
        matches = [x for x in result["items"] if x.get("id") == row["projectItemId"]]
        require(len(matches) == 1 and matches[0].get("path") == row["eaglePath"]
                and matches[0].get("label") == row["labelIndex"]
                and "\\06 Motion Renders\\" in matches[0].get("treePath", ""), "bin, label or media identity changed")
        require(type(row["durationFrames"]) is int and row["durationFrames"] > 0
                and type(row["timelineStartFrame"]) is int and row["timelineStartFrame"] >= 0, "invalid frame timing")
        require(row.get("transitionGapFrames", 0) in {0, 1}, "transition gap exceeds one frame")
        require(row["timelineStartFrame"] == math.floor(row["anchor"] * binding["fps"] + 0.5) + binding["sourceOffsetFrames"] + row.get("transitionGapFrames", 0)
                and row["timelineEndFrame"] == row["timelineStartFrame"] + row["durationFrames"], "source anchor mapping changed")
        require(row["transitionFrames"] in {10, 15} and row["transitionName"] in {"Light Leak", "Blur Dissolve", "Grunge"}, "unapproved transition")
    require(binding["fps"] == 25, "unsupported delivery frame rate")


def validate_source(root, binding, row):
    require(file_digest(row["eaglePath"]) == row["sha256"], "render changed")
    proof = row["sourceProof"]
    require(file_digest(proof["path"]) == proof["sha256"], "motion source proof changed")
    source = read(proof["path"])
    if row["engine"] == "figma":
        require(source["scene"]["episodeId"] == binding["episodeId"]
                and source["scene"]["sceneId"] == row["sceneId"]
                and source["motion"]["engine"] == "figma"
                and source["export"].get("validationStatus") == "passed"
                and source["export"]["fileSha256"] == row["sha256"], "Figma render does not match authoring proof")
        from .timing_evidence import validate_timing_receipt
        validate_timing_receipt(root, source)
    elif row["engine"] == "unreal":
        matches = [x for x in source.get("scenes", []) if x.get("sceneId") == row["sceneId"]]
        require(source.get("humanReview") == "approved" and source.get("approval")
                and source.get("eagleIntake") == "verified" and len(matches) == 1
                and matches[0].get("status") == "checked"
                and matches[0].get("masterSha256") == row["sha256"]
                and matches[0].get("eagleItemId") == row["eagleItemId"]
                and matches[0].get("eagleManagedFile") == row["eaglePath"]
                and matches[0].get("fps") == binding["fps"]
                and matches[0].get("frames") == row["durationFrames"], "Unreal master lacks its own approval and media proof")
    else:
        raise ValueError("Premiere delivery: unapproved engine")


def handle(root, payload):
    """Return True only for an operation owned by this approved delivery batch."""
    name = str(payload.get("tool_name", ""))
    if not name.startswith(PREFIX):
        return False
    tool = name[len(PREFIX):]
    path = Path(os.environ.get("LINEUPS_PREMIERE_DELIVERY_PATH", Path(root) / "config/lineups/active-premiere-delivery.json"))
    if not path.exists():
        return False
    binding = read(path)
    state_path = Path(binding["statePath"])
    state_path.parent.mkdir(parents=True, exist_ok=True)
    with state_path.with_suffix(".lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        return handle_locked(root, payload, binding)


def handle_locked(root, payload, binding):
    name = str(payload.get("tool_name", ""))
    tool = name[len(PREFIX):]
    args = payload.get("tool_input") or {}
    event = payload.get("hook_event_name")
    state_path = Path(binding["statePath"])
    state = read(state_path) if state_path.exists() else {"clips": {}, "attempts": {}, "transitions": {}}
    if state.get("bindingSha256") not in {None, binding["approval"]["bindingSha256"]}:
        raise ValueError("Premiere delivery: runtime state belongs to another binding")
    state["bindingSha256"] = binding["approval"]["bindingSha256"]
    if tool == "get_project_info":
        if event == "PostToolUse":
            response = next((x for x in objects(payload.get("tool_response")) if x.get("success") is True and "path" in x), {})
            state["projectContext"] = {"path": response.get("path"), "at": time.time()}
            save(state_path, state)
        return False
    item = args.get("projectItemId")
    clip = args.get("clipId")
    rows = binding["scenes"]
    selected = [r for r in rows if (item and r["projectItemId"] == item)
                or (clip and state["clips"].get(r["sceneId"]) == clip)]
    sequence_matches = args.get("sequenceId") == binding["sequenceId"]
    if not selected and not sequence_matches:
        return False
    validate_binding(binding)
    # This existing readback hook also works in app sessions whose matcher
    # configuration was loaded before get_project_info was registered.
    if tool == "get_project_item_info":
        require(len(selected) == 1, "inspect one bound imported item")
        if event == "PostToolUse":
            measured = next((x for x in objects(payload.get("tool_response"))
                             if x.get("nodeId") == selected[0]["projectItemId"] and "mediaPath" in x), {})
            tree = measured.get("treePath", "").replace("\\", "/")
            require(measured.get("mediaPath") == selected[0]["eaglePath"]
                    and tree.lstrip("/").split("/")[0] == Path(binding["projectPath"]).name,
                    "imported item readback belongs to a different project or source")
            state["projectContext"] = {"path": binding["projectPath"], "at": time.time(), "itemReadback": measured}
            save(state_path, state)
        return True
    context = state.get("projectContext", {})
    require(context.get("path") == binding["projectPath"] and 0 <= time.time() - context.get("at", 0) < 120,
            "refresh get_project_info for the exact project before delivery")
    require(tool in READS | WRITES, "operation is outside the approved placement, trim and transition scope")
    if tool in READS:
        if tool == "get_full_sequence_info" and event == "PostToolUse":
            sequence = next((x for x in objects(payload.get("tool_response"))
                             if x.get("id") == binding["sequenceId"] and "videoTracks" in x), {})
            require(bool(sequence), "sequence readback is missing")
            for row in rows:
                sid = row["sceneId"]
                if sid in state["clips"] or sid + ":add_to_timeline" not in state["attempts"]:
                    continue
                matches = [c for t in sequence["videoTracks"] if t["index"] == row["trackIndex"]
                           for c in t["clips"] if c.get("name") == Path(row["eaglePath"]).name
                           and same(c.get("start"), row["timelineStartFrame"] / binding["fps"])]
                require(len(matches) == 1, "reserved placement needs one matching clip before recovery")
                state["clips"][sid] = matches[0]["nodeId"]
            save(state_path, state)
        if tool == "get_clip_properties" and event == "PostToolUse" and len(selected) == 1:
            row = selected[0]
            properties = next((x.get("properties") for x in objects(payload.get("tool_response"))
                               if x.get("success") is True and isinstance(x.get("properties"), dict)), {})
            state.setdefault("clipReadbacks", {})[row["sceneId"]] = properties
            save(state_path, state)
            require(properties.get("sequenceId") == binding["sequenceId"]
                    and properties.get("trackIndex") == row["trackIndex"]
                    and same(properties.get("start"), row["timelineStartFrame"] / binding["fps"])
                    and same(properties.get("end"), row["timelineEndFrame"] / binding["fps"])
                    and same(properties.get("inPoint"), 0)
                    and type(properties.get("outPoint")) in (int, float)
                    and properties["outPoint"] + 0.001 >= row["durationFrames"] / binding["fps"], "clip timing readback differs from delivery plan")
            state.setdefault("verifiedClips", {})[row["sceneId"]] = properties
            save(state_path, state)
        return True
    require(len(selected) == 1, "wrong or unbound project item / timeline clip")
    row = selected[0]
    validate_source(root, binding, row)
    sid = row["sceneId"]
    key = sid + ":" + tool
    if event == "PreToolUse":
        previous = state["attempts"].get(key)
        measured = state.get("clipReadbacks", {}).get(sid, {})
        correction = (tool == "trim_clip" and previous and not previous.get("correction")
                      and measured.get("sequenceId") == binding["sequenceId"]
                      and measured.get("trackIndex") == row["trackIndex"]
                      and same(measured.get("start"), row["timelineStartFrame"] / binding["fps"])
                      and args.get("outPoint") is not None and previous["inputSha256"] != digest(args))
        require(not previous or correction, "operation already attempted; recover readback before retrying")
        if tool == "add_to_timeline":
            require(sequence_matches and args.get("trackIndex") == row["trackIndex"]
                    and same(args.get("time"), row["timelineStartFrame"] / binding["fps"])
                    and args.get("insertMode") == "overwrite" and args.get("linkAudio") is False,
                    "wrong sequence, track, anchor, insert mode or audio policy")
            require(sid not in state["clips"], "scene already placed")
        elif tool == "move_clip":
            require(row.get("transitionGapFrames") == 1
                    and same(args.get("newTime"), row["timelineStartFrame"] / binding["fps"])
                    and args.get("newTrackIndex", row["trackIndex"]) == row["trackIndex"], "move differs from the one-frame transition gap")
        elif tool == "trim_clip":
            duration = row["durationFrames"] / binding["fps"]
            require(same(args.get("duration"), duration)
                    and same(args.get("inPoint", 0), 0)
                    and same(args.get("outPoint", duration), duration), "trim differs from the approved editorial In/Out")
        else:
            require(sid in state.get("verifiedClips", {}), "read back the trimmed clip before adding transitions")
            require(args.get("position") == "both" and args.get("transitionName") == row["transitionName"]
                    and args.get("durationFrames") == row["transitionFrames"] and "duration" not in args,
                    "head/tail type or exact frame length differs from approval")
        state["attempts"][key] = {"status": "attempted", "inputSha256": digest(args), "correction": bool(correction)}
    elif event == "PostToolUse":
        response = list(objects(payload.get("tool_response")))
        require(not any(x.get("success") is False or x.get("isError") is True for x in response)
                and any(x.get("success") is True for x in response), "mutation failed or has no success readback")
        require(state["attempts"].get(key, {}).get("inputSha256") == digest(args), "response has no matching reserved mutation")
        if tool == "add_to_timeline":
            ids = {x.get("clipId") or x.get("id") for x in response
                   if x.get("clipId") or (x.get("id") and x.get("mediaPath") == row["eaglePath"])}
            require(len(ids) == 1, "recover the new clip ID by readback; do not place twice")
            state["clips"][sid] = next(iter(ids))
        elif tool == "add_transition_to_clip":
            placed = [x for x in response if "actualFrames" in x]
            require(len(placed) == 2 and all(x["actualFrames"] == row["transitionFrames"] for x in placed), "both transition measurements are required")
            state["transitions"][sid] = placed
        state["attempts"][key]["status"] = "returned-success; final timeline readback required"
    save(state_path, state)
    return True
