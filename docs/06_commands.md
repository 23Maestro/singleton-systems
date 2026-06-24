# Commands

Updated: 2026-06-22

## Purpose

This is the early naming page for the command layer around Singleton Systems.

The goal is not to build every shortcut now. The goal is to name the desire
early so Bear, Raycast, Karabiner, Hammerspoon, Keyboard Maestro, and Codex can
eventually feel like one cohesive system instead of a pile of clever one-offs.

## Core Idea

Commands are the hands of the system.

```text
Bear      -> where the thought lands
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

Keep the naming close to the Bear lanes and Eagle folders:

```text
inbox
video
workflow
website
commands
lifeops
commands/codex
commands/karabiner
commands/hammerspoon
commands/maestro
commands/shortcuts
money-clock
plan-today
log-opportunity-task
capture-proof-asset
update-opportunity-task
```

If a command idea does not fit one of these lanes, it should probably stay as a
raw thought until it is clearer.

## Quick Task Hubs

Some command ideas are not proof assets and do not need Eagle-style folders.
They are small workflow helpers for personal operating friction.

Use the Bear lane name once, then let the command tools point at that same lane.

```text
Bear tag/note name -> quick task hub
Raycast            -> launcher and wrapper
Karabiner          -> keyboard layer
Hammerspoon        -> window/click/app glue
Keyboard Maestro   -> durable repeated macro
```

This is the model for future personal workflow commands:

```text
inbox
commands/karabiner
commands/hammerspoon
commands/maestro
commands/codex
commands/shortcuts
lifeops/car-log
lifeops/rbt-support
website/npid
```

The important part is the name. Do not make separate bucket names for the same
idea in Bear, Raycast, Karabiner, Hammerspoon, and Keyboard Maestro. Name the
workflow once, then let each tool handle its role.

Raycast is implied as the launcher/wrapper. Do not create a Bear tag just to
say Raycast unless the note is specifically about the Raycast extension.

Use `inbox` for raw under-10-minute tasks or unclear captures. If choosing the
right lane takes more than a few seconds, put it in `inbox` and clean it later.

Pending examples:

```text
Bear editing layer
Opportunity HQ / Career HQ command layer
Money Clock check-in
Log Opportunity Task
Plan Today
Update Opportunity Task
Car inventory/log command
RBT shortcut/support command
Screenshot/PDF review command
Window click/focus helper
```

These can start as Bear notes or Raycast commands. Only promote them into
Karabiner, Hammerspoon, or Keyboard Maestro after the repeated action is obvious.

## Mobile Command Layer

Apple Shortcuts is the first mobile command layer. The immediate beta is a
choose-menu prompt palette for iOS AI beta chat.

Use it for:

```text
choose a Bear lane
paste or dictate the raw thought
build a focused AI chat prompt
ask for the next small action
keep the lane/tag language stable
```

First menu:

```text
Inbox
Systems
Life Ops
```

Systems menu:

```text
website
video
workflow
commands
```

The prompt should ask the AI chat to clarify the thought, keep it aligned with
the selected lane, and avoid inventing new tags unless the user explicitly asks.

Use two mobile capture paths:

```text
Quick Thought -> Bear
Log Task      -> Notion / Opportunity HQ
```

Bear is for raw, unclear, emotional, exploratory, or "do not lose this"
thoughts. Opportunity HQ is for focused queue items with status, time, bucket,
money priority, link, follow-up, proof work, or project relation.

Passive shortcut ideas belong in Bear first, especially later Apple Shortcuts,
shell/mobile experiments, share-sheet ideas, and small automations that might
become proof someday. Use `#commands/shortcuts` for these. Promote them to
Opportunity HQ only after human review.

Do not start with a custom mobile app. If a Shortcut becomes repeated and
important, it can later become:

```text
Raycast command on desktop
Bear CLI wrapper
Notion/Career HQ action
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
Plan Today
  Open Opportunity HQ's Today / Money Clock view and make today's Queued /
  Today / In Motion split visible.

Money Clock Check-In
  Ask what job, proposal, application, or follow-up action has been logged today.

Log Opportunity Task
  Create a lean Opportunity HQ task with bucket, status, time, money priority,
  link/notes, and project when obvious.

Update Opportunity Task
  Update status, notes, or proof link on an existing Opportunity HQ
  task.

Export Focus Blocks
  Later: turn today's Opportunity HQ tasks into Apple Calendar-style time
  blocks.
```

The old Prospect Pipeline calendar exporter is the reference pattern: analyze a
real work queue, estimate blocks, then export time to Apple Calendar. Do not
build the exporter until Opportunity HQ's bucket, status, time, and priority
fields are stable.

## Duration-Aware Commands

These are pending command ideas for the Money Clock layer:

```text
Log Opportunity
  Create a lean Opportunity HQ item with bucket, status, time, money priority,
  link/notes, and project when useful.

Estimate Next Move
  Apply the Duration Key to a Bear capture, Opportunity HQ task, or proof task.

Plan Focus Blocks
  Group active Opportunity HQ work into Money Clock, Offer, and
  System Cleanup blocks.
```

Use rough effort buckets, not fake precision:

```text
5m    quick capture, reply, or tiny cleanup
15m   screenshot, Eagle asset, short follow-up, small proof note
30m   job application, Upwork proposal, resume tweak, cover note
60m   focused page section, proof package, consultation block
2h    website section build, grouped proof capture, workflow documentation
4h+   proof video, full page pass, larger system build
```

The command should help the user see the real size of the day before hyperfocus
takes over.

## Examples To Keep In Mind

### Bear Editing Layer

When editing or capturing in Bear, a future Karabiner layer could make common
actions feel instant:

```text
capture into current lane
append to commands/codex
open website lane
open workflow lane
send selected text to Raycast command
```

This should stay simple. The shortcut should help the thought land, not force a
big taxonomy decision.

### Hammerspoon Quirk Layer

Use Hammerspoon for odd Mac behavior that is more about windows, clicks, focus,
or UI glue than durable business logic.

Examples:

```text
focus Bear capture window
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
export a proof asset
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
Capture Website Proof
Append to commands/codex
Create Workflow Note
Open Video Proof Folder
```

The action name should say what it does and where it belongs.

## Pending

- Review old Prospect ID leader-key commands and retire what no longer belongs.
- Replace former Prospect ID command muscle memory with Opportunity HQ /
  Singleton Systems commands.
- Decide which commands belong in Raycast first, then only promote stable ones
  into Karabiner, Hammerspoon, or Keyboard Maestro.
- Build future shortcuts around the same lanes used by Bear and Eagle.
- Keep this cerebral, but lean: name it once, test it, then decide if it earns a
  permanent shortcut.
