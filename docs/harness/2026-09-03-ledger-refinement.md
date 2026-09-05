# Ledger refinement · September 3, 2026

[Vercel preview](https://singleton-systems-krv4d4jzx-23maestros-projects.vercel.app/finances)

Deployment: `dpl_3pJ8XKK5yz6ytnfKvwGHe1oCKZLL`. Next.js 15.5.19. No production promotion, commit, or push.

## interface

Home has Income and Expense. Set balance and the yellow Plan shortcut are removed. Plan remains in navigation.

Income has no category. Description fields open blank. Form labels and controls use 16px text. Transaction names and amounts use 18px. The expense category selector uses less vertical space.

Page navigation keeps the ledger shell mounted. Page changes fade. Modal opening and closing animate. Income/expense changes animate the category section. Reduced-motion preferences disable these effects.

Opening a form does not focus an input. Modal focus lands on its heading. Shared viewport tracking keeps modal actions outside the scrolling fields. Short-screen entry forms have a fixed save action. A date tap updates the field and closes the calendar. Record or Confirm still saves the transaction.

Dark mode uses a near-black background. Light mode keeps its existing palette. Lucide replaces improvised control symbols. The header uses the approved outlined Singleton Systems wordmark.

The S icon has a low asterisk in the former period position. One outlined master generates adaptive SVG, ICO, Apple, and installed-app assets. Ten company logos were upgraded: Google, Figma, Screen Studio, Raycast, Brigit, Albert, Vola, HSN, Discover, and Cash App. Sources are recorded in `lib/ledger/icon-sources.json`. No new packages were installed.

## data

Supabase revision 3 has $0 cash and 38 plan items. Catena Media, Future Voices, and Daycare were removed from active history. HSN's $150 first payment remains, linked to its debt and marked as historical. Its $769.24 balance was preserved. The payment was not deducted again.

All 23 original rows remain in `finance_entries` and `legacy_snapshot`. Row-by-row equality passed. `scripts/reset-ledger-history.sql` locks the state, checks the approved records and revision, and uses a replay-safe receipt. No test income or payment was saved.

## verification

Build, typecheck, finance checks, ledger rules, integration checks, and refinement checks passed. The timezone regression passed in Asia/Tokyo.

Browser checks covered Home, Entry, Plan, date selection, HSN history, dark/light mode, and 320px/390px layouts. At 390×844 the income form fits without scrolling. At 320×568 the save action stays visible. At 390×400 modal actions remain visible while fields scroll. Hosted page, API, manifest, SVG, ICO, and Apple icon responses return 200.

Actual iPhone keyboard and Add to Home Screen installation still need device review.

UI Designer guided the shared form and motion rules. Supabase guided the guarded data update. SS Deploy supplied the build and preview checks. Browser supplied visible behavior checks.

Optional portfolio-evidence-capture checkpoint: blank mobile income form and the S-asterisk icon. No Eagle write is approved.
