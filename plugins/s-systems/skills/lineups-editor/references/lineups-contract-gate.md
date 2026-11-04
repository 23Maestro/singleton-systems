# Lineups contract gate

One checker serves build, measured readback and handoff. The
[stage index](lineups-treatment-system.md)
routes reading. The registry owns template IDs; the design registry owns surface
versions. Current corrections apply to their named lanes. Episode data cannot
change either source contract.

## checks

| Check | Required evidence |
| --- | --- |
| Source | Current template key, source ID and template hash |
| Team styling | Approved per-team fills, strokes, corners and effects |
| Text | Full approved copy, font, size, line height, spacing and alignment |
| Artwork | Visible logo pixel bounds within the slot; approved size and center limits |
| Cues | Locked motion hash, unchanged transcript and current Manim receipt for either engine |
| Order | Approved episode roster; required Figma export files before Unreal |
| Appearance | Review of opening, cue and final hold frames from the exact export |

Appearance review covers headroom, callouts, accents, team backgrounds, logos,
copy, template use, workflow and composition. Inspect heads and helmets at the
opening when the source has room. Preserve user crop edits. The inherited final
push does not add a separate headroom approval gate.

## evidence

Bind `contractGate` in the scene manifest. `templateBinding` records `key` and
`templateSha256`; Unreal also binds `nativeManifestSha256`. `spec`, `measurement` and `visualReview` each reference a file
by `path` and `sha256`. Hashes use SHA-256; JSON hashes use sorted compact keys.

The registry pins `requiredRoles` and `requiredTeamRoles` for each template.
The spec must include every named role with its required kind and team identity.
Measure extra scene roles too. These are evidence slots, not new layout rules.
Logo statement includes its separate `team-background`. Rank Reveal includes
`focus.panel`, `focus.logo` and `focus.text`, plus every rank row.

The spec binds the scene, template hash, roles, protected properties, teams,
palette sources, cues and order. Native specs also bind `nativeManifestSha256`. Copy these from reviewed sources. Record the existing
scoped approval with reviewer, source and the unsigned spec hash. Do not create
approval from a passing check.

Save measured properties from the native app, including distinct node IDs and
source revision. Figma tool responses include the same `contractMeasurement`;
the hook rejects a saved file that differs from that readback. Logo proof uses transparent pixels and their measured frame
bounds (`pixelMapping: axis-aligned`). Rasterize vector logos without a background. Unsupported transforms
need measured flattened artwork; container size alone cannot pass.

Visual review binds the spec, measurements, scene, cues and export. Each check
needs a result and a short observation. Hashes detect stale evidence; they do
not authenticate a reviewer or judge a picture.

## run

Send `{ "root": "/episode/root", "manifest": { ... } }` on stdin:

```sh
python3 scripts/lineups-contract-gate.py before-build < request.json
python3 scripts/lineups-contract-gate.py after-build < request.json
python3 scripts/lineups-contract-gate.py before-handoff < request.json
```

Native manifests use schemaVersion 2 and `motion.engineVersion: unreal-sequencer`.
Issue their timing proof with `tools.lineups_motion.timing_evidence --issue`.
It validates Whisper words, cue math, discovery and padding for the saved engine.
The shared gate checks that receipt before build and handoff.

`source` checks identity only. It cannot authorize a build or handoff. Missing
evidence blocks production. Existing exports keep their historical status;
new builds and handoffs must bind current proof. This check changes no artwork or installed plugin.

## coverage

The Figma mutation hooks, transaction reconciliation and Premiere delivery use
this checker. Native production runs call the CLI before build and handoff;
legacy Unreal trial scripts are not a production runner. The old comparison
trial rejects production contracts. Satin v2 has native approval in the design
registry. Each episode still needs its own timing and export review.
