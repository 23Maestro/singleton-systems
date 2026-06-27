# 05 Review Verification

Owner: human review, with Codex providing the smallest meaningful check.

Allowed inputs:

```text
selected tool stack
task/doc/skill change
proposal/application draft
Raycast action request
proof claim
```

Allowed outputs:

```text
approved mutation
revised draft
verification result
blocked reason
proof link
```

Do not:

```text
silently write ambiguous planning
auto-send proposals/applications
claim runtime proof from a harness-only check
skip stale-name verification after docs/skills changes
```

Review gates:

```text
Opportunity HQ mutation -> show shape first unless directly requested
proposal/application -> draft before send
Raycast action -> native action first, Codex Assist second
docs/skills change -> rg stale naming
code change -> smallest meaningful check
```

Next action rule: verify the touched surface, then send only the durable summary to `06_memory-compaction`.
