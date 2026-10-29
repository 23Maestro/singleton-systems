"""Build a trim-aware review plan. Manim checks timing without rendering art."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from fractions import Fraction
from pathlib import Path


class PlanError(ValueError):
    pass


def number(value):
    try:
        return Fraction(str(value))
    except (ValueError, ZeroDivisionError) as error:
        raise PlanError(f"Invalid time: {value}") from error


def frame_number(seconds, fps):
    value = number(seconds) * fps
    if value < 0:
        raise PlanError("Negative time")
    return (2 * value.numerator + value.denominator) // (2 * value.denominator)


def build_timeline(rows, durations, fps):
    result, previous, cursor = [], {}, 0
    if fps <= 0:
        raise PlanError("FPS must be positive")
    for index, row in enumerate(rows):
        name = row["sourceFile"]
        start, end = number(row["sourceIn"]), number(row["sourceOut"])
        if name not in durations or not 0 <= start < end <= number(durations[name]):
            raise PlanError(f"Invalid source trim: {name} {start}–{end}")
        if start < previous.get(name, 0):
            raise PlanError(f"Overlapping or reversed source ranges: {name}")
        previous[name] = end
        length = frame_number(end, fps) - frame_number(start, fps)
        if length <= 0:
            raise PlanError("Trim rounds to zero frames")
        result.append({"row": index, "sourceFile": name,
                       "sourceIn": float(start), "sourceOut": float(end),
                       "sourceInFrame": frame_number(start, fps),
                       "targetInFrame": cursor, "targetOutFrame": cursor + length,
                       "fpsNumerator": fps.numerator, "fpsDenominator": fps.denominator})
        cursor += length
    if not result:
        raise PlanError("No retained ranges")
    return result


def retained_range(timeline, name, seconds):
    matches = [r for r in timeline if r["sourceFile"] == name and
               number(r["sourceIn"]) <= number(seconds) < number(r["sourceOut"])]
    if len(matches) != 1:
        raise PlanError(f"Cue is removed or ambiguous: {name} at {seconds}")
    return matches[0]


def map_point(timeline, name, seconds):
    row = retained_range(timeline, name, seconds)
    fps = Fraction(row["fpsNumerator"], row["fpsDenominator"])
    frame = row["targetInFrame"] + frame_number(seconds, fps) - row["sourceInFrame"]
    if frame >= row["targetOutFrame"]:
        raise PlanError("Cue rounds beyond retained picture")
    return frame


def map_cue(timeline, cue):
    row = retained_range(timeline, cue["sourceClip"], cue["sourceSeconds"])
    fps = Fraction(row["fpsNumerator"], row["fpsDenominator"])
    start = map_point(timeline, cue["sourceClip"], cue["sourceSeconds"])
    requested = frame_number(cue["durationSeconds"], fps)
    duration = min(requested, row["targetOutFrame"] - start)
    if duration <= 0:
        raise PlanError("Cue has no visible hold")
    return {"targetFrame": start, "targetSeconds": float(start / fps),
            "durationFrames": duration, "holdClampedAtCut": duration != requested,
            "row": row["row"]}


def normalize(text):
    return " ".join(re.findall(r"\w+", text.casefold()))


def match_word_anchor(tokens, seconds, phrase, offset=0):
    wanted = normalize(phrase)
    if not wanted:
        raise PlanError("Empty trigger")
    for index, token in enumerate(tokens):
        start = number(offset) + number(token["offsets"]["from"]) / 1000
        if abs(start - number(seconds)) > Fraction(1, 1000):
            continue
        text = ""
        for last in range(index, len(tokens)):
            text += tokens[last]["text"]
            found = normalize(text)
            if found == wanted:
                end = number(offset) + number(tokens[last]["offsets"]["to"]) / 1000
                if end <= start:
                    raise PlanError("Trigger has no word duration")
                return {"tokenStart": index, "tokenEnd": last + 1,
                        "matchedText": text.strip(), "sourceEndSeconds": float(end)}
            if len(found) > len(wanted):
                break
    raise PlanError(f"Trigger is not in Whisper words: {phrase} at {seconds}")


def validate_flubs(timeline, flubs):
    if [c["value"] for c in flubs] != list(range(len(flubs))):
        raise PlanError("Flub values must start at 0 and increment once")
    result = [{**cue, "targetFrame": map_point(timeline, cue["sourceFile"], cue["sourceSeconds"]),
               "triggerType": "EDIT", "evidence": "Client selects-list cue; picture check pending"}
              for cue in flubs]
    if [c["targetFrame"] for c in result] != sorted(c["targetFrame"] for c in result):
        raise PlanError("Flubs must stay in spoken order")
    return result


def verify_bindings(expected, actual):
    if expected != actual:
        raise PlanError("Source or plan hash changed; timing proof is stale")


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def read_json(path):
    return json.loads(Path(path).read_text())


def validate_manim(plan):
    import manim
    fps = Fraction(plan["fps"]["numerator"], plan["fps"]["denominator"])
    with manim.tempconfig({"pixel_width": 1920, "pixel_height": 1080, "frame_rate": float(fps)}):
        for cue in plan["wordCues"] + [c for c in plan["candidates"] if "targetFrame" in c]:
            row = plan["ranges"][cue["row"]]
            if not row["targetInFrame"] <= cue["targetFrame"] < cue["targetFrame"] + cue["durationFrames"] <= row["targetOutFrame"]:
                raise PlanError("Cue crosses an editorial cut")
            if frame_number(cue["targetSeconds"], fps) != cue["targetFrame"]:
                raise PlanError("Cue frame and time disagree")
    return {"validator": "manim", "version": manim.__version__, "result": "passed",
            "scope": "Word anchors, retained cuts and frame math only; no rendered artwork",
            "planSha256": digest(plan), "sourceBindings": plan["sourceBindings"]}


def build_plan(request_path):
    request = read_json(request_path)
    paths = request["inputs"]
    for name, path in paths.items():
        if not Path(path).exists():
            raise PlanError(f"Required source is missing: {name}")
    cuts = read_json(paths["cutMap"])
    manifest = read_json(paths["sourceManifest"])
    fps = Fraction(request["fps"]["numerator"], request["fps"]["denominator"])
    timeline = build_timeline(cuts["rows"], {s["file"]: s["duration"] for s in manifest}, fps)
    windows = {w["clip"]: w for w in read_json(paths["wordWindows"])}
    all_paths = {**paths, "request": str(request_path)}
    all_paths.update({"transcript/" + p.name: str(p) for p in Path(paths["transcriptDirectory"]).glob("*.wav.json")})
    cues = []
    for index, original in enumerate(read_json(paths["legacyCues"])["cues"]):
        cue = dict(original)
        correction = next((c for c in request["cueCorrections"] if c["card"] == cue["card"]), None)
        if correction:
            if cue["phrase"] != correction["oldPhrase"]:
                raise PlanError("Legacy cue differs from reviewed correction")
            cue["phrase"] = correction["newPhrase"]
        time_fix = next((c for c in request["sourceTimeCorrections"]
                         if c["card"] == cue["card"] and c["sourceClip"] == cue["sourceClip"]), None)
        if time_fix:
            if cue["sourceSeconds"] != time_fix["oldSeconds"]:
                raise PlanError("Legacy cue time differs from reviewed correction")
            cue["sourceSeconds"] = time_fix["newSeconds"]
        window = windows[cue["sourceClip"]]
        word_path = Path(paths["wordDirectory"]) / (cue["sourceClip"].replace("-screen.mp4", "") + ".json")
        all_paths["words/" + word_path.name] = str(word_path)
        tokens = [t for segment in read_json(word_path)["transcription"] for t in segment.get("tokens", [])
                  if t.get("text", "").strip() and not t["text"].startswith("[_")]
        match = match_word_anchor(tokens, cue["sourceSeconds"], cue["phrase"], window["offset"])
        row = retained_range(timeline, cue["sourceClip"], cue["sourceSeconds"])
        if number(match["sourceEndSeconds"]) > number(row["sourceOut"]):
            raise PlanError("Trigger phrase crosses a cut")
        cues.append({"id": f"key-{index + 1:02d}", "card": cue["card"],
                     "sourceClip": cue["sourceClip"], "sourceSeconds": cue["sourceSeconds"],
                     "triggerText": cue["phrase"], "triggerType": "WORD", **match,
                     **map_cue(timeline, cue), "primaryEngine": "HyperFrames",
                     "review": "Whisper anchor verified; audiovisual sync still needs review"})
    payoff = next(c for c in cues if c["sourceClip"] == "01-cold-open-screen.mp4")
    payoff_end = map_point(timeline, payoff["sourceClip"], payoff["sourceEndSeconds"])
    if payoff_end > frame_number(15, fps):
        raise PlanError("The complete cold-open shortcut is later than 0:15")
    flubs = validate_flubs(timeline, cuts["counter"])
    if len(flubs) != 5 or flubs[-1]["value"] != 4:
        raise PlanError("All 4 client flubs plus the initial 0 must survive")
    groups = []
    for row in timeline:
        if not groups or groups[-1]["sourceFile"] != row["sourceFile"]:
            groups.append({"sourceFile": row["sourceFile"], "targetInFrame": row["targetInFrame"]})
        groups[-1]["targetOutFrame"] = row["targetOutFrame"]
    total = timeline[-1]["targetOutFrame"]
    if not 12 * 60 <= total / fps + 10 <= 15 * 60:
        raise PlanError("Planned duration is outside the client's 12–15 minute brief")
    required = []
    for moment in request["requiredRetainedMoments"]:
        target = map_point(timeline, moment["sourceClip"], moment["sourceSeconds"])
        if "latestTargetSeconds" in moment and target / fps > number(moment["latestTargetSeconds"]):
            raise PlanError("Cold-open payoff is later than the client deadline")
        required.append({**moment, "targetFrame": target})
    candidates = []
    for candidate in request["candidates"]:
        mapped = dict(candidate)
        if "sourceClip" in candidate:
            if candidate["triggerType"] == "PHRASE":
                path = Path(paths["transcriptDirectory"]) / candidate["sourceClip"].replace(".mp4", ".wav.json")
                segments = read_json(path)["transcription"]
                if not any(number(s["offsets"]["from"]) / 1000 == number(candidate["sourceSeconds"])
                           and normalize(s["text"]) == normalize(candidate["triggerText"]) for s in segments):
                    raise PlanError(f"Candidate phrase does not match its source segment: {candidate['id']}")
            mapped.update(map_cue(timeline, candidate))
        candidates.append(mapped)
    plan = {"schemaVersion": 1, "status": "proposed; review before assembly",
            "delivery": request.get("delivery", {}),
            "fps": request["fps"], "assemblyEngine": "HyperFrames", "timingValidator": "Manim Python only",
            "ranges": timeline, "flow": groups, "wordCues": cues, "flubs": flubs,
            "coldPayoffEndsAtFrame": payoff_end,
            "dialogueFrames": total, "dialogueSeconds": float(total / fps),
            "withBumperSeconds": float(total / fps + 10), "bumperStatus": "availability unverified",
            "cardSource": request["cardSource"], "cardPlacement": {"centerX": 960, "bottom": 972, "sizing": "HUG"},
            "cueCorrections": request["cueCorrections"], "candidates": candidates,
            "sourceTimeCorrections": request["sourceTimeCorrections"],
            "requiredRetainedMoments": required,
            "sourceBindings": {name: hashlib.sha256(Path(p).read_bytes()).hexdigest()
                               for name, p in all_paths.items() if Path(p).is_file()},
            "reviewLimits": request["reviewLimits"]}
    return plan


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--request", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    gate = subprocess.run(["node", "scripts/developer-storage/storage-gate.mjs", "route", "--client",
                           "INTENT_SOLUTIONS", "--kind", "references"], check=True, text=True, capture_output=True)
    root = Path(gate.stdout.strip()).resolve()
    output = args.output.resolve()
    if not output.is_relative_to(root):
        raise PlanError("Review output must stay under the gated client references directory")
    plan = build_plan(args.request)
    receipt = validate_manim(plan)
    # Re-read all sources before accepting the proof.
    verify_bindings(plan["sourceBindings"], build_plan(args.request)["sourceBindings"])
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(plan, indent=2) + "\n")
    proof = output.with_suffix(".manim-proof.json")
    proof.write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps({"output": str(output), "proof": str(proof), "wordCues": len(plan["wordCues"]),
                      "dialogueSeconds": plan["dialogueSeconds"], "withBumperSeconds": plan["withBumperSeconds"]}))


if __name__ == "__main__":
    main()
