---
name: yt-chapters
description: Write YouTube chapters from a client video's delivered transcript, checked against YouTube's rules and the lane's chapter targets so they render. Use for "add chapters", timestamps, or sections.
---

# yt-chapters

## Lane first

1. Name the lane: `intent-solutions`, `singleton-systems` or `catena-media`. If the user did not
   say, ask. Never guess the lane from the topic.
2. Read `~/.claude/youtube/lanes/<lane>.json`.
   - Missing, or `status` is `needs-grill`: stop. Tell the user to run `/grill-with-docs` for
     that lane.
   - `ready`: use its `format.chapters` targets and minimum length.

## Run it

Use the transcript of the final cut, not the raw takes.

```bash
python3 scripts/chapters.py episode.srt --target 6
```

YouTube ignores a chapter list unless:

- the first entry is 0:00,
- there are at least three,
- each runs at least 10 seconds.

The tool checks all three.

## Retitle every line

The tool finds the boundaries from real pauses. Its titles are topic words, a draft only. Rename
each one with the lane's chapter names when the lane lists them, or as the promise of that section
in three to five words. A section you cannot name in five words is two sections.

This skill writes. The client publishes. End with: **ship it, or change it?**

Adapted from youtube-agent-skill (MIT).
