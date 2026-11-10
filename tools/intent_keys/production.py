"""Shared Intent Keys long-form production checks and version-bound preflight."""
import json
from pathlib import Path
import subprocess
import re
from tempfile import NamedTemporaryFile

from tools.video_workflow.evidence import approval_matches, file_sha256 as digest, record_sha256


ROOT = Path(__file__).resolve().parents[2]
CONTRACT = ROOT / "config/intent-solutions/intent-keys/treatment.json"
MEDIA = Path("/Volumes/HomeSSD/Generated/INTENT_SOLUTIONS")


def read(path):
    return json.loads(Path(path).read_text())


def need(condition, message):
    if not condition:
        raise ValueError(message)


def load_treatment():
    treatment = read(CONTRACT)
    need(treatment["schemaVersion"] == 1 and treatment["id"] == "intent-keys-long-form",
         "Unsupported Intent Keys treatment")
    fps = treatment["fps"]
    quiz = treatment["quiz"]
    need(fps == 30 and treatment["canvas"] == [1920, 1080], "Intent clock must be 1080p30")
    need(quiz["title"] == "Pause & Think" and quiz["digits"] == [4, 3, 2, 1]
         and quiz["framesPerDigit"] == fps and quiz["tickFrames"] == [fps, 2 * fps, 3 * fps]
         and 3 * fps < quiz["chimeFrame"] < 4 * fps, "Invalid Intent countdown treatment")
    return treatment


def locked_style_sources():
    studio = ROOT.parent / "motion-studio"
    paths = []
    for name, expected in load_treatment()["styleSources"].items():
        path = studio / name
        need(digest(path) == expected, f"Locked Intent style source changed: {name}")
        paths.append(path)
    return paths


def require_treatment_plan(composition, version=None):
    composition = Path(composition).resolve()
    try:
        plan = read(composition / "treatment-plan.json")
    except FileNotFoundError as error:
        raise ValueError(f"Intent treatment plan is missing: {composition}/treatment-plan.json") from error
    need(plan.get("schemaVersion") == 1 and plan.get("episode") == composition.name
         and re.fullmatch(r"intent-keys-e\d+", composition.name), "Intent treatment plan is for another episode")
    planned_version = plan.get("version", "")
    need(isinstance(planned_version, str) and re.fullmatch(r"v\d+", planned_version)
         and (version is None or version == planned_version), "Intent treatment plan needs the exact build version")
    brief = composition / plan["brief"]["path"]
    need(digest(brief) == plan["brief"]["sha256"], "Intent treatment plan has a stale episode brief")
    need(type(plan.get("tracksKeys")) is bool, "Record whether Max requested a key count in the episode brief")
    locked_style_sources()
    expected = load_treatment()["components"]
    expected["counter"] = expected["counter"]["keys" if plan["tracksKeys"] else "flubs"]
    actual = plan["components"]
    need(isinstance(actual, dict) and {"screen", "captions", "counter"} <= actual.keys()
         and actual.keys() <= expected.keys(), "Intent treatment plan needs the episode's component roster")
    overrides = plan.get("styleOverrides", {})
    if overrides:
        need(approval_matches(plan, "Jerami") and overrides.keys() <= actual.keys(),
             "Intent style override needs current Jerami approval")
        brief_text = brief.read_text()
        for key, override in overrides.items():
            quote = override.get("briefExcerpt", "").strip()
            need(quote and quote in brief_text and override.get("style") == actual[key] != expected[key],
                 f"{key}: override needs Max's exact brief instruction and replacement style")
            expected[key] = override["style"]
    for key, style in actual.items():
        need(style == expected[key], f"{key}: use the locked Intent style {expected[key]}")
    return plan


def quiz_asset(treatment, name, media=MEDIA):
    asset = treatment["quiz"]["assets"][name]
    path = media / asset["path"]
    need(digest(path) == asset["sha256"], f"E02 quiz asset has changed: {name}")
    return path


def overlaps(start, end, first, last):
    return start < last and first < end


def final_frame(frame, cuts):
    return frame - sum(min(max(0, frame - start), end - start) for start, end, _ in cuts)


def check_protected_cuts(cuts, protected, exceptions):
    actual = {(start, end) for start, end, _ in cuts
              if any(overlaps(start, end, first, last) for first, last in protected)}
    allowed = {(row["startFrame"], row["endFrame"]) for row in exceptions
               if isinstance(row.get("source"), str) and row["source"].strip()}
    need(actual == allowed, "A protected range was cut without its exact episode exception")


