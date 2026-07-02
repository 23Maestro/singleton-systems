# Singleton Systems Goal Sprint

Updated: 2026-06-22

## Big Idea

Singleton Systems needs one simple operating map. The website, Bear, Eagle,
Notion, Raycast, and Codex skills should all point at the same project lanes instead
of creating a new naming system every time a good idea shows up.

The rule is: name it once, then let each app do its job.

## The Project Lanes

These are the first clean project lanes:

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
Eagle      -> portfolio and visual assets
Notion     -> durable structure and bigger task surface
Raycast    -> action buttons and shortcuts
Shortcuts  -> mobile choose-menu prompt palette
Codex docs -> the home base for rules, copy, and decisions
Skills     -> focused helpers for the exact lane being worked
Hooks      -> later reminders that load the right context automatically
```

Bear folders are tags. The Bear lanes are:

```text
inbox
video
workflow
website
commands
lifeops
```

`lifeops` is the Bear version of Eagle's `04 Personal Systems`.

`commands/codex` is the nested Bear lane for planning docs that help Codex
understand the whole Singleton Systems setup.

The first mobile beta is not a custom app. It is an Apple Shortcuts choose menu
that uses the Bear lanes to build focused prompts for iOS AI beta chat:

```text
inbox
video
workflow
website
commands
lifeops
```

The shortcut should help clarify a raw thought, keep it in the selected lane,
and suggest the next small action without inventing new tags.

## What Is Locked V1

- `singleton-systems` is the current home hub.
- `singleton-systems` is the repo/folder name going forward.
- Eagle has outcome folders, not source folders.
- Bear has lean tag lanes, not a giant dump page.
- Notion / Career HQ holds durable structure.
- Raycast is the action layer.
- MCP is useful for operators, but stable code should use local APIs, files,
  scripts, or CLI routes.

## What Is Pending

- Build a Bear Raycast wrapper similar to Career HQ's Notion/Eagle wrappers.
- Add small Codex hooks only when they reduce drift.
- Build the Singleton Systems LikeC4-style map.
- Reference Prospect Pipeline for source-of-truth discipline, not old company
  language.
- Use content, outreach, LinkedIn, Instagram, podcast, Eagle, Bear, and
  Singleton Systems skills only when the task actually needs them.

## Mini-Project Setup Sprint

1. Test one fake mini-project in read-only mode.
2. Confirm parent task, subtasks, dependencies, and blocker priority shape.
3. Decide whether Mini-Project Size stays in page content or earns a Notion property.
4. If approved, create/update the parent task and sub-tasks.
5. Read back the parent task and first blocker tasks.

## Why This Matters

Video is the wedge. Repeatable systems are the real skill.

The website should no longer trap Singleton Systems inside video-only language.
The public promise is workflow cleanup for operators and small teams. Video
still matters because it gives the offer portfolio: course work, content delivery,
notes/review workflows, and asset handoffs. Underneath that, the system should
keep collecting portfolio that the same brain can clean up repeated work anywhere:
project status, follow-up flows, Raycast commands, Bear capture, Eagle portfolio,
Notion tasks, and small personal systems.

The sprint is not to overbuild. The sprint is to keep the names stable, keep the
surfaces clear, and make every future tool easier to place.
