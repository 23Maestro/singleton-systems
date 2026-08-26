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

Use its seven lanes, approved options, automatic routing, action-photo rules,
pacing profile, pruning rule, and pre-Premiere screenshot gate. Keep Jerami's
working language to lane, option, and setting. Figma implementation terms stay
inside the Figma-system skill.
