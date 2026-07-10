# Singleton Systems Harness

Owner: Codex docs/skills naming, with Cerebral as the routing hook.

Purpose: keep Singleton Systems context sound without building agents, Slack,
Discord, Hermes, async loops, databases, automation, or a bot runtime.

Canonical flow:

```text
lane decides context
context decides tools
task state stays isolated
human reviews before mutation
old noise gets compressed
```

Contracts:

```text
01_intake -> capture enough to route
02_routing -> pick lane, owner, fields, skill stack, next action
03_task-shape -> shape Opportunity HQ work without making pseudo-projects
04_tool-scope -> choose the smallest allowed tool stack
05_review-verification -> review before mutation, verify before done
06_memory-compaction -> keep only the decision, owner, evidence, and next action
```

Foundation Pass:

```text
foundation-pass.md -> name structures, interfaces, change map,
trial report, invariants, and smallest implementation slice before editing
```

Owner surfaces:

```text
Obsidian = raw capture
Opportunity HQ = durable projects, tasks, status, Goal Horizon, Work Date, Shift, dependencies, sub-tasks, portfolio notes
Eagle = portfolio and assets
Raycast = external action surface at /Users/singleton23/Raycast/career-hq
Docs/skills = names, rules, review gates, and memory summaries
```

Harness packet:

```text
[lane] Cash Jobs | Career Jobs | Freelance | Offer | Portfolio
[owner] Obsidian | Opportunity HQ | Eagle | Raycast | Docs/skills
[intent] one plain sentence
[shape] capture | task | sub-task | dependency | portfolio | command idea | operating rule
[tools] smallest allowed stack
[review] review gate before mutation
[memory] decision, evidence, remaining next action
```

These tags are the routing grammar, not Obsidian tags and not a runtime format. Use
them when a request needs a clean handoff between Codex, docs, Opportunity HQ,
Raycast, Eagle, or memory.

Real means:

```text
raw intent becomes a packet
packet picks one owner
owner decides allowed tools
review gate protects mutation
memory keeps the decision and next action
```

Final Human Pass:

```text
Any Singleton Systems draft meant for outreach, LinkedIn, sales, proposals,
applications, ads, captions, website copy, portfolio packaging, or social posts
gets one last human pass before it is shown as final.
```

This is the final veil after the platform, sales, or content strategy has done
its job. Keep the useful structure, urgency, and CTA, then strip anything that
sounds like a template performing authority. Cut padding, press-release cadence,
meta commentary, fake guru phrasing, vague AI words, and third-person insight
voice. Use "I" and "you" when that is the natural way to say it. Be concrete.
Let the pacing be human, not perfectly symmetrical.

Example packets:

```text
[lane] Portfolio
[owner] Opportunity HQ
[intent] Package a portfolio asset from an Eagle screenshot into website/outreach copy.
[shape] task with portfolio link
[tools] career-proof-packager + Eagle + Opportunity HQ; Raycast only to open/capture/update
[review] review portfolio claim before publishing
[memory] asset, claim, changed surface, remaining next action
```

```text
[lane] Offer
[owner] Docs/skills
[intent] Preserve a repeated routing rule for future Singleton Systems work.
[shape] operating rule
[tools] cerebral-router + singleton-systems + docs/harness
[review] rg stale naming and forbidden runtime language
[memory] rule, owner surface, verification result, next action
```

Do not add runtime code here.

Visual doc:

```text
docs/harness/index.html
```

Open it directly in a browser for a quick, non-runtime view of the harness flow.
