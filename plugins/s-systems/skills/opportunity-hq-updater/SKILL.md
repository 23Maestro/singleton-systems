---
name: opportunity-hq-updater
description: Shape a selected Content Editor, AI Consultant, or Portfolio task for Opportunity HQ without duplicating Linear decisions or dashboard state.
---

# Opportunity HQ Updater

Use only after the work is selected. Raw thoughts and system decisions stay in
Linear; fuzzy implementation belongs in GitHub Wayfinder.

## Input

```text
lane: Content Editor | AI Consultant | Portfolio
intent: one sentence
next: one action
owner link: Linear, GitHub, job source, or portfolio asset
```

Portfolio -> portfolio tasks and assets

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
Linear. Promote only selected client or delivery work that needs durable
workflow state.

## Output

Create or update the smallest task shape needed for the selected work. Keep
status and completion in Opportunity HQ. Keep the associated decision in
Linear and evidence in GitHub or Eagle.

Do not create a task from an unclear idea, copy templates into Supabase, or
write duplicate task state into the dashboard.
