# Singleton Systems Integration Map

## Purpose

This is the future-facing map for how Singleton Systems connects tools, repos, skills, MCPs, env vars, local source paths, hooks, and plugin surfaces.

Keep this lean. Name each surface once, define what it owns, and avoid turning connected tools into competing sources of truth.

## Core Rule

MCP is an operator/control layer, not the dependency layer.

If code needs reliability, build against stable local APIs, scripts, files, or env config. MCP can expose tools and shortcuts, but the system should not break because an MCP server is inactive.

## Repo Shape Rule

Do not add more mindless numbered docs. A new idea should first go into the
current owner doc, an owner folder such as `docs/harness` or `docs/portfolio`,
or the truth matrix. Create a new top-level doc only when it names a durable
surface or contract.

Future cleanup should rename existing numbered files by owner/topic instead of
continuing numeric-prefix root docs.

## Cerebral First

Cerebral is the brain/front-door hook for mixed Singleton Systems work. It names
the surface, owner, canonical fields/options, and next focused skill before
`singleton-systems`, Opportunity HQ, Obsidian, Eagle, Raycast, LikeC4, website,
copy/portfolio, or other downstream skills act.

Cerebral does not mutate tools by itself. It routes and aligns first; then the
owner surface changes, and the change is verified. It should be inquisitive
before it is corrective: ask which surface owns the work, whether the name is
canonical, and what should be left alone before saying something is wrong.

For content-reference and hook-framework inputs, keep the durable rule in
skills, not a new database or command. `planning-idea-routing` should classify
the reference, then `offer-proof-content` should translate it into Singleton
Systems proof using real case studies, the current social variables
(`platform`, `reference_set`, `direct_style`, `post_format`, `attack_type`),
and the Psychology-Led Proof Attacks contract. Raycast may later expose a
review action only after the workflow repeats.

## Harness V1

Singleton Systems uses a lightweight harness structure to keep context sound
without building agents, Slack, Discord, Hermes, or a bot runtime.

Canonical harness contract:

```text
docs/harness
```

Foundation Pass:

```text
docs/harness/foundation-pass.md
```

Use this when an AI-assisted build needs foundation naming before implementation:
route first, name durable structures, name interfaces, map the change, run or
describe a trial implementation, state invariants, then implement only the
approved slice.

Steal the architecture, not the infrastructure:

```text
lane decides context
context decides tools
task state stays isolated
human reviews before mutation
old noise gets compressed
```

Opportunity HQ project lanes can act like channel boundaries. Cerebral routes
the lane and owner first; Opportunity Tasks hold active state, sub-tasks,
dependencies, Goal Horizon, Work Date, Shift, Duration, and Status.

The harness uses a small packet grammar, inspired by tag-style handoffs but kept
as docs-only contract:

```text
[lane] [owner] [intent] [shape] [tools] [review] [memory]
```

Those are routing labels, not Bear tags and not a runtime format.

## HQ Harness Logs

Runtime watchfulness belongs in Singleton Systems HQ logs.

Root:

```text
/Users/singleton23/singleton_systems_hq/logs
```

Use five real Opportunity HQ lanes plus one router folder:

```text
all_buckets/harness.jsonl
cash_jobs/harness.jsonl
career_jobs/harness.jsonl
freelance/harness.jsonl
offer/harness.jsonl
portfolio/harness.jsonl
```

`all_buckets` is for Cerebral router and cross-lane decisions. The other folders
match the durable Opportunity HQ lanes. Do not add arbitrary folder names.

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
Obsidian Capture
Eagle Assets
Env Vars
Hooks
Naming Rules
```

## V1 Locked Direction

- Current local home hub: `/Users/singleton23/Documents/Development/singleton-systems`
- Repo/folder name: `singleton-systems`
- Current Git remote: `https://github.com/23Maestro/singleton-systems.git`
- External Raycast action repo: `/Users/singleton23/Raycast/career-hq`
- Companion operating doc: `docs/operating-system/phase-one-operating-system.md`
- Confirmed site copy doc: `docs/offer/confirmed-copy.md`
- Command layer doc: `docs/commands.md`
- Truth matrix doc: `docs/truth-matrix.md`
- Obsidian role: quick capture with lean folders and tiny templates
- Obsidian folders: `_Inbox`, `Command Ops`, `Production Ops`, `Business Ops`,
  `Templates`
