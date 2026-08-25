# Cowboys Expectations Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task by task. Repository rules keep execution in the current task and prohibit subagent dispatch. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the Cowboys Expectations visual plan from finished-edit evidence, then encode the approved Lineups rules so future storyboards reach a reliable first pass without repeating the same drift.

**Architecture:** Work in two gated passes. The production pass audits five finished Catena exports, maps the Cowboys transcript from zero to end, and rebuilds only the treatments Jerami approves. The contract pass adds a focused Lineups decision reference to the canonical storyboard skill and pins its required gates in the repository checks.

**Tech Stack:** Premiere Pro MCP, Premiere native transcript, Eagle, Figma Lineups library, approved motion owner discovered from a completed scene, Markdown skill contracts, Node.js Cerebral checks.

---

## Scope and alignment state

Confirmed from the current Cowboys sequence:

- V5 has 11 callout clips.
- V6 and V7 have no rendered motion scenes.
- Several callout exports have dirty alpha edges, opaque framing, or poor crops.
- A rapid group of names over an 8–12 second passage should become one composed scene when separate still swaps would feel rushed.
- A single name followed by roughly 4–8 seconds of explanation usually supports one clean still.
- Motion explanations should run 8–12 seconds.

These remain proposed until the finished-edit audit and Jerami's checkpoint:

- which of the 11 callouts stay;
- the final callout count;
- whether all four identified transcript spans become motion scenes;
- the Mark-to-insert ratio for this episode;
- the exact Figma-to-motion handoff used by the completed Lineups edits;
- whether the ranked-video rule applies to this single-topic Cowboys episode.

No production reset is approved by this plan. Premiere and Figma mutation start only after Task 2 is accepted.

## File map

Production evidence:

- Create: `docs/handoffs/2026-08-24-cowboys-expectations-alignment.md` — short approval packet with benchmark evidence, Cowboys candidates, and the keep/change decision.
- Use read-only: `/Volumes/MediaSSD/05_FINISHED/Catena Media/2026-08-11_NFL_AWARDS_v1.mp4`
- Use read-only: `/Volumes/MediaSSD/05_FINISHED/Catena Media/2026-08-17_RamsTalent.mp4`
- Use read-only: `/Volumes/MediaSSD/05_FINISHED/Catena Media/2026-08-13_Top5_Defenses_v1.mp4`
- Use read-only: `/Volumes/MediaSSD/05_FINISHED/Catena Media/2026-08-12_SuperBowlBubble_v2.mp4`
- Use read-only: `/Volumes/MediaSSD/05_FINISHED/Catena Media/2026-08-13_Top5_Offenses.mp4`
- Use read-only: Figma `lineups`, node `428:27` — approved components and episode boards.
- Use read-only until approval: Premiere sequence `1d87a35c-266a-4a9b-9d90-012c50814421`.

Contract hardening:

- Create: `plugins/s-systems/skills/client-video-storyboard/references/lineups-visual-decision-contract.md` — format fork, treatment rules, evidence fields, and QC gate.
- Modify: `plugins/s-systems/skills/client-video-storyboard/SKILL.md` — route Lineups work through the new reference before storyboard or Premiere work.
- Modify: `plugins/s-systems/skills/client-video-storyboard/references/storyboard-workflow.md` — require benchmark evidence and motion-deliverable proof before timeline mutation.
- Modify: `plugins/s-systems/skills/client-video-storyboard/references/storyboard-template.md` — separate spoken beat from actual insert window and record the treatment owner.
- Modify: `scripts/check-cerebral-drift.mjs` — pin the new contract and its required phrases.

Unrelated working-tree changes in `tsconfig.json` and `tools/figma/lineups-nfl-rolodex/` stay untouched.

### Task 1: Build the finished-edit benchmark

- [ ] **Step 1: Confirm the five comparison exports**

Use the five unique files listed in the file map. Exclude `2026-08-12_SuperBowlBubble_v1.mp4` because `v2` is the delivered revision.

Expected: five comparison videos with no duplicate version of the same edit.

- [ ] **Step 2: Record the delivery envelope**

Run:

