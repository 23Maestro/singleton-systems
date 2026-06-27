# 04 Tool Scope

Owner: docs/skills, enforced by the active skill stack.

Allowed inputs:

```text
routed lane
task shape
owner surface
review need
proof/link need
```

Allowed outputs:

```text
[tools] selected tools
[tools] selected skill stack
[do-not] forbidden tools
[review] review gate
[verify] verification check
```

Do not:

```text
enable every connected tool
build agent/bot/Slack/Hermes infrastructure
add databases
add async loops
make Raycast own business logic
```

Default scope:

```text
Bear -> capture and later review
Opportunity HQ -> durable projects/tasks/status/Goal Horizon/Work Date/Shift/dependencies/portfolio notes
Raycast -> external action surface at /Users/singleton23/Raycast/career-hq
Eagle -> proof assets
Docs -> operating rules and research memos
Skills -> repeated reasoning contracts
```

Next action rule: choose the smallest tool stack that can complete the reviewed next action, then send it to `05_review-verification`.
