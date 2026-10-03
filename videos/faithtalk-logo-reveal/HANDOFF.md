# FaithTalk logo reveal: v1 (2026-09-26)

Brief: ../faithtalk-drawn-seed-preview/references/nursehub-sfx-2026-09-26/CLAUDE-LOGO-HANDOFF.md

## Artwork

- Source: Figma v6sFPJsZp0u3CqyjYy50yV, FT_ATOM_Lockup, **Layout=Horizontal, Theme=White (4:180)**. Jerami asked for the raw all-white version. Production cards currently use Horizontal/WhiteGold (4:205).
- Motion build: page "Concept 02 Production" > section "05 / Logo motion · FaithTalk reveal study" (122:1061)
  - FT_MOTION_LogoReveal component 122:1062: original vectors cloned, uniform scale 1.791246 (1330 px wide, centred in 1920x1080). Emblem 122:1063, Wordmark 122:1076 > Faith 122:1088 / Talk 122:1090, masks 122:1087 / 122:1089
  - Black stage 122:1091 and source reference 122:1121 (instance of 4:180, same scale and position)
  - https://www.figma.com/design/v6sFPJsZp0u3CqyjYy50yV?node-id=122-1061
- **No "TV" exists in any supplied FaithTalk lockup** (all 6 variants read "faithtalk"). Nothing was typed or traced. Supply TV artwork to add it.
- Settled-frame diff: Figma motion component vs 4:180: max 32/255 on isolated anti-alias pixels only. Render vs 4:180: no edge offsets, only a small uniform fill-level shift from H.264 encoding. figma/*.png, renders/settled-vs-source-diff-x6.png

## Motion (index.html, 3840x2160, 30000/1001, 5.0 s = 150 frames)

- 0.07-0.80 emblem establishes at frame centre: opacity 0 to 1, scale 0.86 to 1.015 to 1.0
- 0.80-1.60 emblem travels left into its exact lockup position (power3.inOut)
- 1.20-2.00 Faith: masked left-to-right wipe, 40 px feather, 10 px settle drift
- 1.85-2.65 Talk: same wipe (starts before Faith fully lands)
- 2.65-5.00 full lockup settled and holding
- Timing follows the brief's condensed proposal. Still to do: retime from the dark YouTube original (the one with the pulse). The YouTube download returns 403, and frame sampling needs the browser pane on screen. The light "NurseHub Intro 2.0 - v1.mp4" is the newer intro and is NOT the reference.

## Cue markers (notes only, nothing sourced)

| Cue | Time | Event | Reference sound |
|---|---|---|---|
| C1 | 0.00-5.00 | whole piece | warm atmospheric pad bed (fade in 0-0.6, out 4.2-5.0) |
| C2 | 0.07-0.80 | emblem establishes | airy rising whoosh, lands into C3 |
| C3 | 0.80 | emblem established | glassy chime, shimmer tail |
| C4 | 1.20 | Faith reveal starts | soft low pulse 1 (lub); electronic sweep 1.20-2.65 |
| C5 | 1.85 | Talk reveal starts | soft low pulse 2 (dub) |
| C6 | 2.65 | lockup complete | completion / lock |
The outgoing swoosh (reference at 7.6-8.5) is left out because it belongs to the next-scene transition.

## Outputs (renders/)

- ft-logo-reveal-v1-black-4k-2997.mp4: preview on pure black #000000
- ft-logo-reveal-v1-alpha-4k-2997-prores4444.mov: true alpha (yuva444p12le), rendered with --variables '{"previewBlack":false}'
- edge-check-sheet.png: alpha over light grey, mid grey, emerald #035229 and dark, with no fringing. leak-check.png: Talk does not leak before its wipe
- sheet-v1.png: boundary frames

## Commands

npx --yes hyperframes@0.8.70 check
npx --yes hyperframes@0.8.70 render --fps 30000/1001 --output renders/<name>.mp4
npx --yes hyperframes@0.8.70 render --fps 30000/1001 --format mov --variables '{"previewBlack":false}' --output renders/<name>.mov
