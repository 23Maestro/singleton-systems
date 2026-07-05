# Commands

Updated: 2026-06-22

## Purpose

This is the early naming page for the command layer around Singleton Systems.

The goal is not to build every shortcut now. The goal is to name the desire
early so Obsidian, Raycast, Karabiner, Hammerspoon, Keyboard Maestro, and Codex can
eventually feel like one cohesive system instead of a pile of clever one-offs.

## Core Idea

Commands are the hands of the system.

```text
Obsidian  -> where the thought lands
Raycast   -> where the action starts
Karabiner -> keyboard layers and mode switches
Hammerspoon -> window clicks, app glue, and Mac quirks
Keyboard Maestro -> durable macros and multi-step automations
Apple Shortcuts -> mobile choose-menu prompt palette
Codex     -> helps name, inspect, and build the next version
```

Commands should support the Money Clock without becoming another planning app.
The command layer should make it easy to create, open, update, clarify, rewrite,
and route work in the right surface.

## Current Passive References

These are reference surfaces, not confirmed implementation targets for every
future command.

```text
Raycast Hammerspoon extension:
/Users/singleton23/.config/raycast/extensions/hammerspoon

Raycast Karabiner extension:
/Users/singleton23/.config/raycast/extensions/karabiner-manager

Raycast Keyboard Maestro extension:
/Users/singleton23/.config/raycast/extensions/list-keyboard-maestro-macros

Karabiner config:
/Users/singleton23/.config/karabiner/karabiner.json

Keyboard Maestro app data:
/Users/singleton23/Library/Application Support/Keyboard Maestro
```

## Desired Command Shape

Keep the naming close to the Obsidian folders and Eagle folders:

```text
inbox
command-ops
production-ops
business-ops
money-clock
plan-today
log-opportunity-task
capture-portfolio-asset
update-opportunity-task
```

If a command idea does not fit one of these lanes, it should probably stay as a
raw thought until it is clearer.

## Quick Task Hubs

Some command ideas are not portfolio assets and do not need Eagle-style folders.
They are small workflow helpers for personal operating friction.

Use the Obsidian folder name once, then let the command tools point at that same lane.

```text
Obsidian folder/note -> quick capture hub
Raycast            -> launcher and wrapper
Karabiner          -> keyboard layer
Hammerspoon        -> window/click/app glue
Keyboard Maestro   -> durable repeated macro
```

This is the model for future personal workflow commands:

```text
inbox
command-ops
production-ops
business-ops
```

The important part is the name. Do not make separate lane names for the same
idea in Obsidian, Raycast, Karabiner, Hammerspoon, and Keyboard Maestro. Name the
workflow once, then let each tool handle its role.

Raycast is implied as the launcher/wrapper. Do not create an Obsidian folder just to
say Raycast unless the note is specifically about the Raycast extension.

Use `inbox` for raw under-10-minute tasks or unclear captures. If choosing the
right lane takes more than a few seconds, put it in `inbox` and clean it later.

Pending examples:

```text
Obsidian capture layer
Opportunity HQ Raycast command layer
Money Clock check-in
Log Opportunity Task
Suggest Focus Blocks
Update Opportunity Task
Car inventory/log command
RBT shortcut/support command
Screenshot/PDF review command
Window click/focus helper
```

These can start as Obsidian notes or Raycast commands. Only promote them into
Karabiner, Hammerspoon, or Keyboard Maestro after the repeated action is obvious.

## Mobile Command Layer

Apple Shortcuts is the first mobile command layer. The immediate beta is a
choose-menu prompt palette for iOS AI beta chat.

Use it for:

```text
choose an Obsidian folder
paste or dictate the raw thought
build a focused AI chat prompt
ask for the next small action
keep the lane/tag language stable
```

First menu:

```text
_Inbox
Command Ops
Production Ops
Business Ops
```

The prompt should ask the AI chat to clarify the thought, keep it aligned with
the selected lane, and avoid inventing new tags unless the user explicitly asks.

Use two mobile capture paths:

```text
Quick Thought -> Obsidian
Log Task      -> Notion / Opportunity HQ
```

Obsidian is for raw, unclear, emotional, exploratory, or "do not lose this"
thoughts. Opportunity HQ is for focused queue items with status, time, project
lane, money priority, link, follow-up, portfolio work, or project relation.

Passive shortcut ideas belong in Obsidian first, especially later Apple Shortcuts,
shell/mobile experiments, share-sheet ideas, and small automations that might
become real commands someday. Use `Command Ops` for these. Promote them to
Opportunity HQ only after human review.

Shortcut help has two modes:

```text
Apple Intelligence instructions -> write the prompt that should build or revise the Shortcut.
Manual Shortcut help            -> walk the user through the Shortcuts editor block by block.
```

When writing Apple Intelligence instructions, use direct action language and
the latest visible Shortcuts or App Intents action name when known. Expect Apple
Intelligence to handle the native Shortcuts skeleton, but not every third-party
app action.

If the user asks for manual Shortcut help, default to simple 7th-grade,
block-by-block instructions. Think from the user's Shortcuts screen, not from
code. Name the exact action to search, use the latest visible Shortcuts or App
Intents action name when known, say what token or variable goes in each blank,
and call out which existing block to delete or keep.

Manual Shortcut help format:

```text
1. Search for action: [exact action name]
2. Add it under: [existing block name]
3. Tap: [field name]
4. Put in: [literal value, token, or variable]
5. Keep: [block name]
6. Delete: [block name]
7. Test: [what result should appear]
```

Use this manual format when Apple Intelligence is in beta, chooses the wrong
action, cannot add a third-party action, or produces a prompt that fails.

Use exact Shortcuts action names where possible:

