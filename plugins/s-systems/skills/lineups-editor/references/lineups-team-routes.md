# use the team templates

## selected team routes

Jerami selected these engine routes on October 21, 2026. On November 10,
2026, Jerami moved new builds from Unreal to Figma or Blender:

| Lane | Option | Engine | Source |
| --- | --- | --- | --- |
| 2 / Quick Stat | Team callout | Figma | `quick-stat.team-callout`, component `1843:1021` |
| 4 / Comparison | Team matchup, 2 teams | Ask Figma or Blender | Unreal `comparison.team-matchup.2` is history |
| 4 / Comparison | Logo stat cards, 2 teams | Ask Figma or Blender | Unreal `comparison.logo-stat-cards.2` is history |
| 4 / Comparison | Rank Movement, 2 weeks | Figma Simple comparison | Unreal `comparison.rank-movement.2` is history |

The retired rows stay under `retiredRoutes` in `engine-routing.json`. No
Blender master for these team options is approved yet, so a Blender answer stops
at a reference gap until Jerami approves one.

Team Cards groups 3 uses. Rank Movement shows the same team twice with a
green up arrow or red down arrow. Matchup previews 2 teams. Game Result uses
the Logo stat cards layout for a final score. The saved Rams–Seahawks example
shows records. Review the first copy that uses a final score.

The saved Unreal Stat Breakdown masters (3 and 4 values, from the Mahomes
master) are history. Template search skips retired engines. Lane 3 in Blender
uses variant 3B, the stat card, approved by Jerami on November 10, 2026.

Team callout does not ask for the engine again. The selected transcript
candidate and revision must still match. Player 2-up asks Figma or Blender.
The two team-logo entries keep `config/unreal/team-logo-template.json` as
history. Their preserved Figma nodes serve only an explicit episode answer from
Jerami. The Rams/Seahawks v4 approval stays valid for its saved scope.

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

The satin surface came from a GLB shell with its rim and footer, built in
Unreal. That shell, its prototype maps and its proof are history, not
approved reusable masters. A new native build of this surface needs a Figma
or Blender route that Jerami approves. Keep the entrance and static hold with
no animation out. The source image and hash are in
`config/unreal/team-logo-template.json`.
