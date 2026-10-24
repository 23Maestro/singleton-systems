---
name: yt-shorts
description: Find the Shorts inside a client's long video - moments that stand alone - and write a new first line, on-screen text and crop notes for each under the lane's Short rules. Use for "cut this into Shorts" or "what should we clip".
---

# yt-shorts

A Short is a moment that makes sense without the video around it.

## Lane first

1. Name the lane: `intent-solutions`, `singleton-systems` or `catena-media`. If the user did not
   say, ask. Never guess the lane from the topic.
2. Read `~/.claude/youtube/lanes/<lane>.json`.
   - Missing, or `status` is `needs-grill`: stop. Tell the user to run `/grill-with-docs` for
     that lane.
   - `ready`: follow its `short` rules (length, crop, captions, music, title and end cards) and any
     client-listed Short moments. Those win over picking.

## Pick

From the transcript, find spans that fit the lane's Short length where:

1. It opens on a complete thought.
2. It has a turn: a claim, then proof or a twist.
3. It ends on a line, not a trail-off.

Show the top five with timecodes and first lines.

## Write each one

- A new first line, scored with yt-script's hook scorer.
- On-screen text for the first two seconds, in different words from the spoken line.
- A loop point: the last line sets up the first.
- A crop note: what a 9:16 crop loses, and whether the command and key overlay still read.
- The source range for each moment.

Cuts land in measured pauses, not on caption times. End with: **ship it, or change it?**

Adapted from youtube-agent-skill (MIT).