def speech_audit(cues, alignment, cuts, total, treatment):
    fps = treatment["fps"]
    threshold = treatment["speech"]["gapReviewFrames"]
    aligned = alignment["words"]
    words = [word for caption in cues["captions"] for word in caption["words"]]
    need(bool(words) and [w["text"] for w in aligned] == [w["text"] for w in words],
         "Alignment must cover every caption word in order")
    frames = [(round(w["start"] * fps), round(w["end"] * fps)) for w in words]
    need(all(0 <= a < b <= total for a, b in frames)
         and all(b <= c for (_, b), (c, _) in zip(frames, frames[1:])),
         "Caption words overlap or leave the episode clock")
    quizzes = [tuple(round(t * fps) for t in q["cutaway"]) for q in cues["quizzes"]]
    spoken = [(round(w["alignedStart"] * fps), round(w["alignedEnd"] * fps))
              for w in aligned if w["reliable"]]
    previous = 0
    for start, end, label in cuts:
        need(previous <= start < end < total, f"Invalid cut range: {label}")
        need(not any(start <= a < end for a, _ in frames), f"Cut removes a word cue: {label}")
        need(not any(overlaps(start, end, a, b) for a, b in spoken),
             f"Cut overlaps spoken audio: {label}")
        need(not any(overlaps(start, end, a, b) for a, b in quizzes), f"Cut crosses a quiz: {label}")
        previous = end
    gaps = []
    for left, right in zip(aligned, aligned[1:]):
        start, end = round(left["alignedEnd"] * fps), round(right["alignedStart"] * fps)
        if end - start < threshold:
            continue
        final_start, final_end = final_frame(start, cuts), final_frame(end, cuts)
        holds = sorted((max(start, a), min(end, b)) for a, b in quizzes if overlaps(start, end, a, b))
        silence = []
        cursor = start
        for a, b in holds:
            silence.append(final_frame(a, cuts) - final_frame(cursor, cuts))
            cursor = b
        silence.append(final_end - final_frame(cursor, cuts))
        remaining = final_end - final_start
        disposition = "listen"
        if max(silence) < threshold:
            if holds:
                disposition = "quiz"
            elif remaining < end - start:
                disposition = "trimmed"
        gaps.append({"startFrame": start, "endFrame": end, "after": left["text"], "before": right["text"],
                     "finalStartFrame": final_start, "finalEndFrame": final_end,
                     "reliable": left["reliable"] and right["reliable"],
                     "remainingFrames": remaining, "disposition": disposition})
    return gaps


def page_inputs(page):
    page = Path(page).absolute()
    source = page.read_text()
    assets = re.findall(r"""\bsrc=["']([^"']+)["']|url\(\s*["']?([^)"']+)""", source)
    paths = {page}
    for src, url in assets:
        name = (src or url).strip()
        if not name.startswith("data:"):
            need("://" not in name, f"Intent assets need a local version: {name}")
            paths.add(page.parent / name)
    return paths


def page_fingerprint(page, inputs=()):
    page = Path(page).absolute()
    paths = page_inputs(page)
    paths.update(Path(path).absolute() for path in inputs)
    return record_sha256({str(path): digest(path) for path in paths})


def preflight_path(composition, media=MEDIA, version=None):
    composition = Path(composition)
    if re.fullmatch(r"short-v\d+", composition.name) and re.fullmatch(r"intent-keys-e\d+", composition.parent.name):
        return media / "references" / f"{composition.parent.name}-{composition.name}-preflight.json"
    need(re.fullmatch(r"intent-keys-e\d+", composition.name), "Use the exact Intent Keys episode folder")
    suffix = f"-{version}" if version else ""
    return media / "references" / f"{composition.name}{suffix}-preflight.json"


def preflight_sources(composition):
    entry = "index.html" if composition.name.startswith("short-") else "build.py"
    return {CONTRACT, Path(__file__).resolve(), ROOT / "tools/video_workflow/evidence.py", composition / entry}


def write_preflight(composition, version, inputs, evidence, media=MEDIA):
    composition = Path(composition).resolve()
    paths = preflight_sources(composition)
    paths.update(Path(path).absolute() for path in inputs)
    receipt = {"schemaVersion": 1, "composition": str(composition), "version": version,
               "inputs": {str(path): digest(path) for path in sorted(paths)}, "evidence": evidence}
    path = preflight_path(composition, media, version)
    with NamedTemporaryFile(mode="w", dir=path.parent, delete=False) as temporary:
        json.dump(receipt, temporary, indent=2)
        temporary.write("\n")
    Path(temporary.name).replace(path)
    return path


