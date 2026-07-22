# Design Canvas Template

Use this template for UI design planning surfaces: dashboards, mini CRMs,
weekly trackers, landing-page sections, component systems, and product workflow
screens.

## Canvas Layout

```text
+----------------------+-----------------------------+
| Design controls      | Live direction preview      |
|                      |                             |
| - Product job        | Header / navigation         |
| - Audience           | Main screen zones           |
| - Density            | Key cards or panels         |
| - Palette            | Table/list/detail state     |
| - Typography         | Empty/loading/follow-up     |
| - Signature element  |                             |
+----------------------+-----------------------------+
| Copyable implementation prompt                    |
| [Copy prompt]                                      |
+---------------------------------------------------+
```

## Required Sections

1. **Surface job**
   - who uses it
   - what decision/action it supports
   - what it must not own

2. **Token system**
   - colors with hex values
   - type roles
   - spacing/density
   - border radius and shadow rules

3. **Layout**
   - top zones
   - primary table/list/card area
   - detail or modal behavior
   - mobile collapse behavior

4. **States**
   - empty
   - loading
   - selected
   - follow-up due
   - error or blocked

5. **Prompt output**
   - natural language direction
   - only important choices
   - enough context to apply without seeing the canvas

## Control Types

| Decision | Control |
| --- | --- |
| Density | segmented control: compact / balanced / roomy |
| Week or date range | dropdown or seven-day rail |
| Category | chips or segmented control |
| Status | filter pills |
| Table fields | toggles |
| Palette | swatches |
| Detail behavior | segmented control: drawer / modal / inline |
| Send/write actions | confirm modal only |

## Prompt Shape

```text
Build this as a [surface] for [user].

The screen job is [job]. Use a [density] dashboard layout with [top zones] and
[bottom zone]. Keep owner-system truth in [owner] and show only [read surface].

Visual direction: [palette], [type], [signature]. Reference [screenshot/source]
loosely; do not copy its domain.

Interaction: [filters], [refresh], [detail behavior], [confirm modal].

Mobile: [collapse rule].
```

## Common Mistakes

- Treating the canvas as the database or task owner.
- Adding too many filters before the core table works.
- Copying a screenshot's business domain instead of its layout idea.
- Producing a value dump instead of a usable implementation prompt.
- Hiding the next action behind decorative copy.
