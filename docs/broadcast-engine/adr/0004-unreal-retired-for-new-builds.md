---
status: accepted
---

# Unreal retired for new builds

On November 10, 2026, Jerami moved new LineUps builds from Unreal to Figma or
Blender. This supersedes the Unreal exception in ADR 0001: the Unreal
comparison template no longer stays in production for new episodes.
`config/lineups/engine-routing.json` lists Unreal under `retiredEngines`, and
the contract gate rejects it at `before-build`. Saved Unreal sources, exports
and approvals stay as history and keep their delivery checks.

A Blender lane master enters production only when Jerami approves it. Record
that approval in `blenderVariants`. A prototype, working template or render is
not approval. Later on November 10, Jerami approved the Lane 4 player 2-up
master and the Lane 3 stat card (variant 3B). The Lane 3 Prime station (3A)
is parked.
