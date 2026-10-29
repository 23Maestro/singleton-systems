# Lineups template system

`s-systems:lineups-editor` owns the Lineups workflow. Shared intake and storyboard
handoff stay in `s-systems:client-video-storyboard`. Its old Lineups reference
paths forward to the focused skill so existing hooks and saved chats still work.

Figma holds the editable designs. The registry holds their exact addresses and
supported settings. JSON measurements check whether an episode preserves the
approved design.

| Place | Purpose |
| --- | --- |
| Foundations | Brand assets and measured references |
| Components | Approved reusable sources, grouped by the 7 lanes |
| Episode Workspace | Episode scenes in approved lane groups, with native motion |
| Player Cut Outs + Logos | Loose assets and old parts, grouped by episode |
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
3. After candidate selection, ask **Figma or Unreal?** for **Lane 4 / Comparison / player 2-up**. Save the explicit answer per scene. There is no default.
4. Retrieve the chosen engine’s approved source. Figma uses Components; Unreal uses `config/unreal/comparison-template-01.json` for player comparisons.
5. Create the episode copy, replace allowed content, compare measurements and inspect the finished frame. Unreal production timing and handoff still require their separate proof.

A team matchup with 2 records fits Simple comparison with team logos. Simple and Full
player comparison tables need verified alpha. Figma Cinematic 2-up needs
full photos with original backgrounds visible together from the opening frame
and the established top-left title. An unclear passage
returns a review reason and eligible choices. Missing capacity returns a
reference gap.

The registry currently binds 20 sources across all 7 lanes. Quick Stat has the
new detailed style and geometry comparison. Other lanes retain their existing
checks and require visual review; they do not yet have complete style snapshots.
Simple board and some Asset Swap counts still need source registration.

The four reviewed backgrounds have measured guards for geometry, lock state,
image fills, layer order and native background tracks. Their source IDs are
441:50, 598:215, 594:1254 and 1413:664. The matchup guard does not register a new
option. Asset Swap retains its measured 3424 x 1956.9296875 crop; the former
2040 x 1166 rule was stale. Quick Stat's 1920 x 1087 wrapper stays unchanged.

Use `python3 scripts/lineups-templates.py check <readback.json> --live` for
current canvas evidence. It requires a timestamp from the last hour and the
current source-guard fingerprint. The default check reports saved-readback
evidence. Neither mode replaces human composition review or episode approvals.

After Jerami approves source maintenance, `lock-source-backgrounds` emits the
exact scoped Figma input. It checks every protected value before the first write
and locks only the four reviewed background nodes. Repeating it skips locks
already applied. The hook rejects added mutations and malformed readback.
Episode construction and exports still require their existing scene gates.

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

## episode canvas standard

Jerami approved the lane-section organization on October 14, 2026 and the
workday walkthrough layout on October 16, 2026. Apply it from each episode's
first authorized Figma build. The shared workspace rules live in
`.agents/skills/singleton-figma-system/SKILL.md`; the Lineups lane specs live in
`.agents/skills/singleton-figma-system/references/lineups-production-system.md`.

Use simple episode titles and actual-workday labels at exactly 300 px. Verify
weekdays and dates from work records in America/New_York. Omit the time zone
from visible canvas titles and workday labels. Keep partial dates
explicit. Order episode areas left to right by known work dates on one top
baseline, with wide gaps for a fast Loom pan. Start with 6000 canvas px between
episodes and fit the existing file. Keep scenes in their lane grids.

Use native white Sections side by side with aligned top and bottom edges.
Keep the canonical lane numbers 1 through 7 and omit unused lanes without
renumbering. Each Section uses `<number> / <lane>` in simple words. Arrange multiple
scenes in two columns, or one column for a single scene. Order each lane by
transcript time, with Rank Reveal running 10 through 1. Put a compact centered
scene title and one timing/lane/frame-rate line directly above each preview.
Keep loose photos, cutouts, logos, render parts, and old versions on the existing
`Player Cut Outs + Logos` page in named groups by episode. Preserve assets
inside the actual scene.

## source curation

The October 17, 2026 cleanup keeps seven lanes and registers eight source
capacities for visual review. The registry now has 28 exact scene sources.
`client-review` means the source is reusable and registered; Jerami's visual
approval is still needed before episode use. The fit command returns
`needs-review` for these sources. The episode enforcement allowlist remains
the approval gate.

