# Translation notes — 48-Hour System Deployment

Source: `remotion/josh-vsl/SystemDeployment.tsx` + `ProductStorySystem.tsx`
510 frames · 29.97 fps · 1920×1080 · `data-duration="17.017"`

## Lint
0 blockers, 0 warnings, 2 info (`r2hf/static-file` ×2).

## The media constraint — this scene is structured differently

`<OffthreadVideo>` becomes a plain `<video muted playsinline>`, but HyperFrames
**refuses to own playback for media nested inside a timed wrapper**
(`video_nested_in_timed_element` — "video will be FROZEN in renders"), and equally
refuses untimed media (`media_missing_data_start`). So in this scene alone the
`#scene` wrapper is **untimed** and the `<video>` itself carries
`class="clip"` + `data-start` / `data-duration` / `data-track-index`. The other five
scenes keep timing on the wrapper. Verified by snapshot: the product recording
renders live, not frozen.

Source is ProRes `yuva444p12le`; `media.autoProxy` handles the browser-hostile codec.
Audio stays muted, as in the source.

## Timing translation
`upload = enter(8)`, `claim = enter(398)`, nodes `enter()` at 45/82/119/156/193/230.
`progress = clamp(frame,[38,270],[0,1])` drives the rail as `scaleY` from the top —
never a height tween. `done = frame > at + 30` per node; the preview label swaps at
frame 135 and the header status at 398.

Nodes are **authored completed** with a pending skin on top that dissolves at each
node's beat, so the hand-off is one dissolve plus short colour tweens rather than
restyling six panels.

## Craft pass (authorised)
- Each tick **lands on the shell's spring** instead of blinking on.
- Node dot and icon cross-fade red→green over 7 frames rather than hard-switching.
- The scrim and the `EVERYTHING BUILT IN ABOUT 48 HOURS` badge resolve as one beat,
  driven off the same spring the source used.

Final claim is unchanged and exact. "System live in 48 hours" appears nowhere.

## Verification
`npx hyperframes check` — 0 errors.
SSIM vs master: mean **0.925**, p05 0.901 — the lowest of the six, expected: this is
the only scene whose frame content includes a decoded video, and the 18→29.97 fps
conformed source lands on slightly different sub-frames under HyperFrames' seek than
under Remotion's.
