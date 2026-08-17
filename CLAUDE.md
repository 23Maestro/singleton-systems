# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`singleton-systems` is the public Next.js website/portfolio for Singleton
Systems *and* the personal operating-system harness Jerami Singleton uses to
route work (Linear, GitHub, Supabase, Opportunity HQ, Eagle, etc.) through
AI agents. Application code (`app/`, `lib/`, `components/`) and the
"Cerebral" routing/registry system (`config/`, `.codex/`, `plugins/s-systems/`,
most of `docs/`) live in the same tree but serve different purposes — keep
that distinction in mind before editing.

## Commands

```bash
npm run dev                 # Next.js dev server
npm run build                # prebuild runs decision-maps:sync + check:cerebral, then next build
npm run start
npm run lint                 # next lint
npm run typecheck            # tsc --noEmit (no test runner exists; treat this + lint as the check suite)
npm test                     # runs the four check:* scripts below (no unit test framework in this repo)
```

Cerebral/system-contract drift checks (all pure Node scripts, no framework —
run individually while iterating):

```bash
npm run check:drift               # scripts/check-opportunity-hq-drift.mjs
npm run check:cerebral             # scripts/check-cerebral-drift.mjs — verifies doc/skill files still contain required contract snippets
npm run check:cerebral:hook-routing  # scripts/check-cerebral-hook-routing.mjs — spawns the Python hook against every registry route
npm run check:cerebral:registry      # scripts/check-cerebral-registry.mjs — validates config/cerebral-registry.json shape + Supabase migration RLS
```

LikeC4 architecture maps:

```bash
npm run visual-maps:validate
npm run visual-maps:build     # builds docs/visual-maps -> docs/visual-maps/dist, copies into public/visual-maps
npm run visual-maps:export-portfolio
```

There is no single-file/single-test runner to target — these are whole-repo
consistency checks. To iterate on one check, run its script directly, e.g.
`node scripts/check-cerebral-drift.mjs`.

Other scripts of note (`scripts/`): Remotion renders, Blender scene assembly,
Google Apps Script (`clasp`) push/pull for `docs/harness/personal-ops-google-systems`
and `docs/harness/job-search-prep-google`, Lighthouse/SEO audits, and
`scripts/sync-s-systems-mirrors.mjs` for syncing the `plugins/s-systems`
plugin into other install locations (`--apply` to write).

## Architecture

### Next.js app (`app/`, `components/`, `lib/`)

App Router, React 19, Tailwind. Path alias `@/*` -> repo root (see
`tsconfig.json`). Notable routes:

- `/` — marketing/portfolio site (`app/page.tsx`, `components/*`).
- `/home-tasks` — a chores tracker backed by Google Sheets via
  `lib/home-tasks-google.ts` (uses `googleapis` + a local OAuth token under
  `.google-workspace/`, not Supabase).
- `/linear-inbox` — a capture form (desktop via Raycast, mobile via iOS
  Shortcut/Android share-sheet) that is the single write path into Linear.
  Server route `app/api/linear/inbox/route.ts` does GraphQL directly against
  `api.linear.app` using `LINEAR_API_KEY` (server-side only, sent raw — not
  `Bearer`-prefixed). It creates issues/comments/sub-issues, decides
  comment-vs-subissue update shape heuristically, and records submissions to
  Supabase (`lib/linear-inbox-submissions.ts`) so `/api/linear/status` and the
  webhook route can report back state. Drafts (image/link capture before a
  full submission) go through `lib/linear-inbox-drafts.ts`, which uploads to
  Supabase Storage bucket `linear-inbox-drafts`.
- `app/api/linear/webhook` — receives Linear webhooks to update submission
  status.
- `wemby-shot-lab` is a **separate Vercel project**, reverse-proxied in via
  `rewrites()` in `next.config.mjs` (multi-zone setup) — don't look for its
  code in this repo.

