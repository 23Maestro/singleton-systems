# Translation notes — Pixel Conditioning Engine

## Design polish (authorised 2026-08-01)

The brief changed after this pilot: "polish, same bones", with copy, colours and the
450-frame duration frozen. Six changes, all inside those limits:

| # | Change | Why |
| --- | --- | --- |
| 1 | Verdict pair anchored to the bottom of the left column (`margin-top: auto`) | The source left the bottom third of that column empty while the radar filled its full height. Nothing moved, resized or reordered — the dead space just closed. |
| 2 | Verdict connector is now a red→green gradient with a node at each end | Was a bare 1px rule. The unqualified → completed relationship is now stated rather than implied. |
| 3 | Orbit labels sit on a shadow + inset highlight | Flat boxes now read as chips orbiting the core. Same size, type and colour. |
| 4 | Row verdicts settle on the shell's spring curve, scaling 0.88 → 1 from their left edge | Was a flat linear fade. Same 14-frame window; the verdict lands instead of appearing. |
| 5 | Rings expand 0.93 → 1 on reveal | Was a fixed-size blink. The radar now builds outward from the core. Same reveal windows. |
| 6 | Exit fade kept (see below) | Renders the fade the source specifies rather than the master's flattened tail. |

Not touched: every string, the red/green/white hierarchy, all frame counts and beat
positions, and the `scan` / counter / status-swap timings. The confidence count-up was
deliberately left linear — it is a data readout, and easing it would change which number
is on screen at every sampled frame.

`npx hyperframes check --no-contrast` still passes clean after the polish pass.

---


Source: `remotion/josh-vsl/PixelConditioningEngine.tsx` + `remotion/josh-vsl/ProductStorySystem.tsx`
Target: `hyperframes/josh-vsl-port/pixel-conditioning/index.html`
Composition: `JoshPixelConditioningEngine` — 450 frames, 29.97 fps, 1920×1080

## Lint result

`scripts/lint_source.py` over the dependency closure: **0 blockers, 0 warnings, 1 info**.

- `r2hf/static-file` (`ProductStorySystem.tsx:41`) — `staticFile("remotion-assets/meta.svg")`.
  Translated to a relative `assets/meta.svg` copied next to the HTML. Info only.

## Frame grid

The Remotion composition declares `fps={29.97}` and the approved master is a
`30000/1001` container holding exactly 450 frames. 450 × 1001/30000 = **15.015 s
exactly**, so the root carries `data-duration="15.015"` and every timeline offset
is `frame × 1001/30000`. Renders pass `--fps 30000/1001`, which reproduces 450
frames with no rounding drift.

## How the animation translated

| Remotion construct | HyperFrames translation |
| --- | --- |
| `enter()` — `spring({damping:19, stiffness:135, mass:0.7}, durationInFrames:34)` | Exact 36-entry lookup ease (`SPRING_TABLE`) sampled from Remotion's own `spring()`. See below. |
| `clamp(frame,[a,b],[x,y])` | `gsap.fromTo(..., { ease: "none" })` at offset `T(a)`, duration `T(b-a)` — exact, since both are linear with clamped extrapolation. |
| `ambient = 1 + sin(frame/34)*0.035` | One `sine.out` quarter-period then four `sine.inOut` half-period swings. A `sine.inOut` swing between extremes *is* a sine segment, so this is exact, not an approximation. |
| `profile = Math.round(clamp(frame,[180,330],[18,94]))` | One proxy tween, `ease:"none"`, whose `onUpdate` writes both the `%` text and the bar width from the same rounded integer — matching the source, which derives both from one rounded value. |
| Orbit labels `a = i*π/2 + scan*0.55` | An `.orbit-arm` rotated `+31.5127°` about the radar centre with the `.orbit-pill` counter-rotated `−31.5127°`. Reproduces the true circular path; a linear x/y tween would have chorded across the arc and deviated ~6.4 px at mid-travel. |
| Discrete `frame < N ? A : B` string swaps | Both variants present in the DOM, toggled by zero-duration `tl.set(..., {visibility})` at `T(N − 0.5)` so frame `N−1` shows the old string and frame `N` the new one. |
| `<Img src={staticFile(...)}>` | `<img src="assets/meta.svg">` |
| `lucide-react` icons | Inlined as literal SVG, path data extracted from the installed `lucide-react@1.28.0` so the geometry is byte-identical. |
| `@remotion/google-fonts/{Roboto,RobotoMono}` | Local `@font-face` on vendored woff2. Both families are variable fonts, so one file per family covers every weight — including the non-standard `650` and `760` stops the source uses. No CDN, no render-time network. |

### Why the spring is a lookup table, not `back.out()`

The skill's `timing.md` maps `spring()` → `back.out(N)`. That mapping is wrong for
this source: with `damping: 19, stiffness: 135, mass: 0.7` the damping ratio is
0.977 — **overdamped**. The curve never overshoots, so any `back.out()` would add
an overshoot the original does not have. `durationInFrames: 34` also time-stretches
the natural 16-frame settle across 34 frames and then snaps to exactly 1.0 at frame
35.

Instead, `SPRING_TABLE` holds the value Remotion's own `spring()` returns at each
frame of the window, replayed as a lookup ease. Every rendered frame samples a
table node directly, so the spring is exact rather than approximated.

## Verification