- Bear role: readable archive/import source only
- Eagle role: portfolio and asset library
- Notion / Opportunity HQ role: durable structured truth
- Raycast role: action layer
- Cerebral role: first routing hook before Singleton Systems or downstream skills
- Codex skills/hooks role: keep context aligned across surfaces
- Supabase role: durable business facts and event logs only after a read-only
  design pass

Local folders, remotes, and path-based integrations should use
`singleton-systems` going forward. When an external tool still points at the old
name, update that reference directly instead of adding aliases.

CareerHQ / Opportunity HQ Raycast is an external hub. Singleton Systems may
reference it in docs, skills, maps, and operating contracts, but it does not own
or build it. Do not move `/Users/singleton23/Raycast/career-hq` into the
Vercel-built Singleton Systems repo just to make the system feel unified.

Use segmented Git checks when work crosses both repos:

```bash
git -C /Users/singleton23/Documents/Development/singleton-systems status
git -C /Users/singleton23/Raycast/career-hq status
```

If a publish/update touches both surfaces, finish and verify the Singleton
Systems website/docs slice first, then finish and verify the CareerHQ Raycast
slice. Vercel ignore rules are a last-mile deploy filter, not the ownership
boundary.

## Money Clock / Survival Context

This system is currently being built under a real income deadline. Treat that as
part of the routing context, not as a side note.

Operating lanes:

```text
Money Clock
  Survival jobs, Upwork proposals, applications, follow-ups, and cash-path leads.

Offer
  Website, offer copy, beta offer, portfolio packaging, and workflow-hub materials.

System Cleanup
  Obsidian review, Opportunity HQ cleanup, Eagle capture, commands, shortcuts, and docs.
```

Balanced lanes means all three lanes move, but `Money Clock` gets a daily floor
until income stabilizes. If a request risks becoming website-only hyperfocus,
Codex should calmly point that out and help route one concrete cash-path action
before continuing polish work.

Do not turn this into finance automation. It is a prioritization rule for work,
not a bank, debt, or budget system.

Until income stabilizes, daily work should run like an 8-10 hour shift. Blue
collar and white collar application work get the first 60-70% of serious work
time. Upwork, Singleton offer work, portfolio capture, and system cleanup happen
after the cash-path floor is moving.

Required daily blocks through Monday, June 29, 2026:

```text
1 blue collar application block
1 white collar / resume / Upwork block
1 Singleton portfolio or website block
```

Start-time targets:

```text
Thursday, June 25: rolling by 11am
Friday, June 26 onward: rolling by 10am when possible
```

Use the task database's `Project`, `Duration`, `Money Priority`, and `Status` fields
to build the day before polishing the website or portfolio library.

## Business Needs V1

Singleton Systems needs the normal business foundation, but the sequence should
not block outreach.

Current order:

```text
domain -> Vercel -> outreach -> business email -> LLC -> EIN -> bank account
```

Typical pieces:

```text
domain
public website
business email
LLC
registered agent
operating agreement
EIN
business bank account
annual compliance / reports
basic bookkeeping
```

Current findings:

```text
Namecheap / Vercel:
  Useful now. Buy/connect the public Singleton Systems domain.

Tailor Brands / LLC funnel:
  Potentially useful later as a guided formation path, but the catch is the
  final cart: state fees, service fees, recurring registered-agent/compliance
  fees, EIN convenience fees, and logo/site/email bundles.

Florida LLC:
  Needed soon, not required before first outreach. Touch once when the money or
  client path justifies it. Prefer understanding the full recurring cost before
  paying for a formation bundle.

EIN:
  Get directly from the IRS unless convenience is worth the fee.
```

Rule:

```text
Do not dismiss LLC/domain/email research as bloat. Treat it as business setup
research, but separate today's launch dependency from later legal/admin setup.
```

## Opportunity HQ V1

Opportunity HQ is the durable Notion queue for money
tasks, job applications, freelance work, Singleton offer work, portfolio tasks, and
planning. Obsidian owns raw capture.

V1 project lanes:

```text
Cash Jobs
Career Jobs
Freelance
Offer
Portfolio
```

These five `Opportunity Projects` rows are the durable lanes. Do not add a
second lane concept beside them.

Pseudo-project rows convert into tasks/goals under the five lanes:

