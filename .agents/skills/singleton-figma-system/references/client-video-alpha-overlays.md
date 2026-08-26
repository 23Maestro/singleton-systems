# client video alpha overlays

Use these rules for client-specific educational speaker callouts and transparent on-screen graphics.

## client style contract

Keep one approved overlay family per client. Record its logo treatment, shell shape, colors, type hierarchy, signal accents, static geometry, and motion pattern. Reuse that family for the client's later educational videos.

Figma owns the source component and approved static geometry. Figma Motion owns the timed working copy. Keep the source component free of phrase-specific keyframes.

Size logos statically in the source component and its working copies. Do not use scale keyframes to compensate for an undersized logo unless Jerami asks for animated scale.

## buttery motion

`Buttery` means the entrance reads as one controlled gesture without a snap, bounce, or sudden speed change.

- Start with the branded compact state.
- Let the shell open while the logo travels to its final position.
- Reveal labels and the main message after the shell has nearly landed.
- Hold long enough to read the message.
- Fade out. Do not reverse the entrance unless Jerami asks.
- Use `EASE_IN_AND_OUT` on every authored position, size, and opacity keyframe, including repeated-value plateau keyframes. Do not leave a selected property showing `Mixed` easing.
- Slow the sweep before adding decorative motion. A six-second callout may spend about 1.6 seconds on the sweep, land its copy near 2.75 seconds, hold through about 5.35 seconds, and fade by 5.9 seconds. Adjust those landmarks to the spoken beat.

## shadow-safe export frame

The top-level timeline frame must include the full rendered shadow, blur, glow, and edge treatment at every animated state. Do not size the export frame to the visible card bounds.

Measure the live effect bounds and add overscan around the nested cue. Keep the cue's approved placement inside that frame. For the locked Keeper & Kin 1120 x 220 cue, use a 1210 x 286 top-level frame with the cue at `x = 31`, `y = 0`.

Apply the measured export frame to every matching overlay timeline before export. Verify the first compact state, the widest sweep frame, the resting state, and the fade. A cropped shadow fails review even when the card itself is visible.

## handoff

Export the top-level timeline frame. Animate descendants only. Record the client family, duration, cue range, easing, export-frame size, nested-cue position, and portfolio asset in the handoff.
