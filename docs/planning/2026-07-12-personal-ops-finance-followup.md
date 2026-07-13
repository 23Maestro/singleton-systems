# Personal Ops Finance Follow-up

Date: 2026-07-12

## Routing

Owner surface: Docs planning note now; future finance design pass later.

Why: The current work should stay focused on the chores Personal Ops slice.
Finance has enough existing surfaces that it should not be redesigned inside the
chores build.

Next smallest action: Park the finance source map and use it as the starting
point for a separate read-only finance design pass.

Do not do yet: Do not migrate finance data, create new finance databases, alter
Notion finance schemas, or connect Excalidraw finance review until the finance
goal is explicit.

## Pending Findings

Google Drive:

- `Finance` folder exists and currently shows `discover-settlement.pdf` as a
  child file in connector readback.
- `2023_Financial Tracker` spreadsheet exists with tabs:
  `READ ME - Instructions`, `By Paycheck Dashboard`, `Bills Calendar`,
  `Subscription Tracker`, `Debt Snowball Calculator`, and `Sinking Funds`.
- No Google Forms or Apps Script projects surfaced in the read-only Drive search.

Notion / 23 Space:

- `23 Space` is the top Personal Ops page.
- `23 Space` links to `Finances`, `Vehicle Maintenance Tracker`, and other
  personal ops pages.
- `Finances` links to or contains:
  `Budget`, `Paycheck Plan`, `Child Support Log`, `Debt Tracker`, and `Bills`.

Finance design questions for the later pass:

- Which finance surface is the current source of truth: Notion finance pages,
  the Drive spreadsheet, or a split between both?
- Which finance inputs are still active and which are stale?
- What should a future `23 Space finance review` Excalidraw surface display?
- Which finance actions deserve Opportunity HQ tasks versus staying inside
  Personal Ops finance review?

## Parked Decision

Do not mix finance with the chores build. Chores gets a simple Personal Ops
sheet and review surface first. Finance gets its own goal, source-of-truth
decision, data contract, and review flow later.
