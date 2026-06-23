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
Singleton Offer  -> website, copy, beta offer, workflow hub, proof packaging
System Cleanup   -> Bear review, Career HQ cleanup, Eagle assets, commands
```

Default rule:

```text
No deep website polish until at least one meaningful Money Clock action is logged.
```

This is not meant to be punitive or robotic. It is the guardrail that keeps the
system honest when hyperfocus wants to spend the whole day on the offer page.

### Cerebral Router

Role:

- name the surface once
- decide where an idea belongs
- keep Bear, Eagle, Notion, Raycast, Codex, and skills from drifting
- prevent every new idea from becoming a new folder, tag, command, or doc

The Cerebral router is not a separate database yet. It is the operating logic in
`docs/04_singleton-systems-integration-map.md`.

Use it when a thought mixes business, website, proof, commands, skills, and app
integrations in one pass.

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

### Notion

Role:

- durable structured truth
- Career HQ
- workflow hub
- project/state tracking

Notion answers: what is this item, where does it stand, and what happens next?

For the Money Clock layer, Notion / Career HQ should own a small Focus Board.
Keep it intentionally plain:

```text
Lane:
  Survival Job
  Upwork Cash
  Singleton Offer
  Proof

State:
  Now
  Next
  Parked
```

The Focus Board should answer one question quickly:

```text
What has to happen today so money, offer, and proof all keep moving?
```

Do not recreate a full Eisenhower matrix. Delegate is not part of this model.
Use `Parked` for saved-but-not-now ideas instead of guilt or fake deadlines.

Career HQ may also need a lean Opportunity Log for money-path actions:

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
- quick capture into known lanes
- simple choose-menu prompt palette for iOS AI beta chat
- lane-aware prompt building before deeper app integrations exist

The first desired mobile beta is a Shortcut that lets Jerami choose a lane,
dictate or paste the thought, and generate a focused prompt that respects the
Bear lanes.

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
