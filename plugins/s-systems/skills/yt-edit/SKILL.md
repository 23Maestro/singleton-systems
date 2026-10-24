---
name: yt-edit
description: Turn a client recording's transcript into a review list of cuts - dead air, filler and retakes, with timecodes - under the lane's edit rules. Use for "cut the dead space", "tighten this", or a first pass before the edit.
---

# yt-edit

A review list of cuts from a timestamped transcript. It prints proposals. The editor places each
cut by ear.

## Lane first

1. Name the lane: `intent-solutions`, `singleton-systems` or `catena-media`. If the user did not
   say, ask. Never guess the lane from the topic.
2. Read `~/.claude/youtube/lanes/<lane>.json`.
   - Missing, or `status` is `needs-grill`: stop. Tell the user to run `/grill-with-docs` for
     that lane.
   - `ready`: follow its `editing` and `format` rules. A lane that keeps named mistakes keeps them,
     even when the tool flags them.

## Run it

```bash
python3 scripts/deadair.py transcript.srt              # srt, vtt or whisper json
python3 scripts/deadair.py transcript.srt --floor 0.35 --json
```

No transcript? Make one first. Do not guess timings.

- **DEAD**: gaps longer than the floor, trimmed from the middle so both sides keep a breath.
- **FILLER**: cues that are only "um", "so yeah", "basically". A lone "Okay" or "So" can be the
  host's style; check the lane voice before cutting it.
- **REPEAT**: a sentence restarted.

## Rules for the cuts

- Treat every line as a proposal. Place the actual cut in a measured pause. Never cut on caption
  or Whisper word times alone; they drift after pauses.
- Change only the span under review.
- The removed total counts speech only. A long silent demo makes it wrong; check it against the
  footage.

This skill writes. The editor applies. End with: **ship it, or change it?**

Adapted from youtube-agent-skill (MIT).
