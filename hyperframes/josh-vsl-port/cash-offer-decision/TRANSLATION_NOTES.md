# Translation notes — Cash Offer Decision Engine

Source: `remotion/josh-vsl/CashOfferDecisionEngine.tsx` + `ProductStorySystem.tsx`
450 frames · 29.97 fps · 1920×1080 · `data-duration="15.015"`

## Lint
0 blockers, 0 warnings, 1 info (`r2hf/static-file`).

## Timing translation
`summaryIn = enter(10)`, `cashIn = enter(76)`, `listingIn = enter(118)`, `gapIn = enter(185)`,
`result = enter(330)` — all on the shared exact spring ease.

`route = clamp(frame,[245,330],[0,1])` drove five separate style switches once
`route > 0.7`, i.e. **frame 305**. Rather than tween a panel's border, background,
eyebrow, icon and bar independently, the listing column is **authored in its resolved
green state** and a neutral skin sits on top and dissolves off at that beat. The
check's opacity still tracks `route` linearly across the full window, as in the source.

## Craft pass (authorised)
- **The decision is the hero beat.** The winning column blooms and lifts (scale 1.018)
  while the discounted option recedes (opacity 0.6). Causal, one beat, reversible.
- The `$100K+ GAP` foot lands on its own beat instead of arriving with the panel.

## Verification
`npx hyperframes check` — 0 errors, 0 warnings.
SSIM vs master: mean **0.964**, p05 0.921.
