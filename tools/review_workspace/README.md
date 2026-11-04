# Studio

Source for `/studio` and the private review preview. The first packet uses
verified Week 8 material. W9 intake remains open. Existing Pre/Post routing
and the durable video review service remain unchanged. Chat sending is disabled.

Build from a generated Lineups packet:

```sh
python3 tools/review_workspace/build.py \
  --packet public/decision-maps/2026-10-27-nfl-week-8-power-rankings-pre-figma-review \
  --output sites/video-review-w9/dist
node --test tools/review_workspace/model.test.mjs
node tools/review_workspace/check-browser.mjs REVIEW_URL
```

Build the approved domain copy with `--output public/studio --base-path /studio/`.
Commit that delivery bundle with these sources. The Next.js rewrite serves it
at `/studio`; the base path keeps scripts, packet data and media on that route.
Business Ops links to Studio first with a full-page link.

Check the domain bundle with `node --test tools/review_workspace/studio.test.mjs`
and `python3 -m unittest tools.review_workspace.test_build`. Run the browser
check against `/studio` after deployment. Test a fresh session and a direct
reload. Browser notes from the private preview stay on that preview's origin.

The builder checks timing/cue hashes and every copied media hash. It preserves
scene IDs and links to source artwork and timing proof. It does not render or
change episode content. No extra dependencies are installed.

Notes, replies, normalized frame rectangles and scene statuses live in browser
storage under the episode and cue-map hash. Saves require storage readback.
Export includes media identity and current statuses. Chat sending stays disabled
until the shared service can provide an exact-source receipt. Online persistence,
revision comparison and W9 intake remain open under 23M-323 and its children.

Focus a storyboard card or click the viewer to use ←/→ for scenes, A to approve,
C to request changes and focus the comment field, and Space to play/pause video.
F attaches a frame note. Esc returns from the panel to the viewer, keeping the
draft. Typing fields and native controls keep their own keys. A stays on the scene.
Cards have centered, single-line status footers and one glowing selection border.
Cmd+B toggles the panel and keeps its draft. The stage bar holds the scene title,
status and version controls; the viewer has no extra header. The storyboard row
sizes from the cards so their footers remain visible in shorter windows. Changes
Requested is shown as Changes while stored feedback keeps its original status.
Poppins and white text carry the review UI. Production directions stay in the
packet. Comments opens by default; Scene holds status, Mark's quote and source
actions. Timing receipts stay in the packet without a panel control.

Video comments pause playback and keep the timestamp from when typing starts.
Cmd+Enter posts; Enter adds a line. Older untimed notes remain untimed. Drawing
opens in a large dialog with Undo and Done; closing it preserves the frozen
frame, marks and comment. The panel preview opens the same drawing for editing.

Frame notes currently use custom rectangle marks. Annotorious is installed in
the repository but is not wired into this preview.

References: Frame.io runtime study, parent spec v0.5, OpenMontage production
flow and Raycast colors. Libraries found through ScrapeCreators are recorded
in the November 3 research packet on HomeSSD; no third-party editor source was
copied into this preview. Motion Panels is the leading panel-library candidate
for the React integration after visual review.
