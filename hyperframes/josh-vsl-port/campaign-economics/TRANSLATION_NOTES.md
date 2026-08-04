# Translation notes — Campaign Economics

Source: `remotion/josh-vsl/CampaignEconomics.tsx` + `ProductStorySystem.tsx`
390 frames · 29.97 fps · 1920×1080 · `data-duration="13.013"`

## Lint
0 blockers, 0 warnings, 1 info (`r2hf/static-file`).

## Timing translation
- Stages `enter()` at 15 / 74 / 133 / 192.
- `flow = clamp(frame,[40,230],[0,1])`; leg *i* filled over `clamp(flow,[i/3, i/3+0.34],[0,1])`,
  so leg *i* starts at frame `40 + (i/3)×190` and runs `0.34×190 = 64.6` frames. Each
  connector is a `scaleX` transform, never a `width` tween.
- Listing rows `enter(205 + i×22)`.
- `premium = index < 4 && frame > 285 + index*16` — a hard per-row flip at frames
  286 / 302 / 318 / 334. The `4%` label is authored underneath and the `Standard`
  label swaps off it.
- Right panel `enter(305)`.

## Craft pass (authorised)
- **A pip rides each funnel leg** as it fills, so spend visibly travels through the
  funnel instead of three bars filling in place.
- Each `4%` upgrade **settles** on the shell's spring rather than snapping.
- The premium panel blooms as the last upgrade lands (frame 330), not on arrival.

## Verification
`npx hyperframes check` — 0 errors, 0 warnings, 0 info.
SSIM vs master: mean **0.980**, p05 0.971 — the closest of the six.
