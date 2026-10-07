# Hosted video review proof

October 6, 2026. Lineups first. Research contract; playback remains untested.

## Viewer

Proposed route: `/decision-maps/review/[reviewId]` in the existing Next.js app.
Keep the familiar Decision Maps presentation. Open by link, with no passcode.
Convex holds review data and snapshots. Add each review as data; deploy again
when viewer code changes.

Press **Annotate** to pause playback and audio. Capture the displayed frame.
Hover a mapped element or draw a region. Comment, save and resume. Collect
issues into one batch. Preserve unsaved drafts during retries. Show **Saved**
only after the snapshot and comment are stored.

## First source

Use Week 4 S20, “Buffalo wins despite turnovers”: Figma file
`o7E24iymIT80MTXGYIogVH`, page `1491:4092`, root `1494:3253`.
Live readback confirms 1920 × 1080, 10 seconds, 15 nodes and 13 motion tracks.
The episode has 23 scenes. Candidate counts come from each episode record.

“STILL WON” has source node `1494:3260`. An MP4 carries pixels; named selection
requires a separate map of visible areas to source IDs. Verify that map against
the frozen render. During unsupported motion, allow region comments. Never
attach an unverified source ID.

The actual MP4 hash and source revision still require binding.
[Source readback](video-review/2026-10-06-s20-source-readback.json) records the
inspected geometry and keyframes.

## Shared boundary

One batch format covers stills and rendered video. Retain review/revision IDs,
scene identity, media hash, snapshot storage ID and hash, original dimensions,
comment and status. Store image-relative coordinates from 0 to 1, excluding
player letterboxing.

Record presented media time separately from scene-local time and episode time.
Derive frame numbers only from verified constant-rate media. Keep the snapshot
when later seeking lands differently. Each revision retains its own comments.

Extend the existing Lineups scene manifest and review-correction contracts.
Region comments can stay unresolved until the agent identifies the allowed
target. Corrections retain the existing source-edit limits. Jerami owns approval.

Use browser canvas capture and installed Annotorious `3.9.4` for frozen-image
drawing. Adopt Clapshot's timestamped comment interactions and Agentation's
structured agent handoff inside this engine. Third-party code reuse needs its
own license review. Native HTML capture follows the rendered-video proof.

[Package vetting](video-review/2026-10-06-annotorious-vet.json) records the
source scan and installed-file checks. The API import passed. Repository
typechecking currently fails in the separate Glaze code.

## Proof gate

- Five comments survive reload with their original snapshots.
- Capture matches the frozen pixels and timestamp during playback, rapid
  seeking and an already-paused state.
- A named target resolves to its verified Figma node; an unmapped region saves.
- Resizing preserves the selection. Audio pauses with annotation.
- Retry saves create one comment. Revision B preserves revision A.
- One on-demand agent read returns the batch and accessible snapshots.

[Frame callbacks](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback)
supply presentation timestamps; pixel/time pairing needs browser verification.
Test media CORS before capture. Serve videos directly from storage:
[Convex HTTP actions](https://docs.convex.dev/functions/http-actions) have a
20 MB response limit.

Handoff starts with a review link and copyable JSON. The deployed backend can
provide a one-shot CLI query. Automatic chat delivery remains unverified.
