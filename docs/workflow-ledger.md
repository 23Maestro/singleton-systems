# Video Workflow Pipeline

Selected workflows: Lineups and Intent Keys. Matching component roles use each client’s own sources. Other workflows are not yet indexed.

Generated from the shared JSON records. Edit the records, then regenerate both views.

Record SHA-256: `2d966f23072ba8c19a5d7752a30e4eca70880414d6937940dfb488206f6865e4`

- [Lineups](#lineups)
- [Intent Keys](#intent-keys)

## Lineups

Catena Media · Transcript-led football edits with linked production rules and proof.

| Component | What it does | Source | Checks | Example | Evidence |
| --- | --- | --- | --- | --- | --- |
| Skills + contracts | Keep the client rules and approved work steps available in each chat. | [Lineups skill](<../plugins/s-systems/skills/lineups-editor/SKILL.md>) | [Routing tests](<../scripts/check-lineups-skill-routing.mjs>) | [Week 7 handoff](<handoffs/2026-10-21-week7-figma-review.md>) | documented — The source playbook exists. Installed discovery is a separate check. |
| Scene manifest + schema | Give each scene a build sheet with its source, assets, timing and export settings. | [Scene schema](<../config/lineups/scene-manifest.schema.json>) | [Enforcement tests](<../scripts/check-lineups-enforcement.mjs>) | [Week 7 handoff](<handoffs/2026-10-21-week7-figma-review.md>) | documented — Schema found. A filled build sheet is not proof of a finished scene. |
| Whisper word timestamps | Attach a clock to each spoken word so graphics can follow the right phrase. | [Transcript checks](<../tools/lineups_motion/timing_evidence.py>) | [Cue tests](<../tools/lineups_motion/tests/test_cue_contract.py>) | [Week 7 handoff](<handoffs/2026-10-21-week7-figma-review.md>) | documented — The contract requires word timestamps. A new transcript still needs source review. |
| CueContract + Manim | Check that each graphic enters on its spoken cue and uses the right frame rate. | [CueContract](<../tools/lineups_motion/cue_contract.py>)<br>[Manim proof](<../scripts/lineups-cue-proof.mjs>) | [Timing tests](<../tools/lineups_motion/tests/test_cue_contract.py>) | [Week 7 handoff](<handoffs/2026-10-21-week7-figma-review.md>) | documented — This is the Figma production timing path. Manim checks math, not artwork. |
| Template registry + source guards | Point to the approved parts and protect the values an episode must keep. | [Template registry](<../config/lineups/template-registry.json>)<br>[Source guards](<../config/lineups/source-guards.json>) | [Template tests](<../scripts/check-lineups-templates.mjs>) | [Rank Reveal source](<https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/Lineups?node-id=1277-558>) | documented — Registered sources exist. Each engine keeps its own review state. |
| Enforcement hooks | Stop covered tool actions when required scene or timing proof is missing. | [Lineups hook](<../.codex/hooks/lineups_enforcement.py>) | [Hook tests](<../scripts/check-lineups-enforcement.mjs>) | [Week 7 handoff](<handoffs/2026-10-21-week7-figma-review.md>) | documented — Source found. This page does not prove the hook is active in every app. |
| Discovery ledger | Record which transcript moments were considered across all 7 lanes and why. | [Discovery checks](<../tools/lineups_motion/discovery.py>) | [Discovery tests](<../scripts/lineups-discovery.test.mjs>) | [Week 7 handoff](<handoffs/2026-10-21-week7-figma-review.md>) | documented — The ledger requires coverage evidence. An agent must still review the whole transcript. |
| Regression tests | Try known good and bad cases so later changes do not restore old errors. | [Test entry points](<../package.json>) | [Behavior tests](<../scripts/check-lineups-enforcement.mjs>)<br>[Cue tests](<../tools/lineups_motion/tests/test_cue_contract.py>) | [Week 7 handoff](<handoffs/2026-10-21-week7-figma-review.md>) | documented — Test sources found. Their latest run is not claimed by this ledger. |
| Readbacks + hashes + receipts | Check the actual file or app result and bind that proof to the version checked. | [Media evidence](<../tools/lineups_motion/media_evidence.py>)<br>[Premiere delivery](<../tools/lineups_motion/premiere_delivery.py>) | [Delivery tests](<../tools/lineups_motion/tests/test_premiere_delivery.py>) | [Week 7 handoff](<handoffs/2026-10-21-week7-figma-review.md>) | documented — Week 7 records export hashes and readback. Its Premiere gate was still open in that record. |
| Correction records | Save your feedback with its lane and condition so the next build can apply it. | [Correction guide](<../plugins/s-systems/skills/lineups-editor/references/lineups-corrections.md>) | Not linked | [Edited crop example](<https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/lineups?node-id=1976-5089>) | documented — Current local guide found. No automatic visual-approval check is claimed. |

## Intent Keys

Intent Solutions · Max provides screen recordings and a brief. The edit teaches one keyboard lesson.

| Component | What it does | Source | Checks | Example | Evidence |
| --- | --- | --- | --- | --- | --- |
| Skills + contracts | Keep client rules and lesson steps with the edit. | [Video workflow skill](<../../motion-studio/skills/video-workflows/SKILL.md>)<br>[Intent Keys guide](<../../motion-studio/skills/video-workflows/references/intent-solutions.md>) | Not linked | Not linked | documented — Client instructions and locked style exist locally. |
| Edit plan + source ranges | Record the chosen source ranges and the cut clock. | [E02 Short edit plan](<../../motion-studio/comps/intent-keys-e02/short-point-v07/edit.json>)<br>[E02 cut script](<../../motion-studio/comps/intent-keys-e02/short-point-v07/make-cut.py>) | Not linked | Not linked | documented — This is one Short’s edit plan. A reusable Intent scene schema is not verified. |
| Word timestamps | Align the words with the audio from this cut. | [Audio alignment](<../../motion-studio/comps/intent-keys-e02/short-point-v07/align-captions.py>)<br>[Aligned words](<../../motion-studio/comps/intent-keys-e02/short-point-v07/aligned-words.json>) | [Caption timing check](<../../motion-studio/comps/intent-keys-e02/short-point-v07/test_timing.py>) | Not linked | documented — The alignment is tied to this cut’s audio. Listening still matters. |
| Caption timing + Manim | Drive the active caption from the aligned word times. | [Manim captions](<../../motion-studio/comps/intent-keys-e02/short-point-v07/manim_captions.py>) | [Rendered word checks](<../../motion-studio/comps/intent-keys-e02/short-point-v07/test_timing.py>) | Not linked | documented — The check samples 4 rendered words. It does not prove every word is correct. |
| Style + composition | Keep the client’s caption style and lesson framing. | [Short caption style](<../../motion-studio/styles/intent-keys/short-captions.json>)<br>[E02 Short composition](<../../motion-studio/comps/intent-keys-e02/short-point-v07/build.mjs>) | Not linked | Not linked | documented — The local composition is an episode example. A shared template registry is not verified. |
| Enforcement hooks | Keep required checks from being skipped. | Not linked | Not linked | Not linked | blocked — No Intent-specific enforcement hook has been verified. |
| Story selection | Choose a clear lesson from the source transcript. | [E02 edit plan](<../../motion-studio/comps/intent-keys-e02/short-point-v07/edit.json>) | Not linked | Not linked | documented — The selected Short is recorded. A reusable discovery ledger is not verified. |
| Regression tests | Check known timing and output problems. | [Caption timing test](<../../motion-studio/comps/intent-keys-e02/short-point-v07/test_timing.py>) | [Caption timing test](<../../motion-studio/comps/intent-keys-e02/short-point-v07/test_timing.py>) | Not linked | documented — The test covers selected captions and the audio hash. It does not check every edit or cut. |
| Readbacks + review | Link the rendered version and separate review from automated checks. | Not linked | Not linked | [E02 Short review v07](<https://drive.google.com/file/d/1QslYkjuRe1XS6TPo_WUcMpynZjA8MXoA/view?usp=drivesdk>) | documented — The review link points to the E02 Short. Listening at each join is not recorded as complete. |
| Correction records | Carry client feedback into the next episode. | [E02 cut script](<../../motion-studio/comps/intent-keys-e02/short-point-v07/make-cut.py>)<br>[E02 composition](<../../motion-studio/comps/intent-keys-e02/short-point-v07/build.mjs>)<br>[Caption alignment](<../../motion-studio/comps/intent-keys-e02/short-point-v07/align-captions.py>) | Not linked | Not linked | blocked — These sources show parts of the fixes. A complete version-linked correction ledger is not yet built. |

## How to read evidence

Documented means the source was found. Checked needs a linked test result for its stated revision. Approved needs a linked human decision. A linked example alone proves neither.

See [the harness guide](harness/workflow-ledger.md) for record ownership and update steps.
