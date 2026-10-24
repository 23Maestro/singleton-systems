---
name: yt-viral
description: Find what works in a client lane's YouTube niche, ranked by how far each video beat its own channel's median, then name the hook formula. Use for competitor research, a swipe file, or "why did this blow up".
---

# yt-viral

Raw views rank channel size. This ranks each video against its own channel's median.

## Lane first

1. Name the lane: `intent-solutions`, `singleton-systems` or `catena-media`. If the user did not
   say, ask. Never guess the lane from the topic.
2. Read `~/.claude/youtube/lanes/<lane>.json`.
   - Missing, or `status` is `needs-grill`: stop. Tell the user to run `/grill-with-docs` for
     that lane.
   - `ready`: use its `audience` and `series` to pick the niche and the channels to compare.

## Collect, then rank

Collect at least four public videos per channel. `yt-dlp --flat-playlist -J` against a channel URL
works, or a manual list. Public listings only; never a signed-in session.

```json
[{"channel":"...","title":"...","views":412000,"url":"...","duration":613}]
```

```bash
python3 scripts/swipe.py collected.json --min 2.0
```

The formula label judges the title's words against yt-script's 21 formulas. It does not explain
why a video did well; say so.

## Hand back

The top five with their multiples and formulas, the one structure they share, and which of them
the lane could make this week with what it has.

This skill researches. End with: **ship it, or change it?**

Adapted from youtube-agent-skill (MIT).
