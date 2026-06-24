# Singleton Systems Home Hub

## Purpose

`singleton-systems` is the local home repo for Singleton Systems alignment.

Use it as the stable place for:

- the public offer page
- confirmed copy
- UI direction
- operating-system notes
- integration decisions
- source repo references

Do not turn every connected tool into a new source of truth. Name the system once here, then let Bear, Notion, Eagle, Raycast, and Codex serve their specific roles.

## Home Repo

```text
/Users/singleton23/Documents/Development/singleton-systems
```

Current / target repo name:

```text
singleton-systems
```

Current Git remote:

```text
https://github.com/23Maestro/singleton-systems.git
```

The GitHub repo has already moved to `singleton-systems`. The local folder
should match that name so docs, skills, hooks, and external repo references do
not keep carrying old `pipeline-systems-audit` language.

Owns:

- Singleton Systems website
- offer and copy direction
- landing-page UI language
- business operating-system notes
- integration map

## Connected Source Repos

Use this repo as the current home hub. The operating model should not depend on
GitHub or Vercel naming being perfect, but local docs should call this
Singleton Systems.

### Career HQ Raycast Extension

```text
/Users/singleton23/Raycast/career-hq
```

Role:

- Raycast action surface
- Career task creation and updates
- Eagle proof capture
- Notion Career HQ integration

Current command lane:

- Capture Proof Asset
- Create Career Task
- Update Career Task
- Open Proof Folder

Career HQ should point at the active Eagle proof folders and shared labels. It
uses the direct Eagle API route, not MCP, for reliable command behavior.

Current operating name:

```text
Opportunity HQ
```

Opportunity HQ is the durable Notion layer for tasks, projects, job-search
execution, Upwork, Singleton offer work, and proof capture tasks. Career HQ can
remain as the existing Notion/Raycast surface name while the workflow is being
reshaped, but the meaning is now broader than career tasks.

### Prospect Pipeline

```text
/Users/singleton23/Raycast/prospect-pipeline
```

Role:

- passive proof/reference system
- source-of-truth pattern reference
- Scout Prep / Scouting Coordinator map reference

Do not treat Prospect ID-specific workflows as the future business surface. Keep the reusable concepts:

- buckets own meaning
- commands are buttons
- durable truth belongs in one source
- support caches are not lifecycle truth
- naming and placement rules matter

Use Prospect Pipeline and Scout Prep as reference architecture for bucket
ownership, source-of-truth boundaries, and LikeC4-style visual maps. Do not port
Prospect ID-specific names forward unless they are used as source/context
metadata such as `npid`.

## Tool Roles

### Money Clock

Role:

- keep near-term income actions visible
- prevent website polish from consuming the whole day
- balance survival work, Singleton Systems offer work, and proof building

Current reality:

- This operating system is being built while income is urgent.
- Job applications, Upwork proposals, follow-ups, and survival-job leads are not
  secondary chores until income stabilizes.
- Website and offer work still matter, but they should not hide the daily cash
  path.

Daily lanes:

```text
Money Clock      -> job applications, Upwork proposals, follow-ups, cash-path leads
Offer           -> website, copy, beta offer, workflow hub, proof packaging
System Cleanup  -> Bear review, Opportunity HQ cleanup, Eagle assets, commands
```

Until income stabilizes, treat workdays like 8-10 hour shifts. Blue collar and
white collar job/application work should get roughly 60-70% of serious work
time. Upwork, Singleton offer work, proof, and system cleanup share the
remaining time.

Every day through Monday, June 29, 2026 should include:

```text
1 blue collar application block
1 white collar / resume / Upwork block
1 Singleton proof or website block
```

Default rule:

```text
No deep website polish until at least one meaningful Money Clock action is logged.
```

This is not meant to be punitive or robotic. It is the guardrail that keeps the
system honest when hyperfocus wants to spend the whole day on the offer page.

### Cerebral Router

Role:

- official routing hook for every Singleton Systems surface
- name the surface once
- decide where an idea belongs
- keep Bear, Eagle, Opportunity HQ, Raycast, Codex, Shortcuts, LikeC4, docs,
  and skills from drifting
- prevent every new idea from becoming a new folder, tag, command, or doc

The Cerebral router is not a separate database and does not mutate tools by
itself. It is the operating hook that names the owner surface, canonical
fields/options, and next focused skill before any surface is changed.

Use it when a thought mixes business, website, proof, commands, skills, and app
integrations in one pass. If a surface uses stale names/options, update the
canonical docs and skills first, then the live surface or implementation, then
verify.

