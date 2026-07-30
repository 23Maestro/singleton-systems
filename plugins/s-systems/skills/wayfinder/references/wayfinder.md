# Wayfinder Reference

Owner: `singleton-systems`
Canonical source: `plugins/s-systems/skills/wayfinder/SKILL.md`
Reference: `plugins/s-systems/skills/wayfinder/references/wayfinder.md`
Generated outputs: installed Codex and Claude copies. Do not edit them as the
source of truth.
Validation: `npm run plugins:sync`, `npm run check:cerebral`,
`npm run check:cerebral:hook-routing`, and `npm run check:cerebral:registry`.

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

Set a due date only for a real deadline, scheduled review, or dashboard-visible
follow-up. Do not invent due dates for research or parked ideas.

When implementation begins, include the Linear identifier in the branch or PR.
Do not enable broad GitHub Issues Sync.

## Close

Update the child with its outcome, return to the map, then select the next
unblocked ticket. Do not create a visual as part of this workflow.
