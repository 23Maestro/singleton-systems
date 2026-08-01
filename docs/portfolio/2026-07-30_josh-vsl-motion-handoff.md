# Josh Sayre VSL — motion graphics handoff

Target sequence: `josh-sayer_vsl` · 17:39 · 1920×1080 · Premiere 26.3
Source clip: `V1_DESCRIPT_JoshSayre_VSL.mp4` on V1, starts at **23.690s**

**Timecode offset.** The clip does not start at zero and there is a 1.37s gap at
79.712s. Transcript time converts to timeline time as:

- transcript < 00:56.02 → **+23.690**
- transcript > 00:56.46 → **+24.625**

Every timecode in this document is already converted. Drop titles on **V2**,
popups on **V3**.

---

## Design system

Derived from his live thank-you page (`iwantmoreclosings.com/thankyou`).

| Token | Value | Use |
| --- | --- | --- |
| `bg` | `#0A0A0A` | page base, true near-black |
| `bgRaise` | `#141414` | neutral card surface |
| `hairline` | `rgba(255,255,255,0.08)` | card border, 1px |
| `accent` | `#E01F26` | **red** — emphasis words, numbered badges |
| `ok` | `#22C55E` | **green** — guarantee, confirmed, kept |
| `text` | `#FFFFFF` | headline |
| `textBody` | `#C8C8C8` | card body copy |
| `textDim` | `#A3A3A3` | kicker / eyebrow |

**Status cards are his signature.** Not a neutral card with coloured text — the
whole card is tinted and the border matches:

| Variant | Fill | Border | Use |
| --- | --- | --- | --- |
| `positive` | `#0A1410` | `rgba(34,197,94,0.35)` | guarantee, refund, confirmed |
| `attention` | `#1A0B0C` | `rgba(224,31,38,0.35)` | "one thing before we talk", cost, kicked out |
| `neutral` | `#141414` | `hairline` | agenda, steps, everything else |

Inside a status card, the key phrase goes in the status colour at weight 700
inline — `14 days` and `full refund` in green, `Get the Most` in red. Two
highlights per card maximum.

Type: **Geist** — headline 700 (his page runs heavy, not semibold), body 400,
kicker 500 uppercase `0.14em`, numerals `Geist Mono` 500 tabular. His cards
**centre** the headline and body; left-align only multi-row lists.

**Not flat.** Every surface gets: a 1px `rgba(255,255,255,0.08)` inset top
highlight, a `0 24px 60px rgba(0,0,0,0.55)` drop shadow, a 1px outer ring at
`rgba(0,0,0,0.6)`, and a noise overlay at 3%. Cards sit on `blur(24px)
saturate(140%)`. Radius 14px chips, 18px cards. Keep the radial red wash but drop
it to 10% — his page is flatter and blacker than my first read, so the depth has
to come from the border and shadow, not the wash.

Motion: everything on spring `{ damping: 200, stiffness: 120, mass: 0.6 }`. Words
animate in per-word, 3-frame stagger, each word `translateY(14px) → 0` with
opacity `0 → 1` and a `blur(6px) → 0`. Nothing scales from 0 — start at 0.94.
Exit is always faster than entry: 8 frames, opacity + 6px downward drift.

---

## Slides — 11 numbered section titles

Numbered to match the intro agenda card. Lower third at 00:29 is unnumbered.

| # | Title | Kicker | Timeline in | Hold |
| --- | --- | --- | --- | --- |
| — | Josh Sayre · Licensed agent, AZ & OR | lower third | 00:54.3 | 3.5s |
| 01 | Who this is for | Section 01 | 01:20.6 | 3.0s |
| 02 | Renting or grinding | Section 02 | 02:04.6 | 3.0s |
| 03 | Why a cash offer | Section 03 | 03:38.6 | 3.0s |
| 04 | The nine-question filter | Section 04 | 05:24.6 | 3.0s |
| 05 | Pixel conditioning | Section 05 | 07:40.6 | 3.0s |
| 06 | Cash offer, answered | Section 06 | 09:23.6 | 3.0s |
| 07 | The money math | Section 07 | 11:28.6 | 3.0s |
| 08 | What I build, what you own | Section 08 | 12:57.6 | 3.0s |
| 09 | Proof | Section 09 | 14:43.6 | 3.0s |
| 10 | Price and guarantee | Section 10 | 15:17.6 | 3.0s |
| 11 | Your next step | Section 11 | 17:00.6 | 3.0s |

