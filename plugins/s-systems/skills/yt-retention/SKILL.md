---
name: yt-retention
description: Read a YouTube Studio audience-retention export for a client video and find where viewers leave - hook leak, cliffs and slow slide - then name one fix. Use for a pasted retention CSV, "why do people stop watching", or pacing.
---

# yt-retention

The retention graph is the most honest feedback YouTube gives.

## Lane first

1. Name the lane: `intent-solutions`, `singleton-systems` or `catena-media`. If the user did not
   say, ask. Never guess the lane from the topic.
2. Read `~/.claude/youtube/lanes/<lane>.json`.
   - Missing, or `status` is `needs-grill`: stop. Tell the user to run `/grill-with-docs` for
     that lane.
   - `ready`: judge the hook against its `payoffBySeconds` and pacing against
     `screenChangeEverySeconds`.

## Run it

Get the file: Studio → the video → Analytics → Engagement → audience-retention chart → download.

```bash
python3 scripts/retention.py retention.csv --duration 600
python3 scripts/retention.py retention.csv --transcript episode.srt
```

Pass the episode's delivered SRT so each drop shows what was being said.

- **Hook leak**: loss in the first 30 seconds. Under 25% is healthy. Fix the opening script first.
- **Cliffs**: single steep drops at one moment.
- **Slide**: steady loss across the middle. Fix it by cutting, not rewriting.

## Hand back

The single biggest leak and one change for it. If the hook is healthy and the slide is flat, the
video is fine; send the user to yt-package.

End with: **ship it, or change it?**

Adapted from youtube-agent-skill (MIT).
