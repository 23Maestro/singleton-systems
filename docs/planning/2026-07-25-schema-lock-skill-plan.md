# Foundation Pass — Schema-First Review Loop

## Date

2026-07-25

## Problem

AI generates 80%-there output because it starts building before the human has
named what they actually want. Non-developers hit this hardest: they can
describe the goal but can't decompose it into clean buckets or schema the way
a developer would. The result is sprawling, half-structured output that
requires expensive rework.

ThePrimeagen's approach (GitHub worktrees + forced one-word/JSON schema output
before any build) solves this for developers. The goal here is to steal that
architectural discipline and make it work for non-technical users inside the
Singleton Systems harness — then eventually generalize it.

## What already exists

| Skill | What it handles | Gap |
|---|---|---|
| `cerebral-router` | Forces `Owner/Intent/Tools/Review/Verify/Do not` before cross-surface mutation | Assumes the input is one coherent thought |
| `planning-idea-routing` | Classifies raw capture into one owner + one next action | Same assumption — works on a single idea, not a ramble |
| `wayfinder` | Breaks fuzzy/branching builds into map → blockers → session-sized tickets | Operates after the problem is already named |

The gap: nothing currently segments a mixed-intent ramble into typed buckets
(request / project / task / observation / archive) before routing fires.

## Source to translate

**ThePrimeagen transcript:**
`/Users/singleton23/Documents/YouTube transcripts/my-new-ai-workflow-Aie0nYktsNA.md`

The transferable sequence is: define structures before implementation; exercise
the work through a structured/JSON test surface; then report where the agent
could not complete the work. Foundation Pass adapts that sequence for Singleton
Systems. It is a planned capability, not an installed dependency.

## Proposed skill: Foundation Pass

Sits upstream of `cerebral-router`. Its only decision is whether the request is
clear enough to create a durable record or begin work.

### Flow

```text
raw input
  -> inspect available facts
  -> propose a capped schema: objective, facts, unknowns, next
  -> stop for one user decision if name, scope, owner, or output is uncertain
  -> user confirms the schema
  -> route one confirmed unit through Cerebral
  -> test the result against its structured contract
  -> report what could not be completed; do not invent the missing part
```

### Design decisions to make on desktop

1. **Write gate.** This is not a magic `[schema-locked]` marker or a broad
   hook. Before a Linear issue, GitHub issue, support document, or other
   durable record is written, Foundation Pass must stop on an uncertain name,
   scope, owner, or requested output and ask one decision question.

2. **Schema.** Keep every pass to objective, facts, unknowns, and next. A
   more detailed schema belongs only to the owner that needs it.

3. **Testing.** A test is a structured input and expected output, not a
   simulated conversation. Start with one schema application, one
   Linear/GitHub routing case, and one support-document update.

4. **Location.** Keep it in `plugins/s-systems/skills/` while it is specific
   to Singleton's owners and write boundaries.

5. **Writing style.** Separate confirmed facts from decisions and unknowns.
   A conversational correction is not a business fact until the user asks to
   record it.

## What not to do yet

- Do not generalize beyond Singleton's owner map
- Do not restructure existing skills to make room for it
- Do not add a new registry route until the skill shape is confirmed
- Do not create a new database or automation layer

## Next steps (on desktop)

1. Draft the Foundation Pass SKILL.md with only the write-gate decision.
2. Test it against three real inputs: schema application, Linear/GitHub
   routing, and support-document writing.
3. Record the expected structured output and the required stop question for
   each case.
4. Add it to the registry only after those tests prove it prevents an
   unconfirmed write without blocking clear requests.
