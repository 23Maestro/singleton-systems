# use the team templates

## selected team routes

Jerami selected these engine routes on October 21, 2026:

| Lane | Option | Engine | Source |
| --- | --- | --- | --- |
| 2 / Quick Stat | Team callout | Figma | `quick-stat.team-callout`, component `1843:1021` |
| 4 / Comparison | Team matchup, 2 teams | Unreal | `comparison.team-matchup.2` |
| 4 / Comparison | Logo stat cards, 2 teams | Unreal | `comparison.logo-stat-cards.2` |
| 4 / Comparison | Rank Movement, 2 weeks | Unreal | `comparison.rank-movement.2` |

Team Cards groups 3 uses. Rank Movement shows the same team twice with a
green up arrow or red down arrow. Matchup previews 2 teams. Game Result uses
the Logo stat cards layout for a final score. The saved Rams–Seahawks example
shows records. Review the first copy that uses a final score.

Unreal Stat Breakdown has 3-value and 4-value options based on the saved
Mahomes master. For Unreal, set `engine: unreal` when finding the template and
use a player cutout with real alpha. Use each episode's speech cues and timing
proof before rendering.

These routes do not ask for the engine again. The selected transcript candidate
and revision must still match. Player 2-up keeps the Figma/Unreal question.
The two team-logo entries use `config/unreal/team-logo-template.json`; their old
Figma nodes are preserved for recovery, not used as fallback authoring targets.
Read native readiness and approval from that manifest. The Rams/Seahawks v4
visual and motion approval remains valid for its stated scope. Prototype maps
and episode timing require their own proof.

Team callout uses the team's primary color for the logo block and name tab,
white text for the name, and dark copy on white. The body hugs the copy
with 48 px on each side. The 240 px logo block and full callout sit 36 px from
the bottom at 1920 × 1080. Keep the clean soft shadow. See
`config/lineups/team-callout-contract.json`. Human review and episode motion
proof remain open.

Team stadium plates use dry matte grass. Keep colored light in the stands and
roofline, with restrained neutral field light. Logos and panels stay editable.
Entrance cues follow Mark and same-revision Manim. Hold static with no animation
out; Premiere owns the cut or transition.

### locked paired-logo card style

All Team Cards use `rank-card.sculpted-satin` version 2 from
`config/lineups/design-registry.json`. This November 4, 2026 approval replaces
the striped card background only. Keep the native layout and foreground.
Use `docs/lineups-rank-card-surface.md` for the team inputs and native build gate.
This surface also applies to Team matchup and Logo stat cards.

All new Team Cards use the latest Chiefs sculpted satin background, tinted
with the team primary color. Stripes are retired. Keep the large team logo,
thin metallic border and dark footer. Swap team colors, logo and name; show
a record or rank only when needed.
Browns/Ravens and Chiefs/Chargers use this same style.

Reuse one GLB shell with its rim and footer. Remove stripe geometry and use
the bound satin material. Team primary color is the only surface input. Review
one native Unreal still against the locked reference before adding logos,
text, stadium or motion. Unreal owns logo depth, lighting, camera and a smooth
entrance, then static hold with no animation out. Prototype maps and the shell
proof are not approved reusable masters.
The source image and hash are in `config/unreal/team-logo-template.json`.
