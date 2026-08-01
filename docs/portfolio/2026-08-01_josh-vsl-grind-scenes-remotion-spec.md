# Josh Sayre VSL — "renting or grinding" scene pair, build spec

Turns [the design brief](2026-07-31_josh-vsl-grind-scenes-design-brief.md) into
buildable specs. Reuse the design system from
[the motion handoff](2026-07-30_josh-vsl-motion-handoff.md) — `src/theme.ts`,
`Surface`, `Words`, `Mark`, `LogoChip`. No new tokens, no new fonts.

## Build approach: AI plate + transparent Remotion overlay

Two composited layers per scene, not one flattened render.

1. **Plate** — the abstract cinematic loop (embers, pulses, haze). Generated in
   Google Vids / Veo 3.1, Kling, or Higgsfield. Full-frame, covers the talking
   head. No text, no logos, no people baked in.
2. **Overlay** — a transparent ProRes 4444 render from one new Remotion
   composition, `CinematicStatLoop`, carrying every number, label, and the
   Zillow chip.

Splitting them means the plate can be regenerated or swapped without
re-rendering type, and the numbers stay on-brand (theme tokens, spring motion)
instead of being whatever a video model hallucinates. Video models cannot
render legible, correct, on-brand typography — do not ask them to.

Track placement is a later Premiere handoff (out of scope per the brief), but
the shape is: plate on the first free track under V5, overlay on V5 alongside
the existing graphics.

## Corrections to the brief

**Scene B's placement in the brief is wrong.** It reads `~02:36.6`. The
project's standard offset is transcript + `10.0433s`, and Scene B opens at
transcript `02:16.593`:

```
136.593 + 10.0433 = 146.636  →  02:26.6
```

Scene A's `02:03.7` checks out under the same math (`113.661 + 10.0433 =
123.704`), which is what makes the B figure read as a digit slip rather than a
different derivation. **Scene B places at `02:26.6`, not `02:36.6`.**

**Durations exceed the brief's 10–15s target — deliberately.** The brief quoted
a partial transcript that skipped two lines. The full conformed transcript shows
both windows are continuous arguments with beats landing out to +18s:

| Scene | Window | Length | Last beat |
| --- | --- | --- | --- |
| A | `01:53.661` → `02:14.5` | **21.0s** | "you own nothing" @ +18.23s |
| B | `02:16.593` → `02:38.4` | **21.9s** | "forty calls" @ +18.27s |

Cutting Scene A to 15s drops "and you own nothing" — the thesis of the entire
renting argument. Cutting Scene B to 15s drops "forty calls the first morning."
Both are the payoff lines of their halves. The scenes run long because the
stretch they cover is long, and covering it is the whole point.

## Disposition of prior assets

| Asset | Call |
| --- | --- |
| `14_status_pills.mov` — green "Your call is confirmed" pill | Salvage for the CTA placement per the rerender handoff |
| `14_status_pills.mov` — red "Not listed with an agent" pill | **Retire.** No transcript anchor; forcing it in reintroduces the exact problem this pair exists to solve |
| `14_status_pills.mov` — Zillow chip | **Reuse in Scene A** as a small persistent anchor |
| `14_status_pills.mov` — Meta / Slack / Skool chips | Unresolved, out of scope here |
| `05_split_compare.mov` (renting vs grinding) | **Retire.** Scene A/B now carry this contrast on-transcript |
| `StatBlock` `67 hours of dialing` @ old `02:34.6` | **Absorbed into Scene B.** Do not render standalone |

## The component — `CinematicStatLoop`

One composition drives both scenes so they read as a pair. Only the beat list
and the chip differ.

```ts
type Beat = {
  value: string;              // the number — Geist Mono 700, ~150px
  label: string;              // Geist 700 uppercase, ~30px, textBody
  atSeconds: number;          // scene-relative in-point
  holdSeconds: number;
  tone?: 'attention' | 'neutral';  // default 'neutral'
};

type CinematicStatLoopProps = {
  beats: Beat[];
  chip?: { svg: string; label: string } | null;  // null for Scene B
};
```

Layout and motion:

- Beats render bottom-left, 96px margins — same anchor as `SectionTitle`, so the
  pair sits in the established grid.
- Value enters via `<Words>` (3-frame stagger, `translateY(14px)→0`, `blur(6px)→0`),
  label follows 4 frames behind. Exit is 8 frames, opacity plus 6px downward
  drift — the established rule, no new motion language.
- Beats do **not** stack. One at a time; the outgoing beat exits before the
  incoming enters.
- `attention` tone renders the value in `accent` (`#E01F26`); `neutral` renders
  it in `text` (`#FFFFFF`). No green anywhere in this pair — green is reserved
  for guarantee/confirmed states.