```bash
for file in \
  "/Volumes/MediaSSD/05_FINISHED/Catena Media/2026-08-11_NFL_AWARDS_v1.mp4" \
  "/Volumes/MediaSSD/05_FINISHED/Catena Media/2026-08-17_RamsTalent.mp4" \
  "/Volumes/MediaSSD/05_FINISHED/Catena Media/2026-08-13_Top5_Defenses_v1.mp4" \
  "/Volumes/MediaSSD/05_FINISHED/Catena Media/2026-08-12_SuperBowlBubble_v2.mp4" \
  "/Volumes/MediaSSD/05_FINISHED/Catena Media/2026-08-13_Top5_Offenses.mp4"
do
  ffprobe -v error -select_streams v:0 \
    -show_entries stream=width,height,r_frame_rate:format=duration \
    -of default=noprint_wrappers=1 "$file"
done
```

Expected: width, height, frame rate, and runtime for all five exports.

- [ ] **Step 3: Audit the visual grammar**

Watch each export and record these exact fields in `docs/handoffs/2026-08-24-cowboys-expectations-alignment.md`:

```markdown
| Export | Runtime | Mark % | Photo | Photo + stat | Stat-only | Motion | Typical insert | Longest insert | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
```

Classify by what is visibly on screen. Count a designed multi-person or system scene as motion even when its movement is restrained. Count a lower-third number over a person as photo + stat. Count a full-frame text card with no person as stat-only.

Expected: every insert in all five exports has one classification and one visible time range.

- [ ] **Step 4: Derive a range, not a new arbitrary ceiling**

Add the median and observed range for Mark percentage, insert duration, insert cadence, motion scenes per video, and stat-only cards per video.

Expected: the Cowboys recommendations cite finished-edit evidence. They do not assume every spoken number earns a card.

### Task 2: Hold the alignment checkpoint

- [ ] **Step 1: Classify the episode format**

In the alignment packet, choose one and cite the transcript structure:

```text
RANKED LINEUPS: repeated rank reveal and one team thesis per ranked entry
SINGLE-TOPIC LINEUPS: one team argued across several sections without repeated rank reveals
```

Expected: the ranked rule is applied only when the episode actually follows the ranked structure.

- [ ] **Step 2: Show the disagreement table**

Add this table with evidence-filled rows:

```markdown
| Decision | Current cut | Finished-edit precedent | Proposed correction | Jerami decision |
| --- | --- | --- | --- | --- |
| Total callouts | 11 on V5 | benchmark count and range | keep only proven central claims | approve / revise |
| Motion scenes | 0 rendered | benchmark count and range | transcript candidates below | approve / revise |
| Mark coverage | measure current sequence | benchmark range | episode-specific target | approve / revise |
| Motion path | markers only | trace one completed scene | reuse observed owner and handoff | approve / revise |
```

Expected: Jerami can correct any disputed assumption without reviewing a full timeline rebuild.

- [ ] **Step 3: Stop for approval**

Do not remove callouts, build Figma frames, import media, or change the Premiere timeline until Jerami approves the table.

Expected: the packet is marked `In Review`; production remains unchanged.

### Task 3: Produce the zero-to-end Cowboys map

- [ ] **Step 1: Read the Premiere-native transcript**

Use sequence `1d87a35c-266a-4a9b-9d90-012c50814421`. Read the existing Premiere transcript through the available Premiere MCP path. Do not transcribe through Descript or another service.

Expected: transcript words and timing remain sourced from Premiere.

- [ ] **Step 2: Map every spoken interval**

Use these columns:

```markdown
| Spoken beat | Actual insert window | Treatment | On-screen subject | Asset | Primary owner | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
```

Fill all time from zero to sequence end. Mark-led connective sections remain explicit rows. An insert window covers only the time the insert appears; it does not inherit the full spoken-beat range.

Expected: no timeline gaps and no implied full-length insert holds.

- [ ] **Step 3: Test the four motion candidates**

Evaluate these as candidates, not preapproved scenes:

```text
00:01:22.80–00:01:32.76  CeeDee Lamb, George Pickens, Javonte Williams, line
00:07:38.52–00:07:49.80  Quinnen inside; Gary, Lawrence, Von on edges
00:10:34.12–00:10:44.56  Caleb Downs role map
00:12:58.60–00:13:10.00  interior, edge, linebacker transition
```

Approve a candidate only when it passes one of these tests:

```text
NAME DENSITY: two or more people are discussed inside an 8–12 second passage and still swapping would rush the idea.
SYSTEM MEANING: positions, roles, fronts, or relationships need a composed explanation that a single photo cannot carry.
```