### Bear

Role:

- raw capture
- low-friction mobile/desktop thinking
- quick mobile and desktop mind dump
- temporary holding place before work becomes durable

Bear should not become the durable operating system. It should catch thoughts quickly with a small topic tag set.

Core Bear tags:

```text
#inbox
#video
#workflow
#website
#commands
#lifeops
```

Optional Bear context tags:

```text
#video/npid
#website/npid
#workflow/raycast
#commands/codex
#commands/shortcuts
#lifeops/car-log
```

Use Bear's nested tags to keep context under the front-facing area. For example, use `#video/npid` for Prospect ID video proof or `#website/npid` when Prospect ID is supporting the website, instead of creating loose `#npid` clutter.

Bear has dynamic tags, not real folders. To make the sidebar lanes exist, create tiny title-only notes where the page title and tag match:

```text
inbox    -> #inbox
video    -> #video
workflow -> #workflow
website  -> #website
commands -> #commands
lifeops  -> #lifeops
```

`lifeops` maps to Eagle's `04 Personal Systems` folder. It is for non-primary but useful personal-system proof like car logs, RBT shortcuts, Raycast experiments, and small repeatable builds. Codex/system notes live under `#commands/codex`, not as a top-level Bear lane.

Do not use lifecycle tags like `#capture`, `#clarify`, `#package`, or `#ship` in Bear. Those are operating concepts, not dump tags.

Use `#commands/shortcuts` for later/passive Apple Shortcuts, share-sheet ideas,
shell/mobile workflow experiments, and small automations that might become
useful proof later. Example: a future transcript step for an existing
Twitter/YouTube/internet-video download Shortcut. These ideas stay in Bear
until human review gives them task weight, proof value, money relevance, or a
real next action.

### Notion

Role:

- durable structured truth
- Opportunity HQ / Career HQ
- workflow hub
- project/state tracking

Notion answers: what is this item, where does it stand, and what happens next?

Opportunity HQ owns the real queue. Use it for any item with task weight,
money pressure, a status, a time estimate, a link, proof work, or a follow-up.
Bear can still catch raw thoughts, but focused queue items should go directly
to Notion / Opportunity HQ.

V1 task buckets:

```text
Cash Jobs
Career Jobs
Upwork
Offer
Proof
```

Buckets are lanes, not projects. Projects are outcomes that need multiple
tasks, proof, or time planning, such as:

```text
Get paid by Monday
Blue collar resume ready
White collar video/broadcast applications
Upwork consultation / proposals
Singleton proof + website
```

Suggested task properties:

```text
Task
Bucket
Status
Time
Money Priority
Project
Work Date
Block
Link
Asset / Proof Link
Notes
```

Use page-body checkboxes only when the checklist is tiny. If a subtask needs
its own time estimate, create it as a related task instead.

Projects and tasks are the two durable databases. Do not create a separate
Focus Board database for v1. The Focus Board, Daily Blocks, Work Calendar,
Applications, Upwork, Singleton, and Proof surfaces should be views of the task
database.

Use `Work Date` and `Block` to turn tasks into a rough daily schedule:

```text
Morning
Midday
Afternoon
Evening
Late
```

For the Money Clock layer, Opportunity HQ should own the Focus Board as a view,
not a separate database. Keep it intentionally plain:

```text
Status:
  Queued
  Today
  In Motion
  Waiting
  Done
  Parked
```

The Focus Board should answer one question quickly:

```text
What has to happen today so money, offer, and proof all keep moving?
```

Do not recreate a full Eisenhower matrix. Delegate is not part of this model.
Use `Parked` for saved-but-not-now ideas instead of guilt or fake deadlines.

Opportunity HQ also acts as the lean Opportunity Log for money-path actions:

```text
survival jobs
career-aligned jobs
Upwork jobs / proposals
direct outreach
Singleton offer tasks
proof assets
```

The Opportunity Log should stay small:

```text
Name
Lane
State
Effort
```

Use rough effort buckets instead of perfect time tracking:

```text
5m | 15m | 30m | 60m | 2h | 4h+
```

The point is to see the true size of the day. A website section, nineteen proof
screenshots, a tailored job application, and a proof video should not all feel
like the same size in the user's head.

Opportunity HQ should also support a simple mobile form:

```text
Task
Bucket
Time
Link / Notes
```

Defaults:

```text
Status = Queued
Money Priority = Critical for Cash Jobs, Career Jobs, and Upwork
Money Priority = Useful for Offer and Proof
Project = blank unless obvious
```

