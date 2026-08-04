# Translation notes — Four Fulfillment Paths

Source: `remotion/josh-vsl/FourFulfillmentPaths.tsx` + `JointFlowLayer.tsx` + `ProductStorySystem.tsx`
510 frames · 29.97 fps · 1920×1080 · `data-duration="17.017"`

## The blocker, and how it was cleared

This was the one composition the source lint refused:

```
JointFlowLayer.tsx:61  [blocker] r2hf/use-effect-deps
JointFlowLayer.tsx:142 [blocker] r2hf/use-effect-deps
```

`useLayoutEffect` with non-empty deps. The first effect builds the JointJS graph and
paper; the second pushes `stroke` and `strokeDashoffset` into the live links whenever
`progress` changes. HyperFrames seeks frames — there is no React lifecycle to run
either.

The lint rule's own remedy is *"move the side-effect work into a build step"*, so that
is what happened. **JointJS Core still owns the geometry** — it just resolves once, at
authoring time, instead of on every render:

- [`bake-joint-geometry.mjs`](bake-joint-geometry.mjs) runs `@joint/core` in a real
  browser (Playwright) with the node/edge layout, anchors, routers and rounded
  connector copied verbatim from the source.
- It reads back each link's resolved connection via `linkView.getConnection().serialize()`.
- Output is [`geometry.json`](geometry.json) — five SVG `d` strings, inlined into
  `index.html`.

Re-run with `node bake-joint-geometry.mjs` if the layout ever changes.

Held to the stated boundary: JointJS Core only, no JointJS+, no `transition()`, no
demo styling, and **no hand-rolled substitute for JointJS's path math**. The
normalized node/edge relationships, the central routing lane and the real card
connection points are all preserved because JointJS computed them.

At render time there is no JointJS on the page at all — five static paths and one
paused timeline.

## Timing translation

| Source | HyperFrames |
| --- | --- |
| `input = enter(12)` | shared exact spring ease |
| `routeDraw = clamp(frame,[85,230],[0,1])` | `strokeDashoffset` 1→0 on all five baked paths (`pathLength="1"`, `dasharray="1"` — same construction the source used) |
| `card = enter(130 + i*42)` | tighter cascade inside the same window |
| `valid = enter(255 + i*26)` | check settle; the source's `valid > 0.8` gate is **14 frames into the spring**, so the border / icon / status flips land at frames 269 / 295 / 321 / 347 |
| `routeColor = frame > 330 ? green : red` | stroke + hub border cross-fade at 330 |
| `claim = enter(360)` | bottom panel |
| status swap at 350 | stacked variants, `tl.set` at frame 349.5 |

## Craft pass (authorised)

- **The hub ignites the routing.** A glow peaks as the first stroke leaves it, so the
  paths are caused by the hub rather than simply appearing.
- Card entrances tightened into one cascade; the last card snaps.
- Card border and icon cross-fade to green over 10 frames instead of hard-switching.

## Verification

`npx hyperframes check` — 0 errors, 0 warnings.
SSIM vs master: mean **0.969**, p05 0.963.
