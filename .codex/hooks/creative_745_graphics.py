"""Contract-bound graphics plans and technical handoff checks. Never renders."""
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shlex
import subprocess
from fractions import Fraction


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False,
                                     separators=(",", ":")).encode()).hexdigest()


def probe(file):
    result = subprocess.run([os.environ.get("CREATIVE_745_FFPROBE", "ffprobe"),
                             "-v", "error", "-show_streams", "-show_format", "-of", "json", str(file)],
                            capture_output=True, text=True, check=True, timeout=30)
    return json.loads(result.stdout)


def rate(value):
    try:
        number = Fraction(value)
        if number <= 0 or number > 240:
            raise ValueError()
        return number
    except (ValueError, ZeroDivisionError, TypeError):
        raise ValueError("745 source frame rate is unavailable or invalid") from None


def file_identity(file):
    path = Path(file).resolve(strict=True)
    if not path.is_file():
        raise ValueError(f"745 source/project is not a file: {path}")
    stat = path.stat()
    # Preserve nanoseconds through JS/JSON consumers without unsafe-integer rounding.
    return {"path": str(path), "bytes": stat.st_size, "mtimeNs": str(stat.st_mtime_ns)}


def make_plan(contract, active, opening, seconds, renderer="figma", opening_format=None):
    from creative_745 import validate_active
    client, lane = validate_active(contract, active)
    workflow = contract["workflow"]
    graphics = workflow["graphics"]
    if renderer not in {"figma", "hyperframes"}:
        raise ValueError("745 renderer must be figma or explicit hyperframes fallback")
    opening_format = opening_format or ("png" if renderer == "figma" else "mov")
    if opening_format not in {"png", "mov"} or (renderer == "hyperframes" and opening_format != "mov"):
        raise ValueError("745 opening format must be png or mov; HyperFrames fallback uses mov")
    if active["laneId"] not in graphics["currentBatchLanes"].get(active["clientId"], []):
        raise ValueError("745 reference-only lane is outside the current batch; verify scope before adding work")
    if opening not in {"overlay", "none"}:
        raise ValueError("745 opening must be overlay or none")
    if (active["clientId"], active["laneId"]) == ("pastor_john", "prayer") and opening != "overlay":
        raise ValueError("745 Prayer requires its opening treatment over footage")
    if opening == "overlay" and (isinstance(seconds, bool) or not isinstance(seconds, (int, float))
                                  or not math.isfinite(seconds) or seconds <= 0):
        raise ValueError("745 opening overlay requires an explicit positive duration")
    if opening == "none" and seconds is not None:
        raise ValueError("745 omitted opening cannot have a duration")
    lines = active.get("headlineLines") or [active["headline"]]
    if not isinstance(lines, list) or not lines or any(not isinstance(line, str) or not line.strip() for line in lines):
        raise ValueError("745 headline lines must contain readable text")
    if " ".join(" ".join(lines).split()) != " ".join(active["headline"].split()):
        raise ValueError("745 headline lines differ from the bound headline")
    source = file_identity(active["source"])
    # Saving an edit/import changes the project file normally. Bind its path and
    # exact sequence, without invalidating graphics on every Premiere save.
    project = {"path": file_identity(active["projectPath"])["path"]}
    metadata = probe(active["source"])
    videos = [stream for stream in metadata.get("streams", []) if stream.get("codec_type") == "video"]
    if len(videos) != 1:
        raise ValueError("745 source must have one inspected video stream")
    # Smartphone VFR averages are not the nominal editing rate.
    fps = rate(videos[0].get("r_frame_rate") or videos[0].get("avg_frame_rate"))
    job_directory = str(Path(graphics["outputRoot"]) / active["clientId"] / active["laneId"] / active["sequenceId"])
    cover = {**graphics["cover"], "path": str(Path(job_directory) / "cover.png")}
    overlay_policy = graphics["opening"] if opening_format == "png" else graphics["animatedOpening"]
    overlay = {**overlay_policy, "path": str(Path(job_directory) / ("opening." + opening_format))}
    # A content fingerprint, not a signature or a visual approval certificate.
    return {
        "schemaVersion": 1, "kind": "745-graphics-plan",
        "authoring": graphics["authoring"], "renderer": renderer, "openingFormat": opening_format,
        "clientId": active["clientId"], "laneId": active["laneId"],
        "sequenceId": active["sequenceId"], "headline": active["headline"], "headlineLines": lines,
        "source": source, "project": project, "bindingHash": digest(active),
        "contractHash": digest(contract), "captionOwner": active["captionOwner"],
        "style": {"brand": client["brand"], "lane": lane, "rules": client["rules"],
                  "coverDirection": client.get("coverDirection", {}),
                  "adjustments": active.get("adjustments", {}), "policy": contract["jeramiWiggleRoom"]},
        "width": active["width"], "height": active["height"], "frameRate": str(fps),
        "sourceFrameRates": {"nominal": videos[0].get("r_frame_rate"), "average": videos[0].get("avg_frame_rate")},
        "openingMode": opening, "openingSeconds": seconds,
        "outputRoot": graphics["outputRoot"],
        "jobDirectory": job_directory, "planPath": str(Path(job_directory) / "graphics-plan.json"),
        "outputs": {"cover": cover, "opening": overlay if opening == "overlay" else None},
        "visualApproval": "pending", "templateBaseline": "not recorded by this plan",
        "checks": ["Review cover and opening against the approved Figma lane master; first opening also over real footage",
                   "Verify selected frame belongs to this source and keeps the face clear",
                   "Verify typography availability and licensing; no silent substitutes",
                   "Confirm source nominal rate matches the Premiere sequence; inspect alpha and timing",
                   "Record measured baseline before repeated production; captions remain with Opus"]
    }