### Eagle

Role:

- proof and asset library
- screenshots
- design references
- video/workflow evidence
- website assets

Eagle answers: what does this asset prove or support?

Preferred folder structure:

```text
Career Proof Library
  00 Inbox
  01 Video Proof
  02 Workflow Proof
  03 Website Assets
  04 Personal Systems
  99 Archive
```

Source names should be metadata/tags, not folders:

```text
nursehub
npid
jason-larkins
personal
upwork
```

`Personal Systems` is for car logs, RBT shortcuts, Raycast experiments, and other small builds that prove the same repeatable-system instinct.

### Raycast

Role:

- action layer
- quick capture
- quick update
- open the right surface

Raycast commands should trigger known actions against known buckets. They should not define the business logic.

### Apple Shortcuts / Mobile

Role:

- first mobile action layer
- quick capture into Bear or Opportunity HQ
- simple choose-menu prompt palette for iOS AI beta chat
- lane-aware prompt building before deeper app integrations exist

Use two mobile paths:

```text
Quick Thought -> Bear
Log Task      -> Notion / Opportunity HQ
```

Bear is for raw, unclear, emotional, exploratory, or "do not lose this" capture.
Opportunity HQ is for focused queue items that need status, time, bucket,
money priority, link, follow-up, proof work, or project relation.

Future App Intents or deeper App Shortcuts should come after the workflows are
stable. Mobile should start with low-friction prompt routing, not a custom app.

## Working State Model

Use this as a quiet lifecycle model:

```text
Capture -> Clarify -> Package -> Ship
```

Definitions:

- Capture: raw thought, no pressure
- Clarify: decide what it is
- Package: turn it into a reusable artifact, workflow, proof item, skill, page section, command, or offer component
- Ship: publish, build, send, deploy, or archive

This lifecycle can appear in docs, Notion/Career HQ status fields, or planning notes. It should not become Bear tag sprawl.

## Visual Update Rule

Sketches, screenshots, Excalidraw-style maps, or whiteboard images can be used
as routing evidence. When a visual model clarifies the system, convert it into
the written operating contract:

```text
Surface roles
Bucket names
Notion fields
Command names
Daily operating rules
```

Do not leave visual models as one-off inspiration. If the model changes routing
or ownership, update this repo's docs and the relevant skills.

## Shared Label Direction

Prefer a small shared label language across Bear, Eagle, and Notion, while respecting each app's quirks:

```text
website
workflow
video
commands
lifeops
```

Optional source/context labels:

```text
nursehub
npid
jason-larkins
personal
upwork
raycast
career
```

App quirk: Bear should usually express these as nested context tags under the front-facing area, such as `#video/npid`, `#website/npid`, `#workflow/raycast`, `#commands/codex`, or `#lifeops/car-log`. Eagle and Notion can keep plain labels as metadata because they already have folders, fields, and relations.

This is v1. Allow up to v3 refinement, then lock and use the system instead of renaming endlessly.

## Integration Rule

MCP is an operator/control layer, not the dependency layer.

If code needs reliability, build against stable local APIs, scripts, files, or env config. MCP can expose tools and shortcuts, but the system should not break because an MCP server is inactive.

Current local routes:

```text
Eagle skill CLI route: 127.0.0.1:41596
Career HQ Eagle API route: 127.0.0.1:41595
Bear direct route: /Applications/Bear.app/Contents/MacOS/bearcli
Bear MCP route: optional operator layer only
```

For app integrations, prefer the most stable direct route first:

```text
Eagle -> local HTTP API / existing direct script path
Bear  -> bearcli first, MCP optional
Notion -> official API / Career HQ wrapper
Raycast -> local extension commands
Apple mobile -> Shortcuts first, App Intents later
```

Bear wrapper direction:

- Build future custom Bear workflows through a local forked Raycast extension when the lanes are stable.
- Mirror the Career HQ wrapper style: small command helpers that call stable local routes.
- Prefer `bearcli` or a stable local route for dependable automation.
- Keep MCP as a useful operator/control layer, not the dependency layer.
- Future Bear wrapper commands can create/open lane notes, append to a lane, append with nested context, search lanes, and generate small computer-specific update templates on the fly.

Future integration planning belongs in:

```text
docs/04_singleton-systems-integration-map.md
```

## Local Env

Local integration settings live in:

```text
.env.local
```

This file is gitignored and should contain only machine-local integration values such as Bear MCP token, repo paths, and library hints.
