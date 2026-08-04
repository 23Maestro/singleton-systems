# Josh Sayre VSL — Remotion → HyperFrames port inventory

Scope: the six approved Seller System compositions. `SectionTitle` (11 comps) and
`EmphasisCallout` (20 comps) are **excluded** — they are not in scope unless the
scope is explicitly expanded.

All six share `remotion/josh-vsl/ProductStorySystem.tsx` (COLORS, fonts, `clamp`,
`enter`, `MetaIcon`, `Check`, `XMark`, `ProductShell`, `Panel`, `Eyebrow`).
Every composition is 1920×1080 @ 29.97 fps.

## Compositions

| # | Composition ID | Frames | Duration (s) | Source | Approved master |
| --- | --- | --- | --- | --- | --- |
| 1 | `JoshColdCallingProductStory` | 240 | 8.008 | `ColdCallingProductStory.tsx` | `JOSH 67 HOURS COLD CALLING PRODUCT STORY.mov` |
| 2 | `JoshPixelConditioningEngine` | 450 | 15.015 | `PixelConditioningEngine.tsx` | `JOSH PIXEL CONDITIONING ENGINE.mov` |
| 3 | `JoshCashOfferDecisionEngine` | 450 | 15.015 | `CashOfferDecisionEngine.tsx` | `JOSH CASH OFFER DECISION ENGINE.mov` |
| 4 | `JoshFourFulfillmentPaths` | 510 | 17.017 | `FourFulfillmentPaths.tsx` + `JointFlowLayer.tsx` | `JOSH FOUR FULFILLMENT PATHS.mov` |
| 5 | `JoshCampaignEconomics` | 390 | 13.013 | `CampaignEconomics.tsx` | `JOSH CAMPAIGN ECONOMICS.mov` |
| 6 | `JoshSystemDeployment` | 510 | 17.017 | `SystemDeployment.tsx` | `JOSH 48-HOUR SYSTEM DEPLOYMENT.mov` |

Every master verified: ProRes, 1920×1080, `yuv422p10le`, `30000/1001`, frame count
matching the composition exactly.

## Shared dependencies

| Asset | Source | Vendored to |
| --- | --- | --- |
| Roboto (variable, latin) | `@remotion/google-fonts/Roboto` v51 | `shared/fonts/roboto-latin-var.woff2` |
| Roboto Mono (variable, latin) | `@remotion/google-fonts/RobotoMono` v31 | `shared/fonts/roboto-mono-latin-var.woff2` |
| GSAP 3.14.2 | jsdelivr | `shared/vendor/gsap.min.js` |
| Meta mark | `public/remotion-assets/meta.svg` | `shared/assets/meta.svg` |
| Product recording | `public/remotion-assets/v3_CloserOS_Slack_conformed.mov` | scene 6 only, not yet copied |

Both font families are variable fonts, so a single file per family covers every
weight — including the non-standard `650` / `760` stops. No CDN and no render-time
network request anywhere in the port.

`shared/` is the canonical vendored copy; each composition directory gets its own
`assets/` copy so it renders as a self-contained project.

## Lucide icons per composition

Extracted as literal inline SVG from the installed `lucide-react@1.28.0`.

| Composition | Icons |
| --- | --- |
| Cold Calling | BadgeCheck, Clock3, PhoneCall, PhoneOff, Target, Voicemail |
| Pixel Conditioning | FileText, ScanSearch, UserRoundSearch |
| Cash Offer Decision | Banknote, House, ListChecks |
| Four Fulfillment Paths | Building2, Handshake, KeyRound, PackageCheck, Route, UserRoundCheck |
| Campaign Economics | BadgeDollarSign, FileCheck2, Megaphone, Percent, UsersRound |
| System Deployment | ContactRound, ListChecks, Megaphone, MessageSquareText, MonitorPlay, PanelsTopLeft, PhoneCall, Upload |

## Per-composition lint (dependency closure, not the whole `remotion/` tree)

| Composition | Blockers | Warnings | Info |
| --- | --- | --- | --- |
| Cold Calling | 0 | 0 | 1 (`staticFile`) |
| Pixel Conditioning | 0 | 0 | 1 (`staticFile`) |
| Cash Offer Decision | 0 | 0 | 1 (`staticFile`) |
| **Four Fulfillment Paths** | **2** | 0 | 1 (`staticFile`) |
| Campaign Economics | 0 | 0 | 1 (`staticFile`) |
| System Deployment | 0 | 0 | 2 (`staticFile` ×2) |

Five of six are clean. Linting each closure separately mattered: a whole-directory
lint would have let `JointFlowLayer`'s blockers stop five unrelated scenes.

## Migration blockers

### Four Fulfillment Paths — BLOCKED, needs a decision

`JointFlowLayer.tsx` fires `r2hf/use-effect-deps` twice (lines 61 and 142):
`useLayoutEffect` with non-empty deps. The effects build the JointJS graph, then
push `stroke` / `strokeDashoffset` into the live links on every progress change.
Under HyperFrames' seek-driven model there is no React lifecycle to run them.

This is the composition flagged in the brief, and per the boundary it stops here
rather than being quietly re-architected. Resolution options, for decision when
scene 4 comes up:

1. **Build-time geometry bake.** Run JointJS Core in Node once, at authoring time,
   to resolve the routers/connectors into static SVG path `d` strings; ship those in
   the HTML and animate `strokeDashoffset` on the HyperFrames timeline. JointJS
   still owns the geometry — it just runs in a build step instead of a lifecycle
   hook, which is the lint rule's own stated remedy. Deterministic, no JointJS at
   render time, no JointJS+, no demo styling.
2. **Runtime interop** (the skill's escape hatch). Heavier and keeps a React
   dependency at render time.
3. **Stop and leave scene 4 on Remotion.**

Option 1 preserves the normalized node/edge relationships, the central routing lane
and the real card connection points. Not started — awaiting the call.

### All six — exit fade

`ProductShell`'s `exit` fade is carried in Remotion's alpha channel and is therefore
absent from every approved ProRes master, which has no alpha. This affects the last
12 frames of all six compositions identically. See
`pixel-conditioning/TRANSLATION_NOTES.md` for the measurements and the two options.

## Output layout

```
hyperframes/josh-vsl-port/
  shared/            vendored fonts, gsap, meta.svg   (canonical copies)
  pixel-conditioning/  ← pilot, built
  cold-calling/        ← pending approval
  cash-offer-decision/ ← pending approval
  fulfillment-paths/   ← blocked
  campaign-economics/  ← pending approval
  system-deployment/   ← pending approval

output/josh-vsl-hyperframes-review/   review renders and comparisons
```

Nothing is written inside `remotion/`; no approved master is overwritten.
