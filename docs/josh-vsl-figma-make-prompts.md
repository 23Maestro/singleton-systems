# Josh Sayre VSL — Figma Make prompts (light UI direction)

Six prompts, one per scene. **Paste BLOCK A first, then the scene block**, in the same
prompt. Block A carries the type system, palette and the speaker-box keep-out; the
scene block carries the layout and the locked copy.

Copy is transcript-locked. Every string below is exact. **Bold** marks the words that
must carry the visual emphasis — do not move emphasis onto a different word.

---

## BLOCK A — paste at the top of all six

```
Design a single 1920x1080 desktop product-UI frame. Static layout, no animation.

TYPE — exactly two families, no others:
- Headers, metrics, labels, table headers, buttons: "Inter Tight". Weights 600/700.
  Large numbers use tabular figures. Tight tracking (-0.02em) on anything above 40px.
- Subtitles, body, descriptions, captions, row text: "IBM Plex Sans". Weights 400/500.
  Never use Inter Tight for body copy. Never use IBM Plex Sans for a header.

PALETTE — professional light, Notion-like, calm and paper-forward:
- Page background #F7F7F5
- Card / panel surface #FFFFFF
- Border and divider #E9E9E7
- Primary text #37352F
- Secondary text #787774
- Muted label text #9B9A97
- Friction / process / cost accent #C0212A
- Success / valid outcome accent #15803D
- Data blue (Meta only) #0081FB
Fills use the accent at 6-10% alpha. Borders at 25-35%. Text always full strength.
Green appears ONLY on a valid or successful outcome. Red carries friction, cost,
process and unresolved activity.

SURFACE: cards sit on the page with a 1px #E9E9E7 border, 12px radius, and a very soft
shadow (0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.04)). No heavy drop shadows,
no glassmorphism, no gradients behind text, no glow.

HARD CONSTRAINT — SPEAKER BOX KEEP-OUT:
Leave the rectangle x 1240-1920, y 640-1080 completely EMPTY. No text, no cards, no
icons, no borders, no background detail may enter it. A talking-head video box will be
composited there. Rebalance the layout so the frame still reads as intentional and
finished with that corner empty - do not simply crop or leave dead space.

ALSO: no page footer strip running the full width. Any footer-style line must sit on
the LEFT and end before x=1200.

DO NOT: invent copy, add claims, add logos, add a person, add stock photography,
add drop caps, or use more than the two named fonts.
```

---

## 1 — 67 Hours Cold Calling

```
SCENE: a CRM call-activity view proving that cold calling cost 67 hours for one listing.

Layout with the bottom-right kept empty:
- Top bar: a small red dot, then "SELLER SYSTEM / COLD CALLING". Right side of the top
  bar: "Listing secured".
- LEFT COLUMN (approx x 80-780, full height): the call log card.
- RIGHT COLUMN, UPPER ONLY (approx x 820-1860, y 150-620): a metric card and, beneath
  it, a horizontal EFFORT -> OUTCOME strip. Both must end above y=640.
- Bottom-left (below y=700, left of x=1200): the footer line only.

COPY - exact, nothing added or reworded:
Call log card
  label: "CALL ACTIVITY"
  heading: "Repeated outreach, one call at a time"
  table headers: "Time" | "Activity" | "Result"
  rows:
    "8:04 AM" | "Outbound call" | "No answer"
    "8:08 AM" | "Outbound call" | "Voicemail left"
    "8:12 AM" | "Outbound call" | "Follow-up needed"
    "8:19 AM" | "Outbound call" | "No answer"
    "8:25 AM" | "Outbound call" | "Voicemail left"
  note under the table: "Activity continues until the right seller answers."
Metric card
  label: "TIME INVESTED"
  metric: **67** at ~110px, with "hours" beside it at ~30px
  a horizontal progress bar, filled completely, in the red accent
  under the bar, left: "First call"   right: "67 hours accumulated"
Effort -> outcome strip (horizontal, left to right)
  label: "OBJECTIVE PATH", and at the right of that label row: "EFFORT → OUTCOME"
  left card: "Cold calling" / "Consistent seller outreach"
  a curved connector line with a small chip on it reading "67 hours of effort"
  right card, green: **1 signed listing** / "Successful outcome"
Footer, bottom LEFT only:
  "COLD CALLING" in red small caps, then "67 hours of dialing produced one listing"

EMPHASIS: **67** and **1 signed listing** are the two loudest things in the frame.
The call log is deliberately monotonous - every row looks the same.
```

