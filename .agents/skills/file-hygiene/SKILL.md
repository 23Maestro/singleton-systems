---
name: file-hygiene
description: Audit and clean Figma files without changing design intent. Use for page organization, naming, layer hierarchy, Auto Layout, sizing, components, variants, styles, variables, typography, color alignment, handoff, or archive cleanup.
---

# File hygiene

Improve the current Figma file without damaging its design intent, system assets, or collaboration history.

Source: [file-hygiene by Greg](https://www.figma.com/community/skill/83750/file-hygiene), published under the Figma Community Free Resource License.

Start with a read-only audit. When the user's scope and standard are already clear, use them and continue. Ask only when an unresolved choice would change the file.

## Protected content

Inspect these items, but do not change them without item-level approval:

- published components and component sets;
- prototype connections, interactions, overlays, and starting points;
- variable collections, modes, aliases, and library bindings;
- library instances and assets;
- documentation, cover, release-note, migration, and contribution pages;
- anything marked locked, protected, or do not edit.

Do not detach components, flatten structured content, merge component families, delete tokens, or rewrite prototype behavior as routine cleanup.

## Audit

Identify whether the scope is a design-system library, production file, handoff file, exploration, or archive. Apply its existing conventions and any client contract already loaded.

Check:

- page order, names, status, ownership, and archive boundaries;
- section, frame, group, and layer names;
- default names, stale Copy suffixes, empty containers, zero-size objects, and off-canvas strays;
- inconsistent hierarchy and needless nesting;
- manual spacing that would benefit from Auto Layout;
- gaps, padding, alignment, wrapping, sizing, and absolute positioning;
- duplicate components, detached instances, variant sprawl, and unclear properties;
- raw values when an approved style or variable exists;
- broken aliases, missing modes, unused local styles, and duplicate tokens;
- typography and color that do not match an approved source.

Treat an Auto Layout conversion as review work unless the visual result is identical. Load `safe-auto-layout-conversion` before applying it.

## Operator labels

Keep operator-facing labels readable on the Figma canvas:

- use dark text on the default light canvas;
- use white only on an intentional dark documentation surface;
- use centered alignment for scene titles;
- use Auto Width or a hugging container so the label does not block nearby selection;
- keep major scene titles at 112 px or larger and support labels at 48 px or larger when the client contract does not set another scale;
- place labels consistently above their composition and verify them while zoomed out.

Figma's native frame-name label is interface chrome. It cannot take custom alignment, color, or type size. Use a separate operator text layer when those controls matter.

## Preview and apply

Before a cleanup batch, report the object, current state, proposed state, reason, visual impact, and risk. Group clear, visually neutral changes. Keep ambiguous and protected items separate.

Safe work may include semantic renaming, confirmed-empty container removal, exact-match token binding, and lossless wrapper removal. Verify the affected frame after each logical group. Stop if appearance, instance relationships, bindings, constraints, or prototype behavior changes unexpectedly.

Finish with changed node IDs, completed fixes, skipped items, and remaining decisions. Recheck before calling an item resolved.
