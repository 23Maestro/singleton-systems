# team stadium photos

Use the selected team's stadium photo for new Lineups Figma and Blender
stadium backgrounds. Jerami approved these supplied photos on November 11, 2026.
This replaces both generic Field Night photos for new builds.

[Open the Eagle folder](eagle://folder/MWCF32GULEBG8).
The [asset registry](../config/lineups/team-stadiums.json) owns each team,
Eagle ID, durable path, dimensions and SHA-256 checksum.

## photos

| Team | Canonical photo |
| --- | --- |
| Cincinnati Bengals | [Open in Eagle](eagle://item/MWCF3QSE8OL2T) |
| Pittsburgh Steelers | [Open in Eagle](eagle://item/MWCF3QSEECA1M) |
| Kansas City Chiefs | [Open in Eagle](eagle://item/MWCF3QSER0O63) |
| San Francisco 49ers | [Open in Eagle](eagle://item/MWCF3QSEINTO9) |
| Chicago Bears | [Open in Eagle](eagle://item/MWCF3QSET708S) |
| Minnesota Vikings | [Open in Eagle](eagle://item/MWCF3QSEDKJ6J) |
| Buffalo Bills | [Open in Eagle](eagle://item/MWCF3QSEB4491) |
| Green Bay Packers | [Open in Eagle](eagle://item/MWCF3QSET4KVI) |
| Denver Broncos | [Open in Eagle](eagle://item/MWCF3QSEMZT4N) |
| Detroit Lions | [Open in Eagle](eagle://item/MWCF3QSEU5OPQ) |
| Jacksonville Jaguars | [Open in Eagle](eagle://item/MWCF3QSE4OU82) |

## build rule

- Swap the stadium image in the episode copy. Keep the approved layout,
  foreground art, native motion and 1920 x 1080 output. Asset Swap keeps its
  measured background crop and tracks; replace its image fill only.
- Figma keeps the background locked and separate from artwork. Bind the
  team, Eagle ID, source checksum, actual image hash and node ID in the scene.
  Verify those values in live readback.
- Blender uses the same Eagle image. Bind its path and checksum in the scene
  data and native readback. Relink or pack it before export. Keep the approved
  camera, lighting and motion.
- Use the team Mark is focused on, even when he mentions an opponent. For
  "the Steelers beat the Ravens 39-8," use the Steelers stadium. A score or
  matchup does not need a new layout or engine choice for this image swap.
  Keep the approved scene route, including a pending Unreal-to-Blender card.
- New candidate builds look up the team in the registry and swap its photo
  in the new episode copy. If a team has no photo yet, flag that candidate
  with `Stadium photo needed: TEAM`. Keep the other candidates moving.
- This changes stadium layers only. Cinematic 2-up keeps its full player
  photos. Solid cards, sculpted satin surfaces and Studio Plan rank cards
  keep their approved treatments.

A team stadium may repeat across scenes. The rule against repeated player
photos still applies to foreground art. Never use another team's stadium.

Historical masters, source guards, readbacks and exports keep their original
images. Their old hashes prove past work; they do not select new episode art.
Old templates may keep their generic images. There is no backfill task for
past comps, old planners or prototypes. Keep source guards intact; the new
candidate build swaps the image in its episode copy. Do not change a
historical hash to make a new photo appear verified. Updating old bindings
or releasing the installed skill is not a gate for candidate review.

## build scripts

Run `python3 scripts/prepare-lineups-stadiums.py < candidates.json` to resolve
stadiums and list per-candidate flags. The input may be an array or a packet
with `candidates` or `scenes`. Use `focusTeam` from the transcript's main point.
It wins over the order of team names. Clear single-team and "TEAM beat TEAM"
passages also resolve by their subject. Missing photos flag only that candidate.

The Figma motion and rank planners read the same registry. They request
`upload_assets` for a photo not yet in the file. Set `stadiumImageHash` to the
returned hash, then rerun the planner. Its generated input swaps the stadium
fill in the episode copy and reads it back. Crop, effects and motion stay intact.

`tools/broadcast_engine/fill.py` resolves the same focus team for production
Blender builds. It writes prepared scene data with the Eagle source, fills the
3B or 4A stadium layer and packs the image into the new file. Its build receipt
records the team, Eagle ID and checksum. Old proof builds keep their saved look.

Original URLs, capture dates and licenses were not supplied. Keep those
fields unknown. These photos are approved references, not proof of a current
venue or game date.

## old references

| Source | Current scope |
| --- | --- |
| [Build](../plugins/s-systems/skills/lineups-editor/references/lineups-build.md#data-driven-background) | Team photo in both engines |
| [Lanes](../plugins/s-systems/skills/lineups-editor/references/lineups-lanes.md) | Comparison and Asset Swap use team photos |
| [Assets](../plugins/s-systems/skills/lineups-editor/references/lineups-assets.md) | Eagle source and repeat rules |
| [Review](../plugins/s-systems/skills/lineups-editor/references/lineups-review.md) | Verify the team and checksum |
| [Team routes](../plugins/s-systems/skills/lineups-editor/references/lineups-team-routes.md) | Team photo with the approved native treatment |
| [Corrections](../plugins/s-systems/skills/lineups-editor/references/lineups-corrections.md) | Current rule before authoring |
| [Figma guide](../.agents/skills/singleton-figma-system/references/lineups-production-system.md) | Episode image override; keep source guards |
| [Template system](lineups-template-system.md) | Historical hashes stay historical |
| [Card surface](lineups-rank-card-surface.md) | Stadium swap leaves the satin card surface locked |
| [Stat breakdown](lineups-stat-breakdown.md) | Saved Unreal trial only |
| [Unreal trial](lineups-unreal-trial.md) | Saved generic photo is historical |
| [Prime beat sheet](broadcast-engine/lane3-prime-beat-sheet.md) | Dark set describes the reference recording only |
