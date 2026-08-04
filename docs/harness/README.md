# Singleton Systems Harness

One owner. One next action. One check.

## Owner Map

```text
Linear       -> active decisions, Wayfinder maps, dependencies, and next moves
GitHub       -> branches, commits, pull requests, and implementation proof
Supabase     -> queryable facts and the runtime routing registry
Opportunity HQ -> career workflow state
Eagle        -> proof and assets
Raycast / Shortcuts -> desktop and mobile actions
Next/Vercel  -> owner-backed review dashboard
LikeC4       -> reviewed architecture
```

```text
[lane] Development | Content Editor | AI Consultant | Portfolio
```

## Source Rules

- `plugins/s-systems` is the versioned skill source. Installed plugin copies are outputs.
- A skill holds only its trigger, unique decision, action, and verification.
- A reusable operating reference belongs in this repo beside the system it supports.
- Linear holds Wayfinder planning and task state; GitHub holds linked implementation proof.
- Supabase stores runtime facts only. It never stores full skill text, templates, or ticket bodies.

## Writing Rules

Apply to every artifact: Linear, GitHub, Notion, Supabase, memory, markdown,
code comments, filenames, commit messages.

- Correction = edit instruction. A correction fixes the artifact silently. Never log, quote, or restate the correction itself in output.
- No process commentary in deliverables. State facts and results only.

## Repeatable Skill Source Contract

For SSystems skill or route work:

1. Work from `/Users/singleton23/Documents/Development/singleton-systems`.
2. Treat `plugins/s-systems` as the canonical source for all registered
   SSystems skills.
3. Treat installed Codex and Claude plugin copies as generated outputs only.
4. Keep Linear work in the `Singleton Systems` project, assigned to Jerami and
   delegated to Codex when Codex owns the next implementation action.
5. Run `npm run check:cerebral:registry` before completion. It verifies that the
   registry and all versioned SSystems skill folders still match.

## Change Gate

Before adding or changing an artifact, answer:

1. Does this need to exist?
2. Who owns it?
3. What is the shortest durable form?
4. What check proves it works?

Use `ponytail-audit` after a substantial change, `ponytail` for the smallest
fix, `ponytail-review` on the diff, and `ponytail-debt` only for explicit
`ponytail:` deferrals.

## Verification

```text
npm run check:cerebral
npm run check:cerebral:hook-routing
npm run check:cerebral:registry
npm test
```

Do not claim completion until the applicable commands have run against the
actual diff.