Expected: each candidate is marked `MOTION`, `PHOTO`, `MARK`, or `CHECK` with one sentence of evidence.

- [ ] **Step 4: Rejudge all 11 existing callouts**

For each current V5 callout, keep it only if the number is the central proof, the finished edits support that treatment, and the composite passes visual QC. Mark the rest `SCRAP` or convert them to `PHOTO`, `MOTION`, or `MARK`.

Expected: callout count follows evidence from the five finished edits. No fixed quota is invented.

### Task 4: Prove the established motion path

- [ ] **Step 1: Trace one completed Lineups motion scene**

Pick one known designed scene from the five finished exports. Match its export time to the Figma frame, Eagle source assets, and Premiere project item. Record the observed chain in the packet:

```text
Figma component/frame -> observed motion owner -> rendered file -> Premiere 06 Motion Renders -> timeline
```

Expected: the motion owner comes from a completed project artifact. A default routing guess does not replace the observed path.

- [ ] **Step 2: Assign one owner to each approved Cowboys scene**

Reuse the traced owner for the repeatable Lineups scene family unless Jerami approves a different owner. Record dimensions, frame rate, duration, alpha policy, codec, destination bin, and review format.

Expected: every approved motion row has one owner and one complete delivery envelope before scene work.

- [ ] **Step 3: Inventory Eagle before sourcing**

Search the dated Cowboys episode folder and the shared NFL player/coach folders. Reuse the cleanest existing asset. Flag duplicates and poor transparent crops. Request or source only the missing people required by approved rows.

Expected: no duplicate sourcing and no asset is selected without a visual crop check.

- [ ] **Step 4: Build the approved Figma boards**

Use the approved Lineups components at Figma node `428:27`. Build only approved `MOTION` rows. Use clean people/action crops, team logos, and the existing broadcast field treatment. Add a stat inside the scene only when the approved row says the number is central proof.

Expected: each board communicates one transcript idea and has a readable 8–12 second reveal plan.

### Task 5: Rebuild the Cowboys sequence safely

- [ ] **Step 1: Duplicate the active sequence**

Create a review sequence named `Cowboys Expectations_ALIGNMENT_v2`. Keep sequence `1d87a35c-266a-4a9b-9d90-012c50814421` unchanged as rollback evidence.

Expected: edits occur only in the duplicate.

- [ ] **Step 2: Remove only approved scraps**

Lift V5 clips marked `SCRAP` without rippling dialogue or the base picture. Keep any approved card, photo, or motion row at its reviewed insert window.

Expected: sequence duration and dialogue timing do not change.

- [ ] **Step 3: Ingest approved assets by role**

Import stills into `05 Stills` and rendered scenes into `06 Motion Renders`. Apply the project labels during ingest. Reread every project item's `treePath` before timeline placement.

Expected: no new asset remains at the Premiere project root.

- [ ] **Step 4: Inspect every composite in the Program Monitor**

Check the first, middle, and last frame of each insert at 100% view. Reject black alpha fringes, dirty rounded corners, opaque full-frame mattes, stretched crops, hidden faces, and unreadable type.

Expected: every approved insert passes the actual composite, not only its source thumbnail.

- [ ] **Step 5: Run the cadence comparison**

Compare the rebuilt cut with the finished-edit benchmark. Report Mark percentage, insert percentage, insert count, callout count, motion count, median insert duration, 75th percentile, 90th percentile, and average cadence.

Expected: any outlier has a transcript-based reason. Otherwise revise before export.

- [ ] **Step 6: Export a review copy**

Export to `07 Exports` with a new review name. Do not overwrite an existing client export.

Expected: Jerami can compare the original working cut and alignment cut side by side.

### Task 6: Encode the approved Lineups contract

- [ ] **Step 1: Write the focused decision reference**

Create `plugins/s-systems/skills/client-video-storyboard/references/lineups-visual-decision-contract.md` with this structure and approved wording:

```markdown
# Lineups visual decision contract

## Format fork
- Ranked episodes use the rank-reveal pattern in the main skill.
- Single-topic episodes use section theses and do not force one scene per team.

## Treatment tests
- Rapid multi-name passages: test one 8–12 second motion composition.
- One person with 4–8 seconds of explanation: prefer one clean photo hold.
- System or role explanation: use motion only when relationships need to be shown.
- Stat treatment: require a central proof claim and finished-edit precedent.
- Connective reasoning and conclusions: keep Mark visible.

## Evidence fields
- Record the spoken beat separately from the actual insert window.
- Record the on-screen subject, asset, primary owner, proof, and status.

## Premiere gate
- Do not mutate the timeline while an approved motion row has no rendered deliverable.
- Do not duplicate a graphic until its first Program Monitor composite passes crop, alpha, edge, and readability checks.
```

