"""Validate evidence labels; optionally verify the private recovery archive."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "skills/alex-growth/references/source-index.json"
CHANNEL = "UCUyDOdBWhC1MCxEjC46d-zw"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def validate(index, archive=None):
    ids = set()
    for row in index["constructs"]:
        name = row["id"]
        require(name not in ids, f"Duplicate construct: {name}")
        ids.add(name)
        pdf, video = row.get("pdf"), row.get("video")
        expected = ("paired" if pdf and video else "pdf-only" if pdf else
                    "video-only" if video else "lesson-only" if row.get("lessonUrl") else "gap")
        require(row["status"] == expected, f"{name}: misleading evidence label")
        require(expected == "paired" or row.get("gap"), f"{name}: explain missing evidence")
        if pdf:
            source = index["pdfs"].get(pdf["sourceId"])
            require(source is not None, f"{name}: missing PDF source")
            require(pdf["pages"] and all(isinstance(p, int) and 1 <= p <= source["pageCount"]
                                        for p in pdf["pages"]), f"{name}: invalid PDF page")
        if video:
            source = index["videos"].get(video["sourceId"])
            require(source is not None, f"{name}: missing video source")
            require(source["uploader"]["channelId"] == CHANNEL, f"{name}: unverified uploader")
            start, end = video["startSeconds"], video["endSeconds"]
            require(0 <= start < end <= source["durationMs"] / 1000, f"{name}: invalid time window")
            first, last = video["segmentIndices"]
            require(0 <= first <= last < source["captionCount"], f"{name}: invalid caption range")
            require(video["review"] == "caption-window-read", f"{name}: missing review")
            require(video["url"] == f"https://www.youtube.com/watch?v={video['sourceId']}&t={start}s",
                    f"{name}: timestamp link differs from evidence")
            if archive:
                captions = json.loads((archive / source["transcriptFile"]).read_text())["transcript"]
                # Indices record the inclusive range of caption starts inside the reviewed window.
                selected = [i for i, item in enumerate(captions)
                            if start * 1000 <= int(item["startMs"]) < end * 1000]
                require(selected and [selected[0], selected[-1]] == [first, last],
                        f"{name}: caption range does not match reviewed time")
    if archive:
        for source in index["pdfs"].values():
            check_hash(archive, source["file"], source["sha256"])
        for source in index["videos"].values():
            check_hash(archive, source["metadataFile"], source["metadataSha256"])
            check_hash(archive, source["transcriptFile"], source["transcriptSha256"])
            metadata = json.loads((archive / source["metadataFile"]).read_text())
            require(metadata["channel"]["id"] == source["uploader"]["channelId"] == CHANNEL,
                    "Archived uploader differs")
            transcript = json.loads((archive / source["transcriptFile"]).read_text())
            require(len(transcript.get("transcript") or []) == source["captionCount"], "Caption count differs")
    return len(ids)


def check_hash(archive, filename, expected):
    path = (archive / filename).resolve()
    require(path.is_relative_to(archive.resolve()), "Source path leaves archive")
    require(hashlib.sha256(path.read_bytes()).hexdigest() == expected, f"Changed source: {filename}")


def check_package():
    manifest = json.loads((ROOT / "plugin.json").read_text())
    require(manifest["name"] == "alex-growth", "Wrong package name")
    require("interface" in manifest["extensions"]["com.openai"], "Missing Codex interface")
    require(not (ROOT / ".codex-plugin").exists(), "Unexpected legacy overlay")
    import re
    for path in ROOT.rglob("*.md"):
        content = path.read_text()
        require("/Users/" not in content and "/Volumes/" not in content, f"Nonportable path: {path}")
        for target in re.findall(r"\]\(([^)]+)\)", content):
            if "://" not in target and not target.startswith("#"):
                require((path.parent / target.split("#")[0]).exists(), f"Broken link in {path.name}: {target}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path)
    args = parser.parse_args()
    check_package()
    count = validate(json.loads(INDEX.read_text()), args.archive)
    print(f"PASS: package links and {count} source rows" + ("; archived bytes and caption windows match" if args.archive else ""))
