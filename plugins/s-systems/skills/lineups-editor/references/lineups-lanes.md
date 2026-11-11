# choose the lane

## seven lanes

### 1. quick action photo

Use for an ordinary player or team mention with no data that changes the
argument. Stay on Mark when a photo adds no value. Requested default: 5.5 seconds.
Record requested seconds separately from actual frame-rounded duration. Use
nearest-half-up: 138 frames at 25 fps is 5.52 seconds. Render padding remains
separate; this default does not shorten other lanes.

### 2. quick stat

Use the same requested 5.5-second editorial default and frame rounding as Quick
Action Photo. Keep padded export length separate from time on the timeline.

Choose a current registered option:

- **Team callout** — team logo and name with one clear statement. Use
  `quick-stat.team-callout` and the [Team rules](lineups-team-routes.md).
- **Logo statement** — logo, statement and the selected team's background
  colors. Use `quick-stat.logo`; verify its palette from the selected team.

Keep the subject name once. Use one pipe only for 2 parallel facts. Copy comes
from the passage. Preserve the source's type, padding and safe area; measure it
after copy changes. The old Single-frame statement and Two-photo progression
sources are retired for new builds. Saved episodes retain their recorded proof.

### 3. stat breakdown

Use 1 subject with 3 or 4 data points. Figma uses an action photo on the left
and a solid data panel on the right. Match the action to the claim; a passing
touchdown needs a throwing photo. Blender has two Lane 3 variants. 3B, the
stat card, shows one player's stats from one game. Jerami approved it on
November 10, 2026. 3A, the Prime station, tells a season or multi-stage arc and
is parked. Each fills from a scene JSON with spoken cue frames. The selected
engine owns the asset treatment.

### 4. comparison

The photo and data options are:

1. **Cinematic 2-up** — two subjects, action photos, and one clear visual
   argument.
2. **Simple comparison** — two to four subjects or periods with one main value
   each.
3. **Full comparison: 2** — two subjects with multiple comparable values.
4. **Full comparison: 3** — three subjects with multiple comparable values.
5. **Full comparison: 4** — four subjects with multiple comparable values.

Figma Simple and Full comparisons use the approved Field Night background. Cinematic
2-up keeps its photo-led split treatment. The MVP tracker is the locked simple
comparison reference. Supporting statistics are optional in Cinematic 2-up.
Show them only when the transcript supplies a true like-for-like comparison.
Leave the fields blank when the comparison is conceptual. Do not fill empty
space with jersey numbers, years, or unrelated values.

In Figma, Cinematic 2-up always uses full photos with original backgrounds. Both photos
are visible together from the opening visual frame. Never delay the second
photo until its spoken mention. Shared motion may move both photos together;
text cues may follow speech. Keep the established top-left title position.
Never suggest alpha cutouts or Alpha/Asset Swap for this option. Lamar/Huntley,
Mahomes/Purdy and Pacheco/Walker use this same rule.

Simple and Full player comparisons follow the [alpha-player workflow](lineups-assets.md#alpha-player-assets-and-scene-exports).
A period-only comparison with no players needs no player cutouts.

Team matchup, Logo stat cards and Rank Movement use the
[Team routes](lineups-team-routes.md). Native sources retain their own plates.

### 5. year-by-year + value metrics

Use for trends over time or related metrics that support one point. Choose the
compact trend table when the sequence matters, or the existing bar treatment
for value metrics. The Mahomes touchdown trend is the trend-table reference.
The [Seattle statement-win scene](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/lineups?node-id=1949-3691)
shows the value-metrics use: 20 points scored, 3 points allowed and 0 KC red-zone
trips. Review both uses during discovery; value metrics do not require years
or multiple periods. The stable lane key remains `year-by-year`.

### 6. asset swap

Use for a historical, causal, or emotional progression that needs movement.
Use the approved Field Night background, centered team logo, replaceable action
art, and transcript-timed swaps. The Patriots and 49ers scenes are locked
references.

Field Night, its measured source background geometry, the 1920 x 1080 export frame,
layer order, crop roles, and approved motion pattern are guarded. Episode
cutouts, team logos, transcript-derived copy, and reveal timing are replaceable.
Every subject in a cutout slot must have real alpha. Do not place a rectangular
photo, fake background, blur mask, or full-frame crop in that slot. Stop when an
approved component cannot support the episode without changing a guarded part.

The reviewed Asset Swap background keeps its 3424 x 1956.9296875 crop and
native motion. Its exact offset, image, blur and tracks are recorded in
`config/lineups/source-guards.json`. Lock this source background; preserve the
1920 x 1080 export frame. The former 2040 x 1166 rule does not resize existing
sources or episodes.

Record every selected source ID and Figma image hash in the episode asset
ledger. A source image may appear only once in an episode, including use as a
photo and reuse as a cutout. Replace the later occurrence before review.

Three-subject swaps use the left, center, and right thirds. Put the logo and
middle subject on the 960 px centerline. Put the side subjects near 320 px and
1600 px, and choose inward-facing poses when suitable sources exist.

Eagle tag writes require Jerami's approval for the exact operation. Do not add,
replace, rename, merge, or group tags during intake or asset selection without
that approval.

### 7. recurring board

Use when Mark returns to a named show premise. Current options are **Rank
Reveal** and **Super Bowl Bubble Board**. Update current teams, logos, ranks, and
labels inside the approved design. Rank Reveal stays conditional to ranked
episodes.

Mark's Power Rankings is a weekly Tuesday-afternoon filming workflow during the
season. Treat the next episode as new data in the same Rank Reveal system, not a
new design pass.

`Recurring Board / Rank Reveal / 10 Teams` (`1277:558`) is the only canonical
Rank Reveal source. The pre-normalized source was deleted. Assign logos only
through `Asset/Team Logo/Normalized/*` 96 x 78 wrappers. Set the ten teams and
logos once for the episode, then reveal cumulatively from rank 10 through rank 1.
Every state keeps all previously revealed rows visible. Rank 10 starts with
a scene-start 10-to-1 row-shell cascade. Ranks 9 through 1 keep the board
static and animate only the current team name and normalized logo.
The episode motion artifact is a verified detached working copy. The canonical
component remains the sole reusable source; detached episode copies never
become alternate masters.

Each reveal is transcript-driven. The scene manifest names the verified phrase
or word timestamp. Manim validates `sceneTime = transcriptTimestamp -
verifiedAnchorTimestamp` and the frame rate. Figma Motion alone renders the row
reveal from that cue. A static board, missing track, raw logo component, broken
cumulative state, or Premiere retime fails the Rank Reveal workflow.