```text
Cash Jobs -> Paid by July 1, Blue collar resume ready
Career Jobs -> Career Applications
Freelance -> Freelance proposals
Offer -> Singleton landing page, website, outreach
Portfolio -> portfolio tasks and assets
```

Suggested task properties:

```text
Task
Status
Duration
Money Priority
Project
Goal Horizon
Work Date
Shift
Link
Notes
```

Suggested project properties:

```text
Project
Stage
Tasks
Notes
```

Goal Horizon:

```text
End of W1
End of W2
End of W3
End of Month
Next Month
6 Months
Long Term
```

Goal Horizon belongs to tasks or parent tasks, not the five durable project
lanes.

Project Stage:

```text
To Do
In Progress
Done
```

Project `Stage` is only the lane-level state. The five durable project lanes
should normally sit at `In Progress` because they are operating lanes, not
finishable deliverables.

Duration:

```text
5m | 15m | 30m | 45m | 60m | 90m | 2h | 4h+
```

Money Priority:

```text
Critical
Later
Someday
```

Default priority:

```text
Cash Jobs -> Critical
Career Jobs -> Critical
Freelance -> Critical
Offer -> Later
Portfolio -> Later
```

Long deliverables stay in Opportunity Tasks, not Opportunity Projects.
`Singleton landing page` is a task under `Offer`; domain, Vercel, Tally, MCP,
and similar prerequisites should become sub-tasks or dependency-linked tasks in
the same task database when they need their own status or time estimate.

Use page-body checkboxes only when a checklist is tiny. If a subtask needs its
own time estimate, create it as a related task in the task database.

Projects and tasks are the two durable databases for v1. Do not create a
separate Focus Board database yet. The Focus Board, Daily Blocks, Work Calendar,
Applications, Freelance, Singleton, and Portfolio surfaces should be views of
Opportunity Tasks.

Use `Work Date` as the scheduled completion date for a task, by end of that
date. Use `Shift` as the rough time slot:

```text
Morning
Midday
Afternoon
Evening
Late
```

## Focus Board V1

The Focus Board is now a view of Opportunity HQ, not a separate source of truth.
Use `Status` and `Money Priority` to make today's queue visible.

State meaning:

```text
Queued
  Real task, but not chosen for today yet.

Today
  Selected for today's work block.

In Motion
  Actively being worked.

Waiting
  Submitted, sent, platform/person pending, or externally blocked.

Parked
  Captured safely without forcing a fake deadline.
```

The Focus Board replaces the Eisenhower/delegate idea. Use plain timing and
pressure, not a four-quadrant taxonomy. The board should make it obvious if the
day has no blue collar, white collar, freelance, or follow-up action logged.

## Opportunity Log V1

The old Opportunity Log idea is folded into Opportunity HQ unless it becomes
too crowded. For now, do not create a second database just to log leads.

Use this for:

```text
survival jobs
career-aligned jobs
freelance jobs / proposals
direct outreach
Singleton offer tasks
portfolio assets
```

Keep the database lean. It should answer:

```text
What is it?
Which money lane is it in?
What state is it in?
How long will the next move probably take?
```

Suggested minimal properties:

```text
Name
Project: Cash Jobs | Career Jobs | Freelance | Offer | Portfolio
Status: Queued | Today | In Motion | Waiting | Done | Parked
Effort: 5m | 15m | 30m | 60m | 2h | 4h+
```

Optional fields only when useful:

```text
Link
Related Asset
```

Do not make this a giant CRM. The first use case is simple:

- log the job, lead, proposal, or offer task
- estimate the next action
- make sure at least one cash-path item moves each day
- later, use the effort estimate to build time blocks

If the entry is only a raw thought, it starts in Obsidian. If it has task weight,
money pressure, a link, deadline, follow-up, proposal, application, portfolio value,
or project weight, it belongs in Opportunity HQ.

## Duration Key V1

Use rough effort buckets, not perfect time tracking. The goal is to stop
underestimating big work and to keep small tasks from eating the day.

Default effort assumptions:

```text
5m
  tiny capture, quick note, open/save reference, small reply

15m
  screenshot capture, simple Eagle asset, short Obsidian cleanup, quick follow-up

30m
  job application pass, freelance proposal, resume/cover note tweak, portfolio caption set

60m
  focused section rewrite, portfolio packaging pass, consultation-page block

2h
  website section build, grouped portfolio capture, focused workflow documentation

4h+
  video build, full page pass, larger system build, deep portfolio package
```

