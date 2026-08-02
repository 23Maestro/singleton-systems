---
name: opportunity-hq-updater
description: Shape selected client delivery, AI consulting, or portfolio work for Opportunity HQ without duplicating Linear decisions or dashboard state.
---

# Opportunity HQ Updater

Use only after the work is selected. Raw thoughts, system decisions, and
Wayfinder maps stay in Linear; implementation evidence belongs in GitHub.

## Runtime Route

All Opportunity HQ reads and mutations must use the Homebrew Notion CLI at
`/opt/homebrew/bin/ntn`. Run `ntn doctor` before mutation. Use `ntn pages` and
`ntn datasources` for ordinary content and queries, and `ntn api` when the full
schema, property, view, or database API is required.

Do not use the Notion MCP connector, browser automation, direct HTTP calls, or
an ad hoc Notion script for Opportunity HQ. `ntn` is the sole runtime route.

## Input

```text
project: Content Editor | AI Consultant | Portfolio
client: existing Client relation for client work; omit only for Portfolio
intent: one sentence
next: one action
owner link: Linear, GitHub, job source, or proof asset
```

## Clients and Projects

The only Opportunity HQ projects are `Content Editor`, `AI Consultant`, and
`Portfolio`.

- Content editing clients and deliverables -> `Content Editor`
- AI consulting clients and deliverables -> `AI Consultant`
- Proof packaging and owned case-study work -> `Portfolio`

Keep contacts in the Clients database as `Active` or `Lead`. A lead does not
receive a Task until real delivery work is selected. Lead page content stays at
exactly three blocks: one `Lead context` heading and two bullets covering the
source/need and next action.

Every client delivery Task must relate to the existing Client and exactly one
of the three projects. Never create a client page as a Project.

## Task Sizing (before creating)

Apply the 4-hour test before shaping the task:

```text
duration >= 4h -> this is a project, not a task. Split into 2-4 child tasks
                  (Parent Task / Sub-tasks relation), then size each one again.
duration <= 2h -> create as a single task.
```

Stop splitting once every piece fits inside `2h` or less. Never create a task
pre-tagged `4h+` — split first, always.

## Linear Intake Rules

Linear Intake: keep raw capture, system decisions, and unselected work in
Linear. Promote only selected career or delivery work that needs durable
workflow state.

## Writing Rules

Correction = edit instruction. A correction fixes the artifact silently. Never
log, quote, or restate the correction itself in output.
No process commentary in deliverables. State facts and results only.

## Output

Create or update the smallest task shape needed for the selected work. Keep
status and completion in Opportunity HQ. Keep the associated decision in
Linear and evidence in GitHub or Eagle.

Do not create a task from an unclear idea, copy templates into Supabase, or
write duplicate task state into the dashboard.

When an agent completes a Task through `ntn`, move the page to Notion Trash
instead of leaving a persistent `Done` row. Never trash a parent Task until all
required subtasks are complete.
