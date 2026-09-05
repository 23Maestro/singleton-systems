---
name: layer-cleanup
description: Clean a selected Figma frame or page by auditing default names, hidden layers, empty containers, orphaned objects, nesting, and reading order. Use for semantic renaming and visually neutral layer-panel cleanup.
---

# Layer cleanup

Make the layer panel read like documentation while preserving the visible design.

Source: [layer-cleanup by Sianotte](https://www.figma.com/community/skill/71390/layer-cleanup), published under the Figma Community Free Resource License.

## Audit first

Read the selected frame, or the current page when the user has clearly scoped the whole page. Count:

- default names such as `Frame 427`, `Rectangle 12`, and `Group 8`;
- hidden layers;
- empty groups and frames;
- detached component instances;
- objects far outside their parent bounds;
- redundant single-child wrappers.

Report the counts before changes. A direct instruction to clean the named scope authorizes clear, visually neutral fixes. Hidden, protected, destructive, or ambiguous items still need an item-level decision.

## Rename by role

- Text layers use concise visible content.
- Buttons use role and action.
- Icons use their meaning.
- Images use subject or placement role.
- Containers use semantic roles such as `rail`, `lower-third`, `player-card`, or `scene-title`.
- Decorative layers use stable names such as `bg/gradient` or `decor/rule`.

Do not rename component instances or intentional existing names. Follow the loaded client naming contract when it exists.

## Structural cleanup

- Remove confirmed-empty containers.
- Remove fully transparent layers only when they have no effect, interaction, or state purpose.
- Remove a single-child wrapper only when it carries no style, constraint, layout, clipping, component, or prototype behavior.
- Move a clear stray into its logical parent. Put uncertain strays in `_orphans` for review.
- Order layers to match visual reading order when the change is safe.

Do not delete hidden layers without listing them. Do not detach instances. Do not change position, size, fill, stroke, effect, or visible copy during a layer-only cleanup.

## Finish

Return renamed, removed, relocated, and skipped counts with changed node IDs. Capture a screenshot or geometry readback when structural cleanup touched a visible frame.
