# Lane 4 prototype

Throwaway test builds for the Lane 4 comparison (Mahomes vs Allen). They prove
the look and motion. The production engine replaces them with `fill.py`, the
slot contract and the look library.

```bash
B=/Applications/Blender.app/Contents/MacOS/Blender
O=/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders/blender-l4-concept-v3
$B -b --factory-startup --python-exit-code 1 -P build_l4_v3.py -- $O
mv $O/lane4-concept-v1.blend $O/lane4-v3-scene.blend
$B -b $O/lane4-v3-scene.blend --python-exit-code 1 -P add_lineups_open_v4.py -- $O/lane4-v4.blend
$B -b $O/lane4-v4.blend --python-exit-code 1 -P proof.py -- $O/proof 30,180
```

`render_all.py` renders every frame to PNG. Assets come from
`/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS` and Eagle. These scripts do
not yet use the look library textures.
