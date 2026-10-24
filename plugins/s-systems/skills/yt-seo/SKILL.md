---
name: yt-seo
description: Write a client video's YouTube description, a short tag list and the three search queries it should win, under the lane's packaging rules. Use for "write the description", tags, SEO, or "help this get found".
---

# yt-seo

Search matters most for evergreen videos. For a subscriber-feed video, say so and spend the effort
on yt-package.

## Lane first

1. Name the lane: `intent-solutions`, `singleton-systems` or `catena-media`. If the user did not
   say, ask. Never guess the lane from the topic.
2. Read `~/.claude/youtube/lanes/<lane>.json`.
   - Missing, or `status` is `needs-grill`: stop. Tell the user to run `/grill-with-docs` for
     that lane.
   - `ready`: include what its `packaging.description` requires (for example a sheet link) and
     spell keys and names the lane's way.
3. Never invent a link. Ask for it.

## The description

1. The first two lines say what the video gives, in the words a viewer would type.
2. Then the link or resource the lane requires.
3. Then chapters from yt-chapters.
4. Then the long version: what it covers, who it is for.

## Tags

A weak signal. Use them for spellings, tool names and abbreviations. Fifteen at most.

## The query test

Write the three queries this video should win. Check that the title and first two lines carry
those words. If not, fix the title.

This skill writes. The client publishes. End with: **ship it, or change it?**

Adapted from youtube-agent-skill (MIT).
