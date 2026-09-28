---
name: opportunity-hq-updater
description: Shape selected client delivery, AI consulting, development, or portfolio work in its Lane task system without duplicating decisions or dashboard state.
---

# Task Updater

Use only after the work is selected. Raw thoughts stay in Linear Command +
Ideas. Implementation evidence belongs in GitHub.

Linear owns Development task state. Asana owns AI Consulting and Content Editor
task state.

## Runtime Route

Development task reads and mutations go through Linear GraphQL at
`https://api.linear.app/graphql`, using `LINEAR_API_KEY` from `.env.local`
server-side. Send the key raw — it is not `Bearer`-prefixed. Read every mutation
back through GraphQL before reporting it done.

Linear enforces a query complexity cap. A four-level nested query
(initiative -> project -> issue -> state) fails with `Query too complex`. Split
it into two flat queries.

AI Consulting and Content Editor task reads and mutations use the connected
Asana tool in the `singleton-systems.com` workspace. Stop when Asana is not
connected. Read each write back before reporting it done.

- `AI Consulting`: `1218884867598641`
- `Content Editor`: `1218890014545436`

Notion retains only the Clients and Portfolio surfaces. Reads and mutations
there must use the Homebrew Notion CLI at `/opt/homebrew/bin/ntn`. Run
`ntn doctor` before mutation. Do not use the Notion MCP connector, browser
automation, direct HTTP calls, or an ad hoc script — for Notion, `ntn` is the
sole runtime route.

## Input

```text
initiative: Development | Content Editor | AI Consultant | Portfolio
task system: Linear for Development; Asana for Content Editor or AI Consultant
project: Linear Development project or fixed Asana Lane project
section: Content Editor client section when applicable
client: Notion Client backlink for client work; omit for Development
intent: one sentence
next: one action
owner link: Linear, Asana, GitHub, job source, or portfolio asset
```

## Initiatives and Projects

Initiative is the durable business lane. Project is a finite engagement,
outcome, development effort, or packaging effort.

- Client editing work -> Asana `Content Editor`, matching client section
- AI consulting and outreach -> Asana `AI Consulting`
- Repo, tooling, plugin, and website work -> Linear `Development`
- Anything whose purpose is proving capability -> `Portfolio`

Do not create a client-specific Asana project. Use the fixed Lane project. Keep
project names to one to three words. Keep task and parent-task names to two to
four words, a verb plus the object. Put context, links, dates, and any former
Linear link in the description.

The routing test is purpose, not subject matter. If a record exists to show
someone you can do what you say, it is Portfolio even when the subject is a
client.

## Clients

Clients live in the Notion Clients database and link to their owning Asana or
Linear task. A Client record never carries task status.

Keep contacts as `Active` or `Lead`. A lead does not
receive a Task until real delivery work is selected. Lead page content stays at
exactly three blocks: one `Lead context` heading and two bullets covering the
source/need and next action.

## Portfolio

Portfolio records still live in Notion pending migration. The `Portfolio`
initiative exists in Linear and is intentionally empty until that move runs.
Do not create Portfolio issues in Linear ahead of the migration — it would
split the same set across two systems.

## Task Sizing (before creating)

Apply the 4-hour test before shaping the task:

```text
duration >= 4h -> this is a project, not a task. Split into 2-4 subtasks,
                  then size each one again.
duration <= 2h -> create as a single task.
```

Stop splitting once every piece fits inside `2h` or less. Never create a task
pre-tagged `4h+` — split first, always.

## Intake Rules

Linear Intake: keep raw capture, Development decisions, and unselected work in
the `Command + Ideas` project. Promote selected Development work into Linear.
Write selected AI Consulting and Content Editor work to Asana.

## Writing Rules

Correction = edit instruction. A correction fixes the artifact silently. Never
log, quote, or restate the correction itself in output.
No process commentary in deliverables. State facts and results only.

Keep each task to the outcome, current truth, next action, and done check. Link
the owning workflow or portfolio. Do not paste the workflow into the task. Use
a dated interactive Decision Map when Jerami's review needs more than 500 words.

## Output

Create or update the smallest task shape needed for the selected work. Keep
status and completion in the Lane task system. Keep evidence in GitHub or Eagle.

Do not create an issue from an unclear idea, copy templates into Supabase, or
write duplicate task state into the dashboard.

Completion is a task-state change. Do not delete the record at closeout. Never
complete a parent task until all required subtasks are complete.
