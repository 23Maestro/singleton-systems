# AI Workflow Portfolio C4 and Image Framing Plan

## Purpose

Move the Source Map proof visuals toward a cleaner C4-style system map and a
single consistent image frame. The portfolio should keep the same practical
case-study feel, but the bottom source images should stop looking like nested
cards inside cards.

## Current State

- The portfolio route is `/ai-workflow-portfolio/`.
- Source Map cards link to GitHub source routes.
- The bottom Source Map area renders one selected image at a time.
- README currently uses a custom SVG node diagram.
- API and code artifacts use image screenshots.
- Prospect Web uses a full product screenshot.
- LikeC4 is installed and validates the current visual map source.
- `npm run visual-maps:build` successfully builds the static LikeC4 site.
- Direct `likec4 export png` is currently blocked by a Playwright render timeout.

## C4 Target

Use C4 language for the README-style system map:

- Person: Operator
- System: Prospect ID Workflow System
- Containers:
  - Raycast Commands
  - Local FastAPI Bridge
  - Legacy Laravel Dashboard
  - Supabase PostgreSQL
  - Vercel / Prospect Web
- Relationship:
  - Operator triggers Raycast Commands.
  - Raycast Commands send workflow actions to the Local FastAPI Bridge.
  - Local FastAPI Bridge translates dashboard behavior for Legacy Laravel.
  - Local FastAPI Bridge writes durable facts to Supabase.
  - Vercel / Prospect Web reads cleaned workflow data from Supabase.

Keep the public copy simple:

```text
Command UI, legacy-system adapter work, source-of-truth cleanup, and audit
tests for a practical operations workflow.
```

## Image Frame Contract

Use one outer frame only.

Do:

- One silhouette frame per selected source image.
- Fixed aspect ratio parent on desktop and mobile.
- `object-fit: contain` when the whole artifact matters.
- `object-fit: cover` only when cropping is intentional.
- Per-image `object-position` or small transform only when the image needs a
  nudge.
- One bottom fade overlay if the artifact needs a soft cutoff.

Do not:

- Add another card inside the source image frame.
- Add decorative cards around transparent images.
- Force every image into the same crop mode.
- Use scale changes as the first fix for every asset.

## Research Notes

- MDN defines `object-fit` as the CSS property for resizing replaced content
  such as images or videos inside a container.
- Next.js Image docs support `contain` for preserving the whole image and
  `cover` for filling the frame with intentional clipping.
- MDN `object-position` is the correct tool for shifting image alignment inside
  the selected frame.
- LikeC4 CLI supports static builds and exports to PNG, JPEG, JSON, Mermaid,
  Dot, D2, and DrawIO.
- LikeC4 Docker provides a self-contained export environment with Node,
  Graphviz, Playwright, and LikeC4. That is the likely fallback if local PNG
  export keeps timing out.

Reference links:

- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-position
- https://nextjs.org/docs/pages/api-reference/components/image
- https://likec4.dev/tooling/cli/
- https://likec4.dev/tooling/docker/

## Implementation Plan

### Step 1 - C4 Source

- Add a simple LikeC4 source for the AI Workflow Portfolio README map.
- Keep the model small enough for a clean public image.
- Validate with `npm run visual-maps:validate`.
- Build the static map site with `npm run visual-maps:build`.

### Step 2 - Export Fix

- Reproduce the current PNG export failure with the exact command:

```bash
./node_modules/.bin/likec4 export png docs/visual-maps -o docs/visual-maps/exported-png
```

- If local export still fails on `.react-flow.initialized`, test the LikeC4
  Docker image as the clean export environment.
- Keep generated PNG output out of source control unless it becomes a selected
  public asset.

### Step 3 - Source Map Image Frame

- Replace the current per-image ad hoc handling with a data-driven frame
  contract:

```ts
fit: "contain" | "cover";
position: "center" | "top" | "left top";
scale?: number;
frame: "artifact" | "diagram" | "product";
```

- Render one reusable `SourceArtifactFrame`.
- Remove nested visual wrappers inside the frame.
- Keep links on top cards; bottom image display should not trigger navigation.

### Step 4 - API Images

- Use `contain` for code/API screenshots where the whole artifact matters.
- Use a fixed frame ratio so mobile and desktop stay consistent.
- Keep a subtle bottom fade only when the image intentionally continues past
  the visible frame.
- Stop scaling code images until the frame contract is stable.

### Step 5 - Prospect Web Image

- Treat Prospect Web as a product screenshot, not a code artifact.
- Use a consistent product frame with `object-fit: cover` only if the modal and
  main workflow remain visible.
- Prefer `object-position` before another scale change.
- Keep the current 3 percent shrink as the baseline until a better crop is
  chosen.

### Step 6 - Portfolio Publish Check

- Run `npm run build`.
- Check `/ai-workflow-portfolio/` on desktop and mobile.
- Check `/portfolio-c4-plan/`.
- Deploy preview first unless production is explicitly requested.

## Acceptance Criteria

- Source Map bottom renders one clean frame.
- No extra image cards appear inside the frame.
- README architecture exists as LikeC4 source.
- Static LikeC4 site builds.
- PNG export path is either fixed locally or documented with Docker fallback.
- API screenshots are not awkwardly cropped on mobile.
- Prospect Web image looks intentional, not forced.
