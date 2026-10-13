# Lineups template system

Figma holds the editable designs. The registry holds their exact addresses and
supported settings. JSON measurements check whether an episode preserves the
approved design.

| Place | Purpose |
| --- | --- |
| Foundations | Brand assets and measured references |
| Components | Approved reusable sources, grouped by the 7 lanes |
| Episode pages | Copy, photos, logos, and native motion for each episode |
| Legacy | Old examples and ideas; excluded from template retrieval |

Page count does not decide which design code retrieves. Each template has a
stable registry key, a Figma file and source ID, supported counts, and a direct
source link. Renaming a page or source does not change those IDs. Recreating a
source creates a new ID and requires a registry update.

For a new template, use 1 master in Components. Create count variants when
structure changes. Expose replaceable copy and asset slots. Record protected
geometry and styling, then register its exact source. Keep episode examples
linked as proof, separate from that authority.

The build order is:

1. Record transcript evidence and the visual purpose.
2. Test the candidate's counts and asset requirements against registered looks.
3. Retrieve the exact approved source and verify it exists in Components.
4. Create the episode copy and replace allowed content.
5. Compare actual measurements against the source and inspect the finished frame.

A team matchup with 2 records fits Simple comparison with team logos. Simple and Full
player comparison tables need verified alpha. Cinematic 2-up needs
full photos with original backgrounds visible together from the opening frame
and the established top-left title. An unclear passage
returns a review reason and eligible choices. Missing capacity returns a
reference gap.

The registry currently binds 20 sources across all 7 lanes. Quick Stat has the
new detailed style and geometry comparison. Other lanes retain their existing
checks and require visual review; they do not yet have complete style snapshots.
Simple board and some Asset Swap counts still need source registration.

Run `npm run check:lineups:templates` to test retrieval, candidate fit, canonical
source measurements, and a generic callout fixture. Fetch fresh Figma properties
after each mutation and before delivery. Passing an old JSON file does not prove
the current canvas.

The shared workflow starts with no active episode. Bind the current scene through
`LINEUPS_MANIFEST_PATH`, or create `config/lineups/active-scene.json` for the current
edit only. Verify the episode, Figma nodes, and Premiere sequence against live
readback before binding. Keep manifests and receipts under that episode's folder.
Clear the environment override and remove the temporary active file when the
scene finishes or work switches projects. Episode history never supplies the
default binding. The no-enrollment guard still requires a scene manifest before
mutating or exporting the shared Lineups Figma file.

## Runtime evidence

Discovery covers every Whisper segment in all seven lanes. Each selected scene
must match one candidate in its lane and stay inside that source passage.
Editorial fit and source meaning still need human review.

Run `python3 -m tools.lineups_motion.timing_evidence --issue` with stdin JSON
`{"root":"/absolute/repository","manifest":{...}}`. It checks actual Whisper
word timestamps and runs Manim timing configuration. Save its JSON receipt as
`timing.proofPath`. It creates no visuals and grants no approval. Pre-Figma
candidate checks require this current receipt before review generation.

Approval stores `review.approvedEvidenceSha256`, the SHA-256 of
`tools.lineups_motion.timing_evidence.approval_state(manifest, receipt)` using
that module's canonical JSON. Record it only after Jerami approves that scene,
Figma version, timing receipt and Premiere intent. Evidence changes invalidate
approval. Figma produces the visuals and must return measured motion tracks.
The exact template measurement collector may run without scene enrollment.

For Asset Swap and player comparison tables, each photo/cutout needs an
`alphaProof` bound to its ledger slot: source ID, image hash, alpha and preserved
original paths with SHA-256 hashes, and `edgesReviewedBy: "Jerami"`. Runtime
checks file hashes and nonempty alpha pixels. Jerami reviews identity and edges.
Cinematic 2-up uses full photos; the other lanes inherit no cutout requirement.

Premiere import and placement reserve an intent before the call. An error or
missing response leaves that intent in place. Recover existing item/clip IDs by
live readback and reconcile receipts. Never delete an intent just to replay a
mutation. Only a verified absence of the attempted mutation permits a deliberate
retry. Keep receipt directories episode-specific.

Review exports require the enrolled scene's receipt. Polling jobs bind the scene,
manifest and evidence version. Render proof gates Premiere import; it cannot be
required before producing the first export. Preserve approved editorial trims
and source In/Out separately from padded composition duration.

Before import, ffprobe verifies video dimensions, frame rate and padded duration.
Each visible proof frame needs a `path`, file SHA-256 and matching decoded video
pixels. These checks do not grant visual approval. Cue proof extraction uses
verified HomeSSD storage under `CATENA_MEDIA/previews`.

Both scene generators require `--config <episode timing JSON>`. They print a
pending manifest and tool input without writing active enrollment. The rank
inspector also prints its readback input without changing files or Components.

## current scene readback

A `figma-to-export` receipt carries `evidence.sceneReadback`: the actual matching
scene returned by successful Figma PostToolUse validation. The hook persists its
hash with the current manifest hash in `<sceneId>.figma-readback.json`. Export
and delivery reconciliation require both. Starting another approved Figma
attempt invalidates the prior measurement; failed or malformed responses cannot
reuse it. Native float measurements allow 0.000001 scale/opacity variance and
0.0001 seconds of timing variance. Changed tracks still fail.

Detached backgrounds and Quick Stat callout roles return actual episode IDs
alongside exact planned IDs. Pending IDs are planning references only; source
child IDs cannot stand in for cloned nodes. Quick Stat measures source style and
episode callout geometry. The single-photo planner accepts Single-frame
statement only; Two-photo progression uses a separate two-photo plan.

Premiere replacement requires the approved project item/media path, an approved
live editorial/source timing baseline, and a successful matching readback from
the last ten minutes. Its intent remains pending through errors and timeouts.
Fresh clip/sequence readback must confirm media identity, trims, and source
In/Out before retries or delivery completion. A returned clip ID alone cannot
prove preservation.

Episode activation expires through [the deadline closeout check](lineups-episode-closeout.md).
Closure preserves evidence and does not satisfy the delivery gates above.
