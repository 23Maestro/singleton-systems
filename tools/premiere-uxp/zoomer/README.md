# Zoom Motion — Premiere Pro UXP panel

Applies eight designed Transform effect Scale + Position moves to video clips. If the
timeline selection is empty, the panel targets the video clip under the
playhead.

The preset math is isolated in `src/presets.js`; all Premiere calls live in
`src/ppro.js`. The panel adds Premiere's Transform effect when it is missing.
Applying a preset replaces Scale and Position keyframes on that Transform effect;
intrinsic Motion is never changed. Effect insertion, keyframe creation, and
interpolation use separate Premiere transactions to follow Adobe's documented
component lifecycle.

## Presets

- `push-soft`, `push-punch`, `push-settle`
- `push-recompose-R`, `push-recompose-L`
- `drift`
- `pull-drama-slow`, `pull-drama-snap`

Recompose presets animate the focal point and derive Position from Scale so the
subject stays composed. The default focal is `(0.50, 0.38)` and 1080p scale is
capped at 112%.

## Install and validate

In UXP Developer Tool, add this folder's `manifest.json`, load the plugin into
Premiere, then open Window → Zoom Motion. Click **Probe API** before applying a
preset to a paid sequence.

```bash
npm install
npm run build
npm test
```

Apply a preset to the selected clip(s), or to every video clip in the active
sequence. Drift alternates direction automatically across a multi-clip
application.