Examples:

```text
19 screenshots at 5-10m each
  Estimate as 2h, then batch them.

One short portfolio video
  Estimate as 4h unless the assets are already clean.

One job application with tailored resume
  Estimate as 30m.

One Upwork proposal
  Estimate as 15-30m depending on portfolio needed.
```

This is a planning key, not a time-tracking promise. If a task repeatedly takes
longer than its estimate, update the estimate later instead of adding more fields.

## Focus Blocks V1

Later, the system can borrow the old Prospect Pipeline calendar-export idea:
look at today's active items, apply the Duration Key, and suggest Apple Calendar
blocks.

First-pass daily blocks:

```text
Money Clock
  Apply, propose, follow up, or log outreach.

Offer
  Website, offer, portfolio, or workflow-hub build.

System Cleanup
  Obsidian review, Eagle capture, Opportunity HQ cleanup, commands.
```

The rule is simple: do not schedule a full day of website work when there are no
Money Clock actions in motion.

## Cerebral Router

This is the official plain-English router for the whole system.

It is not a database and it does not mutate tools by itself. It is the hook that
helps Codex, Obsidian, Opportunity HQ, Eagle, Raycast, Apple Shortcuts, LikeC4,
skills, and future hooks agree on what each surface means.

Working rule:

```text
Name the thing once.
Put it in the right surface.
Only automate it after the repeated action is obvious.
```

The router answers:

- what project lane does this idea belong to?
- which app owns the durable version?
- which skill should Codex load?
- is this a command, portfolio asset, website idea, workflow idea, or personal system?
- should this stay quick-capture, become an Opportunity HQ item, or turn into code?
- does the surface use stale projects, statuses, fields, or labels?

Hook rule:

```text
If a surface drifts, update the canonical docs/skills first.
Then update the live Notion/Raycast/Obsidian/Eagle/LikeC4 surface.
Then verify the surface that users actually touch.
```

The router should stay boring on purpose. If a label needs explanation every
time, it is not ready to become a tag, command, skill, or folder.

## Planning + Idea Routing

Use `SS: Planning + Idea Routing` for mixed thoughts that combine task planning,
future ideas, research links, content inspiration, dependencies, and workflow
logic.

The skill's technical name is:

```text
planning-idea-routing
```

Its default job is to route the thought before any live surface changes:

```text
Obsidian -> raw idea, link, transcript, someday thought
Opportunity HQ -> durable task, project, time block, dependency
Docs -> operating rule, research memo, naming decision
Skill -> repeated reasoning contract
Raycast / Shortcuts -> repeated action after the behavior is obvious
```

Current research memo:

```text
docs/planning/planning-idea-routing-research-pass.md
```

## Mobile / Apple Layer

Mobile capture starts with Apple Shortcuts as a focused prompt palette, not a
custom app.

Current direction:

```text
Apple Shortcuts -> choose-menu prompt palette
Obsidian        -> fast mobile text capture
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

For mobile capture, use two paths:

```text
Quick Thought -> Obsidian
Log Task      -> Notion / Opportunity HQ
```

Obsidian receives raw, unclear, emotional, exploratory, or "do not lose this"
thoughts. Opportunity HQ receives focused queue items with status, time, project
lane, money priority, link, follow-up, portfolio work, or project relation.

The first Notion form should expose only `Task`, `Project`, `Duration`, and
`Link / Notes`. Default the rest.

Mobile Notion shortcut/form behavior:

```text
Task
  What needs to happen.

Project
  Cash Jobs | Career Jobs | Freelance | Offer | Portfolio

Duration
  5m | 15m | 30m | 45m | 60m | 90m | 2h | 4h+

Link / Notes
  URL, job post, context, or raw detail.