Plus an **agenda card** at 00:44.6 that stacks all 11 rows in Retell style,
checking each one in on a 4-frame stagger. Hold 5s.

**Render 16 title compositions, not 13** — the three spare cover a re-cut, a
renamed section, and a title Josh asks for on the call.

---

## The 10 animations

Build each as a parameterised Remotion composition, transparent background,
ProRes 4444 out.

**1 · SectionTitle** — **red filled circle** with white mono numeral, exactly like
his numbered steps. Rule wipes right, title words stagger in. Bottom-left, 96px
margins. 11 uses + 3 spare.

**2 · AgendaStack** — this is his "What Happens on Your 45-Minute Call" card
verbatim: `neutral` card, centred white 700 headline, then rows of
`red circle numeral · white title · gray body`. Rows rise on a 4-frame stagger.
Use his three-step structure for the CTA beat too. 1 use for the 11-section
agenda, 1 for the 3-step call breakdown. 2 uses.

**3 · StatBlock** — one huge mono numeral that counts up, label beneath, optional
delta chip. Uses: `$90/day` (01:11.6), `$228 per signed listing` (00:16.6),
`4% commission` (00:21.6), `67 hours of dialing` (02:34.6), `$5 per lead`
(04:02.6), `60% raise` (12:31.6), `3.63% refund rate` (16:14.6). 7 uses.

**4 · SplitCompare** — two stacked panels, left `danger`-tinted, right `ok`-tinted,
divider wiping down between them. Uses: renting vs grinding (02:10.6), cash offer
vs listing (09:44.6), most lead sources vs this system (08:56.6). 3 uses.

**5 · FilterFunnel** — nine question rows; as each kick-out is named the row
slides right and dims to `danger` at 30%, surviving rows close the gap. The phone
number row lands last and pulses `ok`. Runs 05:47.6 → 06:12.6. 1 use.

**6 · RaycastPopup** — the dark notification, now using his status-card recipe:
tinted fill + matching 35% border + 3px left status bar, small square glyph, title
line, dim subtitle, right-aligned mono timestamp. Springs in from the right with a
12px overshoot, sits, drifts out. Uses: lead hits your phone (07:10.6, `positive`),
Slack + CRM routing (13:34.6, `neutral`), 48 hours until built (13:26.6,
`neutral`), refund processed (16:10.6, `positive`). 4 uses.

**6b · GuaranteeCard** *(new — his page leads with this)* — full `positive` card,
centred, green border, "The Guarantee, In Plain English" style headline with
`14 days` and `full refund` highlighted green inline. This is the strongest card
on his site and the VSL's weakest-covered beat. At 16:04.6, hold 6s. 1 use.

**7 · StatusPill** — the "Your Call Is Confirmed" pill: green check glyph, green
label, dark green fill, green border, fully rounded. Also the shell for LogoChip.
Uses: confirmed/qualified beats at 07:14.6 and 17:12.6. 2 uses.

**7b · LogoChip** — same pill geometry, logo left, label right, like the Retell
reference. Skool SVG is at
`/Volumes/HomeSSD/Video Jobs.library/images/MS6Y5PT7248S8.info/Skool Sign up.svg`
— its palette is where `accent`, `accentWarm` and `info` came from, so it sits
native. Use for the community/coaching beat at 13:50.6. Leave the component
generic so Meta, Zillow and Slack chips reuse it — Zillow at 00:49.6, Meta at
07:52.6, Slack at 13:40.6. 4 uses.

**8 · TestimonialCard** — name, market, metric. Metric in mono `ok`. Uses: Brandy
Dallas–Fort Worth 7 appointments / 8 days (14:47.6), Matthew Seattle 3
appointments at $61 (15:00.6), Rob 3 days to appointment (15:14.6). 3 uses.