Expected: the file contains the approved rules only. Project-specific Cowboys timestamps stay in the handoff packet.

- [ ] **Step 2: Route the main skill through the reference**

Add this sentence before `## Lineups transcript-motion rule (locked)` in `plugins/s-systems/skills/client-video-storyboard/SKILL.md`:

```markdown
For every Lineups episode, read `references/lineups-visual-decision-contract.md` before asset selection, storyboard approval, or Premiere mutation.
```

Expected: ranked and single-topic Lineups work both hit the decision contract.

- [ ] **Step 3: Add the production gates to the workflow**

Under the Catena / Lineups profile in `references/storyboard-workflow.md`, add:

```markdown
Benchmark treatment count and cadence against the approved finished-edit set. Separate the spoken beat from the actual insert window. Timeline mutation stays blocked while an approved motion row has no rendered deliverable.
```

Expected: the workflow blocks marker-only motion planning from being reported as production progress.

- [ ] **Step 4: Expand the storyboard template**

Replace the short storyboard-row instruction with this required schema:

```markdown
| Spoken beat | Actual insert window | Treatment | On-screen subject | Asset/search task | Premiere bin | Primary owner | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

Expected: spoken context and visual duration can no longer collapse into one timestamp field.

- [ ] **Step 5: Pin the contract in the drift check**

Add this check object to `scripts/check-cerebral-drift.mjs`:

```javascript
  {
    file: path.join(pluginRoot, "skills", "client-video-storyboard", "references", "lineups-visual-decision-contract.md"),
    must: [
      "## Format fork",
      "Rapid multi-name passages",
      "actual insert window",
      "approved motion row has no rendered deliverable",
      "Program Monitor composite",
    ],
  },
```

Expected: deleting or renaming a production gate fails `check:cerebral`.

- [ ] **Step 6: Run the focused checks**

Run:

```bash
npm run check:cerebral
npm run check:cerebral:registry
npm run check:cerebral:hook-routing
rg -n "Descript|one scene per team|full beat.*insert|marker.*motion render|all_buckets|Linear ledger" \
  plugins/s-systems/skills/client-video-storyboard \
  plugins/s-systems/skills/eagle-skill \
  config/cerebral-registry.json \
  .codex/hooks/cerebral_singleton_guard.py
```

Expected: all three checks pass. The scan returns no stale transcription route, blanket single-topic scene rule, collapsed timestamp rule, marker-as-render claim, retired Lane value, or retired task ledger language.

- [ ] **Step 7: Review and sync plugin mirrors**

Run:

```bash
npm run plugins:sync
```

Expected: dry-run output lists only the reviewed `client-video-storyboard` changes and the new reference. After Jerami approves that diff, run:

```bash
npm run plugins:sync:apply
```

Expected: repository plugin source and installed mirrors match.

- [ ] **Step 8: Commit the contract separately**

Run:

```bash
git add \
  plugins/s-systems/skills/client-video-storyboard/SKILL.md \
  plugins/s-systems/skills/client-video-storyboard/references/lineups-visual-decision-contract.md \
  plugins/s-systems/skills/client-video-storyboard/references/storyboard-workflow.md \
  plugins/s-systems/skills/client-video-storyboard/references/storyboard-template.md \
  scripts/check-cerebral-drift.mjs
git commit -m "fix: lock Lineups visual decision gates"
```

Expected: the commit excludes `tsconfig.json`, `tools/figma/lineups-nfl-rolodex/`, and production media.

## Final review gate

The plan is complete only when:

- Jerami approves the Task 2 disagreement table.
- The Cowboys zero-to-end map has no uncovered time.
- Spoken beats and insert windows are separate.
- Each approved motion row has a real render and one observed owner.
- The rebuilt sequence preserves dialogue timing.
- Every insert passes Program Monitor QC.
- Cowboys cadence is compared with five unique finished edits.
- The skill contract reflects the approved rule, not an unreviewed Cowboys-specific guess.
- Cerebral, registry, and hook-routing checks pass.
- The plugin mirror dry run contains no unrelated change.
