---
name: client-video-storyboard
description: Use for an edit-ready storyboard, client video test edit, transcript decision breakdown, Eagle asset set, or Premiere setup packet.
---

# Client Video Storyboard

Use for an edit-ready client video packet, not content strategy or a full edit.

```text
Eagle     -> assets, transcript, references, review context
Premiere  -> bins, timeline, exports
Codex     -> source mapping, storyboard, checklist
```

1. Confirm source media, transcript/script, client notes, references, runtime,
   aspect ratio, captions, and delivery requirements.
2. Read `references/storyboard-workflow.md` and create the packet.
   Use `references/storyboard-template.md` when it needs asset intake, decision
   labels, or a fuller Premiere handoff table.
   Keep Jerami's working packet between 300 and 500 words. Put raw transcript,
   ingest detail, and machine checks behind links. If the review cannot fit,
   route it to a dated interactive Decision Map.
3. Keep each storyboard row to one meaningful screen change.
4. Use `s-systems:eagle` for asset operations.
5. Before any Premiere import, read
   `references/premiere-ingest-contract.md`. Import every asset
   into its numbered role bin and apply the agreed color label to the project
   item immediately. The import response is not proof. Resolve the new item ID,
   move it to the destination bin ID, then reread its `treePath`. Never leave
   imported media in the project root.
6. Before Premiere mutation, inspect project info, sequences, items, active
   sequence, and bins. If the bridge is unavailable, stop at the packet.

An ingest is complete only when a readback shows the asset under the intended
bin path and the project item has the intended label. Repair failures before
timeline work. Do not defer project-panel cleanup.

Do not create sequences, change a timeline, overwrite exports, or save over a
client project without an explicit review checkpoint.

## Lineups transcript-motion rule (locked)

For ranked Lineups videos, use this editorial pattern every time:

```text
rank reveal -> Mark begins the why -> one purpose-built transcript scene per team
            -> ordinary name mentions afterward get a quick still and move on
```

After each team announcement, inspect the transcript and select the first clear
8-10+ second passage whose meaning benefits from more than a picture. Build one
designed scene around that exact passage. Do not create another full scene for
every later name-drop and do not force an asset swap when a single composition
communicates the beat.

The transcript determines the scene range, people/logo arrangement, swaps, and
whether a stat callout is warranted. Only after locking the passage should the
agent inventory existing assets and request the specific missing transparent
people/action assets. Team logos are handled in Figma.

Locked Denver example:

- `00:37.600-00:47.960`: Nik Bonitto + Jonathon Cooper, football-blur
  background, Broncos logo centered high.
- At `00:44.320`, reveal `22 COMBINED SACKS`.
- End before Vance Joseph. Vance is a quick still afterward, not another full
  composition.