`npx hyperframes check` — lint **0 errors**, runtime **0 errors**, layout **0 issues**,
motion **0 errors**. One lint warning (`composition_file_too_large`, 343 lines),
accepted: splitting into sub-compositions would fragment a single-scene port for no
parity benefit.

The contrast pass reports **22 WCAG AA failures**, every one of them the brand red
`#E01F26` on the near-black interface (`--red` on `--bg`/`--panel`). These are
inherited verbatim from `ProductStorySystem.tsx` and are present identically in the
approved master. Changing them would be a redesign, so they are left as-is and
reported rather than "fixed".

### SSIM vs the approved master

Normalized comparison copies (scratch only — masters untouched), `ffmpeg ssim`:

| Range | Frames | Mean | Min | p05 |
| --- | --- | --- | --- | --- |
| Body (0–437) | 438 | **0.98841** | 0.98708 | 0.98764 |
| Exit window (438–449) | 12 | 0.95651 | 0.88398 | — |
| Full comp (0–449) | 450 | 0.98756 | 0.88398 | 0.98753 |

Body-only: no frame below 0.985. The skill's validated thresholds are 0.95 (T2) and
0.90 (T3); this clears both with wide margin. The ~0.988 ceiling is the font-
rasterisation / encoder noise floor described in `eval.md`, not translation error.

## The one substantive difference: the exit fade

**This needs a decision before the remaining five scenes are ported.**

`ProductShell` ends with:

```ts
const exit = clamp(frame, [durationInFrames - 12, durationInFrames - 1], [1, 0]);
```

i.e. a linear fade to zero over frames 438–449, applied as `opacity` on the
`AbsoluteFill`. The HyperFrames port implements exactly that, over an opaque black
ground.

The approved master does **not** show that fade. Measured mean RGB, frame 438 = 1.000:

| Frame | computed `exit` | Remotion still (RGB) | Approved MOV | HyperFrames port |
| --- | --- | --- | --- | --- |
| 440 | 0.8182 | 0.968 | 0.976 | 0.808 |
| 442 | 0.6364 | 0.953 | 0.956 | 0.623 |
| 445 | 0.3636 | 0.921 | 0.922 | 0.325 |
| 447 | 0.1818 | 0.855 | 0.865 | 0.129 |
| 448 | 0.0909 | 0.684 | 0.695 | 0.048 |
| 449 | 0.0000 | 0.000 | 0.000 | 0.000 |

Cause, confirmed end to end:

1. `remotion.config.ts` sets `Config.setVideoImageFormat("png")`. Remotion documents
   the options as `jpeg` — "the fastest option (default)" — and `png` — "slower, but
   supports transparency". PNG frames therefore carry an alpha channel.
2. Nothing opaque sits below the fading `AbsoluteFill`, so `exit` lands in **alpha**
   rather than RGB. The stills are RGBA with mean alpha 0.6353 at frame 442, matching
   the computed 0.6364 almost exactly, while their RGB stays unpremultiplied at
   near-full brightness.
3. The master is ProRes `yuv422p10le`. ProRes 422 has no alpha channel — only
   ProRes 4444 / 4444-XQ with `yuva444p10le` does.
4. Discarding alpha without compositing leaves the unpremultiplied RGB behind, so
   the fade vanishes from the picture entirely.

This is a known failure mode outside Remotion too — editors hit it when a fade "is
carried in the alpha channel of the export rather than the video information of the
clip", so the exported file shows no fade.

**Proof.** Re-rendering the same composition with `--image-format=jpeg` (flattened,
no alpha; a CLI override — `remotion.config.ts` was not modified) puts the fade back
in RGB, and it lands on the HyperFrames port:

| Frame | computed `exit` | Remotion PNG/alpha | Remotion JPEG/flat | HyperFrames port |
| --- | --- | --- | --- | --- |
| 442 | 0.6364 | 0.953 | 0.609 | 0.623 |
| 445 | 0.3636 | 0.921 | 0.328 | 0.325 |
| 448 | 0.0909 | 0.684 | 0.055 | 0.048 |

The port reproduces Remotion's own flattened output to within ~0.015. The master's
flat tail is a render-pipeline artifact, not an art-direction decision. The two
references genuinely disagree and only the owner can say which is canonical.

Note that Remotion's flattened render also sits below the computed `exit` on the
last frames (0.055 vs 0.0909 at frame 448) — the same offset the port shows. That is
inherent to the composite, not something the port introduced.

Two options, both one tween:

1. **Keep the fade** (current state). Matches the source, and matches the locked
   requirement "full-screen opaque, no transparent backgrounds" — the master's flat
   tail is precisely the transparent-background artifact. Costs ~0.043 mean SSIM
   across 12 of 450 frames.
2. **Match the master.** Replace the `#fill` opacity tween with a hard cut to black
   on frame 449. Raises full-comp SSIM to roughly the body figure (~0.988) but bakes
   the alpha-flatten artifact into the new masters.

Recommendation: option 1. Flagged, not decided.

## Minor, sub-threshold

- On the last two fade frames the port sits slightly darker than the ideal curve
  (frame 448: 0.048 vs the computed 0.0909). This is h264 crushing very dark values
  in limited range, not a timing error; the ProRes 422 HQ deliverable will not carry
  it. Irrelevant if option 2 is chosen.
- `Math.round` on the confidence counter can differ by 1 for a single frame at an
  exact `.5` boundary if float accumulation lands differently. Not observed in this
  render.
