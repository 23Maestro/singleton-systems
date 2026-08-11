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
2. Read `references/storyboard-workflow.md` and create the packet.
   Use `references/storyboard-template.md` when it needs asset intake, decision
   labels, or a fuller Premiere handoff table.
3. Prefer native captions, then local Whisper. Use ffprobe, scene detection,
   adaptive sampling, a compact frame manifest, and contact sheets only when
   the profile needs visual analysis.
4. Keep each storyboard row to one meaningful screen change and one primary
   engine.
5. Use `s-systems:eagle` for asset operations.
6. Before Premiere mutation, inspect project info, sequences, items, active
   sequence, and bins. If the bridge is unavailable, stop at the packet.

Do not create sequences, change a timeline, overwrite exports, or save over a
client project without an explicit review checkpoint.
