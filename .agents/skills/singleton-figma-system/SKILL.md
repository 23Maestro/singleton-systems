---
name: singleton-figma-system
description: Create or refactor Singleton Systems Figma files into reusable client design systems with measured references, variables, components, variants, scenes, review states, and export modes. Use for Singleton client labs, broadcast packages, storyboard libraries, branded template sets, or any Figma file that must support repeatable asset and data replacement.
---

# Singleton Figma system

Build a client-owned design source that can survive the next video, asset pack, editor, and brand revision.

Use the Figma skills `figma-use` and `figma-generate-library`. Inspect the target file before changing it. Search connected libraries and Figma Community before drawing a common primitive from scratch.

For broadcast, video, scoreboard, lower-third, ticker, bug, rail, or on-air work, read [broadcast-package-etiquette.md](references/broadcast-package-etiquette.md) before writing to Figma.

## ownership

- Figma owns geometry, variables, components, variants, scene examples, and review comments.
- Eagle owns client source assets and proof files.
- FFmpeg and Whisper own timing evidence and transcript anchors.
- A renderer or editing tool owns final motion and data playback.
- Keep the active Figma file as the visual contract. Do not copy task state into it.

## file contract

Keep work on the user's requested page. Add pages only when the user approves them. Within one lab page, use indexed sections in this order when they apply:

1. `00 / cover + handoff`
2. `01 / measured references`
3. `02 / variables + styles`
4. `03 / atoms + image slots`
5. `04 / components + variants`
6. `05 / broadcast modes`
7. `06 / scene lab`
8. `07 / export + delivery`

Each section needs a short purpose line, owner, source, status, and output size.

## naming

Name source references with show, mode, subject, and year:

```text
FTF_L3_AreYouJoshing_2026
FTF_FS_MahomesAllenComparison_2026
PTI_RAIL_Rundown_2026
```

Name reusable Lineups nodes by role:

```text
LINEUPS_TOKEN_Color_Accent
LINEUPS_ATOM_PlayerCutout_Left
LINEUPS_CMP_LowerThird_Pun
LINEUPS_MODE_PlayerComparison
LINEUPS_SCENE_Main
LINEUPS_EXPORT_1920x1080
```

Use these status values:

```text
REFERENCE
MEASURED
COMPONENTIZED
CLIENT REVIEW
LOCKED
EXPORT READY
```

## build order

1. Capture up to six clean current references.
2. Place the reference and client rendition side by side.
3. Record literal x, y, width, height, crop, overlap, type size, rule thickness, and safe-area values.
4. Create variables before components.
5. Build image slots and small atoms.
6. Build one source component for each mode.
7. Add variants for count, state, layout, and theme only when they change structure.
8. Expose text, boolean, and instance-swap properties for editor-facing fields.
9. Compose scene examples from instances.
10. Add export frames and verify them with screenshots.

## component rules

- Keep text, images, logos, stats, labels, and dates replaceable.
- Use instance-swap properties for player art, speaker art, logos, and article cards.
- Use count variants for one to four players.
- Give player slots directional roles: left-in, center-left, center-right, right-in.
- Keep one geometry source. Do not rebuild a similar card inside each scene.
- Bind shared color, spacing, type, rule, and safe-area values to variables.
- Use 1920 x 1080 as the master broadcast frame unless the client requires another output.
- Keep the top clear except for an approved graphic bug when that is the show rule.
- Place the Lineups banner and ticker at the approved bottom baseline.

## reference rule

Borrow package structure, hierarchy, measurement habits, naming discipline, and operator controls. Write original Lineups art, copy, marks, and color decisions.

Do not accept a generic card as a broadcast match. Trace the source frame first. If a source mode is missing, mark it `REFERENCE GAP` and keep the component provisional.

## measured repeat rule

When replacing a temporary, cropped, or low-quality repeated asset, treat the user's confirmed Figma placement as the geometry source and the higher-quality asset as artwork only.

1. Measure the confirmed master's x, y, width, height, visible-art bounds, vertical padding, and horizontal pitch.
2. Replace the artwork without resizing or repositioning the approved first item.
3. Duplicate on the measured horizontal pitch until the target frame edge is reached.
4. Clip only the final overflow at the target boundary. Do not add strip height, headroom, footroom, gaps, or a new background plane.
5. Preserve the locked baseline and verify the first, middle, and final repeats at full-frame size before updating dependent instances.

For a static crawl, the editable contract is `source asset + pitch + target edge`. The operation changes repeat count and x position only unless the user explicitly reopens geometry.

## review gate

Before calling a mode complete:

- show the reference and client mode together;
- verify measurements at full frame size;
- check text overflow and long-name cases;
- check one through four player variants where relevant;
- inspect image direction, crop, overlap, and edge masking;
- confirm every repeated field is a variable or component property;
- capture a Figma screenshot;
- return every created or changed node ID.

## handoff

Return:

```text
Owner:
Intent:
Source references:
Variables:
Components:
Modes:
Scenes:
Export frames:
Review status:
Node IDs:
Next smallest action:
Do not:
```
