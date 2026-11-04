---
name: lineups-editor
description: Use for Catena Media Lineups episodes, approved lanes, Figma/Unreal builds and reviewed delivery.
---

# Lineups editor

Start with the [stage index](references/lineups-treatment-system.md) and
[current corrections](references/lineups-corrections.md). Load the references
for the current stage. Keep lane, option, setting and engine separate.

| Work | Read |
| --- | --- |
| Ingest or close an episode; recover prior work | [Episode lifecycle](references/lineups-episode-lifecycle.md) |
| Review the transcript and choose scenes | SELECT in the stage index |
| Find or prepare art | ASSET; [asset search](references/lineups-asset-search.md) for missing art |
| Build or repair a scene | BUILD; TEAM when the scene uses team cards |
| Bind speech and motion | [Motion contract](references/lineups-motion-contract.md) |
| Export, import or deliver | REVIEW; [delivery contract](references/lineups-delivery-contract.md) |

Use `s-systems:client-video-storyboard` for shared intake and Premiere handoff.
Asana owns the episode task. Eagle owns source assets. The episode record keeps
scene IDs, transcript revisions, engine choices and review evidence.

Before Figma work, load `singleton-figma-system` and its Lineups production
reference. Reuse the current registered source. Bind speech cues before mutation.
Preserve live user edits and scoped approvals. Recover the matching prior handoff
before calling a source missing; reconcile a conflicting rule at its owner.

The [contract gate](references/lineups-contract-gate.md) owns shared
build and handoff checks. Follow the episode's declared order. A passing check
cannot supply visual approval or prove delivery. Use the shared review engine
for frame comments, review batches and sending.
