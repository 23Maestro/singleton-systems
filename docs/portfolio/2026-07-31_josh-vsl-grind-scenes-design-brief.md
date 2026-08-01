# Josh Sayre VSL — "renting or grinding" scene pair, design brief

Scoped alignment pass only — this is a brief for a **separate design Claude
session** to turn into full Remotion specs, not an implementation plan itself.
Do not skip straight to composition props from this doc; it's the "what and
why," not the "how."

## Why this exists

`14_status_pills.mov` (green "Your call is confirmed" + red "Not listed with
an agent" + Meta/Zillow/Slack/Skool chips) never anchored to one transcript
moment — its four elements sit in disconnected parts of the script. Rather
than force it into a placement it doesn't fit, replace it with two short,
purpose-built scenes in the one stretch of the video that's currently bare
talking-head with no visual treatment at all.

## Decisions locked (from a 3-question alignment pass)

1. **Two scenes, not one**, forming a matched pair under the existing
   `03_The-Problem.mov` section title ("Renting or grinding," already placed
   at `01:58.0`) — one scene per half of that title.
2. **Style: narrative/cinematic loop**, not a data card. An abstract, looping
   visual metaphor with numbers overlaid — mood over spreadsheet. Same visual
   language across both scenes so they read as a pair.
3. **`14_status_pills.mov` disposition:** salvage the "Your call is
   confirmed" pill only, for a placement near the final CTA (see the outro
   render brief in
   `2026-07-31_josh-vsl-rerender-handoff.md`). The Meta/Zillow/Slack/Skool
   chips are not simply discarded — Zillow's chip in particular may be worth
   reusing inside Scene A below, since that scene is literally about Zillow.
   The red "Not listed with an agent" pill has no home in either new scene;
   flag it for the design session to make the final call on keep/retire.

## Scene A — "Renting" (Zillow)

- **Transcript window:** `01:53.661` "Zillow is renting." → `02:11.895`
  "close a lead into a deal forever, and you own nothing."
  > `01:53.661` Zillow is renting.
  > `01:55.082` You pay fifty to two hundred dollars per lead.
  > `01:58.381` That lead is often shared with three or four other agents,
  > `02:07.115` At typical close rates, you're paying five thousand dollars
  > sometimes to actually
  > `02:11.895` close a lead into a deal forever, and you own nothing.
- **Duration target:** 10–15s (window is ~18s of dialogue — the design
  session should pick the tightest loop, not necessarily cover every line
  verbatim).
- **Visual anchor:** the Zillow chip/mark already exists in the design system
  (used in `08_campaign_widget.mov` and `14_status_pills.mov`) — reuse its
  established color treatment rather than inventing a new one.
- **Timeline placement:** ~`02:03.7` on the corrected timeline (matches
  `05_split_compare.mov`'s existing anchor — check for overlap, that clip may
  need to shift or this scene may replace it; the design session should
  reconcile the two rather than stack them).

## Scene B — "Grinding" (cold calling)

- **Transcript window:** `02:16.593` "Cold calling is grinding" → `02:34.858`
  "And expired and FSBOs get forty calls the first morning"
  > `02:16.593` Cold calling is grinding, and I've done the math on this
  > because
  > `02:20.044` I've actually done cold calling.
  > `02:21.503` At average contact and conversion rates, it takes about
  > sixty-seven hours
  > `02:26.603` of dialing to produce one listing.
  > `02:29.698` That's often a month and a half of part-time telemarketing
  > `02:33.067` for one signed agreement.
  > `02:34.858` And expired and FSBOs get forty calls the first morning
- **Duration target:** 10–15s (window is ~18s, same tightening call as Scene
  A).
- **Numbers that must land:** 67 hours of dialing, one signed agreement, 40
  calls the first morning — these are the existing `StatBlock` uses already
  spec'd in the original motion handoff for this beat (`67 hours of dialing`
  @ old anchor `02:34.6`), so this scene may be replacing or absorbing that
  StatBlock rather than sitting alongside it. Design session should decide.
- **Timeline placement:** transcript time + `10.0433s` per this project's
  standard offset (see the rerender handoff doc) — approximately `02:36.6`.

## Out of scope for the design session

- Don't touch the design system tokens, fonts, or the `Surface`/`Words`
  components — reuse them.
- Don't re-open Sections 01, or any of the already-placed 11 section titles.
- Don't attempt Eagle or Premiere placement — that's a separate, later
  handoff once the renders exist, same pattern as the other two docs in this
  folder.
