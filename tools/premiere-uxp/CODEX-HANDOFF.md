# Codex handoff — Singleton Premiere UXP plugin suite

> 2026-07-30 continuation: the user narrowed active scope to **Zoom Motion** and
> **Bad Take Remover**. Captioner is deferred. Both active panels now use a
> classic bundled script because live Premiere 26.3 rendered the ESM panel HTML
> without executing its module entrypoint. Bad Take Remover passed 13/13 live
> read-only API probes; Zoom Motion passed 14/14. No timeline edits were applied
> during validation. Zoom Motion is strictly a per-clip/all-clips **Transform
> effect preset panel** with no global L/R direction control. It targets (or
> adds) Premiere's Transform effect, never the intrinsic Motion component.

Paste everything below the line into Codex. Status is accurate as of
2026-07-30 and verified against the working tree, not remembered.

---

You are picking up a Premiere Pro UXP plugin suite at
`/Users/singleton23/Documents/Development/singleton-systems/tools/premiere-uxp/`.
Three plugins. One is partly built, two do not exist.

## Hard constraints — do not design around these, design *within* them

1. **Adobe ends CEP/ExtendScript support for Premiere in September 2026.** CEP 12
   was the final major version. Target **UXP only**. Do not write ExtendScript as
   a shipping path.
2. **The `premiere-pro` MCP in this environment is ExtendScript-backed** (it
   exposes `execute_extendscript`). It is a *prototyping bench* for confirming an
   operation is possible. It is not a shipping target — same sunset.
3. **Premiere's UXP Caption API cannot style captions.** Adobe's own wording: it
   "is still under construction … no available API to access and modify caption
   properties." You can enumerate trackItems inside a caption track; you cannot
   set font, colour, position, or box. Any caption styling must go through MOGRT
   text layers or generated graphics — never the caption API.
4. **UXP timeline calls can block the UI.** Batch work, yield between operations,
   and never assume an await is cheap.
5. Verified to exist and to be the right primitive for cutting:
   `SequenceEditor.createRemoveItemsAction(trackItemSelection, ripple, mediaType, shiftOverLapping)`.
6. A transcript API exists, with a documented `transcript_format_spec.json` in
   `AdobeDocs/uxp-premiere-pro-samples` → `sample-panels/premiere-api/assets/`.
   Premiere can read its own transcript; Whisper is for pre-render analysis, not
   for something Premiere already knows.

## Plugin 1 — Cutter · PARTLY BUILT

Path: `tools/premiere-uxp/cutter/`

**Done and verified:**

- `src/cutlist.js` (207 lines) — cut list parsing, validation, merging, and
  planning. Pure logic, zero Premiere calls. **13/13 tests pass**
  (`npm test` → `node --test test/*.test.mjs`).
- Robustness is the point of this file and it is proven: bad JSON, null entries,
  non-numeric or inverted ranges, negative starts, ranges past the sequence end,
  ranges straddling the end, unknown sequence duration, and empty lists are all
  handled as data with reasons — never thrown.
- Cuts are ordered **last-first** because a ripple delete shortens the timeline;
  earliest-first would invalidate every later timecode. Do not "fix" this.
- `index.html` — panel UI, renders correctly.

**Not done, in priority order:**

1. **`src/ppro.js` (197 lines) is unvalidated against a live Premiere.** Every
   signature came from Adobe docs and samples, not from a run. It is written
   defensively — feature-detected, failures returned as data, one file so a
   renamed method is a one-file fix — and it has a `probe()` that reports what the
   installed build actually exposes. **Your first job: run the panel, hit Probe
   API, and correct the real signatures.** Particularly
   `createRemoveItemsAction`, `TrackItemSelection` construction, the track-item
   getters, and whether `sequence.getEndTime()` returns TickTime or seconds
   (`toSeconds()` already handles both).
2. **ESM inside UXP is unverified.** `index.html` loads
   `<script type="module" src="src/main.js">` and the modules use `import`, while
   UXP's `require()` is CommonJS. Manifest v6 is supposed to support ESM. If
   `main.js` never runs, bundle the three modules into one classic script — the
   logic needs no changes, only the module wiring. Do not rewrite the logic to
   work around a bundling problem.
3. No icon assets. `manifest.json` references `icons/light.png`, which does not
   exist.
4. Apply-progress currently reports per-cut but there is no cancel.

**Do not regress:** one transaction per cut, so a mid-run failure keeps the cuts
that already landed. That is deliberate.

## Plugin 2 — Zoom presets · NOT STARTED

Path to create: `tools/premiere-uxp/zoomer/`

Mirror the cutter's architecture exactly: pure preset math in `src/presets.js`
with Node tests, Premiere calls isolated in `src/ppro.js`, panel in
`index.html` + `src/main.js`.

### The keyframe math — get this right first

Premiere zooms via the **Motion** effect. Scaling happens around the Anchor
Point, so to zoom *toward* an arbitrary focal point you must animate **Scale and
Position together**. Naively keyframing Scale alone zooms to frame centre and
looks wrong.

For a focal point `(fx, fy)` in normalised frame coordinates (0–1) at scale `s`
(1.0 = 100%), with frame size `(W, H)`:

```
posX = W/2 + (W/2 - fx*W) * (s - 1)
posY = H/2 + (H/2 - fy*H) * (s - 1)
```

