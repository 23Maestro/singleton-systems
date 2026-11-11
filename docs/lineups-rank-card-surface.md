# rank-card background

Stadium image swaps follow [team stadium photos](lineups-team-stadiums.md).
That rule changes the scene's stadium layer only; this card surface stays locked.

Use `rank-card.sculpted-satin`, version 2, for all new Team Cards.
Jerami approved the reference on November 4, 2026.

The face has fine grain and a soft fold along its right edge. Use the team's
primary color. Keep the center quiet. The texture and light stay the same for
every team and episode. Do not generate a new image for each team.

The lock covers the card background only. Keep the frame, logo, rank, footer,
stadium, arrow and motion from the native template.

## source

`config/lineups/design-registry.json` owns the approved look and reference hash.
`config/lineups/template-registry.json` and
`config/unreal/rank-movement-template.json` bind the same design version and hash.
Template lookup rejects a changed design hash.

The old striped shell stays as a source for its geometry. Its face treatment
does not apply to new Rank Movement, Team matchup or Logo stat cards.
Version 1 remains for historical records. Version 2 extends the same approved
Chiefs surface to the whole card family.

## episode inputs

Pass `episodeId`, `teamId`, `primaryColor` and `colorSource` as JSON:

```bash
python3 scripts/lineups-templates.py surface-request comparison.rank-movement.2 /absolute/path/team-inputs.json
```

Only those inputs can change in a surface request. The scene still owns the
logo, rank values and speech cues. A style change needs a new design version
and review.

## native build

The shared native material is built at
`/Game/Lineups/TeamCardsSatinV2/Materials/M_SculptedSatin`.
`tools/lineups_unreal/sculpted_satin.py` owns its fixed UVs, grain and fold.
Team instances change `TeamColor` only. The new shell removes stripe geometry
and keeps the frame, footer and back.

Chiefs and Vikings native stills are saved in the registry's review proof.
Jerami approved both native cards and their exports on November 4, 2026.
The material is ready for reuse; each episode still needs its own cue and visual checks.
Week 9 logo sizing is an approved scene edit outside the background lock.
