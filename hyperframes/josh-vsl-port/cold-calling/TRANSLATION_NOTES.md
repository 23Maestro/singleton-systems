# Translation notes — 67 Hours Cold Calling

Source: `remotion/josh-vsl/ColdCallingProductStory.tsx` + `ProductStorySystem.tsx`
240 frames · 29.97 fps · 1920×1080 · `data-duration="8.008"`

## Lint
0 blockers, 0 warnings, 1 info (`r2hf/static-file` → `assets/meta.svg`).

## Timing translation
| Source | HyperFrames |
| --- | --- |
| `enter()` spring | shared exact lookup ease (`assets/shell.js`) |
| `outcomeIn = spring({damping:16,stiffness:130,mass:0.72}, 38)` | its **own** exact table — this spring *does* overshoot (peaks 1.0098 at frame 30), unlike `enter()` |
| `hours = Math.round(clamp(frame,[28,132],[0,67]))` | one proxy tween writing the numeral, the bar `scaleX` and the head position |
| `progress` bar | `scaleX` transform — the source's `width` percentage is a forbidden layout tween |
| `route = clamp(frame,[118,167],[0,1])` | one proxy driving `strokeDashoffset`, the dot's `transform`, and the red→green switch at 0.76 |
| `pulse = 1 + sin(frame/9)*0.035` | quarter + half-period `sine` swings — exact, not approximated |

## Craft pass (authorised)
- **Call log arrives as one wave.** The source ran `enter()` 13 frames apart so rows were still landing while the hours counter climbed. Now an accelerating cascade settles the log before frame 28.
- **The win blooms as it lands** — glow and outcome card resolve on one beat.
- **The effort card recedes** (opacity 0.55, scale 0.97) once the outcome takes the frame, so the eye goes to the payoff.
- Bar head glow rides the leading edge of the 67-hour fill.

Rejected: scaling the numeral as it counts. It crowded the "hours" label, and that spacing is part of the locked layout.

## Verification
`npx hyperframes check` — 0 errors. One accepted lint warning (file size).
`#hours` carries `data-layout-allow-overlap`: a 112px numeral at `line-height: 0.9` reaches into the eyebrow's rect exactly as it does in the Remotion source.
SSIM vs master: mean **0.978**, p05 0.974.
