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
2. Create the packet from `docs/portfolio/client-video-storyboard.md` in the
   Singleton Systems repository.
3. Keep each storyboard row to one meaningful screen change.
4. Use `s-systems:eagle` for asset operations.
5. Before Premiere mutation, inspect project info, sequences, items, active
   sequence, and bins. If the bridge is unavailable, stop at the packet.

Do not create sequences, change a timeline, overwrite exports, or save over a
client project without an explicit review checkpoint.
