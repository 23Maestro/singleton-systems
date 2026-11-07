# LineUps coin transition

A branded wipe from Mark's camera to a graphic. It is built from the approved animatic v3.1.

## Beats at 25 fps

- **t0–11:** The coin enters from the bottom left and makes one diagonal flip.
- **About t3:** A film burn starts from the bottom-left corner once the whole coin is on screen. It covers Mark by about t10.
- **t11:** LINE slams on. UPS traces on from t12 to t23.
- **t15:** The 8 outro props burst out from the coin's edge: football, shuttlecock, soccer ball, baseball, paddle, puck, basketball, tennis ball.
- **Hold to EXIT (t30):** This is the elastic pad that absorbs early cues.
- **EXIT:** The coin flips off over 8 frames and the props fling past the camera. At EXIT+4, the light leak reveals the graphic. The leak is comped over the coin, so anything it has passed disappears.

## Run

```bash
python3 prep.py "<Lineups Circular Logo.png>" tex
Blender -b --factory-startup --python-exit-code 1 -P build_coin.py -- "$PWD/tex" <studio_small_03_2k.hdr> "$PWD/coin.blend" "$PWD/layer"
PSTR=0.18 python3 comp.py . "<LineUps_logo 1.png>" final
```

`comp.py` reads `mark/` and `l4/` plate frames, both 1080p at 25 fps.

## Sources

- **Coin face:** Eagle `MSJBJEAI3JUKP`, "Lineups Circular Logo".
- **Background pattern:** Eagle `MSJBJEAIJAIYL`, "LineUps_logo 1". This is the official wordmark with the up-arrow U. Never crop the pattern from an episode band.
- **HDRI:** Poly Haven `studio_small_03` (CC0). It is listed in `config/broadcast-engine/look-library.json`.
- **Sound effects:** Envato, from the Eagle sound effects folder.

## Renders

`/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/renders/coin-transition-v1/` holds the review MP4s, a ProRes 4444 alpha of the 3D layer, and the `.blend`.

The hold length is fixed in this prototype. A lane master needs it to be a parameter.
