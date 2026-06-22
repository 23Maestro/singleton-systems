# Singleton Systems Goal Sprint

Updated: 2026-06-22

## Big Idea

Singleton Systems needs one simple operating map. The website, Bear, Eagle,
Notion, Raycast, and Codex skills should all point at the same buckets instead
of creating a new naming system every time a good idea shows up.

The rule is: name it once, then let each app do its job.

## The Buckets

These are the first clean buckets:

```text
Website
Offer
Video
Workflow
Codex
Career
Personal Systems
```

LikeC4 direction: keep the map small, use clear colors, use simple labels, and
make every node mean one thing. If a map starts feeling like a mural, split it.

## The App Jobs

```text
Bear       -> quick capture lanes
Eagle      -> proof and visual assets
Notion     -> durable structure and bigger task surface
Raycast    -> action buttons and shortcuts
Shortcuts  -> mobile choose-menu prompt palette
Codex docs -> the home base for rules, copy, and decisions
Skills     -> focused helpers for the exact lane being worked
Hooks      -> later reminders that load the right context automatically
```

Bear folders are tags. The Bear lanes are:

```text
video
workflow
website
codex
npc
```

`npc` is the Bear version of Eagle's `04 Personal Systems`.

`codex/systems` is the first nested Bear test lane for planning docs that help
Codex understand the whole Singleton Systems setup.

The first mobile beta is not a custom app. It is an Apple Shortcuts choose menu
that uses the Bear lanes to build focused prompts for iOS AI beta chat:

```text
inbox
video
workflow
website
codex
npc
```

The shortcut should help clarify a raw thought, keep it in the selected lane,
and suggest the next small action without inventing new tags.

## What Is Locked V1

- `pipeline-systems-audit` is the current home hub.
- `singleton-systems` is the pending repo/folder name.
- Eagle has outcome folders, not source folders.
- Bear has lean tag lanes, not a giant dump page.
- Notion / Career HQ holds durable structure.
- Raycast is the action layer.
- MCP is useful for operators, but stable code should use local APIs, files,
  scripts, or CLI routes.

## What Is Pending

- Rename the local repo folder when timing is clean.
- Build a Bear Raycast wrapper similar to Career HQ's Notion/Eagle wrappers.
- Add small Codex hooks only when they reduce drift.
- Build the Singleton Systems LikeC4-style map.
- Reference Prospect Pipeline for source-of-truth discipline, not old company
  language.
- Use content, outreach, LinkedIn, Instagram, podcast, Eagle, Bear, and
  Singleton Systems skills only when the task actually needs them.

## Why This Matters

Video is the wedge. Repeatable systems are the real skill.

The website sells the clean video workflow offer first. Underneath that, the
system should keep collecting proof that the same brain can clean up repeated
work anywhere: video edits, project status, Raycast commands, Bear capture,
Eagle proof, Notion tasks, and small personal systems.

The sprint is not to overbuild. The sprint is to keep the names stable, keep the
surfaces clear, and make every future tool easier to place.