```text
Receive Input
Get URLs from Input
If
Ask for Input
Get Item from List
Set Variable
Get File
Save File
Copy to Clipboard
Show Result
```

For third-party actions, name the app action directly and tell the user what to
search inside Shortcuts. Do not paraphrase app action names when the user needs
to find the block manually.

## Shortcut Capture Lock

Before replacing a working mobile Shortcut, capture the existing Shortcut
exactly from screenshots. Do not design the Obsidian or Notion variant from
memory.

Use this for the old Bear inbox shortcut, Obsidian `_Inbox` replacement, and
Notion / Opportunity HQ logging shortcut:

```text
1. Screenshot every visible block from top to bottom.
2. Transcribe the exact action names in order.
3. Record every variable name, menu label, URL, and destination.
4. Mark which blocks are proven working.
5. Only then write the replacement Shortcut.
```

Replacement direction:

```text
Bear inbox shortcut -> Obsidian `_Inbox` via Advanced URI first
Raw thought         -> Obsidian
Task/log/status     -> Notion / Opportunity HQ
Credential storage  -> review before Data Jar, Shortcuts dictionary, or app token storage
```

For Notion capture, do not lock credentials into a Shortcut until the logging
shape is stable. If credentials are needed, review the smallest storage option
first and prefer a revocable token with the narrowest useful scope.

Do not start with a custom mobile app. If a Shortcut becomes repeated and
important, it can later become:

```text
Raycast command on desktop
Obsidian MCP / Advanced URI wrapper
Notion / Opportunity HQ action
App Intent / App Shortcut
```

App Intents are future-facing. They should expose stable actions after the
workflow names are already clear.

## Cerebral Command Rule

The Cerebral layer routes the thought before the command exists.

```text
What is this?
Where does it belong?
What app owns it?
Is it repeated enough to earn a command?
```

Only after those questions are obvious should the command move into Raycast,
Karabiner, Hammerspoon, Keyboard Maestro, or Apple Shortcuts.

## Money Clock Commands

These are future commands, not implementation requirements yet:

```text
Money Clock Check-In
  Ask what job, proposal, application, or follow-up action has been logged today.

Goal Check-In
  Ask weekly count/result questions, then return one or two daily implications.
  Start as local prompt/cache if needed; do not create a new database first.

Log Opportunity Task
  Create a lean Opportunity HQ task with project, status, time, money priority,
  link/notes, and the linked project's icon DB source.

Update Opportunity Task
  Update status, notes, portfolio link, or project on an existing Opportunity HQ
  task. When the project changes, refresh the task icon from the new project's
  icon DB source.

Export Focus Blocks
  Codex-owned manual run: read approved Opportunity HQ tasks, generate a small
  `.ics` file, copy the plain-text summary, then ask before writing Work Date /
  Shift back to Notion.
```

The old Prospect Pipeline calendar exporter is the reference pattern: analyze a
real work queue, estimate blocks, then export `.ics` into Downloads. Do not use
Raycast or AppleScript as the planning owner.

## Duration-Aware Commands

These are pending command ideas for the Money Clock layer:

```text
Log Opportunity
  Create a lean Opportunity HQ item with project, status, time, money priority,
  link/notes, and the linked project's icon DB source.

Estimate Next Move
  Apply the Duration Key to an Obsidian capture, Opportunity HQ task, or portfolio task.

Suggest Focus Blocks
  Codex groups approved Opportunity HQ work into Money Clock, Offer, and
  System Cleanup blocks for review.
```

Use rough effort buckets, not fake precision:

```text
5m    quick capture, reply, or tiny cleanup
15m   screenshot, Eagle asset, short follow-up, small portfolio note
30m   job application, freelance proposal, resume tweak, cover note
60m   focused page section, portfolio package, consultation block
2h    website section build, grouped portfolio capture, workflow documentation
4h+   portfolio video, full page pass, larger system build
```

The command should help the user see the real size of the day before hyperfocus
takes over.

## Examples To Keep In Mind

### Obsidian Capture Layer

When capturing in Obsidian, a future Raycast or Shortcut layer could make common
actions feel instant:

```text
capture into _Inbox
append to Command Ops
open Production Ops
open Business Ops
send selected text to Raycast command
```

This should stay simple. The shortcut should help the thought land, not force a
big taxonomy decision.

### Hammerspoon Quirk Layer

Use Hammerspoon for odd Mac behavior that is more about windows, clicks, focus,
or UI glue than durable business logic.

Examples:

```text
focus Obsidian capture window
move a floating utility window
click a stubborn UI control
route a browser/tool window to the right place
```

Hammerspoon should solve Mac friction. It should not become the main system of
record.

### Keyboard Maestro Durable Macro Layer

Use Keyboard Maestro when a repeated desktop workflow has enough shape to be a
real macro.

Examples:

```text
export a portfolio asset
prepare a repeated message
run a multi-app capture flow
package a screenshot or PDF review
```

Keyboard Maestro is for useful repeatability after the workflow is obvious.

## Naming Rule

Name the intent before naming the shortcut.

Bad:

```text
hyper+i thing
old prospect key
random capture macro
```

Better:

```text
Open Opportunity HQ
Capture Website Portfolio
Append to commands/codex
Create Workflow Note
Open Video Portfolio Folder
```

The action name should say what it does and where it belongs.

## Pending

- Review old Prospect ID leader-key commands and retire what no longer belongs.
- Replace former Prospect ID command muscle memory with Opportunity HQ /
  Singleton Systems commands.
- Decide which commands belong in Raycast first, then only promote stable ones
  into Karabiner, Hammerspoon, or Keyboard Maestro.
- Build future shortcuts around the same folders used by Obsidian and Eagle.
- Keep this cerebral, but lean: name it once, test it, then decide if it earns a
  permanent shortcut.
