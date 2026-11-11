# Lineups treatment system

Use this index for Catena Media Lineups. Read the current
[corrections](lineups-corrections.md), then load the rows for the work at hand.
Keep lane, option, setting and engine as separate fields.

## choose the stage

| Label | When to load | Required reference | Finish check |
| --- | --- | --- | --- |
| SELECT | Find scenes or write copy | [Selection](lineups-selection.md) and [7 lanes](lineups-lanes.md) | Full transcript reviewed; candidates tied to its revision |
| ASSET | Find, crop or mask art | [Assets](lineups-assets.md) and the selected lane | Source checked; correct crop and alpha; no duplicate image |
| BUILD | Make or edit a scene | [Build](lineups-build.md), selected lane and template | Engine recorded; locked parts preserved; speech cues bound |
| TEAM | Use team cards or a team callout | [Team routes](lineups-team-routes.md), plus BUILD | Exact template and surface version loaded |
| REVIEW | Export, place or close an episode | [Review](lineups-review.md) and [delivery](lineups-delivery-contract.md) | Current visual, timing and delivery evidence passes |

During discovery, read all 7 lanes. During a build, read only the selected lane
plus BUILD and any needed ASSET or TEAM rules. These labels route reading;
they do not replace the seven lanes or waive a gate.

## choose the source

- **Engine:** `config/lineups/engine-routing.json`. Player 2-up requires Jerami's
  Figma or Blender choice. Fixed routes keep their recorded engine. Unreal is
  retired for new builds. A Blender route needs a lane master that Jerami
  approved in `blenderVariants`.
- **Template:** `config/lineups/template-registry.json`. Resolve its exact key.
  Read the linked native manifest before editing.
- **Surface:** `config/lineups/design-registry.json`. All Team Cards use
  `rank-card.sculpted-satin` version 2. Only its card background changes.
- **Episode:** the scene manifest owns team, art, copy, ranks and speech cues.

The [contract gate](lineups-contract-gate.md) checks BUILD
and REVIEW evidence. It owns the shared checklist.

## handle a conflict

Apply Jerami's latest instruction within its stated scope. Check current
corrections and the exact template binding. Old examples cannot change a new
surface lock. Keep visual approval, native build proof and episode timing as
separate states. A passed data check does not prove the picture is right.

Use [episode lifecycle](lineups-episode-lifecycle.md) for ingest, prior-work
recovery and closeout. Reuse saved work before rebuilding it.
