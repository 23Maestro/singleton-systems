# Week 7 Figma review

Current Eagle exports: all 23 Figma scenes are in Week 7 / 06 Motion Renders (`MVHEBR73ZGKA6`). Names use the full `01-of-30` episode order. Existing Unreal scenes at 06, 23, 25 and 30 stay in place. The folder has 27 clips; 10, 17 and 29 are unused alternative slots. All 23 new files passed full decode and 1920 × 1080 / 25 fps checks. Eagle copies match the export SHA-256 hashes. The 4 existing Unreal hashes match their recorded values. These exports include the current title padding, gradients and Team-card baseline. Proof: `eagle-export-manifest.json`, `eagle-export-probe.json`, `eagle-export-readback.json` and `eagle-export-verification.json` in the episode figma-build folder. Premiere assembly remains open.

Current Team-card baseline: Jerami’s latest Bears P04 edits now set the 5 px logo-block border, 3 px accent with square ends and revised corner bend. The Chiefs, Jaguars and 49ers episode cards match it. All 4 reusable Team variants match too, with their own team colors and white upper text. The original Bears card stays as edited. Exact path and glow checks passed on all 8 cards. Current still: `week7-team-card-baseline-v2.png`. Proof: `team-card-baseline-v2.json`, `team-card-baseline-v2-episode.json` and `team-card-baseline-v2-sources.json`. This replaces the earlier Chiefs polish reference below. The `team-polished.mp4` previews predate this stroke and bend update; motion cues stay unchanged.

[Open Week 7](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1855-3320). All 23 primary scenes are built. Visual review remains open.

Older episodes stay left to right at y=0. Week 7 starts the next row at x=0, y=13660, below Big Ten. Its scenes stay in their lane grids.

All 10 right panels use the softer user-edited gradient angle. Vikings and Jaguars keep their exact edits. The other panels use the Vikings stop pattern with their own colors. Black is farther toward the secondary-color edge. The Rank Reveal source remains `1277:558`. It uses real shadcn table cells from the discovered Community kit. Team callouts use `1843:1021`.

All 12 photos retain the packet hashes and appear once. The missing Packers logo came from the official NFL club asset. Its source and hash are saved in the build evidence.

The earlier 23 MP4 previews were checked at 1920 × 1080 at 25 fps. Ranking previews from that batch are now stale after the type, row, gradient and motion refinements. Current motion checks are `week7-R10-refined.mp4`, `week7-R06-refined.mp4` and `week7-R01-refined.mp4`. Manual reveal cues stay unchanged. Each current-row highlight now uses Ravens’ slide-and-fade settings at its own cue. No exit keys were added. Final hold samples differ by at most 1/255 in grayscale after scaling; equal-value native keys confirm the hold. Quick Action pushes run 113 frames (4.52 seconds), then hold in a 10-second preview. MP4 lengths include the renderer’s extra end frame.

Evidence: `final-audit.json`, `source-measurements-current.json`, `build-binding.json`, `photo-upload-readback.json`, `video-probe.json`, `video-hold-pixel-difference.json`, and `verification-summary.json` in the episode’s `storyboard/figma-build` folder. Initial scripts record build steps; the palette, source, layout and Chiefs correction files record later changes.

Previews: `/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/previews/week7-{SCENE_ID}-current.mp4`. Use the `-refined.mp4` ranking examples for the latest review. Earlier `-review.mp4` exports are stale.

| Scene | Figma |
| --- | --- |
| R10 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1855-3537) |
| R09 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1855-3937) |
| R08 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1857-7244) |
| R07 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1857-7675) |
| R06 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1857-8100) |
| R05 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1857-8531) |
| R04 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1857-9393) |
| R03 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1857-9850) |
| R02 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1857-10298) |
| R01 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1857-10757) |
| S01 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1860-7726) |
| P01 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1860-7818) |
| P02 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1860-7831) |
| P03 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1860-7844) |
| P04 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1860-7863) |
| P05 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1860-7890) |
| P06 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1860-7903) |
| P07 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1860-7916) |
| P08 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1860-7929) |
| P09 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1860-7942) |
| P10 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1860-7979) |
| P13 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1860-8044) |
| P14 | [Open](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1860-8091) |

Asana [Edit Week 7 rankings](https://app.asana.com/1/1216086803382161/project/1218890014545436/task/1219719334956962) remains open for visual review and the remaining production work. Unreal and Premiere were outside this build.

Portfolio checkpoint available: Week 7 / Build. Proposed visuals: the ranking lane grid and Quick Stats callout grid. Verified facts: 23 native scenes, team colors, current source IDs and 1080p/25 fps exports. Missing proof: Jerami’s visual approval. Decision: save, revise, or skip. No Eagle write has been made.

All 100 table team-name fields are 64 px. The canonical source has the same 64 px setting. Rows are 81.9 px tall, up 5% from 78 px. The body is 819 px tall. Header and right panel align with the expanded table. Text and logos stay centered in each row. Long names fit. Evidence is in `ranking-refinement-*.json`.

The current Chiefs and Jaguars callouts are now reusable Team variants in Components: [variant family](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/lineups?node-id=1870-1105), [instance previews](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/lineups?node-id=1870-1107). The Chiefs source keeps ID `1843:1021`; Jaguars is `1870:1070`. Upper-card text defaults to white in both. A fresh instance and Team switch were checked. The subject, talking point and logo stay editable. The saved image is `team-callout-variants-current.png`. Earlier source measurements for the standalone `1843:1021` are stale; `team-variant-build.json` and `team-variant-test.json` record the current family.

Bears P04 and 49ers P14 now use the Team callout treatment too. Both have white upper text, team colors, a large logo and a Hug body. The original photo nodes and hashes stay the same. P04 reveals at 4.44 seconds; P14 reveals at 0.78 seconds. Both keep the 11.5-second native timeline and no exit. Current 1920 × 1080 / 25 fps previews are `week7-P04-team-card.mp4` and `week7-P14-team-card.mp4`. Earlier P04/P14 cyan-card exports and readbacks are stale. Current proof is `bears-49ers-team-cards.json`. The family now has Chiefs, Jaguars, Bears and 49ers.

Pending new look: Team callout family. Chiefs P13 has a live polish test: 18 px top-left and bottom-right rounding, a curved gold inverted-L accent ending at the bottom edge, and a soft glow. Only P13 has the test. Review it before applying the polish to the reusable variants or other teams. Current proof is `week7-chief-card-gold-trial.png`; rollback values are in `chiefs-gold-trial.json`. Earlier P13 motion exports predate this polish test.

Jerami’s adjusted Chiefs accent is the latest polish reference. The top segment spans the logo block, the curve and placement were edited, and the glow has 6 layers. Exact geometry and effect cloning passed. The saved repeat recipe is `chiefs-user-adjusted-reference.json`; the current image is `week7-chief-card-user-adjusted.png`. For other teams, replace the stroke and all glow colors together with the team accent color. No rollout was done during this repeatability check.
