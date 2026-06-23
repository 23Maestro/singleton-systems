# Singleton Systems Integration Map

## Purpose

This is the future-facing map for how Singleton Systems connects tools, repos, skills, MCPs, env vars, local source paths, hooks, and plugin surfaces.

Keep this lean. Name each surface once, define what it owns, and avoid turning connected tools into competing sources of truth.

## Core Rule

MCP is an operator/control layer, not the dependency layer.

If code needs reliability, build against stable local APIs, scripts, files, or env config. MCP can expose tools and shortcuts, but the system should not break because an MCP server is inactive.

## Surfaces To Map

```text
Home Repo
External Source Repos
Skills
MCP Tools
Local APIs
Raycast Commands
Command Layer
Notion Surfaces
Bear Capture
Eagle Assets
Env Vars
Hooks
Naming Rules
```

## V1 Locked Direction

- Current local home hub: `/Users/singleton23/Documents/Development/pipeline-systems-audit`
- Target repo/folder name: `singleton-systems`
- Current Git remote: `https://github.com/23Maestro/singleton-systems.git`
- Pending Git/Mac folder target: `singleton-systems`
- Companion operating doc: `docs/02_phase-one-operating-system.md`
- Confirmed site copy doc: `docs/01_confirmed-copy.md`
- Command layer doc: `docs/06_commands.md`
- Bear role: quick capture with lean topic tags
- Eagle role: proof and asset library
- Notion/Career HQ role: durable structured truth
- Raycast role: action layer
- Codex skills/hooks role: keep context aligned across surfaces

Do not rename local folders, remotes, or path-based integrations until the
rename is handled as its own focused pass. For now, docs may say Singleton
Systems while the local path still says `pipeline-systems-audit`.

## Cerebral Router

This is the plain-English router for the whole system.

It is not a database yet, and it is not a giant memory file. It is a small set
of definitions that helps Codex, Bear, Notion, Eagle, Raycast, skills, and
future hooks agree on what each surface means.

Working rule:

```text
Name the thing once.
Put it in the right surface.
Only automate it after the repeated action is obvious.
```

The router answers:

- what bucket does this idea belong to?
- which app owns the durable version?
- which skill should Codex load?
- is this a command, proof asset, website idea, workflow idea, or personal system?
- should this stay quick-capture, become a Notion/Career HQ item, or turn into code?

The router should stay boring on purpose. If a label needs explanation every
time, it is not ready to become a tag, command, skill, or folder.

## Mobile / Apple Layer

Mobile capture starts with Apple Shortcuts as a focused prompt palette, not a
custom app.

Current direction:

```text
Apple Shortcuts -> choose-menu prompt palette
Bear            -> fast mobile text capture
Notion          -> durable structured destination
Raycast         -> desktop action layer
Codex           -> naming, implementation, and system review
```

The first useful beta is a Shortcut that helps build focused prompts for the
iOS AI beta chat using Shortcut action language:

```text
Choose Menu:
  inbox
  website
  video
  workflow
  commands
  lifeops

Prompt shape:
  Here is the raw thought.
  Route it to the selected lane.
  Keep the language simple.
  Suggest the next small action.
  Do not invent new tags unless needed.
```

This is a conflict palette: choose the lane, paste or dictate the thought, then
let the prompt help clarify where it goes without forcing a full task system on
mobile.

Future direction:

- App Intents can expose stable app actions to Shortcuts, Siri, Spotlight, and
  Apple Intelligence.
- App entities can make content discoverable and actionable by system surfaces.
- App Shortcuts are a possible later layer once the local workflows are stable.
- Do not build this first. Start with simple Shortcuts prompts and choose-menu
  actions, then graduate repeated actions into deeper app integrations.

Current research anchor:

- Apple documents App Intents as the bridge between an app's features and
  system experiences like Siri, Shortcuts, widgets, Spotlight, and Apple
  Intelligence.
- Apple’s 2026 App Intents material emphasizes Apple Intelligence, Siri
  context, Spotlight semantic indexing, structured search, and on-screen
  awareness as future-facing integration paths.

Use this as direction, not scope. The first useful mobile version is still a
choose-menu prompt that helps put the thought in the right lane.

## Local Routes

```text
Eagle skill CLI route: 127.0.0.1:41596
Career HQ Eagle API route: 127.0.0.1:41595
Bear direct route: /Applications/Bear.app/Contents/MacOS/bearcli
Bear MCP route: optional operator layer only
```

MCP can expose tools for operator convenience. Reliable code should call stable
local APIs, scripts, files, or env config directly.

