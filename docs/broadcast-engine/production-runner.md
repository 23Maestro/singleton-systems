# Fill approved Blender designs

`3B` is the stat card. `4A` is the player comparison. Their registry keys are
`stat-breakdown.blender.card` and `comparison.blender.player.2`.
`3A` stays parked.

The template registry points to `config/lineups/blender/3B.json` and `4A.json`.
Each record binds the saved design, builder, data contract and runner to file
hashes. The source gate rejects a missing or changed file. Update a hash only
after reviewing the changed source. The saved `.blend` files remain at their
existing paths; this registration does not move or commit them.

Use `tools/broadcast_engine/fill.py` from Blender CLI. A production build needs
the approved scene manifest and the same data file named in `blender.data`:

```sh
/Applications/Blender.app/Contents/MacOS/Blender -b --python-exit-code 1 \
  -P tools/broadcast_engine/fill.py -- \
  --variant 4A --data /absolute/path/row.json \
  --scene /absolute/path/scene-manifest.json \
  --output /Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders/episode-scene-v1
```

The default makes an editable scene without rendering it. Add `--mode still`
for a proof frame or `--mode anim` for PNG frames. The output folder must be
new. A retry gets a new version. The drive gate runs before creating it.

`--proof` replaces `--scene` only for a test build under the client preview
root. Its receipt says `proofOnly: true`. It grants no episode approval.

Use `tools/broadcast_engine/prototypes/lane3/card_data.py` for 3B's slots.
Use `tools/broadcast_engine/player_comparison_data.py` for 4A's slots and
`tools/broadcast_engine/examples/player-comparison.json` as a data example.
The 4A table has 4 rows. Names, photos, SVG logos, team colors and row values
come from data. Layout and lighting stay in the builder.

Frames run at 25 fps. Frame 1 is scene time zero. Stat and tagline landing
frames must match spoken cues in the scene's Manim-checked schedule. A landing
frame is `round_half_up(sceneTime * 25) + 1`.

Before production, bind `blender.source` to the registered source object,
`contractGate.templateBinding` to the template and native manifest hashes, and
`blender.data` to the row's path and hash. The approved specification must use
a Figma/Blender build order. Discovery, timing receipts and scene approval
remain required. A passed test fill does not replace those checks.

After approved scenes are built, review their finished motion with audio in
the same Studio project. Then follow the Premiere and delivery gates.
