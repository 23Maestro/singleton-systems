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

## Lineups treatment rule (locked)

Start from transcript meaning and finished-edit precedent. Do not start from the
current Figma masters. Rank reveal is conditional inventory for episodes that
actually rank teams or players; it is not the default Lineups structure.

Choose the lightest treatment that proves the passage:

1. quick action photo;
2. action photo plus compact stat;
3. two-player comparison;
4. compact table or year trend;
5. conditional rank or section reveal;
6. rare designed explanatory or asset-swap scene.

Use Mark plus a quick action photo for ordinary name mentions, connective
language, repeated claims, and numbers that do not change the argument. Use a
compact stat only when one number is the evidence. Use a two-player scene for one
shared measure; use a table when the audience must compare multiple rows,
seasons, or measures. Reserve designed scenes for claims whose meaning cannot
be communicated by a photo or compact comparison.

Preserve the measured Lineups pacing unless the current finished-export profile
changes it: about 84% Mark, about 16% inserts, a typical five-second insert, 75%
at eight seconds or less, 90% at twelve seconds or less, and roughly one insert
every 41 seconds.

Treat people count, stat count, rows, states, and geometry as editorial inputs.
Expose them through named slots, text/boolean/instance-swap properties, and
variants. Keep typography, spacing, color, safe areas, and Lineups identity
guarded.

Do not report a player asset as missing before using the approved retrieval
path. Search Eagle first, then retrieve a current action image through the
installed player-asset path or direct SportsDB/OpenWiki calls. Prefer official
game or practice action photography. Use a roster portrait only as an identity
fallback and a transparent action pose when isolation is required. Verify
current team and jersey number against the official roster before labeling.

For ranked episodes only, use this pattern:

```text
rank reveal -> Mark begins the why -> transcript-selected supporting treatment
            -> ordinary later mentions get a quick action photo
```

After each ranked announcement, inspect the transcript and select the first
clear passage whose meaning benefits from visual support. Do not create another
full scene for every later name-drop and do not force an asset swap when a
single composition communicates the beat.

Locked Denver example:

- `00:37.600-00:47.960`: Nik Bonitto + Jonathon Cooper, football-blur
  background, Broncos logo centered high.
- At `00:44.320`, reveal `22 COMBINED SACKS`.
- End before Vance Joseph. Vance is a quick still afterward, not another full
  composition.
