# Singleton Systems Harness

One owner. One next action. One check.

## Owner Map

```text
Linear       -> active decisions, commands, and next moves
GitHub       -> research, specs, dependencies, and implementation proof
Supabase     -> queryable facts and the runtime routing registry
Opportunity HQ -> career workflow state
Eagle        -> proof and assets
Raycast / Shortcuts -> desktop and mobile actions
Next/Vercel  -> owner-backed review dashboard
LikeC4       -> reviewed architecture
```

```text
[lane] Cash Jobs | Career Jobs | Freelance | Offer | Portfolio
```

## Source Rules

- `plugins/s-systems` is the versioned skill source. Installed plugin copies are outputs.
- A skill holds only its trigger, unique decision, action, and verification.
- A reusable operating reference belongs in this repo beside the system it supports.
- Linear holds the active decision and links; GitHub holds durable engineering proof.
- Supabase stores runtime facts only. It never stores full skill text, templates, or ticket bodies.

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
