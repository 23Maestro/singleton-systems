# build the scene

## engine choice after selection

After transcript discovery, pacing and human candidate selection, a selected
**Lane 4 / Comparison / player 2-up** must ask: **Figma or Blender?** There is no default.
Keep the existing option name and subject count; record the engine separately.
The seven lane names and numbers in `config/lineups/engine-routing.json` stay
fixed across both tools. The fixed team routes below take precedence.

Before authoring, run `python3 scripts/lineups-templates.py engine-choice MANIFEST`.
It checks the selected candidate against current transcript discovery. Ask the
returned question in chat. Record Jerami's answer using `--engine figma|blender
--answer 'actual answer'`. This saves `engineChoice` in the scene manifest.
Discovery preflight rejects a missing, stale or mismatched choice. Re-ask when
the transcript revision, candidate, option or subject count changes. The answer
is per scene; never turn one answer into an episode-wide engine default.

Figma retrieves the registered option in Components with its existing asset
rules. Blender works like Figma component variants. Each lane can have Blender
variants, listed in `blenderVariants` in `config/lineups/engine-routing.json`.
A variant is one swappable template: a Blender CLI builder plus a data file per
player or episode. Cue frames are absolute at 25 fps from the spoken cues, so a
new edit changes only the data. IDs are the lane number plus a letter.

| Variant | Template | Status |
| --- | --- | --- |
| 3A | Prime station: multi-stage or full-season arc (Lawrence, Prime TNF reference) | Parked; v8 needs work |
| 3B | Stat card: one player's stats from one game (W9 Burrow, Simmons) | Approved by Jerami, November 10, 2026 |
| 4A | Player 2-up (Cinematic 2-up, Full comparison: 2) | Approved by Jerami, November 10, 2026 |

Run a variant with `Blender -b --factory-startup --python-exit-code 1 -P
BUILDER -- DATA.json OUT_DIR [still FRAME | anim]`. Only an approved variant
routes a build. A Lane 3 Blender scene names its variant in
`scene.blenderVariant`; the gate rejects a missing, parked or working-template
variant. 3B and 4A still lack a template registry row with a hashable master
(4A also lacks its production runner), so the gate stops their builds until
those exist. Team and period
comparisons have no Blender variant. Register a new variant only when its
builder exists.
Blender production renders run headless through the Blender CLI. The Blender
MCP is for authoring only. Use the Standard view transform for team colors.

Every Blender build gives the stadium real depth. Each team has 1 depth map,
made once with DepthFlow by `tools/broadcast_engine/stadium_depth.py` and
listed in `config/lineups/team-stadium-depth.json`. The builder pushes the
stadium photo into 3D with it, so camera moves show true parallax. A build
stops when its team has no current depth map. The camera arrives and moves
for the first 6 seconds (`MOVE_END`, frame 150), then holds. Renders cover
only the motion; the hold is a freeze of the last moving frame.

### 4A house defaults

Jerami approved these on the Packers trio, November 12, 2026. The 4A builder
and `tools/broadcast_engine/prototypes/lane4/house.py` build them. The rules
and their tests live in `tools/broadcast_engine/lane4_layout.py`.

- Logos and player photos show exact source color. Only a full-width
  rectangle counts as a logo canvas, so the Green Bay gold ring stays.
- Titles and names use upright Antonio. Stats use Saira. Text is flat white.
- Both logos match in width, mirror left and right, and sit level.
- Helmet tops sit on 1 line, measured from the cutout pixels.
- Players build in from team-card dust after the logos land.
- Episode data `cards` swaps the table for mini stat cards on the
  nameplates. Each card is rounded black, uses Antonio and has a divider
  between stats.
- Centered callouts sit on rounded black panels just above the nameplates.
- `house.player_swap` drops the old player, whips the new one in from the
  right and flips the nameplate.
- `render_review.py` renders frames with object or material keys, then adds
  the episode audio at the scene anchor.

Unreal is retired for new builds. The Unreal comparison, team-logo and rank
movement masters stay as history with their saved approvals and exports. Team
matchup, Logo stat cards and Rank Movement had Unreal-only routes. They now ask
Figma or Blender. Jerami may still choose the preserved Figma source for one
episode with `record_episode_engine_choice`. Never send a Blender or Unreal copy
through Figma receipts.

## episode workspace

Jerami's October 29, 2026 corrections supersede older source styling: lock all
wash overlays, keep photo darkening at or below 20%, and use the current white
Team callout `1843:1021`. The blue callout is retired for new episode builds. Stat Breakdown subjects use 40 px Inter Bold;
support labels use 36 px Inter italic, following the live Mahomes example
`1976:5088`. The Figma production reference owns the exact role styles and line
heights. Frame the visible person within the available photo slot and preserve
Jerami's live crop edits. Centering the image rectangle alone does not pass.
Keep available headroom in the initial framing so heads and helmets are intact
when the source allows. Preserve Jerami's adjustments. Headroom at the end of
the inherited push-in is not a separate approval requirement.
When a source conflicts with these agreed rules, fix the source, verify it,
then build the episode copy.

At episode start, use `singleton-figma-system` for the shared Figma structure.
Use simple episode titles and actual-workday labels at exactly 300 px. Keep
episodes left to right by known work date, with wide gaps for a quick Loom pan.
Keep a spec for each approved lane used. Loose cutouts, logos, original photos,
extra render parts, and old versions live on `Player Cut Outs + Logos`, grouped
by episode. Preserve the scene artwork, IDs, approved sources, and motion.
Apply this at the first authorized Figma build; the review gates still apply.

## data-driven background

New Figma and Blender stadium backgrounds use the selected team's canonical
Eagle photo. Follow [team stadium photos](../../../../../docs/lineups-team-stadiums.md)
and `config/lineups/team-stadiums.json`. This replaces both generic Field Night
photos for new builds, including Asset Swap. Keep the approved layout, crop
roles and native motion. Figma keeps the background locked and separate from
artwork. Bind the team, Eagle ID, source checksum, Figma node and actual image
hash; verify them in live readback. Blender binds the same source path and
checksum. Photo-led options keep their photos. Past sources keep their proof.

The new candidate build swaps the registered team photo in its episode copy.
If no team photo exists, flag `Stadium photo needed: TEAM` on that candidate
and keep the others moving. Old templates may keep their old images. Backfill,
old script updates and installed skill release do not block candidate review.

Set `focusTeam` from Mark's main point. "The Steelers beat the Ravens 39-8"
uses the Steelers stadium. The Figma planners and Blender `fill.py` use the
same registry lookup. This changes the stadium fill, not the scene route.

## motion engine

Read `config/lineups/engine-routing.json` after transcript candidate selection.
Player 2-ups ask Jerami to choose Figma or Blender. For the same team's rank
across 2 weeks, set `comparisonKind: periods` and `comparisonMetric: rank`.
That scene reuses the registered Figma Simple comparison (`comparison.simple.2`).
Other period comparisons reuse their registered Figma source. Fixed options
keep their recorded route. A different episode route needs a fresh answer
from Jerami tied to that source.

The Figma production path uses Figma Motion as its sole visual motion engine.
A Blender master uses its own keyframes from the same cue list. Manim validates the Whisper word anchors, cue math,
frame rate, and composition timing; it never renders the scene. The required
order is Whisper word-level transcript -> Manim timing receipts -> Studio
candidate packet -> human candidate decisions -> Lane 4 2-up engine
question when applicable -> the selected authoring path. Figma production uses
Figma Motion. The cue
list owns `transcriptTimestamp`, `sceneTime`, action, and duration. The hook
checks the math and motion proof before Figma mutation or export.

Team callout uses `config/lineups/team-callout-contract.json`, including its
current source fingerprint and all 8 protected node roles. It does not use
the Single-frame statement callout contract. Fetch the exact bound nodes and
check their measured properties. Keep the normal episode approval receipts.

For Rank Reveal with the current-team panel and row highlight, bind all 4
`figma.rankReveal.contentNodeIds` roles: `teamText`, `logo`, `currentTeamPanel`,
and `rowHighlight`. Their opacity tracks use the same team-content cue.
The earlier 2-node layout remains readable for prior records. New nodes cannot
be added as unnamed tracks or used to replay the whole board.

Every composition is at least 10 seconds long and extends at least two seconds
beyond its last content cue. This padding is intentional so Premiere can trim a
longer source instead of sending the scene back to Figma.

## active-system rule

Approved options live in the current menu. Working pages use copies of those
approved options. Idea boards remain references. Rejected drafts, replaced
masters, and stale labels leave active pages after each review pass.
