# Visual System Contract

## Locked Surface Names

```text
1. Cerebral - Routing
2. Linear - Development Work
3. Asana - Client and Consulting Work
4. GitHub - Implementation Evidence
5. Supabase - Queryable Cross-Surface Facts
6. Next/Vercel - Active Week Dashboard
7. LikeC4 - Reviewed System Map
```

Each surface has one job. Links may cross surfaces, but state ownership does not.

## 1. Cerebral - Routing

Intent: choose the owner, tool stack, review gate, and next action from natural
language. The live route registry is stored in Supabase and has a checked-in
fallback at `config/cerebral-registry.json`.

```text
request -> Cerebral route -> owner surface -> reviewed mutation -> verification
```

Cerebral never becomes a task database, background worker, or hidden writer.

## 2. Linear - Development Work

Intent: hold Development ideas, decisions, projects, assignments, and next
moves.

Canonical placements:

```text
Team: 23Maestro
Project: Command + Ideas  -> capture, commands, small decisions
Project: Singleton Systems -> system plans, dashboard, GraphQL gateway
Default issue status: Backlog
```

Use this template for a new issue:

```markdown
## Intent
<one sentence>

## Context
<link, source, constraint, or current state>

## Done
<one observable result>
```

Existing issues receive a short comment or independently actionable subissue;
do not rewrite their full body.

Development Wayfinder maps also live here. A map is one Linear issue, and its
named decision tickets are sub-issues connected by native blockers.

```text
Wayfinder map -> blocking decisions -> clear route -> implementation handoff
```

## 3. Asana - Client and Consulting Work

Intent: hold AI Consulting and Content Editor task state.

```text
AI Consulting -> To Do / In Progress / Done
Content Editor -> client sections and completed task state
```

Use the fixed `AI Consulting` and `Content Editor` projects. A Wayfinder map in
either Lane is a parent task with decision subtasks. Keep links, dates, and any
former Linear link in the description.

## 4. GitHub - Implementation Evidence

Intent: retain the code history and review evidence produced after a Linear
decision reaches implementation.

```text
task record -> branch / commit / pull request -> verified implementation
```

GitHub does not own Wayfinder ticket state. Link evidence back to the named
Linear or Asana record; a backlink does not migrate ownership.

## 5. Supabase - Queryable Cross-Surface Facts

Intent: hold facts that need reporting, joins, multiple readers, or dashboard
queries. It is not a scratchpad or copy of every ticket body.

Current durable facts:

```text
cerebral_routes / harness_skills / harness_capabilities -> live routing registry
outreach_attempts / contacts -> outreach and follow-up events
content_references / content_posts / portfolio_assets -> portfolio and content metadata
```

The dashboard reads queryable facts and owner links. New tables require a
read-only design pass, confirmed writer/reader list, and a verification path.

## 6. Next/Vercel - Active Week Dashboard

Intent: run a seven-day review surface without becoming another task database.

Inputs:

- current Development decisions from Linear
- current AI Consulting and Content Editor tasks from Asana
- active career, cash, and outreach events from Supabase-backed owner flows
- active Personal Ops home tasks from Apps Script while the list remains small
- weekly goals, time cues, and follow-up dates

Top half:

- week selector, refresh action, and seven-day rail
- category filters for `Cash Jobs`, `Career Jobs`, `Freelance`, `Offer`, and `Home`
- compact metrics for applications, outreach, follow-ups due, replies, and money
- active blocks that open their owner instead of duplicating status

Bottom half:

- follow-up tracker with `When`, `Target`, `Category`, `Channel`, `Status`, and `Next`
- filters for `Due`, `Waiting`, `Replied`, `Closed`, and `No Follow-up`
- direct owner links for Gmail, LinkedIn, the job source, Linear, or the relevant task system

The screenshot reference establishes a dark operational tone, compact filters,
a week dropdown, refresh control, and a readable event table. It does not define
the data model.

Pending implementation cards:

```text
23M-88 -> Paper wireframe and dashboard contract
23M-89 -> authenticated Linear GraphQL action gateway
```

`23M-89` must settle the server-side authentication and payload contract before
Shortcut Playground creates a mobile client. Raycast and Codex use the same
gateway contract when that task is ready.

## 7. LikeC4 - Reviewed System Map

Intent: make verified repositories, apps, APIs, and handoffs understandable.

```text
reviewed architecture fact -> LikeC4 source -> validate -> publish static map
```

What stays out across all surfaces:

- passive ideas without a decision or next move
- raw message bodies in dashboard tables
- duplicate task status
- unverified architecture claims
- secret keys or personal tokens in client apps, Shortcuts, Raycast, or docs

## Review Rhythm

```text
Development capture / decide / Wayfind -> Linear
AI Consulting or Content Editor tasks -> Asana
Implement / review code -> GitHub
During the week -> Next/Vercel dashboard
Queryable event -> Supabase
System change -> LikeC4 validation and publish
Weekly closeout -> clear stale dashboard cues and confirm owner-system state
```