## V1 Bear Tags

Core tags:

```text
#inbox
#video
#workflow
#website
#commands
#lifeops
```

Optional context tags:

```text
#video/npid
#website/npid
#commands/codex
#lifeops/car-log
```

Quick command tags:

```text
#commands/karabiner
#commands/hammerspoon
#commands/maestro
```

Use Bear's nested tags for support context. The first segment should name the front-facing area; the second segment should name the support source or channel.

Use `#inbox` for raw under-10-minute tasks or unclear captures. Do not rely on
Bear's app-level Inbox/Notes view as a durable automation target. The explicit
`#inbox` tag is searchable and scriptable through `bearcli`.

Raycast is the action layer and is implied in command workflows. Do not create a
Bear tag just to say Raycast unless the specific note is about the Raycast
extension itself.

Bear's visible folders are tags. Seed Bear with title-only notes where note title and tag match:

```text
inbox    -> #inbox
video    -> #video
workflow -> #workflow
website  -> #website
commands -> #commands
lifeops  -> #lifeops
```

`lifeops` maps to Eagle `04 Personal Systems`. Codex/system notes live under `#commands/codex`, not as a top-level Bear lane.

Do not use `#capture`, `#clarify`, `#package`, or `#ship` as Bear tags.

## V1 Eagle Shape

```text
Career Proof Library
  00 Inbox
  01 Video Proof
  02 Workflow Proof
  03 Website Assets
  04 Personal Systems
  99 Archive
```

Source/context tags:

```text
nursehub
npid
jason-larkins
personal
upwork
```

## Skill Intentions

Use skills as narrow operating contracts, not giant memory dumps.

```text
singleton-systems
  Owns the business direction, offer, website copy, proof strategy, and cross-surface alignment.

bear
  Owns Bear capture rules, direct bearcli usage, nested tag discipline, and MCP-as-optional guidance.

eagle
  Owns Eagle proof/assets actions through the local Eagle API CLI.

content-creator
  Owns content strategy, proof packaging, video/page copy direction, and repurposing logic.

upwork-proposal
  Owns Upwork job-post replies, consultation pitches, and question-first proposal variants.

resume-tailor
  Owns job-post-to-resume alignment, truthful bullet swaps, keywords, and application positioning.

cover-letter-casual
  Owns short, human cover notes that avoid corporate filler and overbuilt application language.

career-proof-packager
  Owns turning Eagle assets, screenshots, repo examples, Upwork proof, and workflow demos into reusable proof blocks.

content-from-proof
  Owns turning proof assets into practical content angles, captions, posts, and light schedules.

cerebral-router
  Owns first-pass routing when a thought mixes business, website, proof, commands, Bear, Eagle, Notion, Raycast, hooks, or skills.

linkedin-content-creator / instagram-curator / podcast-strategist
  Use when proof needs to become platform-specific content. Do not load these by default for ordinary website edits.

sales-outreach / outbound-strategist
  Own outbound positioning, offer clarity, proof-led messaging, and target-specific outreach.

ad-creative-strategist
  Use later for paid tests, angle generation, hooks, and creative packaging after the offer/proof base is clearer.

backend-architect
  Use later for client hub data models, internal CRM, finance tracker, integrations, and automation architecture.

scoutprep-business-logic
  Reference only. Use its bucket/source-of-truth discipline, LikeC4 visual rules, and naming-once logic.

prospect-supabase-source-of-truth
  Reference only when borrowing source-of-truth patterns from Prospect Pipeline. Do not import NP-specific workflow names as the future product.

raycast-extension-builder
  Owns Career HQ command implementation, Raycast UI conventions, and local action routing.

backend-architect
  Owns direct-route architecture, API contracts, reliability rules, and the rule that MCP is operator/control only.

build-ios-apps:ios-app-intents
  Future reference for App Intents and Apple Shortcuts once mobile actions are ready to become a real app or app-facing integration.

karabiner-config-migrator / hammerspoon-browser-automation / km-assembler-mode
  Own command-layer implementation only after the command name and lane are stable in docs/Bear.
```

The goal is one Singleton Systems operating model with specialized skills around
it, not one large skill trying to remember every possible workflow.

## Opportunity And Proof Skill Stack

Use this stack for career, outreach, and brand-building work:

```text
Upwork job post
  -> upwork-proposal + sales-outreach

Job post / resume tailoring
  -> resume-tailor

Cover note / casual application message
  -> cover-letter-casual

Screenshot / Eagle asset / project proof
  -> career-proof-packager + eagle

Proof asset into LinkedIn / Instagram / content
  -> content-from-proof + platform-specific skill only when needed

Mixed idea / "where does this go?"
  -> cerebral-router
```

