# Higgsfield background passes (not submitted)

Each pass is image-to-video. The start frame is the approved still already in the cut, so framing, horizon and sun position match exactly. Nothing is generated until Jerami approves.

Shared rules for every pass:

- Background only. No seed, plant, flower, hands, people, animals, text or logo.
- Locked-off or very slow drift. The centre third stays calm for the line art.
- Warm golden-hour grade. No green cast.
- 16:9, highest resolution offered, 5–8 s, no audio.

## Pass 1 — soil (optional)

Start frame: `assets/soil-clean-plate-v1.png`
Prompt: Macro close-up of dark moist soil at golden hour, shallow depth of field. Sunlight flickers softly through the grass behind. Dew glints gently. The camera holds still with a faint push-in. Nothing moves in the centre.

## Pass 2 — sunset grass

Start frame: `assets/scene-2-sunset-grass.png`
Prompt: Low-angle view across a dewy grass field at sunset. The sun rests on a dark treeline. Grass blades in the foreground sway slightly in a light breeze, and clouds drift slowly left. The camera holds still. The sun and horizon stay fixed.

## Pass 3 — sunrise meadow

Start frame: `assets/scene-3-sunrise-meadow.png`
Prompt: Sunrise over a rolling green hillside with scattered pines. Golden mist drifts slowly through the far valley. Light rays shift gently from the upper left. The camera holds still with a very slow drift right. The hill line stays fixed.

## Pass 4 — mountain (replaces the 2 s clip)

Start frame: `renders/faithtalk-drawing-correction-v6-final-frame.png` with the drawing removed, or the first frame of `assets/mountain-clean-4k.mp4`.
Prompt: Aerial view over layered forested mountains at golden hour. Valley fog flows slowly between the ridges. The drone drifts forward very slowly. No buildings in frame. 8 s continuous, no cuts.

## Scoring each pass before use

- Place the first frame over the current still at 50% difference. The horizon and sun must stay within 1% of frame height.
- Scan every frame for morphing trees, flicker or cuts.
- Check the centre third stays calm with the drawing on top.