`lib/supabase-rest.ts` is the only Supabase client: plain `fetch` against the
PostgREST (`/rest/v1/`) and Storage (`/storage/v1/`) endpoints using
`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (service role — server-side
only, never expose to the client). There is no `@supabase/supabase-js`
dependency; all Supabase access goes through this thin wrapper.

Supabase schema lives in `supabase/migrations/*.sql`, applied in filename
(timestamp) order. Tables enforce RLS with `for select` policies only for the
Cerebral registry tables (`cerebral_routes`, `harness_capabilities`,
`harness_skills`, `harness_verification_events`) — writes to those go through
migrations/seed scripts, never app code (`check:cerebral:registry` asserts
this).

### The Cerebral routing system

This is a cross-agent (Claude Code, Codex/ChatGPT) convention for routing
natural-language requests to the right "owner" system. The source of truth
chain is:

```
config/cerebral-registry.json   (routes, skills, capabilities — versioned)
  -> .codex/hooks/cerebral_singleton_guard.py   (reads the registry, runs on
     UserPromptSubmit/SessionStart/PreToolUse/PostToolUse, prints
     [route]/[lane]/[owner]/[preflight] blocks)
  -> plugins/s-systems/skills/*/SKILL.md   (one skill per registry route,
     the actual procedure)
  -> docs/*.md   (commands.md, integration-map.md, truth-matrix.md,
     visual-system-contract.md — narrative contracts the drift check pins
     specific sentences from)
```

If you touch any of these four layers, run `npm run check:cerebral` (content
drift), `npm run check:cerebral:registry` (registry shape + Supabase
migration), and `npm run check:cerebral:hook-routing` (hook behavior) before
considering the change done — they cross-check each other and will fail on
missing/renamed skills, stale "retired owner" references, or a registry route
without a matching hook behavior.

Key invariant enforced by the checks: capabilities like `homebrew` and
`pdf-skill` must stay `status: "verify-on-use"` with `path: null` — never
hardcode a machine-specific path into the registry; discover it at call time
with the capability's `verification_command`.

`plugins/s-systems/` is a Claude/Codex plugin (has both `.claude-plugin/` and
`.codex-plugin/` manifests) bundling the skills referenced by the registry.
`scripts/sync-s-systems-mirrors.mjs` keeps mirrored copies of this plugin in
sync elsewhere — check `--apply` output before assuming a sync happened.

### Docs (`docs/`)

Mostly narrative/planning markdown, not code documentation — treat as
prose to read for context, not something to keep exhaustively updated
unless a drift check (above) pins specific text in it. `docs/visual-maps/`
holds the LikeC4 source (`*.c4` files); `docs/harness/` holds Google Apps
Script projects managed via `clasp` (see the `gas:*` npm scripts) and are
their own semi-independent codebases, not part of the Next.js build.

## Writing Rules

Applies to every reviewable non-code artifact — Markdown, Linear, GitHub,
Notion, memory, emails, cover letters, proposals, briefs, handoffs, captions,
site copy, public HTML/pages, visual/source notes, and review docs. Not to
source code, generated bundles, code blocks, or conversation.

Canonical source: `docs/harness/writing-rules.md` (full deny-list, voice, and
the client-repo hook payload). Pinned summary in `docs/harness/README.md` →
Writing Rules.

- Correction = edit instruction. A correction fixes the artifact silently. Never log, quote, or restate the correction itself in output.
- No process commentary in deliverables. State facts and results only.
- Caveman brevity, full grammar. Short sentences, plain verbs, concrete numbers.
- Jerami review surfaces usually stay between 300 and 500 words. Use fewer
  when the decision is simple.
- If the review truly needs more, create a dated interactive HTML Decision Map
  and keep the written entry point short. Do not put operating manuals in
  Linear issues.
- Banned: delve, showcase, leverage, utilize, robust, seamless, elevate, streamline, pivotal, crucial, foster, landscape, empower, unlock, additionally, enhance, facilitate, demonstrate.
- Banned: "not just X but Y", "X rather than Y", "serves as", "features" (write is, has), hedging, three-item rhythm, `**Bold**:` list headers, Title Case Headings.

## Conventions

- No test framework (Jest/Vitest/etc.) is configured. "Tests" in this repo
  means the `check:*` drift/registry scripts plus `typecheck`/`lint`.
- Server-only secrets (`LINEAR_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  Google OAuth tokens under `.google-workspace/`) must never be referenced
  from client components — keep them inside `app/api/**/route.ts` and `lib/`
  modules that only run server-side.
- When a Linear GraphQL query needs to expand beyond the curated project
  list, remember Linear enforces a query complexity cap (~10000) — see the
  comment above `lookupQuery` in `app/api/linear/inbox/route.ts` for why it's
  filtered.
