---
name: yt-audit
description: Audit a client lane's YouTube channel - titles, thumbnails, first fifteen seconds, upload rhythm, retention - and end with one fix. Use for "audit the channel", "why isn't it growing", or a pasted channel URL.
---

# yt-audit

An audit with twenty problems hides the one that matters. This ends in one fix.

## Lane first

1. Name the lane: `intent-solutions`, `singleton-systems` or `catena-media`. If the user did not
   say, ask. Never guess the lane from the topic.
2. Read `~/.claude/youtube/lanes/<lane>.json`.
   - Missing, or `status` is `needs-grill`: stop. Tell the user to run `/grill-with-docs` for
     that lane.
   - `ready`: judge the channel against its `audience`, `format` and `packaging` rules.
3. Never invent a number, a result or a source.

## Look, in this order

1. **The last ten titles as a set.** Check them with yt-package's title checker.
2. **Thumbnails at feed size.** If three are unreadable small, that is the fix.
3. **The first fifteen seconds of the three newest videos.** Transcribe and score them with
   yt-script's hook scorer.
4. **Upload rhythm.** Consistency, not frequency.
5. **Retention**, if exported. Use yt-retention.

## Hand back

- The one biggest fix and what to do this week.
- Three things already working, named exactly.
- What not to do yet, and why.

End with: **ship it, or change it?**

Adapted from youtube-agent-skill (MIT).
