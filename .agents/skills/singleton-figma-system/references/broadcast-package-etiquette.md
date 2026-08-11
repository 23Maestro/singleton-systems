# Broadcast package etiquette

This reference records the organizational patterns taken from two public Figma Community broadcast files. Use the patterns as workflow guidance. Create original client art.

Sources:

- [TFF Broadcast package](https://www.figma.com/community/file/1664751812329954511/tff-broadcast-package)
- [Live Broadcast Graphics Generator](https://www.figma.com/community/file/1545613341214061371/live-broadcast-graphics-generator)

## package map

Index the modes so a producer or editor can scan the whole package:

```text
01  Cover + package map
02  Live bar / scorebug
03  Starting soon
04  Be right back
05  Stream ending
06  Speaker / webcam frame
07  Alerts
08  Stinger / transition
09  Composite overlay
10  Brand marks
```

For a sports editorial package, add:

```text
11  Lower thirds
12  Player comparison
13  Full-screen table or list
14  Article or quote card
15  Side rail / rundown
16  Ticker / crawl
17  Promo / next up
18  Export matrix
```

## mode documentation

Give each mode:

- an index and universal name;
- one sentence stating when it appears;
- a live or full-frame preview;
- anatomy callouts;
- editable fields;
- component and variant names;
- output size and alpha rule;
- review state.

The observed live-bar page explains five parts beside the preview: brand mark, live status, now-playing field, calls to action, and angled shape. Follow that teaching pattern for every client mode.

## operator model

Separate operator controls from the live preview:

```text
Templates  Select lower third, full screen, ticker, scoreboard, or caption.
Text       Edit title, subtitle, and description.
Style      Edit font, size, text color, opacity, background, alignment, and screen position.
Shows      Select the client, show, or package context.
Output     Set on-air state, preview, export type, and resolution.
```

Use a position preset for each legal placement. Keep `Bottom Left (Lower Third)` as an explicit preset. Record the safe-area measurement beside it.

## output model

Use a fixed output matrix:

```text
Master frame   1920 x 1080
Still review   PNG
Vector parts   SVG
Alpha overlay  PNG or renderer-specific alpha video
Motion handoff component ID + variant + timing note
```

Keep status visible: `OFF AIR`, `PREVIEW`, `CLIENT REVIEW`, or `EXPORT READY`.

## Lineups mode mapping

```text
Live bar / scorebug   -> LINEUPS_MODE_LiveBar
Speaker frame         -> LINEUPS_CMP_SpeakerFrame
Alerts                -> LINEUPS_MODE_BreakingUpdate
Stinger               -> LINEUPS_MODE_Transition
Composite overlay     -> LINEUPS_SCENE_Main
Brand marks           -> LINEUPS_ATOM_GraphicBug
Lower third           -> LINEUPS_MODE_LowerThird
Player comparison     -> LINEUPS_MODE_PlayerComparison
Full-screen list      -> LINEUPS_MODE_RankingTable
Article card          -> LINEUPS_MODE_ArticleCard
Side rail             -> LINEUPS_MODE_RundownRail
Ticker                 -> LINEUPS_MODE_BottomTicker
```

## FTF geometry cues

Use the current FTF references to study:

- a white information plane over a dark blue lower shell;
- thin cyan and orange edge rules;
- a compact topic strap above the headline;
- a pun lockup with athlete cutouts on the left;
- action art that points into the composition;
- a dark field background with black edge falloff;
- white table headers and dense black stat rows;
- small `since`, `so far`, `still to come`, source, and context labels;
- article cards with paper texture, tilt, shadow, and source badge;
- a stable bottom baseline across talking-head and full-screen modes.

Trace these values from the placed reference. Do not estimate them by eye when the source frame is available.

## client review etiquette

- Put direct references above the client modes.
- Keep one clean rendition per mode.
- Add comments to instances. Edit the source component after review.
- Show the universal name and source filename beside every reference.
- Show status, owner, and last measured date.
- Keep experimental directions in a separate `LAB` group.
- Keep approved components in a `LOCKED` group.
- Keep export frames clean of notes, rulers, and callouts.