Research-backed build rule:

- Keep skills narrow and description-led so Codex can trigger the right one without loading a giant memory file.
- Use hooks later as trusted routing/preload helpers, not hidden automation that mutates surfaces.
- For mobile, expose only stable, common actions. Shortcuts/App Intents should come after the repeated action is clear.
- For Bear, prefer direct app routes (`bearcli` or x-callback-url) for reliable actions; MCP stays optional.

## Hook Queue V1

Future hooks should route the agent to the right docs and skills. They should not
create tags, move assets, or write Notion pages by themselves.

```text
mentions: upwork, proposal, client post, job post
  load: upwork-proposal, sales-outreach, singleton-systems

mentions: resume, application, job description, tailor
  load: resume-tailor, singleton-systems

mentions: cover letter, cover note, application note
  load: cover-letter-casual

mentions: Eagle, proof, screenshot, reference, asset
  load: career-proof-packager, eagle

mentions: LinkedIn, Instagram, content, brand, schedule
  load: content-from-proof, then platform skill if needed

mentions: where does this go, offload, Bear, capture, route
  load: cerebral-router, bear

mentions: Shortcut, Karabiner, Hammerspoon, Maestro, command
  load: cerebral-router, docs/06_commands.md, then exact implementation skill
```

Hook rule:

```text
Route attention first. Ask the focused skill to do the work second.
```

For the business loop, milestones, content lanes, Upwork lane, proof bank rules,
and future skill candidates, use `docs/02_phase-one-operating-system.md` as the
companion operating document. This file owns the integration map; the Phase One
doc owns the week-to-week business mold.

## Reference Repos And What To Borrow

### Prospect Pipeline

```text
/Users/singleton23/Raycast/prospect-pipeline
```

Borrow:

- bucket ownership
- source-of-truth boundaries
- action commands as buttons
- proof of repeatable systems
- Scout Prep / Scouting Coordinator mapping discipline
- LikeC4-style visual mapping rules

Do not borrow:

- Prospect ID-specific naming as product language
- stale former-work shortcuts
- command-specific labels unless they become source/context metadata

### Career HQ

```text
/Users/singleton23/Raycast/career-hq
```

Owns:

- Raycast action surface for capture/update/open commands
- Eagle proof capture against outcome folders
- durable Career HQ routing to Notion/Career surfaces
- practical proof operations for Singleton Systems

## Naming Once Rules

Use these as the first pass for buckets:

```text
Website
Offer
Workflow
 Codex
Career
Personal Systems
```

Use these as source/context tags:

```text
npid
nursehub
jason-larkins
upwork
raycast
notion
bear
eagle
```

Rules:

- Folders answer what the item is for.
- Tags answer where it came from or what supports it.
- Commands open or mutate known buckets; commands do not become buckets.
- A repeated idea should get one plain name before it becomes a tag, folder, skill, or command.
- If a label makes the user pause and ask where it belongs, it is probably too clever.

## Query Routing Rules

Use this when the user drops a mixed thought in plain language:

```text
website copy / section wording
  -> docs/01_confirmed-copy.md, singleton-systems, content-creator, sales-outreach

business loop / offer / proof / weekly path
  -> docs/02_phase-one-operating-system.md, singleton-systems

surface ownership / app roles / repo paths / hooks / skills
  -> docs/04_singleton-systems-integration-map.md, singleton-systems, backend-architect

commands / shortcut layers / macro ideas
  -> docs/06_commands.md, bear, raycast-extension-builder, plus the exact command skill only when building

quick raw thought under ten minutes
  -> Bear #inbox

video proof
  -> Eagle 01 Video Proof, Bear #video or #video/context

repeatable workflow proof
  -> Eagle 02 Workflow Proof, Bear #workflow or #workflow/context

site asset or reference
  -> Eagle 03 Website Assets, Bear #website or #website/context

personal repeatable system
  -> Eagle 04 Personal Systems, Bear #lifeops or #lifeops/context

Codex/workspace/system idea
  -> Bear #commands/codex, then docs/04 if it becomes durable
```

Do not force every thought into Notion. Notion is for durable structure after
the thought earns structure.

## Legacy ChatGPT Project Reference

Old source:

```text
Video Editing + Workflow Offer
```

Use it as a reference for:

