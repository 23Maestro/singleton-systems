# Lineups corrections by lane and condition

## team stadium backgrounds

For new builds, use the selected team's canonical stadium photo in Figma and
Blender. This November 11, 2026 rule replaces both generic Field Night photos.
Use [team stadium photos](../../../../../docs/lineups-team-stadiums.md) and
`config/lineups/team-stadiums.json`. Swap only the stadium image in episode
copies. Keep the approved geometry, native motion, card surfaces and player
photo treatments. Past source measurements remain historical proof.

Old templates may keep their existing images. Use the new candidate build to
swap in the team photo and flag `Stadium photo needed: TEAM` when none exists.
Keep the other candidates moving. Backfill, old script updates and installed
skill release do not block candidate review.

For a score or matchup, use the team Mark is focused on. "The Steelers beat
the Ravens 39-8" uses the Steelers stadium. This is a stadium fill swap in the
existing comp style; it does not ask for a new layout or engine choice.

Use this checklist before candidate selection, source retrieval, authoring and
visual handoff. It records Jerami's corrections in the Chiefs chat
`01a18967-0f3d-7101-b280-087d5e7a743f`. Later clarifications control earlier loose
wording. The production reference owns exact Figma measurements. This checklist
does not approve a new design, engine, cutout or final scene.

Apply each correction by its lane and condition. Team names, player names and
scene IDs identify examples; they do not restrict a correction to that video.
Do not add an episode restriction unless Jerami states one.

## selection across all 7 lanes

| Correction | When | Required action |
| --- | --- | --- |
| `mix`, `rejections` | Photos and Quick Stats dominate the first pass | Review the full transcript across all 7 lanes. Search gaps for stronger treatments. Keep plausible candidates for review; reject on transcript fit, not convenience or missing artwork. |
| `pacing` | Comparing camera time with insert time | Treat 80–84% camera time as a loose guide. Short videos may differ. Do not block a good candidate to hit a ratio. |
| `candidate-pool` | Revising the scene mix | Preserve the reviewed pool while looking for better fits. Jerami's acceptance of 17 candidates did not set a quota; cutting to 13 was not the requested fix. |
| `stronger-options` | Jerami chooses a stronger treatment | Use that choice in place of the matching weaker candidate. Examples: Allen vs Worthy, Wilson vs Downs, and the Pickens breakdown. |
| `remove-run-game` | Jerami removes a candidate | Remove it from the active selection and do not restore it as filler. Example: “RUN GAME STALLS → OBVIOUS PASSING DOWNS.” |

## lanes

Lane numbers follow `config/lineups/engine-routing.json`. A stale canvas label
does not change a lane's identity. Preserve existing scene IDs and artwork when
resolving a numbering conflict; this record does not authorize moving live boards.

| Lane | Corrections and conditions | Reference or limit |
| --- | --- | --- |
| 1 / Quick Action Photo | Apply shared framing and initial-headroom checks. Keep as a candidate where it adds value; do not use it to avoid reviewing a stronger treatment. | No new type size or duration was set by this correction batch. |
| 2 / Quick Stat | `blue-retired`: stop using the retired blue callouts. For Team callout, use the current white source. Apply shared wash, framing and headroom checks. | [White Team callout](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/lineups?node-id=1843-1021). Other approved Quick Stat options keep their registered sources. |
| 3 / Stat Breakdown | `stat-type`: use Mahomes as the readable subject/support-type baseline for the 3-point and 4-point Figma sources. Apply framing against the actual photo slot beside the data panel. `existing-bars`: when a passage fits an existing bar treatment, recover that source instead of defaulting to a generic breakdown. | [Mahomes](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/lineups?node-id=1976-5088): subject 40 px Inter Bold; support 36 px Inter italic. Preserve headline and main-value styles. Bar example: “What the Chiefs already have,” using the earlier Chiefs/Bills treatment and its recorded engine route. |
| 4 / Comparison | Apply visible-person framing to each slot. If a label names a person, center it above that person's head/upper body. Preserve live user edits. | [Wilson / Downs](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/lineups?node-id=1985-4488). Cinematic 2-up keeps full photos, both visible from the opening. Do not apply Asset Swap cutout rules to it. |
| 5 / Year-by-Year + Value Metrics | Use for trends over time or related metrics that support one point. Review the existing table and bar treatments for both. | [Seattle value metrics](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/lineups?node-id=1949-3691): 20 points scored, 3 points allowed, 0 KC red-zone trips. |
| 6 / Asset Swap | `subject-labels`: center a person's label optically above their head/upper body. `label-color`: matching era labels use the same approved white treatment; reuse the outline/shadow for contrast. `kelce-copy`: when showing eras, put the year/era above each photo and keep the team logo centered. | [Kelce example](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/lineups?node-id=2008-4494): 2022 above left, CURRENT above right, Chiefs logo on the 960 px centerline. Final human visual review pending. Set copy and optical alignment from the subjects being shown. |
| 7 / Recurring Board | Review when the transcript supports a recurring premise. Apply shared source, editability and visual-review rules. | No new board-specific styling was requested in this batch. Keep its approved type and cumulative reveal behavior. |

