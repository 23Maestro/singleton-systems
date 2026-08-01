# Josh Sayre VSL — motion graphics re-render handoff

Three renders in the `04_GRAPHICS_MOTION` set have numbers that don't match what
Josh says on tape. Confirmed against
[the conformed transcript](2026-07-29_josh-iwmc-vsl-conformed-transcript.md) and
[the pickups doc](2026-07-29_josh-iwmc-vsl-pickups.md). Do not re-open the
motion design system — reuse `src/theme.ts` and the existing `Surface`/`Words`
components from
[the motion handoff](2026-07-30_josh-vsl-motion-handoff.md). This is a copy fix
on three existing compositions, not new design work.

## Locked facts

- Project: `2026-07-26_JoshSayer_VSL_Offer.prproj`, sequence `josh-sayer_vsl`.
- Source: `V1_DESCRIPT_JoshSayre_VSL.mp4`. From transcript time **00:56.46
  onward**, timeline time = transcript time + **10.0433s** (verified directly
  against live clip in/out points — this replaces the old +23.690/+24.625
  offset pair, the cut has moved since that doc was written).
- Renders live in Eagle under `04_GRAPHICS_MOTION`, tagged `josh-sayre`,
  `iwmc-vsl`, `motion-graphics`. Replace the file in place (same Eagle item,
  same filename) — do not create a new numbered variant.

## 1. `04_stat_block.mov`

- **Wrong:** card shows `$30/day in Meta spend`.
- **Correct:** `$90/day` — Josh says this on tape, not the locked-script $30.
- **Transcript:**
  > `00:11.416` They came from one funnel that I built running on about $90 a day.
  > `00:15.265` And these listings I actually signed at about $228 per signed listing.
- **Duration:** current render is **5.000s**. Anchor at `00:11.416`, hold 5s
  (covers through the start of the $228 line).
- **New timeline placement (post-fix):** `00:14.4` on V5.

## 2. `08_campaign_widget.mov`

- **Wrong:** card shows `$25/day to Meta`.
- **Correct:** `$90/day` — same number as above, said twice on tape total, this
  is the second instance. $25 doesn't match the transcript, the locked script,
  or anything Josh says — not even a stale-script issue, just wrong.
- **Transcript:**
  > `11:43.633` My current campaign is at about $90 a day.
  > `11:47.003` I got nine qualified sellers and five signed listings.
- **Duration:** current render is **8.000s**. Anchor at `11:43.633`, hold 8s
  (covers through "five signed listings").
- **New timeline placement (post-fix):** `11:53.7` on V5.

## 3. `13_price_card.mov`

- **Wrong:** card shows `$4,505` paid-in-full and `$2,815 + $3,000` split.
- **Correct:** `$4,800` paid in full (`saves $1,200`), `$3,000 + $3,000` split.
- **Transcript:**
  > `15:22.416` The build is forty-eight hundred dollars if you pay in full,
  > which
  > `15:25.755` saves you twelve hundred dollars.
  > `15:27.786` Or three thousand dollars to get started and three thousand
  > `15:32.359` more when you close your first deal
- Pickups doc already closed this: "The build is $4,800" is confirmed on tape
  (the "yield" read was a mis-hear) — do not re-litigate, just fix the card.
- **Duration:** current render is **6.000s**. Anchor at `15:22.416`, hold 6s
  (covers through "saves you twelve hundred dollars").
- **New timeline placement (post-fix):** `15:32.5` on V5.

## Not in scope for this pass

`14_status_pills.mov` does not align to one transcript moment — its four
elements ("Your call is confirmed," "Not listed with an agent," and the
Meta/Zillow/Slack/Skool chips) sit in disconnected parts of the script.
Leave the file as-is; Jerami reviews placement separately.

## The missing outro (17:14.798 → 17:50.460) — new renders needed

