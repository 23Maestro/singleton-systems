# 05 Review Verification

Owner: human review, with Codex providing the smallest meaningful check.

Allowed inputs:

```text
selected tool stack
task/doc/skill change
proposal/application draft
outreach/content/copy draft
Raycast action request
portfolio claim
```

Allowed outputs:

```text
approved mutation
revised draft
verification result
blocked reason
portfolio link
```

Do not:

```text
silently write ambiguous planning
auto-send proposals/applications
claim runtime portfolio from a harness-only check
skip stale-name verification after docs/skills changes
```

Review gates:

```text
Opportunity HQ mutation -> show shape first unless directly requested
proposal/application -> draft before send
outreach/content/copy -> Final Human Pass before final
Raycast action -> native action first, Codex Assist second
docs/skills change -> rg stale naming
code change -> smallest meaningful check
```

Final Human Pass means: keep the strategy, but remove boilerplate before the
draft reaches the user as final. Ban padded phrases, meta commentary, fake guru
cadence, vague AI words, and template lines like "here's where I come in" unless
the user explicitly asks for that style. Make it sound like a person with a real
reason to write.

Next action rule: verify the touched surface, then send only the durable summary to `06_memory-compaction`.
