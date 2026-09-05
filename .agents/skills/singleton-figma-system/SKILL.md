---
name: singleton-figma-system
description: Create or refactor Singleton Systems Figma files into reusable client design systems with measured references, variables, components, variants, scenes, alpha overlays, buttery motion workspaces, review states, and export modes. Use for client labs, broadcast packages, storyboard libraries, branded template sets, or any Figma file that must support repeatable asset and data replacement.
---

# Singleton Figma system

Build a client-owned design source that can survive the next video, asset pack, editor, and brand revision.

Use the Figma skills `figma-use` and `figma-generate-library`. Inspect the target file before changing it. Search connected libraries and Figma Community before drawing a common primitive from scratch.

Load `file-hygiene` and `layer-cleanup` before structural Figma edits. Load
`safe-auto-layout-conversion` before changing a manual frame to Auto Layout or
changing Hug, Fill, wrapper, or layout-sizing behavior. Load
`accessibility-review` before a color, contrast, or accessibility assessment.
Use the client contract to resolve any conflict with a generic community rule.

For broadcast, video, scoreboard, lower-third, ticker, bug, rail, or on-air work, read [broadcast-package-etiquette.md](references/broadcast-package-etiquette.md) before writing to Figma.

For branded full-screen scenes, split-photo title graphics, and compact topic callouts, read [client-video-title-cards.md](references/client-video-title-cards.md). Use it only for title-card families. Do not apply those rules to speaker overlays unless Jerami reopens that family.

For client-specific educational speaker callouts or transparent on-screen graphics, read [client-video-alpha-overlays.md](references/client-video-alpha-overlays.md). Load `figma-use-motion` when the overlay has animation. The trigger word `buttery` activates its slow-sweep, explicit-easing, and shadow-safe export rules.

For Catena Media Lineups work, read
[lineups-production-system.md](references/lineups-production-system.md). It
implements the approved seven-lane menu and the active-page pruning rule.

## ownership

- Figma owns geometry, variables, components, variants, scene examples, and review comments.
- Eagle owns client source assets and portfolio files.
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
- Center standalone non-text focal assets inside their intended container by default. An off-center logo, photo, icon, or focal graphic needs a measured reference or Jerami's explicit direction.

## edit timing contract

For Figma scenes that will be placed in Premiere:

- Time each entrance from the transcript anchor for the spoken line it supports.
- Once text, logos, stats, or other information appears, keep it visible through the scene. Do not add fade-outs or exit animation unless Jerami asks for one in that scene.
- Add a 5-second tail pad after the final transcript beat. The pad is an edit handle for Premiere and must preserve the final visible state.
- Do not make the Figma composition end on the transcript beat. Premiere owns the final trim.
- Record the transcript anchor, last entrance time, content end, and padded composition end in the scene handoff.

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