**9 · PriceCard** — two options side by side: `$4,800 paid in full` with a
`saves $1,200` chip in `ok`, and `$3,000 + $3,000 at first close`. The split
option's second half fades to 40% to show it waits. At 15:20.6. 1 use.

**10 · LowerThird** — name, credential, thin `accent` rule. 00:54.3, and reusable
for the CTA at 17:20.6. 2 uses.

---

## Zooms — the push-ins on cuts

Josh wants these and the cut already has the punch points. Existing 6-zoom preset
set is the base; these are the two additions the reference frames imply.

| Preset | Move | Ease | Use |
| --- | --- | --- | --- |
| `push-soft` | 100 → 104% over 14f | out-expo | default on a hard cut mid-sentence |
| `push-punch` | 100 → 112% over 8f | out-quint | landing a number or a claim |
| `push-hold` | 100 → 106% over 20f, holds | in-out-sine | under a section title |
| `pull-reveal` | 108 → 100% over 18f | out-cubic | opening a new section |
| `drift-L` / `drift-R` | 104% with 20px lateral over 90f | linear | long talking-head stretches |
| **`push-settle`** *(new)* | 100 → 109% over 10f then **back to 106.5% over 6f** | out-back | the overshoot-and-settle in the reference; use on the biggest three claims |
| **`push-offset`** *(new)* | 100 → 107% with anchor pushed 8% off-centre toward frame edge | out-quart | when a graphic occupies the opposite third |

Anchor on his eyeline, not frame centre — roughly x 50%, y 38%. Never exceed
112% on 1080p source. Alternate `drift-L` / `drift-R` so consecutive drifts never
move the same direction.

Apply on the cuts already in the timeline; the cut list at
`tools/premiere-uxp/cutter/samples/josh-iwmc-vsl.cutlist.json` marks every one.

---

## Remotion build prompt

Paste this whole block.