## shared visual conditions

| Correction | If | Then | Does not mean |
| --- | --- | --- | --- |
| `person-framing` | A person sits in a full-frame, split or stat-panel photo slot | Align the visible head and body within the usable slot. Compare with Jerami's edited crops. | Centering the image rectangle proves good framing. |
| `initial-headroom` | The source has space above the head or helmet | Preserve it at the initial frame. Reposition before enlarging. Keep full-photo slots covered. | Invent missing head pixels when the original is already clipped. |
| `push-exception` | The inherited photo push later crops the head | Keep the initial framing correct and preserve the approved push. | Add a new final-frame headroom gate or redesign motion. |
| `wash-limit` | A contrast wash darkens a photo | Cap effective darkening at 20%. Do not stack a second wash. | |
| `wash-lock` | A wash lies over editable art | Lock the wash so a click can reach the photo or text. Lock all wash overlays. | Lock all scene content, or restyle other pages while locking. |
| `subject-labels` | A caption identifies a person | Center it over the visible head/upper body. Check the pose visually. | Use transparent file padding, an extended leg or container center as the label anchor. |
| `label-color` | Matching era labels cross light and dark background areas | Keep one white title treatment and reuse its approved outline/shadow. | Turn one matching label black, darken the whole scene, or ban dark text on white cards and canvas notes. |

The [Mahomes photo](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/lineups?node-id=1976-5089)
and [Downs photo](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/lineups?node-id=1976-4924)
show Jerami's corrected framing. Preserve their live transforms; do not restore
the earlier center crops. For the 4-point Stat Breakdown, label 4 repeats label
3's style. These type sizes do not replace other lanes' approved typography.

## workspace and continuity

| Correction | Condition and action |
| --- | --- |
| `six-boards` | Use at most 6 episode boards across each canvas row, then start another row. This is not a scene-card count within a lane. |
| `manual-board-move` | Read live canvas positions first and preserve Jerami's moves. Example: Week 8 moved to row 2, with Chiefs placed to its right. |
| `source-repair` | If a source conflicts with an agreed rule, fix the affected source properties, verify the repair, then build. Preserve unrelated properties, native motion and live user edits. Do not patch only the episode and leave the source stale. |
| `continuity` | Carry the correction, lane, affected role, condition, source example and review state into the next build. Use the approved source and compare the current screenshot with the applicable example. Do not make Jerami restate a recorded rule. |
| `direct-link` | Every visual handoff includes a direct link to the exact current scene. Geometry and timing checks do not establish visual approval. |
| `figma-first`, `finish-figma` | When Jerami asks for Figma first, follow that work order and finish the authorized remaining scenes. Keep separately recorded engine routes and review gates. |
| `kelce-art` | When Jerami approves the shown cutouts, record that approval against those assets and continue the authorized build without asking again. The same condition applies wherever cutout review is required, including Simple and Full Comparison. |
| `deadline` | Use the confirmed deadline in the task and work record. Example: “tomorrow 10am,” confirmed October 29, means October 30, 2026 at 10 AM America/New_York. |

## review before handoff

1. Read the live source and episode edits. Resolve any conflict before building.
2. Apply only the rules for the chosen lane, role and condition above.
3. Inspect a current 1920 x 1080 screenshot for visible-person framing, initial
   headroom, label alignment, matching text treatment and readable type. Inspect
   motion separately when motion changed. Preserve native tracks and editability.
4. Return the exact scene link and state what remains for human review. Do not
   label a scene visually approved because a validator passed.

Jev classifies where each recorded correction belongs. It does not decide
whether to obey it, explain a result or approve the scene. The episode's
`storyboard/figma-build/corrections/ledger.json` retains each supplied excerpt,
condition, applicable lanes, local Jev result and operator scope assessment.
Its scores are relative and uncalibrated. Where the broad section choice differs,
the explicit correction and its lane/condition remain authoritative.
