---
name: yt-package
description: Write and check a YouTube title and thumbnail as one pair for a client lane - length, repeated words and vague words. Use for title ideas, thumbnail text, low click-through, or renaming a video.
---

# yt-package

The title and the thumbnail are one unit. The thumbnail should say what the title does not.

## Lane first

1. Name the lane: `intent-solutions`, `singleton-systems` or `catena-media`. If the user did not
   say, ask. Never guess the lane from the topic.
2. Read `~/.claude/youtube/lanes/<lane>.json`.
   - Missing, or `status` is `needs-grill`: stop. Tell the user to run `/grill-with-docs` for
     that lane. Do not infer a voice.
   - `ready`: follow its `packaging` rules (title pattern, thumbnail owner). The lane profile wins
     over the defaults below.
3. Never invent a number, a result or a source.

## Check the pair

```bash
python3 scripts/title.py --title "..." --thumb "CTRL R"
python3 scripts/title.py titles.txt     # one per line, ranked
```

- 60 characters is the desktop search cut. 40 is the mobile feed cut.
- The thumbnail must not repeat the title's words.
- Three words at most on the thumbnail.
- A number, a name or a date beats an adjective.
- Two all-caps words at most.

## Hand back

Write ten titles in the lane's title pattern, run them all, and show the top three with the issue
on each. For the winner, write the thumbnail brief: expression, framing, the three words, and the
background contrast. If the lane says the client makes the thumbnail, hand the brief to them.

This skill writes. The client publishes. End with: **ship it, or change it?**

Adapted from youtube-agent-skill (MIT).
