# Camera rig (Template 2)

A locked camera move for any content. The camera flies a zig-zag of stops in 3D. Each stop sits deeper on alternating sides, and the last stop stays parked at the frame edge. New content builds after the camera lands.

Measured from the Prime Video TNF card wall (`/Volumes/HomeSSD/Generated/VIDEO_WORKFLOWS/references/tnf-prime-cardwall-IMG_3656.MOV`).

## What is locked (rig.js → LOCK)

| Move | Time | Ease | Where the stop being left ends |
|---|---|---|---|
| Step | 1.20 s | custom bezier 0.60,0,0.15,1 (slow start, ramp, long settle) | 40% of frame width off centre, 30% size |
| Whip | 1.50 s (0.20 s push first) | custom bezier 0.70,0,0.10,1 | 37% off centre, 14% size, plus flare and flash |
| Hold | per stop | sine.inOut | camera creeps 4% closer and drifts 18 px |

Stops two or more moves back fade out. The previous stop dims to 75%. Change these numbers only to change the house style for every video.

## What changes per video

Edit `rig.data.js`. Each stop is one of:

- `{ type: "headline", kicker, title, sub }`
- `{ type: "stat", value, label }`
- `{ type: "icons", title, items: [{ svg | img | glyph, label }] }`
- `{ type: "quote", title, lines: [...], by }`
- `{ type: "card", title, sub, images: [...], side: [left, right], stats: [{ top, bottom }], lines, by, layout: "side" }`
- `{ html: "<any markup>" }`. Add `data-b="letters|line|frame|rise|pop|slide-l|slide-r"` to any element to give it a build. Add `data-at="0.4"` to time it, or let it sequence itself.

Per stop: `hold` (seconds) and `move` (`"step"` or `"whip"`, how the camera arrives). Use one whip per video, on the biggest moment.

Keep each stop's content inside about 1,300 x 800 px, so the parked stop at the edge never touches it.

## Length

Total = sum of holds + 1.2 per step + 1.5 per whip. Put that number on `data-duration` of `#root` in `index.html`. The rig writes its own count to `data-rig-total` so you can compare.

## Swap the world

The environment lives in `index.html`, the `.env-studio` block. The camera does not care what is in it:

- `.rig-env-far`: the far background. It gets slight parallax.
- `.rig-floor`: an optional plane inside the 3D world. It gives the strongest depth cue.
- `.rig-flare`: the light used on the whip.

Colours and type are CSS variables in `rig.css` (`--accent`, `--ink`, `--font-display` ...).

## Stable text

Static camera text uses transparent native-font PNGs at 2× resolution. The
existing letter builds run first. The paused stage timeline then switches to
the full-text image, so camera motion scales the same glyph shapes on every
frame. Reverse seeks restore the letter build.

Edit the copy in `rig.data.js` and the typography in `rig.css` or `index.html`.
`npm run text:bake` regenerates the images and their source manifest. The test,
preview, check, render and publish scripts run that command first. Direct CLI
calls need the same bake step. A copy or style mismatch stops playback until
the assets are regenerated.

All built-in text components use this path. Mark a custom text leaf with
`data-rig-text="static"`. Mark a counter or changing label with
`data-rig-text="live"` to keep that subtree editable during playback.

The exporter keeps generated PNGs on physical HomeSSD and links them through
`assets/stable-text`. Change the command's `--client VIDEO_WORKFLOWS` when
copying the template into a client project. Use `--scale 3` or higher when the
design enlarges text beyond the authored resolution. A copied project outside
this repository can pass `--storage-gate /absolute/path/to/storage-gate.mjs`.

The approved DIY Smart Code caption sample measured a maximum adjacent paint
jump of 0.184px, rounded to **0.19px**, with this raster approach. That number
belongs to the measured sample; new compositions still need visual review.

## Commands

```bash
npm run text:bake
npx --yes hyperframes@0.8.134 preview --background
npm test
npm run check
npm run render -- --output /Volumes/HomeSSD/Generated/VIDEO_WORKFLOWS/renders/<name>.mp4
```
