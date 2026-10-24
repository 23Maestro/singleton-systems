---
name: yt-plan
description: Plan a week or month of YouTube uploads for a client lane, sized to real hours - one anchor video, one quick video, and Shorts cut from the anchor. Use for a content calendar or "what should we post next".
---

# yt-plan

A plan that does not fit the week is a list of regrets.

## Lane first

1. Name the lane: `intent-solutions`, `singleton-systems` or `catena-media`. If the user did not
   say, ask. Never guess the lane from the topic.
2. Read `~/.claude/youtube/lanes/<lane>.json`.
   - Missing, or `status` is `needs-grill`: stop. Tell the user to run `/grill-with-docs` for
     that lane.
   - `ready`: plan inside its `series`, `format` and `publishing` rules.
3. Ask two things before writing: **how many hours are there**, and **what is already
   half-made**. Ask for the best posting day; do not assume one.

## The week

- **One anchor**: the video the week is for.
- **One quick video**: built from something that exists.
- **Three Shorts from the anchor**, found with yt-shorts.

Three uploads a week, not seven.

## Hand back

A table: day, format, working title, the one-sentence promise, and what already exists. Then the
hours it costs and what to drop first if the week goes wrong. Record client delivery dates in the
lane's task system, not here.

This skill plans. The client publishes. End with: **ship it, or change it?**

Adapted from youtube-agent-skill (MIT).