---

## 2 — Pixel Conditioning Engine

```
SCENE: an ad-platform learning view - completed applications teach the system who to
find next.

Layout with the bottom-right kept empty:
- Top bar: red dot, "SELLER SYSTEM / PIXEL CONDITIONING". Right: "Finding similar sellers".
- LEFT COLUMN (x 80-980): application processor card, full height down to y~900.
- RIGHT COLUMN (x 1020-1860) but the radar must sit HIGH: confidence metric at the top,
  then a circular radar graphic centred around y~420, ending above y=630.
- The radar's own status line moves to the TOP of the radar card, not the bottom.

COPY - exact:
Application processor card
  label: "APPLICATION PROCESSOR"
  heading: "One conversion teaches the system."
  a small square badge, top right of this card, containing the Meta infinity mark in #0081FB
  table headers: "APPLICATION" | "PROGRESS" | "RESULT"
  rows:
    "Application 18" | "3 of 9" | red x icon + "NOT THIS ONE"
    "Application 19" | "9 of 9" | green check + **MORE LIKE THIS**
    "Application 20" | "5 of 9" | red x icon + "NOT THIS ONE"
    "Application 21" | "9 of 9" | green check + **MORE LIKE THIS**
  below the table, two small side-by-side boxes joined by a short red-to-green connector:
    red box: "UNQUALIFIED" / "Not this one"
    green box: "COMPLETED" / "More like this"
Confidence block
  label: "MOTIVATED-SELLER PROFILE"
  metric: **94%** at ~78px, with "CONFIDENCE" as a small right-aligned label
  a thin progress bar beneath, filled to 94%
Radar graphic
  concentric rings, a person-with-magnifier icon at the centre, and four pill labels
  orbiting it: "MOTIVATION", "TIMELINE", "EQUITY", "MARKET"
  status row at the TOP of this card: "SEARCH ACTIVE" in green on the left,
  "Finding similar sellers…" on the right
Footer, bottom LEFT only:
  "PIXEL CONDITIONING" in red small caps, then
  "Completed applications improve the next search"

EMPHASIS: **94%** and both **MORE LIKE THIS** rows.
```

---

## 3 — Cash Offer Decision Engine

```
SCENE: a two-option comparison that resolves in favour of the traditional listing.

Layout with the bottom-right kept empty:
- Top bar: red dot, "SELLER SYSTEM / OFFER DECISION". Right: "Recommending the best outcome".
- The verdict strip moves to the TOP, directly under the summary - not the bottom.
- Summary row across the top (y 130-250).
- Verdict strip (y 270-360), left-aligned, ending before x=1200.
- Two option cards side by side (y 390-620 max). Both must end above y=640.
- Bottom-left: footer line only.

COPY - exact:
Summary row
  a house icon in a red-tinted square
  label: "SELLER PROPERTY"
  heading: "Motivated seller requesting a cash offer"
  right side: "Market value" / "$400,000"   and   "Request" / "Cash offer"
  a red outlined tag: "COMPARE BOTH OPTIONS"
Verdict strip (green, left-aligned)
  green check icon
  label: "SELLER ROUTED TO LISTING"
  sub: "Both options made the decision clear."
  then, still left of x=1200: **9 OUT OF 10** at ~43px followed by "CHOOSE TO LIST"
Option card 1 - red-tinted, the losing option
  "OPTION 01"   right of it: "70–75% OF MARKET"
  a banknote icon + "CASH OFFER"
  figure: "$280K–$300K" at ~72px
  sub: "Speed and certainty at a discounted price."
  a bar filled to about 73% in red
  a footed row: "Difference from full market"  and  **$100K+ GAP** in red
Option card 2 - green, the winning option, visibly the stronger card
  "OPTION 02"   right of it: "FULL MARKET VALUE"
  a checklist icon + "TRADITIONAL LISTING"
  figure: "$400K" at ~72px
  sub: "Full value with the listing plan behind it."
  a bar filled to 100% in green
  a footed row: "Seller's strongest financial outcome" with a green check
Footer, bottom LEFT only:
  "CASH OFFER QUESTION" in red small caps, then
  "The cash offer opens the door · the math converts"

EMPHASIS: **$100K+ GAP** and **9 OUT OF 10**. Card 2 must read as the winner at a
glance - warmer surface, stronger border, green accent.
```

