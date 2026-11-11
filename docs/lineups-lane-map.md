# LineUps lane map

The one page for what each lane builds today. Updated November 11, 2026.
Detail lives in the [lane rules](../plugins/s-systems/skills/lineups-editor/references/lineups-lanes.md),
[template system](lineups-template-system.md) and [engine routing](../config/lineups/engine-routing.json).

New builds use Figma or Blender. Unreal retired on November 10, 2026; its comps stay as reference.
A Blender variant is the lane number plus a letter. A lane gets letters only when Blender has a variant in it.

## lanes

| Lane | Figma | Unreal (reference) | Blender |
| --- | --- | --- | --- |
| 1 · Quick action photo | Full-frame photo | none | none |
| 2 · Quick stat | Team callout, Logo statement | none | none |
| 3 · Stat breakdown | Photo + data panel; grouped stats | Player stat breakdown | **3A** Prime station, parked · **3B** Stat card, approved Nov 10 |
| 4 · Comparison | Cinematic 2-up; Simple and Full comparison; Logo row | Team matchup; Logo stat cards; Rank movement | **4A** Player 2-up, approved Nov 10 · **4B** Team cards, in review · **4C** Rank cards, in review |
| 5 · Year-by-year + value metrics | Trend table; Seattle value metrics | none | **5A** Value metrics, in review |
| 6 · Asset swap | Standard swap; Logo pair | none | none |
| 7 · Recurring board | Rank reveal; Super Bowl bubble board | none | none |

## blender variants

| ID | Use | Builder | Lineage |
| --- | --- | --- | --- |
| 3A | One player's season or multi-stage arc | `tools/broadcast_engine/prototypes/lane3/build_station.py` | Prime TNF Lawrence reference |
| 3B | One player, one game, 3 or 4 stats | `tools/broadcast_engine/prototypes/lane3/build_card.py` | W9 Burrow and Simmons cards |
| 4A | Two players with a centered stat card | `tools/broadcast_engine/prototypes/lane4/build_l4_v5.py` | Mahomes vs Allen |
| 4B | Two teams: VS, a result, or two talking points on their own cues | `tools/broadcast_engine/families/team_cards.py` (layout `pair`) | Unreal Team matchup and Logo stat cards |
| 4C | One team at two points in time, arrow and change line | `tools/broadcast_engine/families/team_cards.py` (layout `rank`) | Unreal Rank movement, satin v2 faces |
| 5A | 2 to 4 related values for one point | `tools/broadcast_engine/families/value_metrics.py` | Figma Seattle statement win, node 1949:3691 |

Every builder runs headless: `Blender -b --factory-startup --python-exit-code 1 -P <builder> -- <data.json> <out_dir> [still F,F | anim]`.
Each one checks that pieces land on their spoken cues at 25 fps and stay in frame. 4B, 4C and 5A also check that the stadium covers every frame.

## shared look for 4B, 4C and 5A

- Team names in Anton. Numbers and supporting words in Saira Semi Condensed (SIL Open Font License).
- Numbers and big words read flat. Team names and labels get a little depth. Cards, arrows, bars and logos keep full depth and cast floor shadows.
- Card faces use the satin v2 surface in the team's primary color.
- The stadium is the focus team's [registered photo](lineups-team-stadiums.md), darkened 10% with soft edges and a light vignette. A missing photo flags `Stadium photo needed: TEAM`.
- Value bars compare only rows that share a unit. A zero has no bar.

Proofs: `/Volumes/HomeSSD/Generated/CATENA_MEDIA/previews/2026-11-11-team-cards-value-metrics/`.

## open

- 4B, 4C and 5A wait on Jerami's approval. Approval registers their masters, slot contracts and runners.
- Seattle and the Rams have no registered stadium photo.
