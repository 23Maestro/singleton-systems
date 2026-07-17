# Commands

Updated: 2026-07-05

## Purpose

This is the early naming page for the command layer around Singleton Systems.

The goal is not to build every shortcut now. The goal is to name the desire
early so Obsidian, Raycast, Karabiner, Hammerspoon, Keyboard Maestro, and Codex can
eventually feel like one cohesive system instead of a pile of clever one-offs.

## Core Idea

Commands are the hands of the system.

```text
Obsidian  -> raw quick capture only
Opportunity HQ / Notion -> durable task and job-hunt state
Linear    -> durable Command Ops issues ready for Codex
Raycast   -> desktop action surface
Karabiner -> keyboard layers and mode switches
Hammerspoon -> window clicks, app glue, and Mac quirks
Keyboard Maestro -> durable macros and multi-step automations
Apple Shortcuts -> mobile/share-sheet action surface
Codex     -> helps name, inspect, and build the next version
```

Commands should support the work without becoming another planning app.
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

## Current Command Split

Use the owner surface as the first naming check:

```text
Raw thought / unclear note      -> Obsidian
Job hunt / task-shaped capture  -> Opportunity HQ / Notion
Proof or asset capture          -> Eagle
Desktop action                  -> Raycast
Mobile/share-sheet action       -> Apple Shortcuts
Reasoning or cleanup            -> Codex Assist after review
```

Do not name command lanes after Obsidian folders unless the command really writes
raw notes into Obsidian. Job-search and task-shaped flows should use Opportunity
HQ project lanes, not Obsidian folder names.

Current command names should stay plain:

```text
Log Opportunity Task
Update Opportunity Task
Capture Portfolio Asset
Open Opportunity HQ
Notion Job Hunt Start
```

Planning the day belongs in Codex + Opportunity HQ review. Raycast and Apple
Shortcuts should trigger capture/update actions against known tasks and project
lanes; they should not become the planning brain.

## Mobile Command Layer

Apple Shortcuts is the first mobile/share-sheet action layer. It currently has
two different jobs, and they should not be mixed:

Use two mobile capture paths:

```text
Quick Thought -> Obsidian
Command Ops   -> Linear
Log Task      -> Notion / Opportunity HQ
```

Obsidian is for raw, unclear, emotional, exploratory, or "do not lose this"
thoughts. Opportunity HQ is for focused queue items with status, time, project
lane, money priority, link, follow-up, portfolio work, or project relation.

The screenshot with `Select Project`, `Cash Jobs`, and `Career Jobs` is the
Notion / Opportunity HQ job-hunt logging shortcut. It is not raw capture and it
is not an Obsidian folder picker.

Passive shortcut ideas can still be captured as raw notes, but working shortcuts
should be documented by the action they perform and the owner surface they write
to.

`S.System Inbox` uses one explicit exception to its Obsidian destination menu:

```text
New -> Command Ops
  -> open a prefilled Linear draft
  -> Team: 23Maestro
  -> Project: Command Ops
  -> Status: Backlog
```

The draft uses exactly three headers: `Intent`, `Context`, and `Done when`.
Linear remains the human review gate; the Shortcut does not create an issue
silently and stores no Linear API key. `Update` does not offer `Command Ops`;
existing work is updated on its Linear issue.

## Mobile + Desktop Unison

Mobile and desktop should use the same owner names and fields. The device only
changes the trigger.

```text
Phone / Share Sheet -> quick capture or job link intake
Mac / Raycast       -> review, update, open, and repeat actions
Codex Assist        -> cleanup, routing, drafting, and review
Owner surface       -> Obsidian, Opportunity HQ, or Eagle
```

For Opportunity HQ work, both mobile Shortcuts and desktop Raycast should speak
the same small field language:

```text
Task
Link
Project
Status
Duration
Work Date
Money Priority
```

Do not create mobile-only lane names, Obsidian folder aliases, or Raycast-only
status names. If a shortcut writes `Cash Jobs`, `Career Jobs`, `Today`, or
`Queued`, those names should match Opportunity HQ.

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