---

## 4 — Four Fulfillment Paths

```
SCENE: one seller request branching into four service routes, none of which need the
agent's own money.

Layout with the bottom-right kept empty:
- Top bar: red dot, "SELLER SYSTEM / SELLER FULFILLMENT". Right: "Four ways to help this seller".
- LEFT (x 80-500): the seller request card.
- CENTRE: a small routing hub icon at approximately x 560, y 400.
- The four route cards are a SINGLE VERTICAL COLUMN (x 640-1200), stacked, y 130-1000.
  Do not use a 2x2 grid - the right half of the frame below y=640 must stay clear.
- Connector lines run from the hub out to each card's left edge, with rounded 90-degree
  corners and a shared vertical routing lane. Clean orthogonal routing, not curves.
- The claim strip sits at the BOTTOM LEFT (x 80-1200, y 900-1000).

COPY - exact:
Seller request card
  a person-with-check icon in a red-tinted square
  label: "SELLER REQUEST"
  heading: "CASH-OFFER SELLER"
  sub: "Ready to review service paths"
  divider, then two rows:
    "Seller needs" / "SPEED + CERTAINTY"
    "Agent funds" / **$0 REQUIRED** in red
Route cards, in this order, each with a green check at its right edge:
  "Option 1"  box icon  "WHOLESALE"
      "Assign the contract to a local investor"
      status in green: "Investor assignment ready"
  "Option 2"  handshake icon  "INVESTOR PARTNER"
      "Partner, renovate, and list it again"
      status in green: "Partner route ready"
  "Option 3"  building icon  "iBUYER PLATFORM"
      "Request an offer through a platform"
      status in green: "Platform offer ready"
  "Option 4"  key icon  "BUY IT YOURSELF"
      "Use it as a flip or rental"
      status in green: "Purchase route ready"
Claim strip, bottom LEFT
  green check icon
  label: "ALL FOUR OPTIONS ARE READY"
  sub: "Each route gives the seller a valid way forward."
  then: **NONE REQUIRE YOU TO HAVE THE MONEY**
Footer line, bottom LEFT, below the claim strip:
  "FOUR FULFILLMENT PATHS" in red small caps, then "One seller · four ways to serve them"

EMPHASIS: **$0 REQUIRED** and **NONE REQUIRE YOU TO HAVE THE MONEY**.
The routing lane must look engineered - real connection points, consistent corner radius.
```

---

## 5 — Campaign Economics

```
SCENE: ad spend converting into signed listings, with the cost-per-listing as the payoff.

Layout with the bottom-right kept empty:
- Top bar: red dot, "SELLER SYSTEM / CAMPAIGN ECONOMICS". Right: "Campaign results ready".
- Funnel strip across the top (y 130-350), four stages separated by connector arrows.
- The PREMIUM POSITIONING card moves to the LEFT (x 80-560, y 390-900).
- The listings table sits to its RIGHT but must END above y=640 (x 600-1860, y 390-630).
- Bottom-left below y=700: footer line only.

COPY - exact:
Funnel strip
  label: "CAMPAIGN → QUALIFIED SELLERS → SIGNED LISTINGS"
  right of the label: the Meta infinity mark in #0081FB and the words "Meta campaign"
  four stages, separated by thin arrows:
    megaphone icon + "$90 / DAY"  under it: "CAMPAIGN INPUT"      (red)
    people icon + "9"             under it: "QUALIFIED SELLERS"   (neutral)
    signed-doc icon + "5"         under it: "SIGNED LISTINGS"     (neutral)
    percent-badge icon + **$228** under it: "PER SIGNED LISTING"  (green)
  the first two connectors are red, the last connector is green
Listings table
  headers: "LISTING" | "SELLER" | "AGREEMENT" | "COMMISSION"
  rows:
    "Listing 1" | "Qualified seller 41" | green check + "Signed" | **4%** in green
    "Listing 2" | "Qualified seller 42" | green check + "Signed" | **4%** in green
    "Listing 3" | "Qualified seller 43" | green check + "Signed" | **4%** in green
    "Listing 4" | "Qualified seller 44" | green check + "Signed" | **4%** in green
    "Listing 5" | "Qualified seller 45" | green check + "Signed" | "Standard" in grey
Premium positioning card (green, left column)
  a percent icon + label: "PREMIUM POSITIONING"
  metric: **4 OF 5** at ~94px in green
  under it: "LISTINGS AT 4%"
  at the bottom of the card, two lines:
    "Five signed listings"
    "Four premium-commission outcomes"
Footer, bottom LEFT only:
  "CAMPAIGN ECONOMICS" in red small caps, then
  "Cost per signed listing is the number that matters"

EMPHASIS: **$228**, **4 OF 5**, and the four **4%** cells.
The single "Standard" row must read as the quiet exception, not a failure.
```