- Upwork consultation page templates
- short question-first proposal writing
- proof-bank capture prompts
- Career HQ page/task generation
- daily execution tracking

Do not use it as the current positioning source. The current Singleton Systems
direction is:

```text
Video workflow cleanup is the entry point.
Repeatable production systems are the deeper skill.
AI-assisted steps are useful when they save real time.
```

When a future Shortcut, Codex prompt, or Notion connector creates a Career HQ
item, it should borrow the old project's clean templates, not its old split-offer
positioning.

Default Career HQ page block shape:

```text
Goal
Why it matters
Inputs needed
Action list
Proof or asset links
Next review point
```

Use this for Upwork consultations, website sections, workflow buildouts,
proof-capture tasks, and other items that need more than quick Bear capture.
The model is: one clean page, a small task list, and enough context to return
later without rethinking the whole idea.

## Hook And Config Intentions

Hooks should be added later only where they reduce drift.

Potential hooks:

```text
on repo open
  remind agent this repo is the Singleton Systems home hub.

before website copy edits
  load singleton-systems and content-creator.

before proof/library work
  load singleton-systems and eagle.

before Career HQ command work
  load raycast-extension-builder and singleton-systems.

before Bear capture work
  load bear and singleton-systems.
```

Do not make hooks noisy. The hook should point to the right operating contract,
not dump every connected surface into every turn.

Current Codex config already has hook state references in
`/Users/singleton23/.codex/config.toml`. Treat that as proof that hooks are a
real option, but do not add Singleton Systems hooks until the target behavior is
specific.

Future hook candidates:

```text
on opening this repo
  remind Codex this is the Singleton Systems home hub and point to this doc.

on website copy work
  point to confirmed copy and singleton-systems skill.

on Bear/Career HQ integration work
  point to Bear skill, integration map, and command doc.

on command-layer work
  point to docs/06_commands.md and the exact implementation skill.
```

Hook rule:

```text
A hook should route attention, not perform taxonomy.
```

## LikeC4 / Map Direction

Use Scout Prep visual-map rules as the design reference:

- color means state or risk
- shape means surface type
- edge labels are short verbs
- maps should have 5-9 meaningful nodes first
- split maps before they become murals

Singleton Systems map buckets should start with:

```text
Thought Capture -> Bear
Durable Structure -> Notion / Career HQ
Proof Assets -> Eagle
Actions -> Raycast
Home Docs -> pipeline-systems-audit now / singleton-systems target
Reference Systems -> Prospect Pipeline
Business Surface -> Website
```

This is the "Scouting Coordinator" equivalent for Singleton Systems: a small map
that explains where work belongs before adding commands, tags, folders, or
automation.

## App Quirks To Respect

### Bear

- Bear has dynamic tags, not folders.
- Bear's sidebar folder tree is created by tags and nested tags.
- Keep core tags lean.
- Use nested tags for context, such as `#video/npid`, `#website/npid`, `#workflow/raycast`, `#commands/codex`, or `#lifeops/car-log`.
- Use `#commands/codex` as the nested lane for Codex-system planning docs.
- Do not use lifecycle tags as Bear tags.
- Use `bearcli` directly for reliable local automation.
- Do not create a global Singleton Systems dump note by default.
- Future Bear automation should be wrapped in the local forked Raycast extension, similar to Career HQ's Notion/Eagle wrappers, once the tag lanes are stable.
- Future Bear wrapper commands may generate small computer-specific update templates on the fly, but template creation should stay lane-based and explicit.

### Eagle

- Eagle folders should be outcome folders.
- Source names are tags or metadata.
- The Eagle skill CLI currently uses port `41596`.
- Career HQ currently uses port `41595`.

### Notion / Career HQ

- Notion holds durable structure.
- Career HQ is the focused action/update surface.
- Status fields can use lifecycle concepts, but Bear should not.
- Use "In Motion" as active-work language where the Career HQ surface supports
  it.
- If a capture becomes a real initiative, Career HQ should get a structured page
  instead of a loose note.

### Raycast

- Raycast is the action layer.
- Commands should feel like shortcuts into named buckets.
- Replace old Prospect ID leader-key ideas with Career HQ / Singleton Systems actions only after the buckets are stable.

## Open Later

- Bear MCP config and direct API wrapper shape
- Career HQ Raycast command mapping after folder/tag rewrite
- Notion Career HQ schema alignment
- Prospect Pipeline reusable-logic references
- LikeC4-inspired naming and visual logic map
- Codex hook implementation
- Repo rename from `pipeline-systems-audit` to `singleton-systems`
