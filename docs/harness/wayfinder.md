# Wayfinder

Use Wayfinder when a build is too fuzzy or branching for one session.

```text
GitHub -> map, research, blockers, specs, implementation evidence
Linear -> current decision, priority, owner, status, due date, next move
PR -> implementation proof
```

## Map Shape

Create a map issue with the destination, known facts, open decisions, and the
next unblocked ticket. Add a child issue only for a real research, decision,
prototype, or manual-setup branch.

Use native GitHub parent and blocker relationships. If unavailable, write:

```text
Blocked by: #123
Blocks: #125
Next unblocked ticket: #126
```

Use the shared labels only when they fit:

```text
Wayfinder: Research
Wayfinder: Grilling
Wayfinder: Prototype
Wayfinder: Manual Setup
```

## Linear Ledger

Link a Linear issue only when work needs a mobile decision, priority, owner,
status, due date, or active next move. Keep evidence in GitHub.

```markdown
## GitHub
<issue URL>

## Ledger
Decision: <one sentence>
Blocks: <blocker or none>
Status: <Backlog | Todo | In Progress | In Review | Done>
Due: <YYYY-MM-DD or none>
Next: <one action>
```

Use status deliberately:

```text
Backlog     -> raw capture or parked decision
Todo        -> accepted next work
In Progress -> active agent or user work
In Review   -> waiting for review, proof, or handoff acceptance
Done        -> observable result is complete
```

Set a due date only for a real deadline, scheduled review, or dashboard-visible
follow-up. Do not invent due dates for research or parked ideas.

When implementation begins, include the Linear identifier in the branch or PR.
Do not enable broad GitHub Issues Sync.

## Close

Update the child with its outcome, return to the map, then select the next
unblocked ticket. Create a visual only when it clarifies three or more systems
or handoffs.
