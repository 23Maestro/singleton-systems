---
name: client-video-storyboard
description: Use for a URL or local client video that needs breakdown, an edit-ready storyboard, Eagle asset matching, or a reviewed Premiere handoff.
---

# Client Video Storyboard

Use for a client video breakdown and edit-ready packet, not content strategy or
an unreviewed full edit.

```text
Eagle     -> assets, transcript, references, review context
Premiere  -> bins, timeline, exports
Codex     -> source mapping, storyboard, checklist
```

1. Confirm the URL or local source, client profile, transcript/script, notes,
   references, runtime, aspect ratio, captions, and delivery requirements.
2. When a client supplies a style reference, read
   `references/reference-edit-profile.md`. Audit the reference from its first
   frame through its final frame before mapping any target footage. Produce the
   event ledger and quantified Edit Style Profile. A sampled moment is an
   example, not a profile.
3. Read `references/storyboard-workflow.md` and create the packet.
   Use `references/storyboard-template.md` when it needs asset intake, decision
   labels, or a fuller Premiere handoff table.
   Keep Jerami's working packet between 300 and 500 words. Put raw transcript,
   ingest detail, and machine checks behind links. If the review cannot fit,
   route it to a dated interactive Decision Map.
4. Prefer native captions, then local Whisper. Use ffprobe, scene detection,
   adaptive sampling, a compact frame manifest, and contact sheets only when
   the profile needs visual analysis.
5. Keep each storyboard row to one meaningful screen change and one primary
   engine.
6. When a mapped beat needs animation, read
   `references/motion-cue-map.md`. Use the client Edit Style Profile to set the
   cadence, then bind each reveal to a verified transcript phrase or edit point.
   Load `figma-use` and `figma-use-motion` when Figma Motion owns the beat.
7. Use `s-systems:eagle` for asset operations.
8. Before any Premiere import, read
   `references/premiere-ingest-contract.md`. Import every asset
   into its numbered role bin and apply the agreed color label to the project
   item immediately. The import response is not verification. Resolve the new item ID,
   move it to the destination bin ID, then reread its `treePath`. Never leave
   imported media in the project root.
9. Before Premiere mutation, inspect project info, sequences, items, active
   sequence, and bins. If the bridge is unavailable, stop at the packet.

An ingest is complete only when a readback shows the asset under the intended
bin path and the project item has the intended label. Repair failures before
timeline work. Do not defer project-panel cleanup.

Do not create sequences, change a timeline, overwrite exports, or save over a
client project without an explicit review checkpoint.

## Lineups gate

For every Catena Media Lineups edit, read
`references/lineups-treatment-system.md` before transcript mapping, asset
selection, Figma work, or Premiere mutation.

At episode ingest and closeout, also read
`references/lineups-episode-lifecycle.md`. Use one Linear issue and one project
record per video. Set its due date from the confirmed delivery deadline. Use
the locked Pre-Figma and Post-Figma review UIs. A team or topic is episode data;
it cannot change the shared UI or create a new option.

Use its seven lanes, approved options, automatic routing, action-first asset
rules, transcript-copy rule, pacing profile, pruning rule, and pre-Premiere
screenshot gate. Keep Jerami's working language to lane, option, and setting.
Figma implementation terms stay inside the Figma-system skill.

When a Lineups option needs Figma, load `singleton-figma-system` and read that
skill's `lineups-production-system.md` reference before building. Do not rebuild
an approved option from loose layers when its source component already exists.

Before the first Lineups Figma mutation, create and activate the scene manifest.
The manifest must already contain the verified transcript anchor, rational frame
rate, cue list, `entranceTimes`, approved Figma source, episode instance, and
motion ownership. The Lineups Figma file fails closed when no active manifest
exists. Do not build static compositions first and add timing later.

For every Lineups motion candidate, use this fixed contract:

- `motion.engine` is `figma` and `motion.engineVersion` is `figma-motion`;
- `motion.timingValidator` is `manim`;
- Whisper supplies word-level transcript timestamps;
- Manim validates transcript cue math, frame rate, and composition timing only;
- Figma Motion is the sole visual motion engine and must have read-back manual
  keyframe tracks aligned to every approved non-zero cue;
- each composition is at least 10 seconds long and extends at least two seconds
  beyond its final content cue for trim-safe Premiere placement;
- Premiere places the rendered scene at the verified transcript anchor and does
  not retime the motion by eye.

Stop before Figma when the transcript anchor, Manim timing validation, Figma
Motion tracks, or approved source cannot be named and verified. For Rank Reveal,
also require the normalized canonical source and its cumulative 10-to-1 state.
Only Rank 10 may animate the full board cascade. Ranks 9 through 1 animate only
the current team name and normalized logo while prior reveals remain visible.
