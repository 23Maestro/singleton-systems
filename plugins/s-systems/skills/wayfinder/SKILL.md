---
name: wayfinder
description: Map a fuzzy or branching build into GitHub evidence, concise Linear decisions, and the next unblocked ticket.
---

# Wayfinder

Use when the destination is unclear, research blocks a decision, or the work
needs more than one focused session.

Wayfinder is owned by `singleton-systems`. The canonical source is this
versioned skill folder in `plugins/s-systems`; installed Codex and Claude copies
are generated outputs, not sources of truth.

Read `references/wayfinder.md` for the map, ledger, and closeout shapes.

```text
map issue -> blockers -> session-sized tickets -> spec -> PR proof
```

## Writing Rules

Correction = edit instruction. A correction fixes the artifact silently. Never
log, quote, or restate the correction itself in output.
No process commentary in deliverables. State facts and results only.

Keep GitHub as the evidence record and Linear as the active decision ledger.
When creating or updating Linear ledger items, include status and due-date
intent from `references/wayfinder.md`.
Do not create a flat ticket inventory, a background sync, or a visual unless it
clarifies a real handoff.

Validate source and mirror changes with `npm run plugins:sync`, then the
Cerebral checks listed in `docs/harness/README.md`.