def validate_plan(contract, active, plan):
    if not isinstance(plan, dict) or plan.get("kind") != "745-graphics-plan":
        raise ValueError("745 render needs the JSON from graphics-plan as --variables-file")
    if plan.get("bindingHash") != digest(active) or plan.get("contractHash") != digest(contract):
        raise ValueError("745 graphics plan is stale; regenerate from the current binding and contract")
    current = make_plan(contract, active, plan.get("openingMode"), plan.get("openingSeconds"),
                        plan.get("renderer"), plan.get("openingFormat"))
    if current != plan:
        raise ValueError("745 graphics plan is stale or changed; regenerate from the current binding and contract")


def check_streams(metadata, plan, kind):
    streams = metadata.get("streams", [])
    if len(streams) != 1 or streams[0].get("codec_type") != "video":
        raise ValueError("745 graphics must have one video stream and no audio or extra tracks")
    stream = streams[0]
    if (stream.get("width"), stream.get("height")) != (plan["width"], plan["height"]):
        raise ValueError("745 graphics must be 1080x1920")
    if kind == "cover":
        if stream.get("codec_name") != "png":
            raise ValueError("745 cover must be PNG")
    else:
        if plan.get("openingFormat") == "png":
            if stream.get("codec_name") != "png":
                raise ValueError("745 static opening must be PNG")
            if not re.match(r"^(?:rgba|argb|bgra|abgr|ya)", str(stream.get("pix_fmt", ""))):
                raise ValueError("745 static opening has no alpha-capable pixel format")
            return
        if stream.get("codec_name") != "prores" or "4444" not in str(stream.get("profile")):
            raise ValueError("745 opening must be ProRes 4444 MOV")
        if not re.match(r"^(?:yuva|gbrap|rgba|argb|bgra|abgr)", str(stream.get("pix_fmt", ""))):
            raise ValueError("745 opening has no alpha-capable pixel format")
        fps = rate(plan["frameRate"])
        if rate(stream.get("avg_frame_rate")) != fps:
            raise ValueError("745 opening frame rate must match its source")
        duration = float(stream.get("duration", metadata.get("format", {}).get("duration", "nan")))
        if not math.isfinite(duration) or abs(duration - plan["openingSeconds"]) > 1 / float(fps):
            raise ValueError("745 opening duration differs from the plan")


def verify_storage(root, file, must_exist=True, render_command=None):
    path = Path(file).resolve(strict=must_exist)
    parent = Path(root).resolve()
    if not parent.is_dir():
        raise ValueError("745 HomeSSD outputRoot is unavailable; no internal fallback")
    if parent not in path.parents:
        raise ValueError("745 graphics must live under their HomeSSD outputRoot; symlink escapes are blocked")
    from creative_745 import ROOT
    cache = str(Path(os.environ.get("STORAGE_GATE_ROOT", "/Volumes/HomeSSD/Generated"))
                / "hyperframes/cache/extracted-frames")
    # Keep the gate's configured root spelling (macOS /var -> /private/var is
    # an alias); its own physical-path check still rejects escaping symlinks.
    storage_file = Path(root) / path.relative_to(parent)
    command = render_command or f"hyperframes render --output {shlex.quote(str(storage_file))} --frames-cache-dir {shlex.quote(cache)}"
    result = subprocess.run(["node", str(ROOT / "scripts/developer-storage/storage-gate.mjs"), "hook"],
                            input=json.dumps({"tool_name": "Bash", "tool_input": {"command": command}}),
                            capture_output=True, text=True, check=True, timeout=10)
    if result.stdout.strip():
        output = json.loads(result.stdout)["hookSpecificOutput"]
        if output.get("permissionDecision") == "deny":
            raise ValueError(output["permissionDecisionReason"])
    return path


