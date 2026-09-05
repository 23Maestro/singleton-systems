---
name: safe-auto-layout-conversion
description: Convert manually positioned Figma frames to Auto Layout while preserving the existing geometry. Use for Auto Layout conversion, Hug or Fill corrections, wrapper design, or layout refactors where visual drift would be a failure.
---

# Safe Auto Layout conversion

Treat the existing design as the geometry source. Auto Layout must reproduce it.

Source: [safe-auto-layout-conversion by Alberto Gloder](https://www.figma.com/community/skill/84898/safe-auto-layout-conversion), published under the Figma Community Free Resource License.

Load `figma-use` before a Figma tool call. Inspect the target frame and capture a screenshot before writing.

## Preserve first

Before changing hierarchy or layout properties, record each relevant child's:

- x, y, width, and height;
- order and parent;
- gap from its prior sibling;
- indentation and alignment;
- Fixed, Fill, or Hug behavior;
- overlay or clipping role.

Use exact geometry when it is available. Do not average irregular gaps or normalize offsets unless the user requested a visual cleanup.

## Model the relationships

- Uniform spacing and alignment can use one Auto Layout frame.
- Different gap groups need nested wrappers.
- Different indentation needs a wrapper or padding.
- A header, body, rail, and footer need page-level ownership that matches the current geometry.
- A real overlay stays outside normal flow with absolute positioning.
- Do not simulate a structural relationship with arbitrary padding or negative spacing.

Keep wrapper count as low as the measured relationships allow.

## Work inside-out

Use this order:

1. Capture the reference and geometry.
2. Design the wrapper hierarchy.
3. Create the inner wrappers and move their children.
4. Set the wrapper's layout mode, padding, gap, and alignment.
5. Set child sizing only after its parent supports that sizing mode.
6. Convert the next outer frame.
7. Convert the page-level frame last.
8. Restore any recorded fixed dimensions that collapsed.
9. Recheck overlays, clipping, and footer position.
10. Capture a new screenshot and compare it with the reference.

Never set a child to Fill before its parent has the matching Auto Layout direction. Do not assume Hug is correct because a frame contains children.

## Visual guardrails

Unless the user requested a redesign, do not:

- make irregular gaps uniform;
- center an intentionally offset element;
- change indentation;
- stretch a fixed-width object;
- shrink or expand a container to its contents;
- move a footer into a body wrapper;
- force an overlay into document flow;
- replace measured spacing with a token scale.

After each structural step, check critical nodes for width or height values of 0 or 1. Restore recorded dimensions before continuing.

## Completion

The conversion passes when the new hierarchy uses Auto Layout, the visible geometry matches the reference, sizing modes are intentional, overlays remain in place, and no node collapsed. If a step causes broad movement, correct the hierarchy before adding compensating values.