- No `Surface` card behind the beats. These sit directly on the plate — that's
  what makes them read cinematic rather than as a data card.
- `chip` renders as a `LogoChip` pinned top-right, 96px margins, 70% opacity,
  present for the full duration. It anchors the metaphor without competing.

## Scene A — "Renting"

**In:** `02:03.7` · **Duration:** 21.0s (630f @ 29.97fps) · **Chip:** Zillow

Metaphor: **money burns off.** Embers rise, brighten, and are gone — the literal
visual argument for "you own nothing." This replaces the original "draining
downward" idea; see Plate production for why.

| # | At | Hold | Value | Label | Tone | Lands on |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1.4s | 3.0s | `$50–$200` | PER LEAD | neutral | `01:55.082` "fifty to two hundred dollars per lead" |
| 2 | 4.7s | 3.4s | `SHARED 3–4×` | WITH OTHER AGENTS | neutral | `01:58.381` "shared with three or four other agents" |
| 3 | 8.6s | 4.0s | `EVERYTHING STOPS` | THE MOMENT YOU STOP PAYING | attention | `02:02.251` → `02:05.340` |
| 4 | 13.4s | 4.0s | `$5,000` | TO CLOSE ONE DEAL | neutral | `02:07.115` "five thousand dollars" |
| 5 | 18.2s | 2.8s | `YOU OWN NOTHING` | — | attention | `02:11.895` "and you own nothing" |

Beat 5 has no label — it's the closing statement, value only, and it holds
through the scene's exit.

## Scene B — "Grinding"

**In:** `02:26.6` · **Duration:** 21.9s (656f @ 29.97fps) · **Chip:** none

Metaphor: effort loops endlessly, return never accumulates. Same red-on-black
language as Scene A so the two read as halves of one idea.

| # | At | Hold | Value | Label | Tone | Lands on |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 4.9s | 7.5s | `67 HOURS` | OF DIALING → FOR ONE LISTING | neutral | `02:21.503` → `02:26.603` |
| 2 | 13.1s | 4.6s | `6 WEEKS` | PART-TIME TELEMARKETING · ONE SIGNED AGREEMENT | attention | `02:29.698` → `02:33.067` |
| 3 | 18.3s | 3.6s | `40 CALLS` | THE FIRST MORNING · EXPIREDS & FSBOs | attention | `02:34.858` |

Beat 1's label swaps mid-hold at 10.0s (`02:26.603`, "to produce one listing")
while the `67 HOURS` value stays put — the number is the point, the label
completes the sentence under it. Add an optional `labelSwap?: { at: number;
to: string }` to `Beat` for this.

`6 WEEKS` is the plain-language read of "a month and a half," which is what
Josh says. Do not render it as "1.5 MONTHS."

## Plate production

All plates: 1920×1080, no audio, no text, no logos, no people. Keep the **upper
right dark and empty** in Scene A — the Zillow chip sits there. Keep the **lower
left dark and uncluttered** in both — every beat lands there.

Clip 1 of Scene A is generated and cleaned. `VSL_VEO.mp4` (Google Vids / Veo
3.1, 2026-08-01) came back 8.06s, 1904×1080, 30fps, with audio. Four findings.

### What came back

**The look is right.** Deep blacks, correct bokeh falloff, volumetric haze. Keep
it.

**Both safe zones held.** Mean luminance measured across all 241 frames:

| Zone | Region (1904×1080) | Min | Median | Max |
| --- | --- | --- | --- | --- |
| Chip (top-right) | `360×90 @ 1448,96` | 27.0 | 27.2 | 43.1 |
| Beat (bottom-left) | `904×284 @ 96,700` | 28.1 | 29.9 | 50.9 |

White type on a ~30/255 field clears 10:1 contrast. The `textShadow` already on
`SectionTitle` absorbs the occasional bright bokeh pass. No scrim needed.

**The embers rise; the prompt asked them to fall.** Confirmed by slit-scan (a
6px column tiled across all 241 frames — trails slope up-and-right). **Keep it
and reframe the metaphor to burning.** Rising embers read as combustion, and
burning money is a sharper argument for renting than draining ever was: you pay,
it burns off, you own nothing. Draining is passive; burning is active and closer
to Josh's tone. Scene A's metaphor is now *burn*, not *drain*.