def check_pair(contract, active, plan, cover, opening):
    validate_plan(contract, active, plan)
    if bool(opening) != (plan["openingMode"] == "overlay"):
        raise ValueError("745 opening output does not match the plan; cover is always required")
    verified = {}
    for kind, file in (("cover", cover), ("opening", opening)):
        if not file:
            continue
        if str(Path(file).resolve()) != str(Path(plan["outputs"][kind]["path"]).resolve()):
            raise ValueError(f"745 {kind} must use the bound job's HomeSSD output path")
        expected_suffix = "." + plan["outputs"][kind]["format"]
        if Path(file).suffix.lower() != expected_suffix:
            raise ValueError(f"745 {kind} must use {expected_suffix}")
        path = verify_storage(plan["outputRoot"], file)
        check_streams(probe(path), plan, kind)
        # Streaming avoids loading a ProRes file into memory.
        hashed = hashlib.sha256()
        with path.open("rb") as handle:
            for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                hashed.update(chunk)
        verified[kind] = {"path": str(path), "sha256": hashed.hexdigest()}
    return {"technicalStatus": "passed", "clientId": plan["clientId"], "laneId": plan["laneId"],
            "sequenceId": plan["sequenceId"], "planHash": digest(plan), "outputs": verified,
            "visualApproval": "pending", "note": "Metadata and file identity checked. Review cover/opening pixels against the Figma master; test the first opening's actual transparency and playback over real footage in Premiere."}


def render_guard(contract, active, command):
    match = re.search(r"--variables-file(?:=|\s+)(?:\"([^\"]+)\"|'([^']+)'|([^\s;]+))", command)
    if not match:
        raise ValueError("745 render requires graphics-plan JSON through --variables-file")
    file = next(value for value in match.groups() if value is not None)
    plan = json.loads(Path(file).read_text())
    validate_plan(contract, active, plan)
    if plan["renderer"] != "hyperframes":
        raise ValueError("745 HyperFrames render requires an explicit --renderer hyperframes fallback plan; authoring stays Figma")
    if "--format mov" not in command and "--format=mov" not in command:
        raise ValueError("745 opening render must explicitly use --format mov; covers use a PNG snapshot")
    if plan["openingMode"] != "overlay":
        raise ValueError("745 plan omits an opening overlay; do not render an invented intro")
    match = re.search(r"--output(?:=|\s+)(?:\"([^\"]+)\"|'([^']+)'|([^\s;]+))", command)
    if not match:
        raise ValueError("745 render requires an explicit HomeSSD --output")
    output = Path(next(value for value in match.groups() if value is not None)).resolve()
    if output != Path(plan["outputs"]["opening"]["path"]).resolve():
        raise ValueError("745 opening render must target the bound job's HomeSSD opening.mov")
    verify_storage(plan["outputRoot"], str(output), must_exist=False, render_command=command)
    return "745 GRAPHICS PLAN PASSED. Run graphics-check for the cover/overlay pair; visual approval remains pending."


def import_guard(contract, active, files):
    """Gate explicit generated graphics imports; raw footage imports are unaffected."""
    checked = []
    for file in files:
        path = Path(file)
        plan = json.loads((path.parent / "graphics-plan.json").read_text())
        if file not in [output["path"] for output in plan.get("outputs", {}).values() if output]:
            raise ValueError("745 imported graphic is not an output of its adjacent graphics-plan")
        verified = check_pair(contract, active, plan, plan["outputs"]["cover"]["path"],
                              plan["outputs"]["opening"]["path"] if plan["outputs"]["opening"] else None)
        checked.append(verified)
    return "745 GRAPHICS TECHNICAL HANDOFF PASSED. Pixels remain unapproved.\n" + json.dumps(checked)
