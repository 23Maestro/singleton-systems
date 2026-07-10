# Foundation Pass

Owner: Codex docs/skills naming, with Cerebral as the routing hook.

Purpose: force AI-assisted build work to name the foundation before it edits.
Use this when an idea feels too complex to name cleanly, has multiple moving
parts, or needs a safer implementation path than "go build it."

This is a reasoning contract first. Do not turn it into a Raycast command,
Shortcut, database, or automation until the workflow repeats enough to deserve
one.

## Core Rule

```text
No implementation until the structures, interfaces, change map, and review gate
are clear.
```

The useful part is not the phase count. The useful part is that Codex must show
what it thinks the system is before it changes the system.

## Phases

### Phase 0: Route And Research

Inspect the current idea, repo, docs, or transcript. Decide:

```text
lane
owner surface
allowed tools
review gate
what should stay untouched
```

For Singleton Systems, Cerebral routes first. The harness then chooses the
smallest allowed stack.

### Phase 1: Durable Structures

Name the durable objects before naming tasks.

Examples:

```text
entities
state buckets
project lanes
files
tables
status values
source-of-truth records
proof assets
content variables
```

If the structures are wrong, stop here and correct them.

### Phase 2: Interfaces And Handoffs

Name how the structures talk to each other.

Examples:

```text
functions
commands
APIs
prompts
review screens
owner boundaries
file handoffs
source-to-proof handoffs
mobile-to-desktop handoffs
```

If the interface hides ownership, mixes source-of-truth layers, or invents a new
surface, stop here and correct it.

### Phase 3: Change Map

List the exact places that would change.

For code:

```text
files
functions
tests
fixtures
routes
commands
docs
```

For systems work:

```text
owner doc
skill
Opportunity HQ task shape
Raycast command
Shortcuts action
Eagle proof item
LikeC4 map
```

This is the "show me your to-dos in the actual system" phase.

### Phase 4: Trial Implementation Report

Before final implementation, have Codex explain what would happen if it tried
the build.

When code is involved, a real trial can use a temporary branch or git worktree.
The output should answer:

```text
What followed the structures?
What followed the interfaces?
What followed the change map?
Where did the plan break?
What extra files or concepts were needed?
What should be corrected before the real implementation?
```

If a trial implementation is actually run, it should be reviewable and easy to
discard.

### Phase 5: Invariants

Write the rules that must stay true after the change.

Singleton Systems examples:

```text
Opportunity HQ owns durable tasks and project state.
Raycast is an action surface, not the planning brain.
Docs/skills own naming and review gates.
Eagle owns proof and assets.
Obsidian owns raw capture only.
MCP is an operator layer, not a reliability dependency.
Human review happens before mutation.
```

If the model cannot state the invariants clearly, the idea is not ready for
implementation.

### Phase 6: Real Implementation

Only implement after the user approves the structures, interfaces, change map,
trial report, and invariants.

Keep the implementation scoped to the approved map. If work must leave the map,
stop and report why before continuing.

## Git Worktree Practice

Git worktrees are worth keeping as the beginner-safe version of "let AI try this
somewhere else."

Use a worktree when:

```text
the change is bigger than one file
the plan may be wrong
the AI needs to try code before the user trusts it
the main checkout has unrelated dirty work
the user wants to review a separate attempt without losing the current state
```

Beginner mental model:

```text
normal repo folder = current desk
git worktree = second desk connected to the same repo
branch = label for the attempt on that desk
```

Safe local pattern:

```bash
git status --short
git worktree add ../singleton-systems-foundation-pass -b codex/foundation-pass
cd ../singleton-systems-foundation-pass
git status --short
```

After review, keep or remove the attempt:

```bash
git worktree list
git worktree remove ../singleton-systems-foundation-pass
```

Do not use worktrees as a substitute for review. They isolate the attempt, but
the user still decides what gets merged, copied, committed, or deleted.

## Prompt Template

```text
Do not implement yet.

I want to build or clarify this idea:
[idea]

Run a Foundation Pass.

Return:
1. Route: lane, owner surface, allowed tools, review gate
2. Durable structures
3. Interfaces and handoffs
4. Exact change map
5. Trial implementation report: where the plan would probably break
6. Invariants that must stay true
7. The smallest approved implementation slice

If implementation would require leaving this plan, say where and why before
editing.
```

## Output Shape

```text
Lane:
Owner:
Tools:
Review gate:

Structures:
Interfaces:
Change map:
Trial report:
Invariants:
Smallest implementation slice:
Do not:
```

## Promotion Rule

This starts as a docs/skills pattern.

Promote it only after repetition is obvious:

```text
repeated prompt -> skill template
repeated skill use -> Raycast Codex Assist action
repeated code trial -> documented worktree helper
repeated verified helper -> command
```

Do not skip straight to automation.