```

Defaults:

```text
Status = Queued
Money Priority = Critical for Cash Jobs, Career Jobs, and Freelance
Money Priority = Later for Offer and Portfolio unless tied to immediate income
Money Priority = Someday for passive system ideas and uncommitted experiments
Task page icon = selected Project's icon DB source
Work Date = blank unless approved in Codex / Notion planning as the scheduled completion date
Shift = blank unless approved in Codex / Notion planning
Eagle note = task body only, added after capture as `Added to Eagle: [asset name]`
```

Use the mobile shortcut for capture, not planning. Planning happens later in
Codex / Notion: assign `Work Date`, `Shift`, `Project`, and status changes only
after review. `Work Date` means scheduled to complete by the end of that date.
When a task's `Project` changes, refresh the task page icon from the newly
linked Project's icon DB source. For Cash Jobs, use custom icon `cash-job`
(`notion://custom_emoji/a3b304a1-8d81-47f4-aea9-74ce88acc795/38e4c8bd-6c26-8079-9053-007a3a48e114`).

Passive shortcut and future automation ideas should usually start in Obsidian. This
includes useful but later ideas such as a mobile transcript step for an existing
share-sheet video download Shortcut. These can become Opportunity HQ tasks only
after human review, when they have task weight, money relevance, portfolio value, or
a real next action.

Suggested Obsidian folder:

```text
Command Ops
```

Use this as the holding lane for later Apple Shortcuts, shell/mobile workflow
ideas, passive automations, and small "this could become portfolio later" concepts.
Do not make every shortcut idea a Notion task.

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
Opportunity HQ Raycast / Eagle route: 127.0.0.1:41595
Obsidian MCP route: https://127.0.0.1:27124/mcp with OBSIDIAN_MCP_TOKEN
Bear archive route: exported Markdown stays outside the active Obsidian folders until a manual import is needed
```

MCP can expose tools for operator convenience. Reliable code should call stable
local APIs, scripts, files, or env config directly.

## V1 Obsidian Capture

Vault:

```text
/Users/singleton23/Library/Mobile Documents/iCloud~md~obsidian/Documents/Singleton Systems
```

Folders:

```text
_Inbox
Command Ops
Production Ops
Business Ops
Templates
```

Templates:

```text
_Inbox         -> raw / next
Command Ops    -> tool / next
Production Ops -> workflow / next
Business Ops   -> thing / next
```

Use folders for broad shape only. Do not rebuild the old Bear tag tree inside Obsidian.

Use `_Inbox` for raw under-10-minute tasks or unclear captures.

Raycast is the action layer and is implied in command workflows. Do not create a
folder just to say Raycast unless the specific note is about the Raycast
extension itself.

Middle-ground mapping from the old Bear lanes:

```text
inbox    -> _Inbox
video    -> Production Ops
workflow -> Production Ops or Command Ops
website  -> Production Ops
commands -> Command Ops
lifeops  -> Business Ops
```

Do not use `capture`, `clarify`, `package`, or `ship` as folders or tags.

## V1 Eagle Shape

```text
Career Portfolio Library
  00 _Inbox
  01 Video Portfolio
  02 Workflow Portfolio
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
  Owns the business direction, offer, website copy, portfolio strategy, and cross-surface alignment.

obsidian
  Owns Obsidian capture rules, Local REST API MCP usage, Advanced URI links, and tiny templates.

eagle
  Owns Eagle portfolio/assets actions through the local Eagle API CLI.

content-creator
  Owns broad content strategy, editorial planning, and repurposing logic after
  the portfolio/offer angle is clear.

freelance-gig-proposals
  Owns Upwork, Fiverr, freelance/gig replies, consultation pitches, platform
  research notes, and question-first proposal variants.

job-application-resume
  Owns blue-collar and white-collar job application support, resume cleanup,
  truthful bullet swaps, keywords, application positioning, resume source rules,
  rendered-copy rules, and repeated field stashing. White-collar source lives in
  `docs/resumes/white-collar_Jerami_Singleton_Resume2026.pdf`; job-specific
  copies render to `~/Documents`. Blue-collar resume history stays draft until
  missing job-list fields are confirmed.

cover-letter-casual
  Owns short, human cover notes that avoid corporate filler and overbuilt application language.

career-proof-packager
  Owns turning Eagle assets, screenshots, repo examples, Upwork portfolio, and workflow demos into reusable portfolio blocks.

offer-proof-content
  Owns turning portfolio assets, YouTube/social references, and build progress into
  offer-aligned content angles, captions, posts, and light schedules.

cerebral-router
  Owns first-pass routing when a thought mixes business, website, portfolio, commands, Obsidian, Eagle, Notion, Raycast, hooks, or skills.