The live Premiere sequence's last frame lands 0.4s into "Below this video is a
short application" — confirmed by two independent checks (`sequence duration
1044.84171s − 10.0433s offset = 1034.798s`, which is also the literal
`outPoint` of the timeline's last clip). Everything after that point was never
conformed into this sequence — **35.66s of script**, the entire closing CTA.

**Raw-file timestamp — honest gap, not computed.** The `17:14.798` figure is
Descript-conformed-file time. There is no verified offset from conformed time
back to the raw 33:24.24 original (`JSayer_VSL_video.mp4`, Eagle
`MS19EYHJZ6V1A`) — unlike the Descript→Premiere offset, which I confirmed
directly against live clip in/out points, no one has established a
conformed→raw mapping, and the pickups doc's own re-insert table located
things by content match, not timecode, for the same reason: 137 non-uniform
gaps and 25 dropped takes were removed throughout the file, so no constant
offset exists. This is the closing line of the locked script, so it should sit
near the tail of the raw file's read-through — but "near the tail" is the
honest precision available without transcribing that stretch of the raw file
directly. Search Lossless Cut for the phrase **"Then you decide... ready to
own the thing that produces your listings... fill out the application now"**
rather than trusting a fabricated timecode.

Continuing the numbering from the existing 15-file batch (do not reuse 02–15,
those are spoken for):

| # | Name | Covers | Anchor | Duration | Composition to reuse |
| --- | --- | --- | --- | --- | --- |
| 16 | `16_next_step_title.mov` | Section 11 title card ("Your next step") | `17:12.951` "So here's the next step." | 3.0s | `SectionTitle` — same comp as `02_section_title`, just Section 11's number/title |
| 17 | `17_application_steps.mov` | market / experience / goals, ~2 min to fill out | `17:17.001` → `17:23.905` | 7.0s | `AgendaStack` (3-row form, matches the "three-step call breakdown" use already spec'd in the motion handoff) |
| 18 | `18_call_confirmed_pill.mov` | "pick a time for a forty-five minute call ... on Zoom" | `17:23.905` → `17:30.000` | 6.0s | `StatusPill` / `LogoChip` shell — swap in a Zoom glyph |
| 19 | `19_no_pitch_reassurance.mov` | "that call won't be a pitch or a lecture. You already know how the system works" | `17:30.000` → `17:37.747` | 7.5s | `TestimonialCard`/`GuaranteeCard` shell without the metric — plain reassurance copy |
| 20 | `20_final_cta.mov` | "Fill out the application now, and I'll see you on the call" | `17:44.470` → end (17:50.460) | 6.0s | `LowerThird` — same comp as `15_cta_lower_third`, final card, holds through black |

New timeline placements (once the outro footage itself is back in and the
sequence duration changes, these numbers shift — recompute against the new
sequence end the same way this doc's other placements were derived: transcript
time + 10.0433s for anything after 00:56.46).

## RESOLVED: Section titles 01–11

Not missing — they were already rendered (2026-07-30, `04_GRAPHICS_MOTION`
root, not the subfolders) and just weren't found in the earlier search pass:
`01_The-Cold-Open`, `02_Who-This-Is-For`, `03_The-Problem`,
`04_The-Front-End-and-Why-Its-a-Cash-Offer`, `05_The-Filter-Question-by-Question`,
`06_Pixel-Conditioning`, `07_The-Cash-Offer-Question`, `08_The-Money-Math`,
`09_What-I-Build-What-You-Do-and-Who-Owns-It`, `10_Proof`,
`11_Price-Guarantee-and-Why-Now`. All 11 are imported into the `Motion
Graphics` bin and placed on V5 at their transcript-derived anchors. The
one-off placeholder `02_section_title.mov` used in the first pass was removed
and replaced with the real `02_Who-This-Is-For.mov`. No new section-title
renders needed.

## Claude execution prompt

> Fix three Remotion renders for the Josh Sayre VSL motion graphics package at
> the source project referenced in `JSayre_Motion_Source.zip` (Eagle,
> `04_GRAPHICS_MOTION`). Do not touch the design system, the other 12
> compositions, or Premiere — this is copy-only.
>
> 1. `StatBlock` instance rendered as `04_stat_block.mov` — change `$30/day` to
>    `$90/day`. Keep duration at 5.000s.
> 2. `StatBlock` (or equivalent campaign-widget composition) rendered as
>    `08_campaign_widget.mov` — change `$25/day` to `$90/day`. Keep duration at
>    8.000s.
> 3. `PriceCard` rendered as `13_price_card.mov` — change `$4,505` to `$4,800`
>    and `$2,815 + $3,000` to `$3,000 + $3,000`. `saves $1,200` chip is already
>    correct, leave it. Keep duration at 6.000s.
>
> Render each with `--codec=prores --prores-profile=4444` and
> `transparent: true`, matching the existing 15-file batch's settings exactly.
> Export to the same filenames so they can replace the existing Eagle items in
> place. Report back the three output paths — do not touch Eagle or Premiere
> yourself, that's a separate handoff.

## Claude execution prompt — new renders (outro only)

> Build 5 new Remotion renders for the Josh Sayre VSL motion graphics
> package, reusing the existing design system and components verbatim from
> `src/theme.ts` / `Surface` / `Words` / `SectionTitle` / `AgendaStack` /
> `StatusPill` / `LogoChip` / `LowerThird` (see
> `docs/portfolio/2026-07-30_josh-vsl-motion-handoff.md` for the full
> component spec — do not redesign or re-theme anything). The 11 section-title
> cards (01–11) already exist and are placed — do not touch them or rename
> them.
>
> Continue numbering from 16 (01–15 are spoken for):
> 1. `16_next_step_title.mov` — `SectionTitle` comp, number `11`, title "Your
>    next step". Note: `11_Price-Guarantee-and-Why-Now.mov` already covers
>    "your next step" thematically as part of its "and why now" framing —
>    check with Jerami before rendering this one, it may be redundant.
> 2. `17_application_steps.mov` — `AgendaStack` comp, 3 rows: "Your market",
>    "Your experience and goals", "About two minutes to fill out". 7.0s.
> 3. `18_call_confirmed_pill.mov` — `StatusPill`/`LogoChip` shell, Zoom glyph,
>    label "Forty-five minute call". 6.0s.
> 4. `19_no_pitch_reassurance.mov` — plain reassurance card (no metric),
>    headline "Not a pitch. Not a lecture.", body "You already know how the
>    system works." 7.5s.
> 5. `20_final_cta.mov` — `LowerThird` comp, same treatment as
>    `15_cta_lower_third.mov`, copy "Fill out the application now — I'll see
>    you on the call." 6.0s, hold through black at the end.
>
> Render every file with `--codec=prores --prores-profile=4444` and
> `transparent: true`, matching the existing batch exactly. Report back all 5
> output paths. Do not touch Eagle or Premiere — that's a separate handoff,
> and do not attempt timeline placement math, it's already derived in this
> doc.

## After re-render (separate pass, standard editing addition)

Once the three files are replaced, this repo's `s-systems:eagle-skill` and
`s-systems:client-video-storyboard` skills handle the rest: re-import the
three files into the `josh-sayer_vsl` project's `Motion Graphics` bin (same
Eagle paths, Premiere will treat them as new project items), then
`add_to_timeline` each onto V5 (trackIndex 4) at the timeline placements
listed above. No new alignment math needed — it's already derived.