def require_preflight(composition, version=None, media=MEDIA):
    composition = Path(composition).resolve()
    plan_path = composition / "treatment-plan.json"
    if version is None and plan_path.is_file():
        version = read(plan_path).get("version")
    path = preflight_path(composition, media, version)
    if version is not None and not path.is_file() and not composition.name.startswith("short-"):
        legacy = preflight_path(composition, media)
        if legacy.is_file() and read(legacy).get("version") == version:
            path = legacy
    receipt = read(path)
    need(receipt["schemaVersion"] == 1 and receipt["composition"] == str(composition)
         and (version is None or version == receipt["version"]), "Intent preflight is for a different build")
    inputs = receipt["inputs"]
    need(all(str(path) in inputs for path in preflight_sources(composition)),
         "Intent preflight is missing its source bindings")
    for path, expected in inputs.items():
        need(digest(path) == expected, f"Intent preflight is stale: {path}")
    return receipt


def check_short(composition, media=MEDIA):
    from html.parser import HTMLParser

    class Elements(HTMLParser):
        def __init__(self):
            super().__init__()
            self.by_id = {}

        def handle_starttag(self, _tag, attrs):
            values = dict(attrs)
            if "id" in values:
                self.by_id[values["id"]] = values

    composition = Path(composition).resolve()
    plan_path = composition / "short-plan.json"
    plan = read(plan_path)
    version = composition.name.removeprefix("short-")
    need(plan.get("schemaVersion") == 1 and plan.get("platform") == "youtube-shorts"
         and plan.get("episode") == composition.parent.name and plan.get("version") == version,
         "Short plan belongs to another episode or version")
    brief = composition / plan["brief"]["path"]
    need(digest(brief) == plan["brief"]["sha256"], "Short brief changed")
    start, end = plan["sourceFrames"]
    need(plan.get("sourceTake") and type(start) is int and type(end) is int and 0 <= start < end,
         "Short plan needs the original take and frame range")
    page = composition / "index.html"
    source = page.read_text()
    elements = Elements()
    elements.feed(source)
    tags = elements.by_id
    need({"root", "screen", "max", "narration", "title", "endcard"} <= tags.keys(),
         "Short needs the demo, speaker, source audio and supplied cards")
    root = tags["root"]
    need((root.get("data-width"), root.get("data-height"), root.get("data-fps")) == ("1080", "1920", "30"),
         "Intent Short needs a 1080 × 1920, 30 fps canvas")
    for key in ("title", "endcard"):
        asset = composition / tags[key]["src"]
        need(digest(asset) == plan["cardSha256"][key], f"Short has the wrong {key} artwork")
    need(re.search(r"\.caption\{[^}]*\btop:" + str(plan["captionTop"]) + r"px", source)
         and plan["captionTop"] in {1738, 1740} and "Poppins" in source,
         "Short captions differ from the locked YouTube treatment")
    if plan["keyDisplay"] != "native":
        key = tags.get(plan["keyDisplay"], {})
        need(key.get("src") and float(key.get("data-duration", 0)) > 0,
             "Short needs a visible key callout during the demo")
    return write_preflight(composition, version, [plan_path, brief, *locked_style_sources(), *page_inputs(page)],
                           {"clockFrames": int(float(root["data-duration"]) * 30 + 0.5), "gaps": []}, media)


def measure_short(composition, export, media=MEDIA):
    composition, export = Path(composition).resolve(), Path(export).resolve()
    version = composition.name.removeprefix("short-")
    receipt = require_preflight(composition, version, media)
    need(export.parent == (media / "renders").resolve()
         and export.name == f"{composition.parent.name}-{composition.name}.mp4",
         "Use the exact Intent Short export")
    result = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
        "stream=width,height,r_frame_rate,nb_frames", "-of", "json", str(export),
    ]))["streams"][0]
    frames = int(result["nb_frames"])
    need((result["width"], result["height"], result["r_frame_rate"], frames) ==
         (1080, 1920, "30/1", receipt["evidence"]["clockFrames"]), "Short export differs from the plan")
    sha = digest(export)
    subprocess.run(["ffmpeg", "-v", "error", "-xerror", "-i", str(export), "-map", "0:v:0",
                    "-map", "0:a:0", "-f", "null", "-"], check=True)
    need(digest(export) == sha, "Short export changed during readback")
    path = media / "references" / f"{export.stem}-measurements.json"
    path.write_text(json.dumps({"file": str(export), "sha256": sha, "frames": frames,
                               "fullDecode": True, "preflightSha256": digest(preflight_path(composition, media, version))}, indent=2) + "\n")
    return path


