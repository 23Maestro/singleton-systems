---
name: yt-comment
description: Sort a client video's YouTube comments into four groups and draft short replies in the lane's voice, with one pin pick. Use for "reply to my comments", a pasted comment thread, or "someone asked X".
---

# yt-comment

Replies in the first few hours decide whether a thread becomes a conversation.

## Lane first

1. Name the lane: `intent-solutions`, `singleton-systems` or `catena-media`. If the user did not
   say, ask. Never guess the lane from the topic.
2. Read `~/.claude/youtube/lanes/<lane>.json`.
   - Missing, or `status` is `needs-grill`: stop. Tell the user to run `/grill-with-docs` for
     that lane. Do not infer a voice.
   - `ready`: reply in its `voice`. Follow its `packaging.pinnedComment` rule when it has one.
3. Never invent a number, a result or a source. Never promise a video nobody agreed to make.

## Sort first

Say how many fall in each group before writing:

1. **Questions**: answer them. Note repeats; they are next-episode ideas.
2. **Corrections**: if right, say so and thank them. Never argue a fact you cannot check.
3. **Praise**: reply to a few with something specific from the comment.
4. **Bait**: no reply. Say so and move on.

## Replies

- Under 30 words. Answer the question in the first sentence.
- One question back, only when it is real.
- No emoji unless the lane voice uses them.

Pick one comment to pin: the question most people share. If the lane fixes the pinned comment,
use that.

This skill drafts. The client posts. End with: **ship it, or change it?**

Adapted from youtube-agent-skill (MIT).
