# CODEX.md

Codex is the primary implementation driver for this repository. This file is
the canonical shared repository guide. `CLAUDE.md` is the secondary Claude Code
entrypoint. When the two files disagree, this file wins.

## startup

Before exploring or changing the repository, read:

- `CONTEXT.md` for shared Gate and Lane vocabulary;
- `docs/agents/domain.md` for domain-document rules;
- `docs/agents/issue-tracker.md` for Linear ownership and workflow;
- `docs/agents/triage-labels.md` for tracker-label mappings.

These files adapt generic skill language to Singleton Systems. They do not
authorize automatic dispatch or unsupervised implementation.

## repository

`singleton-systems` contains two connected systems:

- the public Next.js website and portfolio in `app/`, `components/`, and `lib/`;
- the Cerebral routing and operating harness in `config/`, `.codex/`,
  `plugins/s-systems/`, and most of `docs/`.

Keep those purposes clear before editing.

## commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm test
```

Cerebral contract checks:

```bash
npm run check:drift
npm run check:cerebral
npm run check:cerebral:hook-routing
npm run check:cerebral:registry
```

LikeC4 maps:

```bash
npm run visual-maps:validate
npm run visual-maps:build
npm run visual-maps:export-portfolio
```

There is no single-file test runner. Use the whole-repo checks or run the
relevant Node script directly while iterating.

## application architecture

Figma Make is a design and concept tool. Port approved exports into this
repository's Next.js app and deploy on Vercel. Do not copy the export's Vite
scaffold, package manifest, lockfile, or Figma-specific dependencies. Reuse
the approved interface, assets, and tested domain rules with the existing stack.

The app uses Next.js App Router, React 19, and Tailwind. The `@/*` path alias
points to the repository root.

- `/` is the marketing and portfolio site.
- `/home-tasks` is backed by Google Sheets through
  `lib/home-tasks-google.ts`.
- `/linear-inbox` is the capture path into Linear. Its server route writes
  through the Linear GraphQL API and records submission state in Supabase.
- `app/api/linear/webhook` receives Linear status updates.
- `wemby-shot-lab` is a separate Vercel project reached through a rewrite.

`lib/supabase-rest.ts` is the Supabase client. It uses server-side REST calls.
Do not expose service-role credentials to client code.

Supabase migrations live in `supabase/migrations/` and apply in filename order.
Cerebral registry writes go through migrations and seed scripts.

## cerebral

Cerebral routes natural-language requests to the right owner system:

```text
config/cerebral-registry.json
  -> .codex/hooks/cerebral_singleton_guard.py
  -> plugins/s-systems/skills/*/SKILL.md
  -> docs/*.md
```

If any layer changes, run all three Cerebral checks before completion. Keep
machine-specific capabilities such as `homebrew` and `pdf-skill` at
`status: "verify-on-use"` with `path: null`.

`plugins/s-systems/` is the versioned Codex and Claude plugin source. Installed
copies are generated outputs. Use `scripts/sync-s-systems-mirrors.mjs` to check
or apply mirror updates.

## documentation

`docs/` holds planning, operating, handoff, and visual-map material. Update it
when the task changes a durable contract or a drift check pins the text.

## writing

The canonical writing rules live in `docs/harness/writing-rules.md`. Apply them
to every reviewable non-code artifact.

- Fix corrections silently.
- State facts and results only.
- Use short sentences, plain verbs, and concrete numbers.
- Keep Jerami review surfaces under 500 words when the decision is simple.
- Use a dated interactive Decision Map when the review needs more room.

## conventions

- Preserve unrelated changes in a dirty worktree.
- Verify visible behavior for user-facing changes.
- Keep secrets inside server routes and server-only modules.
- Use Linear for task state and GitHub for implementation evidence.
- `ready-for-build` records readiness. It does not start work.
- Treat `Lane` as the front-facing term. Accept `Bucket` as a trigger phrase
  and tool-harness destination.
- Keep Jerami in control of scope, delivery, and external changes.
- Codex owns the current task. Do not dispatch sub-agents, create AFK work, or
  start background implementation unless Jerami explicitly requests it.