**It does not loop.** First frame is sparse, small, sharp embers; last frame is
dense, large, near bokeh. Tiling 3× pops twice, hard. **Abandon the tiled-loop
plan.** The clip's natural sparse→dense build is worth more than a loop: run
Scene A as a 3-clip progression that intensifies across the 21s and peaks on
`YOU OWN NOTHING`.

**It is watermarked.** Two static Veo marks, located by temporally averaging all
frames — moving embers blur out, static marks stay sharp:

| Mark | Bounds (1904×1080) |
| --- | --- |
| Grey ✦ sparkle | x `1704–1777`, y `863–936` |
| "Veo" wordmark | x `1864–1897`, y `1042–1056` |

`delogo` smears both — they are large and opaque, and the wordmark touches the
right edge. Both sit right of x=1704, so a plain crop removes them with no
artifacting, and holding 16:9 inside the crop means no distortion:

```bash
ffmpeg -i VSL_VEO.mp4 \
  -vf "crop=1704:958:0:122,colorbalance=rs=0.06:gs=-0.07:bs=-0.02:rm=0.09:gm=-0.11:bm=-0.04,scale=1920:1080:flags=lanczos" \
  -an -c:v prores_ks -profile:v 3 VSL_VEO_sceneA_01.mov
```

Costs 11% of frame — nothing on an abstract ember field. Also fixes 1904→1920
and strips the audio Veo adds. The `colorbalance` pass pulls the stock orange
toward `accent` `#E01F26`; dial `rm`/`gm` back if it reads hot against Josh's
footage. **Verify every future clip the same way** — temporal-average the output
and confirm nothing static survives.

Source is 30fps against the project's 29.97; Premiere conforms on import.

### Clip 2 — Animate continuation

Seed from **clip 1's watermark-free last frame in original framing**. Do not
seed from the cropped/graded plate — clip 2 returns watermarked in source
framing, and the same crop+grade must then apply to it identically.

```bash
ffmpeg -i VSL_VEO.mp4 -vf "select='eq(n\,240)',delogo=x=1696:y=855:w=90:h=90,delogo=x=1856:y=1034:w=46:h=32" -frames:v 1 -update 1 sceneA_clip01_seed.png
```

`delogo` is fine on a still here — Veo reinterprets the seed, so fill artifacts
never survive into the generation.

> Continue this exact shot with no cut. The glowing embers keep rising and
> multiplying, filling more of the frame and drifting closer to camera, their
> bokeh growing larger and softer as they pass. The haze thickens on the left.
> The heat builds — brighter, denser, more of them — but every ember still burns
> out and vanishes into the black before it reaches the top of frame. Nothing
> escapes. The camera holds its same slow drift at the same speed. Identical
> grain, identical color, identical depth of field — one unbroken take. The
> upper right stays dark and empty. The lower left stays dark and uncluttered.
> No text, no letters, no numbers, no logos, no people, no faces, no hands, no
> objects, no music, no sound effects, no dialogue, no cuts.

### Clip 3 — Animate continuation, the burn-out

Seed from clip 2's last frame, same extraction method.

> Continue this exact shot with no cut. The embers reach their peak density and
> then begin to die — fewer and fewer rise, the ones remaining dim from bright
> orange down to deep red, and the haze thins and clears. The frame empties
> toward pure black, quiet and cold, until only a handful of faint dying embers
> drift upward through an almost empty void. Slow, final, spent. The camera
> holds its same slow drift at the same speed. Identical grain, identical color
> grade, identical depth of field — one unbroken take. The upper right stays
> dark and empty. The lower left stays dark and uncluttered. No text, no
> letters, no numbers, no logos, no people, no faces, no hands, no objects, no
> music, no sound effects, no dialogue, no cuts.

Clip 3's burn-out lands under `YOU OWN NOTHING` at +18.2s. That is the whole
argument staged in three clips: pay, burn, nothing left.

### Scene B — full breakdown

**Rewritten to pair with Scene A.** The brief requires one visual language
across both scenes. Now that Scene A is a burning ember world, the original
sonar/pulse-ring concept no longer pairs with it — the two would read as clips
from different videos. Scene B keeps Scene A's exact world and changes only the
*failure mode*:

- **Scene A — embers rise and burn out.** Money spent, gone. → *renting*
- **Scene B — embers rise, stall, and fall back.** Effort spent, no progress,
  forever. → *grinding*

