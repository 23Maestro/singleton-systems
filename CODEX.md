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

For offer, audience, outreach, or business work, also read
`business/brand-foundation.md`, `business/offer-and-audience.md`, and
`business/voice-rules.md`. `business/` is the single home for current business
facts. Skills and old source notes must defer to it.

Before downloading, generating, moving, or cleaning video media, read
`docs/video-storage-workflow.md` and use `s-systems:video-storage`.

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
npm run verify
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm test
```

Husky runs `npm run verify` before every commit.

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

For a focused check, use `node --test path/to/test.mjs` or
`python3 -m unittest package.test_module`. Run the required repo checks before
delivery; a focused pass alone does not prove the full change.

## application architecture

Figma Make is a design and concept tool. Port approved exports into this
repository's Next.js app and deploy on Vercel. Do not copy the export's Vite
scaffold, package manifest, lockfile, or Figma-specific dependencies. Reuse
the approved interface, assets, and tested domain rules with the existing stack.

The app uses Next.js App Router, React 19, and Tailwind. The `@/*` path alias
points to the repository root.

Use Sites for a review preview and verify its hosted HTTPS link on the review
surface. Keep production on Vercel and the existing domain. Start a local
server only when Jerami asks or an automated check needs it; stop an owned test
server after the check. Preview publication and production publication are
separate steps.

- `/` is the video-editing offer and portfolio. `/AI-consultant` owns the
  separate AI consulting offer. Keep their page content and metadata separate.
- `npm run build` checks the rendered public offers after compilation. Keep
  that check in the release path, including releases for private tools.
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
Supabase runtime registry
  -> .codex/hooks/cerebral_singleton_guard.py
  -> plugins/s-systems/skills/*/SKILL.md
  -> current business facts and domain contracts
```

`config/cerebral-registry.json` is the versioned contract and seed source.
The runtime hook reads Supabase; the JSON file is not a local fallback.

If any layer changes, run all three Cerebral checks before completion. Keep
machine-specific capabilities such as `homebrew` and `pdf-skill` at
`status: "verify-on-use"` with `path: null`.

`plugins/s-systems/` is the versioned Codex and Claude plugin source. Installed
copies are generated outputs. `scripts/sync-s-systems-mirrors.mjs` checks or
updates development mirrors. `scripts/release-s-systems-plugin.mjs` owns the
installed Codex plugin release. A source edit or mirror sync alone does not
update an installed plugin. Validate and release only the approved scope.

## documentation

`docs/` holds durable operating contracts, source records, handoffs, and visual
maps. Update it when a contract changes or a drift check pins the text.
Put Development plans, specs, progress, and next steps in Linear. Put client
editing and consulting work in Asana. Do not create dated repo plans or keep
superseded business facts as a second source of truth.

Video storage is a separate front-facing tool. `s-systems:video-storage` owns
HomeSSD placement, migration, retention, and video-media cleanup. `dev-storage`
owns dependencies, caches, runtimes, and Git worktrees.

For Unreal setup, use `s-systems:unreal-storage`. It owns engine and project
placement, Unreal caches, and the native agent script path. Follow each scene's
recorded engine route. A reviewed Unreal master does not prove episode timing,
finished visual approval, or delivery.

Before calling a Lineups source or workflow missing, recover the last matching
production handoff and episode closeout. Follow the prior-production lookup in
`plugins/s-systems/skills/lineups-editor/references/lineups-episode-lifecycle.md`.
Name the exact conflict when saved work and a validation rule disagree. Fix
that rule at its owner; do not ask Jerami to rebuild an existing source.

## task closeout

Keep the task tracker current during normal work. Jerami does not need to name
a skill. For selected work, find the existing Asana or Linear task and follow
the shared closeout steps in `docs/agents/issue-tracker.md`.

Bind the exact task before work. Check the result before ending. Close proven
subtasks first, then the parent. Read each change back. Keep work open when
approval or proof is missing. Record the exact next step with `defer`.

The normal prompt and resume hooks show missed closeout. The Stop hook asks
for 1 correction, then leaves a visible pending result. It runs no external
writes and starts no background work. Research alone needs no task binding.

## writing

The canonical writing rules live in `docs/harness/writing-rules.md`. Apply them
to prose we author or rewrite for a reader. Preserve supplied client words and
verbatim speech transcripts. Code stays outside the prose gate.

- Fix corrections silently.
- State facts and results only.
- Use short sentences, plain verbs, and concrete numbers.
- Rewrite source-backed drafts without losing facts or attribution. Run the
  competitor swap test on hooks, landing pages, proposals, and portfolio copy.
- Draft operational copy as CommonMark with real blank lines. Linear accepts
  CommonMark. Convert Asana descriptions to supported HTML in `html_notes`,
  wrapped in `<body>`; `notes` is plain text. Read back both fields after writes.
  Never print escaped `\n` as layout.
- Keep Jerami review surfaces under 500 words when the decision is simple.
- Use a dated interactive Decision Map when the review needs more room.

## conventions

For CAD component builds and reference reviews, read
`docs/cad-component-review-workflow.md`. Geometry checks and visual approval
remain separate gates. Linear owns component state.

For 745 Creative visual edits, read `docs/745-creative-visual-contract.md`.
Bind the exact client/content lane and Premiere sequence in
`config/745-creative/active-edit.json`. The source-backed JSON and supplied
reference govern the look, with Jerami's 10% adjustment allowance.
Figma authors contract-bound lane masters and covers; HyperFrames + GSAP is an
optional renderer. Review designs in Figma and test the first opening over real
footage in Premiere, which owns final assembly. Role-matched UI components may
refine containers without changing the locked treatment. The client visual
contract owns caption routing and its lane-specific renderer choices. Jev suggests lanes;
it never overrides the supplied direction or binds automatically.

- Preserve unrelated changes in a dirty worktree.
- Verify visible behavior for user-facing changes.
- Keep secrets inside server routes and server-only modules.
- Use Linear for Development task state. Use Asana for AI Consulting and
  Content Editor task state. GitHub holds implementation evidence.
- `ready-for-build` records readiness. It does not start work.
- Treat `Lane` as the front-facing term. Accept `Bucket` as a trigger phrase
  and tool-harness destination.
- Keep Jerami in control of scope, delivery, and external changes.
- Codex owns the current task. Do not dispatch sub-agents, create AFK work, or
  start background implementation unless Jerami explicitly requests it.
