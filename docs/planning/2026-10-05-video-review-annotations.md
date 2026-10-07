# Video review annotations

October 5, 2026. Updated October 6. Research first. Lineups is the first proof.

## Destination

One hosted review surface under Singleton Systems, retaining Decision Maps'
pre/post-Figma presentation. One engine serves Lineups and DIY Smart Code through
source adapters. A future video-review skill routes into it. Open by link, with
no passcode. Drafts stay accessible; no resident localhost previews or parameter
controls.

## Review flow

Press **Annotate** to pause video/audio and capture the displayed frame.
Mark a region or select a mapped component, comment and resume. Pre-Figma
stills use the same interaction. Named hover selection needs source IDs and
verified bounds at the captured time. Defer continuous tracking.

Collect issues into one durable batch. Five issues across 27 candidates is an
example; candidate counts come from episode records. Retain review/revision,
scene, media identity, snapshot, presented time, frame/FPS when verified, image
dimensions, region, comment and status. Preserve Figma node or HTML component
IDs when available. Older notes stay attached to their original render.

Codex or Claude reads the batch on demand and reviews snapshots individually.
Ask a focused question when needed. Revisions return to the same page.
A review link or copyable JSON provides handoff. Automatic delivery into an
existing chat remains unverified.

## Hosting and reuse

[Convex](https://docs.convex.dev/production/hosting/vercel) holds review data and
files; Next.js still needs frontend hosting. Deploy one viewer and add reviews
as data/media updates. Code changes require deployment. Storage and delivery
consume resources.

Reuse existing Convex integration patterns and extend Lineups' scene-manifest
and review-correction contracts. `lib/reviews` handles code review.
Keep unrelated data separate.

[Browser capture](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage)
preserves video pixels. Verify pixel/time pairing and CORS. Native HTML needs
a capture adapter. [One-shot queries](https://docs.convex.dev/cli/overview)
allow agent reads without a watch server.

## Selected pieces

| Project | Use |
| --- | --- |
| [Annotorious](https://github.com/annotorious/annotorious) | Image drawing library; `3.9.4` vetted and installed |
| [Clapshot](https://github.com/elonen/clapshot) | Timestamped comments, drawings and replies; interaction reference |
| [Agentation](https://github.com/benjitaylor/agentation) | Structured agent feedback; interaction/protocol reference |

Borrowed code requires license review. Keep these pieces inside one engine.

[First proof contract](2026-10-06-video-review-proof.md): Week 4 S20, five saved
comments, verified source selection and region fallback. Reload preserves
snapshots; resized regions stay aligned; revisions remain separate; an agent
reads one batch. End-to-end behavior remains unproven.

## Recovered sources

- **Video Outreach**, October 4, 5:30 pm EDT, turn
  `01a108d3-2017-7460-a048-f36c2889ac38`:
  [annotation request](codex://threads/01a0c477-802c-7970-9458-925f69f7cae1).
- [Lineups review-loop ticket](https://linear.app/23maestro/issue/23M-144/design-hard-stop-review-loop-for-lineups-edit-sprints)
  specifies frame/version comments and scoped corrections.
- Moved to Asana September 26. Active
  [Review Loop](https://app.asana.com/1/1216086803382161/project/1218890014545436/task/1218911062253962)
  was incomplete at the prior readback.

Preserved screenshots: [header](/Volumes/HomeSSD/Generated/VIDEO_WORKFLOWS/references/2026-10-05-annotation-reference-header.png),
[button](/Volumes/HomeSSD/Generated/VIDEO_WORKFLOWS/references/2026-10-05-annotation-reference-button.png),
[heading](/Volumes/HomeSSD/Generated/VIDEO_WORKFLOWS/references/2026-10-05-annotation-reference-heading.png),
[section](/Volumes/HomeSSD/Generated/VIDEO_WORKFLOWS/references/2026-10-05-annotation-reference-section.png).
Hashes matched the originals at intake.