> Build a Remotion project that renders transparent-background motion graphics
> for a 1920×1080 29.97fps sales video. TypeScript, Remotion 4.
>
> **Design tokens** — define once in `src/theme.ts`, taken from the client's live
> site: `bg #0A0A0A`, `bgRaise #141414`, `hairline rgba(255,255,255,0.08)`,
> `accent #E01F26` (red), `ok #22C55E` (green), `text #FFFFFF`,
> `textBody #C8C8C8`, `textDim #A3A3A3`.
> Font: Geist (400/500/**700**) and Geist Mono (500) via `@remotion/google-fonts`
> or local `.woff2`. Radius 14px chips / 18px cards. Headlines are 700 and
> **centred** inside cards; only multi-row lists left-align.
>
> **Status variants drive everything.** Build a `<Surface variant>` component with
> three variants, each a tinted fill plus a matching 1px border:
> `positive` → fill `#0A1410`, border `rgba(34,197,94,0.35)`;
> `attention` → fill `#1A0B0C`, border `rgba(224,31,38,0.35)`;
> `neutral` → fill `#141414`, border `hairline`.
> Inside a card, key phrases render inline in the status colour at weight 700 —
> expose a `<Mark tone>` component for that. Two marks per card maximum.
>
> **Never flat.** `<Surface>` also composes: a 1px inset top highlight
> `rgba(255,255,255,0.08)`; a 1px outer ring `rgba(0,0,0,0.6)`;
> `box-shadow: 0 24px 60px rgba(0,0,0,0.55)`; `backdrop-filter: blur(24px)
> saturate(140%)`; a radial red wash at **10%** from top-left; and an SVG
> `feTurbulence` noise overlay at 3% opacity. Depth comes from the border and
> shadow, not the wash — the source design is flat black with crisp edges.
> Every card and chip renders inside `<Surface>`.
>
> **Motion rules** — one shared `useEnter(frame, delay)` hook returning a spring
> `{damping:200, stiffness:120, mass:0.6}`. Text animates per word: 3-frame
> stagger, each word `translateY(14px)→0`, `opacity 0→1`, `filter blur(6px)→0`.
> Scale entrances start at 0.94, never 0. Exits are 8 frames: opacity out plus
> 6px downward drift. Build a `<Words>` component that takes a string and does
> this, so no composition hand-rolls text animation.
>
> **Compositions**, each with typed props and a `<Composition>` entry:
> 1. `SectionTitle` — props `{number: string, title: string, kicker?: string}`.
>    Bottom-left, 96px margins. A filled `accent` circle (56px) with the numeral in
>    white `Geist Mono`, a 1px rule that wipes right over 12 frames, then the title
>    via `<Words>`. 90 frames.
> 2. `AgendaStack` — props `{headline: string, items: {title: string, body?:
>    string}[]}`. `neutral` Surface, centred 700 headline, then rows of
>    `accent`-filled numeral circle + white 600 title + `textBody` body. Rows rise
>    on a 4-frame stagger. Supports 3 rows and 11 rows without layout change. 150f.
> 3. `StatBlock` — props `{value: string, label: string, delta?: string,
>    deltaTone?: 'ok'|'danger'}`. Numeral counts up with `interpolate`, mono,
>    ~180px. 90f.
> 4. `SplitCompare` — props `{left:{title,body,tone}, right:{title,body,tone}}`.
>    Two stacked panels, divider wipes down between them. 120f.
> 5. `FilterFunnel` — props `{questions: string[], kickedIndexes: number[]}`.
>    Rows list; kicked rows slide +40px right and dim to 30% `danger` in
>    sequence, survivors close the gap with a layout spring; final row pulses
>    `ok`. 750f.
> 6. `RaycastPopup` — props `{title, subtitle?, variant:'positive'|'attention'|
>    'neutral', timestamp?, glyph?}`. Uses `<Surface variant>`, plus a 3px left
>    status bar in the variant colour, a small rounded glyph square, and a
>    right-aligned mono timestamp. Springs in from the right with 12px overshoot,
>    holds, drifts out. 120f.
> 7. `GuaranteeCard` — props `{headline, body, marks: string[]}`. Full-width
>    `positive` Surface, centred 700 headline, body at 34px/1.5 in `textBody` with
>    each string in `marks` wrapped in `<Mark tone="ok">`. Body reveals per line,
>    6-frame stagger. 200f.
> 8. `StatusPill` — props `{label, variant, glyph?}`. Fully rounded, variant fill
>    and border, check glyph whose tick draws along an SVG path, then label via
>    `<Words>`. 90f.
> 9. `LogoChip` — same geometry as `StatusPill`; props `{svg: string, label:
>    string, variant?}`. Logo left at 28px, label right. Logo path draws in over 10
>    frames, then label. 90f.
> 10. `TestimonialCard` — props `{name, market, metric}`. `neutral` Surface, metric
>    in mono `ok`. 110f.
> 11. `PriceCard` — props `{options: [{price,terms,chip?},{price,terms}]}`. Side by
>    side; the `saves $1,200` chip is a `positive` pill; second option's trailing
>    half at 40% opacity. 140f.
> 12. `LowerThird` — props `{name, credential}`. Thin `accent` rule. 105f.
>
> Render every composition with `--codec=prores --prores-profile=4444` and
> `transparent: true` so alpha survives into Premiere. Add an `npm run render:all`
> script that renders each composition once per prop-set defined in
> `src/renders.ts`, naming files `NN_Composition_variant.mov`.
>
> Do not add a background colour to the root — compositions must be transparent
> outside their cards.

---

## Source of the palette

Tokens are read off his live thank-you page (`iwantmoreclosings.com/thankyou`):
the green guarantee card, the red numbered call-breakdown, and the "Your Call Is
Confirmed" pill. Two things that changed from my first pass — his red is a vivid
`#E01F26`, not the muted terracotta in the Skool mark, and green is a full accent
for guarantee/confirmed states rather than a generic success colour. The Skool
chip should therefore keep its own brand colours and read as a guest logo, not
adopt his palette.

Component count is now 12 rather than 10 — `GuaranteeCard` and `StatusPill` came
straight out of those screenshots, and the guarantee is the beat with the weakest
coverage on tape, so it earns a dedicated card.
