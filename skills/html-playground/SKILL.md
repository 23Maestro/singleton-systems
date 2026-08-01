---
name: html-playground
description: Create a self-contained interactive HTML explorer with controls, live preview, and a review prompt.
---

# HTML Playground

Use for an interactive playground, explorer, or visual review surface.

1. Read `references/base-playground-scaffold.md`.
2. Read the closest lane reference:
   - `references/design-playground.md`
   - `references/data-explorer.md`
   - `references/concept-map.md`
   - `references/document-critique.md`
   - `references/diff-review.md`
   - `references/code-map.md`
3. Adapt the lane to the request and write one dated, self-contained HTML file.
4. Open the result in the browser after verification.

Every playground must use inline CSS and JavaScript, a useful first-load state,
3-5 cohesive presets, immediate control-to-preview updates, natural-language
prompt output, and a copy button with visible feedback. Keep the review surface
readable: large type, few meaningful nodes, and no crowded inventory.

Keep one state object and one defaults object. Every control updates state and
calls one render path that refreshes controls, preview, and prompt output.

Use a repository-local HTML verifier when the working repository provides one.
