---
name: yt-script
description: Write a YouTube script for a client lane from a raw idea - five hooks scored against 21 formulas, then the spoken script with on-screen beats. Use for a video script, a hook, an opening line, or "what should I say".
---

# yt-script

One idea into a script the host can read out loud.

## Lane first

1. Name the lane: `intent-solutions`, `singleton-systems` or `catena-media`. If the user did not
   say, ask. Never guess the lane from the topic.
2. Read `~/.claude/youtube/lanes/<lane>.json`.
   - Missing, or `status` is `needs-grill`: stop. Tell the user to run `/grill-with-docs` for
     that lane. Do not infer a voice.
   - `ready`: follow its audience, voice, format and packaging rules. The lane profile wins over
     the defaults below.
3. Never invent a number, a result or a source. Ask for it or write the line without it.

## Score the hook

```bash
python3 scripts/hookscore.py hooks.txt          # rank options, one per line
python3 scripts/hookscore.py --hook "one line"  # score one
```

The formulas are in [references/hooks.json](references/hooks.json). The score is a guide, not a
promise.

## The shape

1. **Hook.** Write five, score them, keep the top two with their scores. The payoff lands by the
   lane's `payoffBySeconds`.
2. **The turn.** One sentence on what the video does, then start doing it. No channel intro.
3. **The body.** One idea per beat. Mark each beat `[ON SCREEN: ...]`.
4. **The payoff.** Deliver what the hook promised and say so.
5. **The close.** The lane's one call to action.

## Hand back

- The two best hooks with their scores.
- The script, beat by beat, with `[ON SCREEN: ...]` on every beat.
- Runtime at 150 words per minute, checked against the lane runtime.
- The formula the winning hook used, in one line.

This skill writes. The client publishes. End with: **ship it, or change it?**

Adapted from youtube-agent-skill (MIT). Licence: [references/upstream-license.md](references/upstream-license.md).