---

## 6 — 48-Hour System Deployment

```
SCENE: a build checklist completing beside a live product screen recording.

Layout with the bottom-right kept empty:
- Top bar: red dot, "SELLER SYSTEM / SYSTEM BUILD". Right: "Ready to review together".
- LEFT COLUMN (x 80-620): an intake card, then a vertical progress rail with six
  completed steps running from y 260 to y 1000.
- RIGHT: the product preview window occupies x 660-1860, y 130-620 ONLY. It must end
  above y=640. Give it a titled pane header and a 16:9 black video area inside.
- The claim badge sits centred inside the lower third of the preview window, not below it.
- The preview's caption row moves ABOVE the video area, inside the pane header.

COPY - exact:
Intake card
  an upload icon in a red-tinted square
  label: "VIDEOS RECEIVED"
  heading: "SELLER VIDEOS"
Progress rail - six steps, all shown COMPLETE, green check on each, connected by a
vertical line that runs red at the top grading to green at the bottom:
  megaphone icon    "AD ACCOUNT"              "Campaign in your account"
  layout icon       "LANDING PAGE"            "Seller-focused page"
  checklist icon    "9-QUESTION APPLICATION"   "Qualification questions"
  phone icon        "PHONE VALIDATION"        "Confirmed contact details"
  contact icon      "CRM"                     "Follow-up ready"
  message icon      "SLACK"                   "Lead notifications ready"
Product preview pane
  pane header, left: a monitor-play icon + "Live Product Preview"
  pane header, right: "CloserOS · Integrations"
  pane header, second line (small, muted): "Genuine product recording · muted"
    and "Conformed from 18 fps to 29.97 fps"
  the video area itself is a plain black 16:9 rectangle with a 12px radius - a placeholder
  a green claim badge centred in the lower third of that black area:
    **EVERYTHING BUILT IN ABOUT 48 HOURS**
Footer, bottom LEFT only:
  "48-HOUR SYSTEM BUILD" in red small caps, then
  "Built first · reviewed together · then live"

EMPHASIS: **EVERYTHING BUILT IN ABOUT 48 HOURS**.
Never write "System live in 48 hours" - the claim is that it is BUILT, not live.
```

---

## Font pairing

**Primary recommendation — Inter Tight + IBM Plex Sans.**
Inter Tight has the tight, confident numerals these frames lean on and holds up at
94px. IBM Plex Sans reads as engineered rather than generic, so support copy and table
rows feel like product data instead of marketing text. Both are free, both are in
Figma's font list.

**Alternate — Instrument Sans + IBM Plex Sans.** Slightly warmer, a touch less
corporate, same structure.

No third family. IBM Plex Sans has proper tabular figures, so it covers the data role
that Roboto Mono used to fill in the dark version.

## Keep-out geometry

Speaker box reserved region: **x 1240-1920, y 640-1080** (680 x 440 px). That fits a
standard bottom-right talking-head PIP with margin. Every prompt above states it and
relocates whatever used to live there:

| Scene | What moved out of the bottom right |
| --- | --- |
| Cold Calling | Effort→outcome strip pulled up; footer to bottom-left |
| Pixel Conditioning | Radar raised; its status row moved to the top of the card |
| Cash Offer | Verdict strip moved from the bottom to directly under the summary |
| Four Paths | 2x2 card grid became a single vertical column; claim strip to bottom-left |
| Campaign Economics | Premium card swapped to the left; listings table ends above y=640 |
| System Deployment | Preview pane ends above y=640; captions moved into the pane header |

In all six the full-width footer strip is gone - it now sits bottom-left and stops
before x=1200.