Same particles, same haze, same grade, same lens. Opposite futility. That reads
as a matched pair in a way embers-versus-sonar never would.

> **Shot.** Locked-off cinematic wide on a pure near-black void, thin volumetric
> haze throughout, shallow depth of field.
>
> **Subject.** Glowing red-orange embers rise slowly from the bottom of frame,
> exactly like drifting sparks off a fire. But none of them escape. Each ember
> climbs, slows, stalls in mid-air, and sinks back down into the darkness it
> came from. Then more rise and do the same. The cycle repeats endlessly at a
> slow, steady, wearing rhythm — rise, stall, fall, rise again. The density in
> frame never increases and never decreases. Nothing accumulates. Nothing
> escapes. Nothing changes.
>
> **Motion.** Only the embers move. The camera holds nearly still with the
> faintest slow drift. No shake, no whip, no cuts, no push.
>
> **Light.** Dim warm sources low in frame falling off fast into black. Deep
> crushed blacks, no fill, no rim, no lens flare.
>
> **Mood.** Repetitive, hypnotic, wearing, endless. Patient and expensive, not
> frantic. The visual feeling of working hard and getting nowhere.
>
> **Style.** Anamorphic widescreen, fine 35mm grain, cinematic color grade,
> heavy negative space, foreground embers blurred into soft round bokeh.
>
> **Framing.** The lower left of frame stays dark and uncluttered.
>
> **Exclude.** No text, no letters, no numbers, no logos, no watermarks, no
> people, no faces, no hands, no phones, no objects, no buildings, no UI
> elements, no music, no sound effects, no dialogue, no voiceover.

Scene B carries no chip, so its upper right is free — but keep the lower left
clear regardless, all three beats land there. Same 3-clip Animate progression as
Scene A, and the same crop+grade recipe on every clip.

*Alternate, if the pair reads too samey on the timeline:* the original concept —
concentric dim red pulse rings expanding from center like a sonar ping or dial
tone, against a faint circular progress ring that never fills. More literal to
cold calling, weaker as a pair. Documented, not recommended.

## Google Vids / Veo 3.1 environment notes

Checked directly in Google Vids on `Flow@singleton-systems.com`, 2026-08-01.

**Available on this account:**

- **Create** — text-to-video from scratch
- **Animate** — image-to-video, the practical continuity path (feed a still or a
  previous clip's last frame)
- Model selector (**Veo 3.1**), aspect ratio selector (Landscape / Portrait /
  Square), **Generate**
- Per-clip **Mute** control in the clip gallery

**Gated behind an upgrade on this account:**

- **Ingredients** — reference images / brand images. This is the feature that
  would let a Zillow mark or a brand still steer the generation. Not available,
  which is another reason the chip belongs in the Remotion overlay rather than
  the plate.
- **Edit** (Omni video editing)
- **Avatar**

**Constraints that shape the prompts above:**

- Hard **8-second** cap per generated clip. Neither scene fits in one clip.
- The "Expand" control in the AI Video panel is a **side-sheet expand/collapse
  toggle, not a video-extend feature** — there is no native extend in this UI.
  Continuation runs through **Animate** (last frame → new clip) or a second
  **Create** with a continuation prompt.
- Veo 3.1 generates audio by default — confirmed, `VSL_VEO.mp4` came back with
  an AAC track. The prompts exclude it and the gallery has a per-clip Mute, but
  the `-an` in the crop recipe strips it regardless. Everything here sits under
  Josh's VO.
- **Output is watermarked on this plan** — a grey ✦ sparkle and a "Veo"
  wordmark, both bottom-right, both static. The crop recipe above removes them.
  Upgrading the plan is the only way to get clean output straight from Vids; the
  crop is the workaround, and it is lossless enough on abstract content that
  upgrading is not required for these two scenes.
- Output resolution is **1904×1080 @ 30fps**, not 1920×1080 @ 29.97 — the crop
  recipe rescales, Premiere conforms the frame rate.
- Generated clips do **not** loop seamlessly even when the prompt demands it.
  Plan for progressions seeded through Animate, not tiled loops.

The prompts are written to survive elsewhere too: Kling and Higgsfield both take
the same structured descriptive form, and both offer longer base durations and
real extend, so the tiling workaround is only needed if the plate comes out of
Vids.

## Out of scope

Per the brief: no design-system changes, no reopening Sections 01 or the 11
placed section titles, no Eagle or Premiere placement — that's a later handoff
once the renders exist.
