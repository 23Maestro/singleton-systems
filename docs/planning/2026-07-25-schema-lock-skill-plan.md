# Schema-Lock Skill Plan

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
| `foundation-pass` | Available locally, not yet in repo | Needs review against this plan |

The gap: nothing currently segments a mixed-intent ramble into typed buckets
(request / project / task / observation / archive) before routing fires.

## References to pair

1. **ThePrimeagen transcript** — local, `~/Documents/YouTube transcripts/`,
   filename contains "ai workflow" or similar. Extract the lock sequence:
   what forces schema output, how worktrees gate progress, whether the check
   is mechanical or convention.
2. **Foundation pass skill** — available locally, not in this repo. Review
   its current shape and determine overlap with this plan.

## Proposed skill: upstream triage + schema lock

Working name TBD. Sits upstream of `cerebral-router`.

### Flow

```text
raw input (ramble, voice dump, mixed intent)
  -> segment into typed buckets
  -> if small (1-2 segments): skip interview, route directly
  -> if medium/large: interview to confirm bucket names and boundaries
  -> draft capped schema (bucket count scaled by size: small/medium/large)
  -> user confirms schema
  -> mark [schema-locked]
  -> hand each bucket to cerebral-router / planning-idea-routing
```

### Design decisions to make on desktop

1. **Gate mechanism.** The interview is a skill (multi-turn). The lock
   enforcement can be a hook — refuse downstream skill execution unless
   `[schema-locked]` is present. But: should the hook actually block, or
   just warn? ThePrimeagen's transcript will clarify whether his was hard
   or soft.

2. **Bucket taxonomy.** Start with: request, project, task, observation,
   archive. These are owner-agnostic categories that map to Singleton's
   existing owners (Linear, GitHub, Eagle, etc.) via `cerebral-router`. The
   mapping is Singleton-specific; the categories are not.

3. **Schema cap formula.** Candidate: small input (< 3 sentences) → 1-2
   buckets, no interview. Medium (3-10 sentences) → interview, max 4
   buckets. Large (10+) → interview, max 6 buckets. Wayfinder already uses
   a similar restraint: "child issue only for a real branch."

4. **Where the skill lives.** Candidates: `plugins/s-systems/skills/` (if
   it's Singleton-specific routing), or `skills/` at repo root (if it's
   generic enough to eventually extract). Decide after pairing against
   ThePrimeagen's approach.

5. **Relationship to cowork / Claude Tag.** Long-term ambition is a product
   feature for non-technical users. But: harden for Singleton first. Do not
   generalize until the local version works for at least 10 real rambles.

## What not to do yet

- Do not build the skill without reviewing the transcript and foundation pass
- Do not generalize beyond Singleton's owner map
- Do not restructure existing skills — they pass `check:cerebral`
- Do not add a new registry route until the skill shape is confirmed
- Do not create a new database or automation layer

## Next steps (on desktop)

1. Open local Claude Code session in this repo
2. Share the transcript file path and foundation pass skill location
3. Extract ThePrimeagen's lock sequence from the transcript
4. Pair against `cerebral-router`, `planning-idea-routing`, `wayfinder`,
   and `foundation-pass`
5. Draft the skill SKILL.md
6. Decide gate mechanism (hook check vs. convention)
7. Test against 3-5 real rambles before adding to the registry
