# App Design Brand Plan

Lean capture, not a finished spec. Log the decisions that are actually
locked, name what's pending without designing it yet, and grill the rest in
a dedicated design session before the surfaces below get touched. Linked
from `23M-<id>` in Linear (Singleton Systems, due 2026-07-27).

## Locked: icon spec

Phosphor icons (`@phosphor-icons/react`, already the dependency used on
`/home-tasks`) are the glyph source for every surface on the domain, going
forward. Not Material Symbols — that was a wrong guess in an earlier pass
and is corrected here.

The existing Singleton Systems badge frame stays exactly as it already is —
this is the operator's own design, not something to redo:

```text
2px black stroke circle, pastel brand-color fill
(blue #2383e2, yellow #ffc83d, coral #ff6257, green #25c266)
```

Only the glyph inside the frame changes to a Phosphor icon at matching
stroke weight. The small custom accent detail — the three-point sparkle
cluster next to "Curious about AI? Ask me where it can save real time." on
the homepage (`app/page.tsx`, the `RotatingHeroHeadline` area) — is the
most-loved detail in the current build and should be kept/reused as a
signature element, not folded into the generic badge treatment.

Surfaces in scope for the swap: homepage, AI workflow portfolio, home
tasks, links, linear inbox.

## Homepage and AI workflow portfolio: already intentional

Both `app/page.tsx` and `app/ai-workflow-portfolio/page.tsx` are real,
intentional designs — not AI-default output — and are good bones. They
still want alignment and cleanup on certain elements, but that's a "grill
it later" pass, not something to guess at now. No specifics logged yet on
purpose.

## Pending, named but not designed

### Pending dashboard

Working assumption: this is the `/linear-inbox` "awaiting approval" status
view already locked in from the prior session (submitting -> created ->
agent updating -> confirmed). Flagging as an assumption, not a decision —
correct this note if "pending dashboard" meant something else.

### Pending: ScoutID / Glaze contest entry

Goal: enter ScoutID in the Glaze/Raycast + Anthropic contest, $10k prize,
due **2026-07-31**. The operator's read: a real shot at winning if the UI
gets small design changes to match the utility and ergonomics that are
already built — not a rebuild, a polish pass tied to real functionality.

Reusable context pulled from a prior Codex session
(`~/.codex/memories/rollout_summaries/2026-07-21T22-17-01-ST6h-scoutid_evidence_review_lean_portfolio_plan.md`),
carried forward so it isn't lost:

- App: `/Applications/Glaze/ScoutID.app` — a prospect/scouting workflow UI
  with `Scout Prep`, `Scout Schedules`, `Prospect Search`, `Client Messages`.
  Editable source: `~/Library/Application Support/app.glaze.macos.main/apps/prospect-id-scout-prep-local-15mhwiwi/.glaze-sources`.
- It mirrors a larger Mac surface built from the Raycast Prospect Pipeline
  extension. Contract docs already exist and are the source of truth for
  what's real vs. assumed:
  - `~/Raycast/prospect-pipeline/docs/architecture/scouting-command-ui-contract.md`
  - `~/Raycast/prospect-pipeline/docs/architecture/scouting-command-raycast-mutation-contract.md`
  - `~/Raycast/prospect-pipeline/docs/architecture/scouting-coordinator-system-map.md`
- Prior session's caveat, still true: do not assert shortcut/feature claims
  without reviewing the live app and source contracts first. The user
  explicitly rejected unsupported claims once already.
- A proof-page shape was proposed but never confirmed or built: a
  `/scoutid-proof/` route reusing the existing `/ai-workflow-portfolio/`
  pattern, three tabs (`How it works`, `Evidence map`, `Built from the
  job`), evidence chain `screen/control -> shortcut -> Raycast source ->
  mutation contract -> proof file/test`. Treat this as one option, not a
  decision — the actual ask now is UI/design polish on the real app for
  the contest submission, which may or may not need a separate proof page.
- This is a distinct app from the Glaze-built DFX Palette tool documented
  at `~/Documents/Development/karabiner-ts/docs/glaze-app-handoff.md` —
  don't conflate the two when picking this back up.

## Sequencing

1. This capture ships as one Linear ticket now (Todo, due 2026-07-27) — no
   GitHub map issue this pass.
2. Immediately after, work redirects to finishing the already-locked
   `/linear-inbox` build: the design already agreed on, plus the
   webhook/status-poll functionality and UI wiring.
3. By 2026-07-27, run the actual design session: grill the homepage/AI
   workflow portfolio cleanup, the pending dashboard, and the ScoutID
   contest UI polish, and very likely set the reusable Singleton Systems
   brand design system out of that session rather than out of this note.