linkedin-content-creator / instagram-curator / podcast-strategist
  Use when portfolio needs to become platform-specific content. Do not load these by default for ordinary website edits.

sales-outreach / outbound-strategist
  Own outbound positioning, offer clarity, portfolio-led messaging, and target-specific outreach.

ad-creative-strategist
  Use later for paid tests, angle generation, hooks, and creative packaging after the offer/portfolio base is clearer.

Final Human Pass
  Required as the last gate for Singleton Systems outreach, LinkedIn, sales,
  proposals, applications, ads, captions, website copy, portfolio packaging, and
  social posts. Run the platform or sales strategy first, then strip
  boilerplate, fake guru cadence, vague AI words, meta commentary, and template
  lines before showing the draft as final.

backend-architect
  Use later for client hub data models, internal CRM, finance tracker, integrations, and automation architecture.

scoutprep-business-logic
  Reference only. Use its bucket/source-of-truth discipline, LikeC4 visual rules, and naming-once logic.

prospect-supabase-source-of-truth
  Reference only when borrowing source-of-truth patterns from Prospect Pipeline. Do not import NP-specific workflow names as the future product.

raycast-extension-builder
  Owns Opportunity HQ command implementation, Raycast UI conventions, local
  action routing, and the native-first / Codex Assist-second command pattern.

backend-architect
  Owns direct-route architecture, API contracts, reliability rules, and the rule that MCP is operator/control only.

build-ios-apps:ios-app-intents
  Future reference for App Intents and Apple Shortcuts once mobile actions are ready to become a real app or app-facing integration.

karabiner-config-migrator / hammerspoon-browser-automation / km-assembler-mode
  Own command-layer implementation only after the command name and lane are stable in docs/Obsidian.
```

The goal is one Singleton Systems operating model with specialized skills around
it, not one large skill trying to remember every possible workflow.

## Opportunity And Portfolio Skill Stack

Use this stack for career, outreach, and brand-building work:

```text
Upwork / Fiverr / freelance post
  -> freelance-gig-proposals + sales-outreach

Job post / resume tailoring
  -> job-application-resume

Cover note / casual application message
  -> cover-letter-casual

Screenshot / Eagle asset / project portfolio
  -> career-proof-packager + eagle

Portfolio asset into LinkedIn / Instagram / content
  -> offer-proof-content + platform-specific skill only when needed

Mixed idea / "where does this go?"
  -> cerebral-router

Any route that produces copy for the user to send, publish, or paste ends with
Final Human Pass.
```

Research-backed build rule:

- Keep skills narrow and description-led so Codex can trigger the right one without loading a giant memory file.
- Use hooks later as trusted routing/preload helpers, not hidden automation that mutates surfaces.
- For mobile, expose only stable, common actions. Shortcuts/App Intents should come after the repeated action is clear.
- For Obsidian, prefer Local REST API MCP and Advanced URI for reliable capture/open/search actions.

## Hook Queue V1

Future hooks should route the agent to the right docs and skills. They should not
create tags, move assets, or write Notion pages by themselves.

```text
mentions: upwork, fiverr, proposal, client post, freelance, gig
  load: freelance-gig-proposals, sales-outreach, singleton-systems

mentions: resume, application, job description, tailor, application fields
  load: job-application-resume, singleton-systems

mentions: cover letter, cover note, application note
  load: cover-letter-casual

mentions: Eagle, portfolio, screenshot, reference, asset
  load: career-proof-packager, eagle

mentions: LinkedIn, Instagram, content, brand, schedule
  load: offer-proof-content, then platform skill if needed

mentions: where does this go, offload, Obsidian, Bear, capture, route
  load: cerebral-router

mentions: Shortcut, Karabiner, Hammerspoon, Maestro, command
  load: cerebral-router, docs/commands.md, then exact implementation skill

mentions: money clock, job search, proposals, applications, survival, end of month
  load: cerebral-router, singleton-systems, freelance-gig-proposals or job-application-resume when relevant
