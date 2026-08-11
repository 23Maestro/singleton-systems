---
name: wayfinder
description: Plan a huge chunk of work as a shared map of decision tickets, then resolve them one at a time. Use only when the user explicitly names this skill.
disable-model-invocation: true
---

# Wayfinder

## Invocation contract

Use this skill only when the user explicitly names it. Keep all analysis and
execution in the current session. Recommend related skills or a separate task
when useful, and leave every launch to the user. Leave agent hooks and model
settings unchanged. Stage, commit, push, branch, and worktree actions require a
separate explicit request from the user.

Never launch or delegate to a sub-agent.

A loose idea has arrived: too big for one agent session and wrapped in fog. The
way from here to the **destination** is not visible yet. Wayfinding charts that
route as a **shared map** on the repo's issue tracker, then works its **decision
tickets** one at a time until the route is clear.

The destination varies per effort. Naming it is the first act of charting
because it shapes every ticket. It may be a spec, a decision to lock before
planning, or a change made in place. The map is domain-agnostic.

## Plan, don't do

Wayfinder is planning by default. Each ticket resolves a decision. The map is
done when nothing remains to be decided before implementation. A map may allow
execution in its **Notes**. Without that approval, produce decisions, not
deliverables.

## Refer by name

Every map and ticket has a title. In human-readable output, refer to it by its
linked title, never by a bare ID, number, or slug.

## The map

The map is one Linear issue labelled `wayfinder:map`. Its decision tickets are
sub-issues. The map is an index, not a duplicate store. Each decision lives in
its resolution comment. The map links a one-line gist after the ticket closes.

Read `references/wayfinder.md` for the Linear hierarchy, labels, status rules,
blocking operations, and GitHub boundary.

### Map body

```markdown
## Destination

<what reaching the end of this map looks like>

## Notes

<lane, domain, skills, constraints, and approved deviations>

## Decisions so far

- <closed ticket title, linked to its Linear issue> — <one-line gist>

## Not yet specified

<in-scope fog that cannot yet be stated as a precise question>

## Out of scope

<work intentionally excluded from this destination>
```

### Decision tickets

Each ticket is a Linear sub-issue sized to one focused session. Its body holds
one precise question:

```markdown
## Question

<the decision or investigation this ticket resolves>
```

Apply exactly one type label: `wayfinder:research`, `wayfinder:prototype`,
`wayfinder:grilling`, or `wayfinder:task`.

Claim a ticket before working it by assigning it and moving it to
`In Progress`. Use Linear's native blocker relationships. The frontier is the
open, unblocked, unclaimed sub-issues. Link assets from the ticket instead of
pasting them into its body.

## Ticket types

- **Research:** inspect documentation, APIs, or local sources to resolve a
  factual blocker. Work in the current visible session when the user selects
  it, or prepare a handoff for the user to launch separately.
- **Prototype:** make a cheap artifact that lets Jerami react to behavior or
  appearance. Recommend the relevant prototype skill and leave its launch to
  the user.
- **Grilling:** resolve a decision with Jerami. Use the grilling method and
  keep durable terms and decisions current when the map requires it.
- **Task:** complete a manual prerequisite that blocks a decision. Keep the
  work visible and record the resulting facts.

Every ticket is human-present. Never launch a sub-agent, background job,
research branch, or parallel session automatically.

## Fog of war

Create a ticket when its question can be stated precisely now, even if it is
blocked. Keep an in-scope area in **Not yet specified** when the question is
still too vague to state. Resolving a ticket may clear that fog and make new
tickets precise.

Do not put decided work, live tickets, or out-of-scope work in **Not yet
specified**.

## Out of scope

Work beyond the destination belongs in **Out of scope**, not the fog. If an
existing ticket turns out to be beyond the destination, close it and add one
linked line explaining why it is excluded. Do not add it to **Decisions so
far**.

## Chart the map

1. Grill to name the destination.
2. Grill breadth-first to identify precise questions and visible fog.
3. If the whole route fits one session and no fog remains, stop and ask whether
   a map is useful.
4. Create the Linear map and the decision tickets that are precise now.
5. Wire native blockers after issue identities exist.
6. Queue research tickets. Do not start them, create branches, or launch
   separate sessions.
7. Stop. Do not resolve a ticket during charting.

## Work through the map

Resolve no more than one ticket per session.

1. Reload the map because Jerami or another visible session may have edited it.
2. Use the named ticket or select the first frontier ticket.
3. Claim it before work.
4. Resolve it in the current session. Fetch related ticket bodies only when
   needed.
5. Post the answer as a resolution comment, close the ticket, and append its
   linked one-line gist to **Decisions so far**.
6. Create and wire only newly precise tickets. Remove graduated fog from **Not
   yet specified** so each fact has one owner.

## Writing rules

Correction = edit instruction. Fix the artifact silently.
No process commentary in deliverables. State facts and results. Do not create a
flat ticket inventory, duplicate Linear state in GitHub, or create a visual
unless it clarifies a real handoff.

Validate with `npm run check:skills`, `npm run check:cerebral`,
`npm run check:cerebral:hook-routing`, and
`npm run check:cerebral:registry`.
