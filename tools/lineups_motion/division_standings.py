"""Find spoken division names for the Division Standings candidate."""

import argparse
from bisect import bisect_right
import hashlib
import json
from pathlib import Path
import re


DIVISION_PHRASE = re.compile(
    r"\b([AN]FC|[AN][ .]+F[ .]+C\.?)(?:\s+|\s*[-–]\s*)(North|South|East|West)\b",
    re.IGNORECASE,
)


def scan_transcript(transcript_path: Path) -> dict:
    """Return proposed candidates tied to the exact Whisper transcript bytes."""
    source = transcript_path.read_bytes()
    segments = json.loads(source)["transcription"]
    if not segments:
        raise ValueError("A timed Whisper transcript is required.")

    text_parts = []
    token_starts = []
    token_spans = []
    position = 0
    for segment_id, segment in enumerate(segments):
        text_parts.append(" ")
        position += 1
        for token in segment["tokens"]:
            text = token["text"]
            if not text.strip() or text.startswith("[_"):
                continue
            start = position + len(text) - len(text.lstrip())
            token_starts.append(start)
            token_spans.append((segment_id, token["offsets"]["from"], token["offsets"]["to"]))
            text_parts.append(text)
            position += len(text)

    if not token_starts:
        raise ValueError("A timed Whisper transcript is required.")
    candidates = []
    spoken_text = "".join(text_parts)
    for mention in DIVISION_PHRASE.finditer(spoken_text):
        first = bisect_right(token_starts, mention.start()) - 1
        last = bisect_right(token_starts, mention.end() - 1) - 1
        start_segment, cue_start, _ = token_spans[first]
        end_segment, _, cue_end = token_spans[last]
        division = f"{mention.group(1)[0].upper()}FC {mention.group(2).title()}"
        candidates.append({
            "division": division,
            "lane": "recurring board",
            "option": "Division Standings",
            "status": "proposed",
            "segmentIds": list(range(start_segment, end_segment + 1)),
            "cue": {
                "triggerType": "PHRASE",
                "triggerText": " ".join(mention.group().split()),
                "transcriptTimestamp": cue_start / 1000,
                "endTimestamp": cue_end / 1000,
            },
        })
    return {
        "transcriptSha256": hashlib.sha256(source).hexdigest(),
        "candidates": candidates,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("transcript", type=Path, help="Whisper JSON with word offsets.")
    args = parser.parse_args()
    try:
        print(json.dumps(scan_transcript(args.transcript), indent=2))
    except (OSError, ValueError, TypeError, KeyError) as error:
        parser.exit(1, f"Division Standings: {error}\n")


if __name__ == "__main__":
    main()