```

Hook rule:

```text
Route attention first. Ask the focused skill to do the work second.
```

For the business loop, milestones, content lanes, Freelance lane, portfolio bank rules,
and future skill candidates, use `docs/operating-system/phase-one-operating-system.md` as the
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
- portfolio of repeatable systems
- Scout Prep / Scouting Coordinator mapping discipline
- LikeC4-style visual mapping rules

Do not borrow:

- Prospect ID-specific naming as product language
- stale former-work shortcuts
- command-specific labels unless they become source/context metadata

### Opportunity HQ Raycast Extension

```text
/Users/singleton23/Raycast/career-hq
```

Owns:

- Raycast action surface for Opportunity HQ capture/update/open commands
- Eagle portfolio capture against outcome folders
- durable Opportunity HQ routing to Notion tasks/projects
- practical portfolio operations for Singleton Systems

## Naming Once Rules

Use these as Eagle/portfolio folders or broad content lanes, not Opportunity HQ
project lanes:

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
- Commands open or mutate known projects; commands do not become project lanes.
- A repeated idea should get one plain name before it becomes a tag, folder, skill, or command.
- If a label makes the user pause and ask where it belongs, it is probably too clever.

## Query Routing Rules

Use this when the user drops a mixed thought in plain language:

```text
website copy / section wording
  -> docs/offer/confirmed-copy.md, singleton-systems, content-creator, sales-outreach

business loop / offer / portfolio / weekly path
  -> docs/operating-system/phase-one-operating-system.md, singleton-systems

surface ownership / app roles / repo paths / hooks / skills
  -> docs/integration-map.md, singleton-systems, backend-architect

commands / shortcut layers / macro ideas
  -> docs/commands.md, raycast-extension-builder, plus the exact command skill only when building

quick raw thought under ten minutes
  -> Obsidian _Inbox

passive shortcut idea / later automation / useful someday command
  -> Obsidian Command Ops, then human review before Opportunity HQ

survival job, blue collar job, white collar job, income deadline, proposal count, application, follow-up
  -> Notion / Opportunity HQ, cerebral-router, then job-application-resume, cover-letter-casual, freelance-gig-proposals, or sales-outreach

job lead, Upwork lead, outreach target, offer task with effort estimate
  -> Notion / Opportunity HQ, then Focus Board view if active today

video portfolio
  -> Eagle 01 Video Portfolio, Obsidian Production Ops

repeatable workflow portfolio
  -> Eagle 02 Workflow Portfolio, Obsidian Production Ops or Command Ops

site asset or reference
  -> Eagle 03 Website Assets, Obsidian Production Ops

personal repeatable system
  -> Eagle 04 Personal Systems, Obsidian Business Ops

Codex/workspace/system idea
  -> Obsidian Command Ops, then docs/skills if it becomes durable
```

Do not force every thought into Notion. Notion is for durable queue work after
the thought has task, money, portfolio, link, follow-up, or project weight.

Exception: survival-critical work should not sit only in Obsidian. If it affects
income timing, follow-up, applications, proposals, or end-of-month execution, it
needs a durable Opportunity HQ task.

## Legacy ChatGPT Project Reference

Old source:

```text
Video Editing + Workflow Offer
```

Use it as a reference for:

- Upwork consultation page templates
- short question-first proposal writing
- portfolio-bank capture prompts
- Opportunity HQ page/task generation
- daily execution tracking

Do not use it as the current positioning source. The current Singleton Systems
direction is:

```text
Video workflow cleanup is the entry point.
Repeatable production systems are the deeper skill.
AI-assisted steps are useful when they save real time.
```

When a future Shortcut, Codex prompt, or Notion connector creates an Opportunity
HQ item, it should borrow the old project's clean templates, not its old
split-offer positioning.

Default Opportunity HQ richer task/page block shape:

```text
Goal
Why it matters
Inputs needed
Action list
Portfolio or asset links
Review note
```

Use this for Upwork consultations, website sections, workflow buildouts,
portfolio-capture tasks, and other items that need more than quick Obsidian capture.
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

before portfolio/library work
  load singleton-systems and eagle.

before Opportunity HQ command work
  load raycast-extension-builder and singleton-systems.

before Obsidian capture work
  load cerebral-router and singleton-systems.
```

Do not make hooks noisy. The hook should point to the right operating contract,
not dump every connected surface into every turn.

Singleton Systems now has a small project hook in `.codex/hooks.json`.
Its job is to keep Codex pointed at the ecosystem map and command map before
work drifts across Obsidian, Opportunity HQ / Notion, Eagle, Raycast, Apple
Shortcuts, LikeC4, docs, skills, or the public site.

