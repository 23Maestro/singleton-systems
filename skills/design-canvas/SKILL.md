---
name: design-canvas
description: Create focused design canvases, UI direction boards, dashboard layout plans, and copyable implementation prompts from screenshots, product ideas, or existing code. Use when the user wants to fork a design skill, plan a UI before coding, compare layout/style directions, or build a lightweight HTML/Paper design canvas instead of a full app.
---

# Design Canvas

Use this skill for the design-thinking pass before implementation. It is a
forked, Codex-local version of the Claude Code `frontend-design` guidance plus
the design-playground template, adapted for local HTML/Paper/Next.js planning.

## Purpose

Create one small design canvas that helps choose:

- page job and audience
- layout structure
- density and responsive behavior
- palette, typography, and visual signature
- copy tone and action labels
- implementation prompt to apply back into the target app

This skill is not a generic moodboard generator and not a replacement for
`html-playground`. Use `html-playground` when the deliverable is an interactive
single-file explorer with live controls. Use `design-canvas` when the deliverable
is a focused design direction, canvas, or UI planning surface.

## Workflow

1. Name the product surface, user, and one job of the screen.
2. Read the screenshot, code, or source text the user provided.
3. Pick one compact token system:
   - 4-6 colors with hex values
   - display/body/utility type roles
   - density, spacing, and radius rules
   - one visual signature tied to the actual product
4. Sketch the layout in prose or ASCII before building.
5. Build only the requested canvas or prompt:
   - Paper canvas when Paper Desktop tools are available and the app is open.
   - Self-contained HTML when the user wants a browser review surface.
   - Markdown design brief when the user only needs direction.
6. End with a copyable implementation prompt that can be applied to the target
   app, repo, or skill.

## Local Output Rules

- Keep the canvas lean: a few zones, strong labels, no crowded architecture
  inventory.
- Use real product language from the user's system. Do not paste generic SaaS
  copy into the design.
- If using a screenshot as reference, describe it as direction, not source truth.
- Avoid one-note palettes and default AI-design looks unless the user asks for
  them.
- For dashboards and operator tools, prioritize scan speed, dense but readable
  tables, clear filters, and restrained cards.
- Every action label should describe the action: `Refresh`, `Open Gmail`,
  `Draft follow-up`, `Mark waiting`, `Copy prompt`.
- Do not turn design exploration into a new source of task truth. Link back to
  the owner system.

## Template

When building a canvas or HTML planning surface, read:

```text
templates/design-canvas.md
```

Use it as the base structure, then adapt to the user's exact surface.

## Icon assets: generate with Satori

**Trigger line:** "Make me a flat vector icon with Satori" (or: "turn this reference icon into an alpha-transparent brand icon").

**How it works, simply:** Satori is a tool that turns a description of boxes
and shapes — written the same way you'd write a webpage with `<div>`s and
CSS — into a clean picture file (an SVG) instead of a webpage. You tell it
"put a white rounded box here, add two black lines crossing it, add a
colored stripe," and it draws that as flat, sharp vector art with a
see-through background, so it never looks blurry or has a white square stuck
behind it. No camera, no drawing tablet, no font needed if the icon has no
text in it.

**The actual steps** (see `scripts/generate-linear-inbox-icon.mjs` for a
working example):

1. Find or describe the reference icon (existing app icon, Raycast asset, etc).
2. Write a small `.mjs` script that describes the icon as a tree of
   `{ type: "div", props: { style: {...}, children: [...] } }` objects —
   plain boxes with `background`, `border`, `borderRadius`, `position`,
   and `transform: "rotate(...)"` for angled lines/stripes.
3. Call `await satori(root, { width, height, fonts: [] })` — `fonts: []` is
   fine as long as there's no text, only shapes.
4. Write the returned SVG string straight to `public/<name>-icon.svg`.
5. Reference it in the component with `next/image`, same pattern as
   `public/home-tasks-icon.svg` in `HomeTasksApp.tsx`.
6. Sanity-check the render before wiring it in — `sharp('<file>.svg').png().toFile(...)` and
   read the PNG back, since Satori's absolutely-positioned children need
   explicit `width`/`height` (not CSS `inset: 0`, which it silently mis-sizes).

Use this whenever a screen needs a small brand-consistent glyph that isn't
already a Phosphor icon — keep it flat (no gradients/shadows), no frame, no
background square, matching the rest of the Tier 2 icon language.

## Validation

- For HTML output, open the file and verify desktop and mobile layout.
- For Paper output, verify Paper Desktop is running with a file open before using
  Paper tools.
- For repo work, run the smallest relevant check after applying the design.