That holds the focal point stationary while scale grows. Write this as a pure
function `focalPosition(focal, scale, frameSize)` and unit-test it: at `s = 1`
position must equal frame centre for any focal; at `focal = (0.5, 0.5)` position
must equal centre for any scale.

**Default focal point is the subject's eyeline: `(0.50, 0.38)`.**

For the recompose presets below, `focal` is itself a function of time — animate
scale and focal together, then derive position per keyframe. This is the move
that makes them feel designed and intentional.

**Cap scale at 112% on 1080p source.** Beyond that softness shows.

### The 8 presets — build exactly these

| # | Name | Scale | Focal | Frames | Ease | Use |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `push-soft` | 100 → 104 | static eyeline | 14 | out-expo | default on a hard cut mid-sentence |
| 2 | `push-punch` | 100 → 112 | static eyeline | 8 | out-quint | landing a number or a claim |
| 3 | `push-settle` | 100 → 109 → **106.5** | static eyeline | 10 + 6 | out-back then in-out-sine | overshoot-and-settle; the premium move, reserve for the three biggest claims |
| 4 | `push-recompose-R` | 100 → 107 | **(0.50,0.38) → (0.72,0.38)** | 18 | out-quart | starts centred and travels right as it pushes, clearing the left third for a graphic |
| 5 | `push-recompose-L` | 100 → 107 | **(0.50,0.38) → (0.28,0.38)** | 18 | out-quart | mirror; clears the right third |
| 6 | `drift` | 105 held | focal pans ±0.04 on X | 90+ | linear | long talking-head stretches; multi-clip applications alternate automatically |
| 7 | `pull-drama-slow` | **108 → 100** | static eyeline | 120 | in-out-sine | **reverse.** Slow release under a serious line — gives it gravity without announcing itself |
| 8 | `pull-drama-snap` | **112 → 104** | static eyeline | 12 | out-back, slight undershoot to 103.4 then rest at 104 | **reverse.** Quick reset after a punchline or before a section turn |

Presets 4 and 5 are the important new ones: the focal point **animates**, so the
frame recomposes during the push instead of just growing. Preset 4 is the one
Jerami asked for by name — centred, then pushing right to hand the left third to
a graphic.

Presets 7 and 8 are the two required reverses. Keep them subtle — a reverse that
reads as an effect has failed. `pull-drama-slow` in particular should be barely
perceptible frame to frame and obvious only in retrospect.

Every preset needs: name, description, `scaleKeys[]`, `focalKeys[]`, duration in
frames, per-key temporal ease, and a `maxScale` guard. Ship them as data in
`src/presets.js`, not as code branches.

### Panel behaviour

- Read the current selection; if empty, act on the clip at the playhead.
- Preset list with a one-line description each, and a live thumbnail strip showing
  scale over time so the shape of the move is visible before applying.
- Apply to selected clip(s), or apply to every video clip in the active
  sequence. This plugin has no cut-list or transcript input.
- `intensity` (0.5–1.5, scales the delta not the duration) is the only per-apply
  override. Drift direction alternates automatically across multi-clip runs.
- Undo must be one step for the whole batch — wrap the batch in a single
  transaction here, unlike the cutter. A half-applied zoom pass is worse than
  none.

Use `add_keyframe`, `set_clip_scale`, `set_clip_position`, and
`set_keyframe_interpolation` on the MCP bench first to confirm the keyframe and
easing calls behave, then port to UXP.

## Plugin 3 — Captions · NOT STARTED

Path to create: `tools/premiere-uxp/captioner/`

Deliberately lean. **10 presets, one vetted font, no more.**

Because the Caption API cannot style (constraint 3), the only viable routes are:

- **A —** import an SRT to a caption track, then apply a track style. Limited, but
  native and cheap.
- **B —** generate MOGRT text layers per caption cue, styled fully. This is how
  FireCut and its peers do it and it is the route to pick unless probing proves
  otherwise.

Take route B. Ingest the same transcript/cut-list JSON the cutter uses, chunk it
into caption cues (max 2 lines, ~32 chars per line, snap boundaries to word
timings, never split a hyphenated word), then place styled MOGRT instances.

10 presets covering the styles that actually appear on YouTube: plain white bold
with a dark scrim; white with a hard drop shadow; word-by-word highlight box;
keyword-coloured (one word in accent per cue); all-caps condensed; boxed
lower-third; karaoke fill; outline-only; two-tone speaker colours; minimal
sans no effects.

Font: **Geist** (already the suite's face). Do not add a second family.

Keep caption design tokens project-neutral and define them beside the preset.

## Working agreement

- Pure logic in its own module with Node tests; Premiere calls isolated to
  `ppro.js` per plugin. This split is why the cutter's core could be proven
  without Premiere open, and it is not negotiable.
- Every plugin gets a `probe()` and a Probe API button.
- Robustness rule, carried from the cutter: **a missing or out-of-range segment
  must never break a run.** Validate each item independently, clamp or skip with a
  reason, report a summary, keep going.
- `npm test` must pass in every plugin directory before you call anything done.
  Report actual output; do not assert success.
- Do not touch `engine/*.py` or anything under `docs/portfolio/` — those are
  client deliverables.