| Existing lane | Registered option | Capacity |
| --- | --- | --- |
| Quick Stats | Logo statement | One logo and statement; selected team colors |
| Stat Breakdowns | Grouped stats | 3-2-2 facts |
| Stat Breakdowns | Grouped logo facts | 3-2-2 or 2-2-3 items |
| Comparison | Team matchup | Two logos and one result; zero stat rows |
| Comparison | Logo row | Three teams and one value each |
| Comparison | Logo stat cards | Two teams and one shared metric |
| Asset Swap | Logo pair | Title and two logos |

Grouped logo facts cover different topics in each row. A comparison repeats
one metric across its subjects. A Year-by-Year board follows one subject
across periods. This distinction routes Conference Pulse and Snapshot to
Stat Breakdowns, and National Champions to Comparison.

Grouped type follows Jaguars defense (`1732:2227`): 82 px title; three-item
rows use 48/56/30 px heading/primary/detail; two-item rows use 56/64/36 px.
Logo statement has one neutral placeholder (`quick-stat.logo`). Build a team
treatment only when the scene calls for it. Use that candidate's primary and
secondary brand colors. Supply `teamId` and `teamColors` with `primary`,
`secondary` (#RRGGBB), and `source`, then run
`python3 scripts/lineups-templates.py logo-statement-paint <candidate.json>`.
Apply its gradient to the episode background, replace the logo and statement,
and leave the source neutral. Missing colors require verification; do not
fallback to an old team palette. Retain 64 px text, 190 px panel height, and
72 px side padding.
Logos and text are exposed as edit controls. Refit swapped logo artwork with
its aspect ratio intact and verify long labels before episode use.

The asset page holds 52 logo/person sources, a neutral logo placeholder, saved originals, older photo
statements, and four cast examples awaiting alpha and slot review. Existing
National Champions and Snapshot instance links are preserved. Components holds
scene sources and four shared helpers: the callout and three table bases.

For each used lane, link the spec for its approved option/source, counts,
output size, asset and copy slots, timing, guarded values, and review proof.

Regroup existing scene nodes without replacing their IDs or native motion.
Verify a readable overview and provide a direct lane link before continuing.

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
Figma Cinematic 2-up uses full photos; the other lanes inherit no cutout requirement.

Premiere import and placement reserve an intent before the call. An error or
missing response leaves that intent in place. Recover existing item/clip IDs by
live readback and reconcile receipts. Never delete an intent just to replay a
mutation. Only a verified absence of the attempted mutation permits a deliberate
retry. Keep receipt directories episode-specific.

Review exports require the enrolled scene's receipt. Polling jobs bind the scene,
manifest and evidence version. Render proof gates Premiere import; it cannot be
required before producing the first export. Preserve approved editorial trims
and source In/Out separately from padded composition duration.

When an intro is trimmed, retain the original Figma timing evidence. Bind
`premiere.timelineMapping` to the native Premiere transcript file and SHA-256,
sequence, source clip, source word time and exact phrase. Map that word through
the retained source In/Out and round to the nearest frame, with halves rounded
up. Include this mapping in the approval hash. The native transcript must come
from Premiere without retranscription.

If Jerami removes all motion from a scene, record `figma.staticByUserRequest`
with his approval and 0-duration cues. Measured readback must still match the
empty track list. This exception does not grant permission to change visuals.

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

Episode activation expires through [the deadline closeout check](../plugins/s-systems/skills/lineups-editor/references/lineups-episode-closeout.md).
Closure preserves evidence and does not satisfy the delivery gates above.

## review website template

Jerami approved the photo-first Pre-Figma review on October 13, 2026.
`tools/lineups_review/` owns the UI for both stages. The approved version and
source hashes are in `config/lineups/review-template.json`.

Generate both stages with `scripts/render-lineups-review.py`. Episode
`review.json` files supply the title, deadline, links, photo-subject labels,
and optional verified Post-Figma media. Scene excerpts come from words inside
that scene's time interval. Full passages stay in the transcript view.

The generated packet has one shared style and component set for Sites and
Vercel. `npm run check:lineups:review` rejects changed template bytes, copied
asset drift, page edits, and episode CSS overrides. The Vercel prebuild runs
this check. Production publication still requires its own authorization.

Photos fill the card above their context. Color-driven plans remain the fallback
for boards without finished artwork. They do not replace the locked Figma
backgrounds. Post-Figma keeps the same layout and shows verified renders when
available.

Both stages keep the same stage links and word-cue panel. The plan shows
which word starts each reveal. The built scene shows the cues saved with its
export. Keep the client’s spoken words exact. Use short, plain labels for
review actions. Keep the save button visible even when no photos are missing.
Load saved choices only for the current cue-map hash. A recorded chat approval
supersedes an earlier page export. Browser choices use a key bound to that
decision revision, so an old tab cannot hide the later approval.

When `review.json` has no `postScenes`, the renderer reads the episode’s
`storyboard/figma-build/<scene>/final-export.json` and scene manifest. It checks
scene identity, transcript, anchor, passed export evidence, and media hashes.
It makes small video previews under the verified HomeSSD preview folder.
Changed or missing build evidence stops the page build. A scene with no export
stays out of Post-Figma; the page does not use its source photo as a finished
scene. Older review packets keep their recorded template version.

## Saved engine choice

The canonical routing contract is `config/lineups/engine-routing.json`. It names
all seven lanes and separates Lane 4 / Comparison / 2-up from its engine.
Discovery stays engine-neutral. After selection, run:

```bash
python3 scripts/lineups-templates.py engine-choice /absolute/path/scene-manifest.json
python3 scripts/lineups-templates.py engine-choice /absolute/path/scene-manifest.json --engine unreal --answer 'Unreal for this scene'
```

The second command is an example; record Jerami's actual answer. It persists a
hash of the selected scene, discovery candidate, transcript revision and routing
contract. Preflight blocks missing or stale answers and rejects an engine mismatch.
It does not change `motion.engine` or create a render. The native player master
is visually approved; production Unreal routing remains disabled pending episode
Mark/Manim timing and handoff proof. Other unregistered team/period Unreal
selections expose a reference gap. The fixed team routes below take precedence.

## selected team routes

Jerami selected these engine routes on October 21, 2026:

| Lane | Option | Engine | Source |
| --- | --- | --- | --- |
| 2 / Quick Stat | Team callout | Figma | `quick-stat.team-callout`, component `1843:1021` |
| 4 / Comparison | Team matchup, 2 teams | Unreal | `comparison.team-matchup.2` |
| 4 / Comparison | Logo stat cards, 2 teams | Unreal | `comparison.logo-stat-cards.2` |

These routes do not ask for the engine again. The selected transcript candidate
and revision must still match. Player 2-up keeps the Figma/Unreal question.
The two team-logo entries use `config/unreal/team-logo-template.json`; their old
Figma nodes are preserved for recovery, not used as fallback authoring targets.
They remain pending native and human review.

Team callout uses the team's primary color for the logo block and name tab,
white text for the name, and dark copy on white. The body hugs the copy
with 48 px on each side. The 240 px logo block and full callout sit 36 px from
the bottom at 1920 × 1080. Keep the clean soft shadow. See
`config/lineups/team-callout-contract.json`. Human review and episode motion
proof remain open.

Team stadium plates use dry matte grass. Keep colored light in the stands and
roofline, with restrained neutral field light. Logos and panels stay editable.
Entrance cues follow Mark and same-revision Manim. Hold static with no animation
out; Premiere owns the cut or transition.

### locked paired-logo card style

Rams/Seahawks is the sole card style for both team options. Use angled stripes
near the team's colors, a large team logo, a thin shiny border and a dark name
strip. Swap team colors, logo and name; show a record or rank only when needed.
Browns/Ravens and Chiefs/Chargers use this same style.

Use Three.js to generate one reusable GLB card shell with real geometry and
standard PBR materials. Team colors are replaceable material inputs. Review
one native Unreal still against the locked reference before adding logos,
text, stadium or motion. Unreal owns logo depth, lighting, camera and a smooth
entrance, then static hold with no animation out. Prototype maps and the shell
proof are not approved reusable masters.
The source image and hash are in `config/unreal/team-logo-template.json`.