Use this for Notion / Opportunity HQ logging shortcuts and any Obsidian
raw-capture replacement:

```text
1. Screenshot every visible block from top to bottom.
2. Transcribe the exact action names in order.
3. Record every variable name, menu label, URL, and destination.
4. Mark which blocks are proven working.
5. Only then write the replacement Shortcut.
```

Replacement direction:

```text
Notion Job Hunt Start -> Opportunity HQ / Notion
Raw thought           -> Obsidian
Credential storage    -> review before Data Jar, Shortcuts dictionary, or app token storage
```

### Notion Job Hunt Start

The current screenshots show the `Notion Job Hunt Start` Apple Shortcut. This
is an Opportunity HQ / Notion task creation shortcut for job-search links from
the share sheet.

Captured working shape:

```text
Receive Apps and 18 more from Share Sheet
If no input: Continue
Get URLs from Shortcut Input
Get first item from URLs
Get name of Shortcut Input
Get first item from Name
```

The shortcut then asks for the Opportunity HQ lane:

```text
Choose from menu: Select Project
  Cash Jobs
  Career Jobs

Cash Jobs branch:
  Text = [Cash Jobs project id]
  Set variable project_id to Text

Career Jobs branch:
  Text = [Career Jobs project id]
  Set variable project_id to Text
```

The shortcut then asks for initial task status:

```text
Choose from menu: Select Status
  Today
  Queued

Today branch:
  Text = Today
  Current Date
  Format Date
  Get first item from Formatted Date
  Text = formatted date
  Set variable work_date to Text

Queued branch:
  Text = Queued
```

If the status menu result is `Today`, the Notion page create payload includes
`Work Date` set to the current formatted date. Otherwise it creates the page
without a work date.

The Notion API write is:

```text
POST https://api.notion.com/v1/pages

Headers:
  Notion-Version: 2026-03-11
  Content-Type: application/json
  Authorization: Bearer [token]

Request body:
  parent.data_source_id = [Opportunity Tasks data source id]
  properties.Status.status.name = [Menu Result]
  properties.Task.title[0].text.content = [shared item name]
  properties.Link.url = [shared URL]
  properties.Project.relation[0].id = [project_id]
  properties.Work Date.date.start = [work_date] when status is Today
  properties.Money Priority.select.name = Critical
  properties.Duration.select.name = 30m
```

This shortcut does not plan the day. It creates a job-hunt Opportunity Task from
a shared link, assigns it to `Cash Jobs` or `Career Jobs`, and marks it `Today`
or `Queued`. Any broader daily planning belongs in Codex + Opportunity HQ
review after capture.

Do not lock new credentials, project IDs, or data source IDs into a replacement
shortcut without first verifying the live Notion surface and using the smallest
revocable token scope available.

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

## Command Growth Rule

Start with the smallest action surface that fits:

```text
Apple Shortcuts -> mobile/share-sheet capture
Raycast         -> desktop command UI and hotkeys
Codex Assist    -> reviewed text/routing help
Hammerspoon     -> Mac window/app quirks
Keyboard Maestro -> repeated multi-app desktop macro
Karabiner       -> keyboard layer only after the action is stable
```

Do not promote an idea into Hammerspoon, Keyboard Maestro, or Karabiner until the
same action has repeated enough to make the extra layer worth it.

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
Notion Job Hunt Start
Log Opportunity Task
Update Opportunity Task
Capture Portfolio Asset
```

The action name should say what it does and where it belongs.

## Pending

- Review old Prospect ID leader-key commands and retire what no longer belongs.
- Replace former Prospect ID command muscle memory with Opportunity HQ /
  Singleton Systems commands.
- Keep mobile Shortcuts and desktop Raycast aligned to the same owner names,
  fields, and statuses.
- Keep this cerebral, but lean: name it once, test it, then decide if it earns a
  permanent shortcut.