EXPORT_NAME = re.compile(r"(intent-keys-e\d+)(-short)?-(v\d+)\.mp4")
EPISODE_REVIEW = {"speech-and-joins", "brief-exceptions", "sheet-reveals", "quizzes",
                  "captions", "framing", "privacy"}
SHORT_REVIEW = {"speech-and-joins", "captions", "framing", "key-display", "cards", "privacy"}


def evidence_file(root, reference):
    need(isinstance(reference, dict) and reference.get("path") and reference.get("sha256"),
         "Intent review evidence is missing")
    path = (root / reference["path"]).resolve()
    need(path.is_relative_to(root.resolve()) and digest(path) == reference["sha256"],
         f"Intent review evidence is stale: {path}")
    return path


def require_handoff(export, media=MEDIA):
    export = Path(export).resolve()
    identity = EXPORT_NAME.fullmatch(export.name)
    need(identity and export.parent == (media / "renders").resolve(), "Use the exact Intent Keys review export")
    episode, short, version = identity.groups()
    review = read(media / "references" / f"{export.stem}-handoff.json")
    need(review.get("schemaVersion") == 1 and approval_matches(review, "Jerami"),
         "Intent review approval is missing or stale")
    preflight = evidence_file(media, review.get("preflight"))
    receipt = read(preflight)
    folder = Path(receipt["composition"])
    need(folder.name == episode if not short else folder.parent.name == episode,
         "Intent review is for another episode")
    need(preflight == preflight_path(folder, media, version).resolve(), "Intent review has the wrong preflight")
    require_preflight(folder, version, media)
    measured = read(evidence_file(media, review.get("measurements")))
    need(Path(measured["file"]).resolve() == export and measured.get("sha256") == digest(export),
         "Intent review export is stale")
    need(measured.get("preflightSha256") == digest(preflight), "Intent measurement is stale for this preflight")
    expected_frames = receipt["evidence"].get("finalFrames", receipt["evidence"].get("clockFrames"))
    need(expected_frames is None or measured.get("frames") == expected_frames, "Intent measured frame count differs from the plan")
    need(measured.get("fullDecode") is True and type(measured.get("frames")) is int
         and measured["frames"] > 0, "Intent review needs a measured export")
    checks = review["checks"]
    required = SHORT_REVIEW if short else EPISODE_REVIEW
    need(required <= checks.keys() and all(
        checks[key].get("status") == "passed" and str(checks[key].get("note", "")).strip()
        for key in required), "Intent review has missing or failed playback checks")
    frames = review["frames"]
    frame_numbers = {frame["frame"] for frame in frames}
    need({0, measured["frames"] - 1} <= frame_numbers and
         all(type(frame) is int and 0 <= frame < measured["frames"] for frame in frame_numbers),
         "Intent review needs opening and final frames from the export")
    for frame in frames:
        evidence_file(media, frame)
    pending = {(gap["startFrame"], gap["endFrame"]) for gap in receipt["evidence"].get("gaps", [])
               if gap["disposition"] == "listen"}
    reviewed = {(row["startFrame"], row["endFrame"]) for row in review.get("gaps", [])
                if row.get("decision") in {"keep", "false-positive", "intentional-hold"}
                and isinstance(row.get("note"), str) and row["note"].strip()}
    need(pending == reviewed, "Intent review needs a listening decision for every flagged gap")
    joins = {row["finalFrame"] for row in review.get("joins", [])
             if row.get("status") == "passed" and isinstance(row.get("note"), str) and row["note"].strip()}
    need(joins == set(receipt["evidence"].get("joinFrames", [])),
         "Intent review needs a playback decision for every cut join")
    return review


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("stage", choices=["check-short", "measure-short", "before-handoff"])
    parser.add_argument("target", type=Path)
    parser.add_argument("export", type=Path, nargs="?")
    args = parser.parse_args()
    try:
        if args.stage == "before-handoff":
            require_handoff(args.target)
            result = args.target
        else:
            gate = ROOT / "scripts/developer-storage/storage-gate.mjs"
            subprocess.run(["node", str(gate), "route", "--client", "INTENT_SOLUTIONS", "--kind", "references"],
                           check=True, stdout=subprocess.DEVNULL)
            if args.stage == "check-short":
                result = check_short(args.target)
            else:
                need(args.export is not None, "measure-short requires the exported MP4")
                result = measure_short(args.target, args.export)
    except (OSError, ValueError, TypeError, KeyError, subprocess.CalledProcessError) as error:
        parser.exit(1, f"{error}\n")
    print(result)
