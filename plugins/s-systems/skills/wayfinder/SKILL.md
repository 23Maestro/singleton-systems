---
name: wayfinder
description: Plan a large or foggy effort as a Linear map of named decision tickets, then resolve one ticket at a time until the route is clear.
disable-model-invocation: true
---

# Wayfinder

Use when the destination is unclear, research blocks a decision, or the work
needs more than one focused session. Wayfinder finds the route; it does not
silently execute the destination.

This skill adapts Matt Pocock's Wayfinder flow to Linear and keeps Jerami in the
loop. Never launch or delegate to a sub-agent. Never start background research
or parallel sessions. Work in the current visible session only.

Read `references/wayfinder.md` for the Linear hierarchy, labels, map template,
status rules, and GitHub boundary.

## Plan, Don't Do

Each ticket resolves a decision. The map is complete when nothing remains to be
decided before implementation. A map may explicitly allow execution in its
`Notes`; otherwise stop at the handoff.

## Refer by Name

Refer to every map and ticket by its linked title in human-readable output.
Never make a bare issue identifier or slug carry the meaning.

## The Map

The canonical artifact is one Linear issue labelled `wayfinder:map`. Its
decision tickets are sub-issues. The map is an index, not a duplicate store:
each decision lives in its resolution comment, and the map links a one-line
gist after the ticket closes.

The map body has exactly these sections:

```markdown
## Destination

<one or two lines describing what this effort is finding its way to>

## Notes

<lane, project context, skills, constraints, and approved deviations>

## Decisions so far

- <closed ticket title, linked to its Linear issue> — <one-line gist>

## Not yet specified

<in-scope fog that cannot yet be stated as a precise question>

## Out of scope

<work intentionally excluded from this destination>
```

## Decision Tickets

Every ticket is a Linear sub-issue whose body contains one precise question:

```markdown
## Question

<the decision or investigation this ticket resolves>
```

Apply exactly one type label: `wayfinder:research`, `wayfinder:prototype`,
`wayfinder:grilling`, or `wayfinder:task`.

Claim a ticket before working it by assigning it and moving it to
`In Progress`. Use Linear's native blocker relationships. The frontier is the
open, unblocked, unclaimed sub-issues.

## Ticket Types

- **Research:** inspect documentation, APIs, or local sources in the current
  visible session. Share concise progress and resolve only after review.
- **Prototype:** make a cheap artifact that lets Jerami react to behavior or
  appearance. Link the artifact from the ticket.
- **Grilling:** resolve a decision with Jerami, one question at a time.
- **Task:** complete a manual prerequisite that blocks a decision. Keep the
  action visible and record the resulting facts.

All four types are human-present. None authorizes a sub-agent, background job,
or autonomous batch.

## Fog of War

Create a ticket only when its question is precise now. Keep an in-scope area in
`Not yet specified` until the frontier makes the question sharp. Move work past
the destination to `Out of scope`; it never graduates unless the destination is
redrawn as a new effort.

## Chart the Map

1. Grill to name the destination.
2. Grill breadth-first to identify precise questions and the visible fog.
3. If the whole route fits one session and no fog remains, stop and ask whether
   a map is useful.
4. Create the Linear map and its currently specifiable sub-issues.
5. Wire native blockers after issue identities exist.
6. Stop. Do not begin research or resolve a ticket during charting.

## Work Through the Map

Resolve no more than one ticket per session.

1. Load the map, not every ticket body.
2. Use the ticket Jerami named or select the first frontier ticket.
3. Claim it before work.
4. Resolve it in the current visible session.
5. Post the answer as a resolution comment, close the ticket, and append its
   linked one-line gist to `Decisions so far`.
6. Create and wire only newly precise tickets. Clear graduated fog from
   `Not yet specified` so each fact has one owner.

Reload the Linear map before writing because Jerami may have edited it from
another session. Concurrency awareness never authorizes autonomous concurrency.

## Writing Rules

Correction = edit instruction. Fix the artifact silently; never log, quote, or
restate the correction itself. No process commentary in deliverables. State
facts and results only.

Do not create a flat ticket inventory, duplicate Linear state in GitHub, or
create a visual unless it clarifies a real handoff.

Validate with `npm run check:skills`, `npm run check:cerebral`,
`npm run check:cerebral:hook-routing`, and `npm run check:cerebral:registry`.
