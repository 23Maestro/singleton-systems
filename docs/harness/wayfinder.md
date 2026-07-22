# Wayfinder

Use Wayfinder when a build is too fuzzy or branching for one session.

```text
GitHub -> map, research, blockers, specs, implementation evidence
Linear -> current decision, priority, owner, next move
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

Link a Linear issue only when work needs a mobile decision, priority, owner, or
active next move. Keep evidence in GitHub.

```markdown
## GitHub
<issue URL>

## Ledger
Decision: <one sentence>
Blocks: <blocker or none>
Next: <one action>
```

When implementation begins, include the Linear identifier in the branch or PR.
Do not enable broad GitHub Issues Sync.

## Close

Update the child with its outcome, return to the map, then select the next
unblocked ticket. Create a visual only when it clarifies three or more systems
or handoffs.