The hook should stay lean:

```text
review the full ecosystem map
review the command map when actions/shortcuts/Raycast are involved
route to the owner surface
reuse the focused skill
apply Ponytail: smallest working change
```

Future hook candidates:

```text
on website copy work
  point to confirmed copy and singleton-systems skill.

on Obsidian/Opportunity HQ integration work
  point to integration map and command doc.

on command-layer work
  point to docs/commands.md and the exact implementation skill.
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
Thought Capture -> Obsidian
Durable Structure -> Notion / Opportunity HQ
Portfolio Assets -> Eagle
Actions -> Raycast
Home Docs -> singleton-systems now / singleton-systems target
Reference Systems -> Prospect Pipeline
Business Surface -> Website
```

This is the "Scouting Coordinator" equivalent for Singleton Systems: a small map
that explains where work belongs before adding commands, tags, folders, or
automation.

### Throwaway HTML Review Surfaces

Use single-file HTML when a review is too dense for linear Markdown and does
not need to become the durable source of truth.

```text
Markdown = source notes
LikeC4 = durable system map
Draw.io = visual sketch
HTML = throwaway review surface
```

Good Singleton uses:

- Workflow audit viewer: messy inputs, current path, bottlenecks, proposed fixes, risk notes, sorted by impact.
- Opportunity HQ review cockpit: Today / Waiting / Money Clock / Portfolio tasks with filters before mutating Notion.
- Portfolio packaging board: Eagle assets, notes, and website/proposal copy angles in one scannable page.
- PR/code review brief: files changed, risk zones, screenshots, test status, and needs-human-decision notes.
- Website copy comparison: current section, proposed rewrite, why, and accept/reject notes.
- Client workflow map preview: a clickable walkthrough for one messy workflow, not durable architecture.

Do not make this a command, skill, or artifact system until the same review UI
shape repeats. The first version should be a disposable local HTML file.

## App Quirks To Respect

### Obsidian

- Obsidian has real folders; keep them broad and few.
- Use `_Inbox`, `Command Ops`, `Production Ops`, `Business Ops`, and `Templates`.
- Keep templates tiny: `raw/next`, `tool/next`, `workflow/next`, and `thing/next`.
- Do not use lifecycle tags as Obsidian tags or folders.
- Use Local REST API MCP for create/search/update and Advanced URI for opening notes.
- Do not create a global Singleton Systems dump note by default.
- Bear remains a readable archive/import source until migrated notes are touched.

### Eagle

- Eagle folders should be outcome folders.
- Source names are tags or metadata.
- The Eagle skill CLI currently uses port `41596`.
- Opportunity HQ Raycast / Eagle route currently uses port `41595`.

### Notion / Opportunity HQ

- Notion holds durable structure.
- Opportunity HQ is the durable tasks/projects model.
- The local Raycast extension folder may still be named `career-hq` for
  continuity, but visible command language should say Opportunity HQ.
- Status fields can use lifecycle concepts, but Obsidian should not.
- Use `In Motion` as active-work language.
- If a capture becomes a real initiative, Opportunity HQ should get a project
  plus related tasks instead of one loose note.
- If a capture affects the Money Clock, Opportunity HQ should get at least a
  small task so it does not disappear inside Obsidian.

### Raycast

- Raycast is the action layer.
- Commands should feel like shortcuts into known project lanes and tasks.
- Native Raycast actions should handle cheap capture, status updates, links,
  file opening, Notion writes, and Eagle import.
- Raycast should not own planning. Keep `Work Date` and `Shift` visible as
  Opportunity HQ metadata; edit them through Codex / Notion after review.
- Codex Assist is secondary: `cmd+shift+c` where available, one Raycast
  input/review screen, then Apply, Copy, Log, or Cancel.
- Replace old Prospect ID leader-key ideas with Opportunity HQ / Singleton
  Systems actions only after the buckets are stable.

## Open Later

- Obsidian MCP and Advanced URI wrapper shape
- Opportunity HQ Raycast command mapping after schema stabilization
- Notion Opportunity HQ schema alignment
- Tally intake form shape and MCP/operator route
- Namecheap / Vercel domain setup for the public Singleton Systems domain
- Prospect Pipeline reusable-logic references
- LikeC4-inspired naming and visual logic map
- Codex hook implementation
