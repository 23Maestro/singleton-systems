# Blender skill coverage

The broadcast engine borrows from one public skill pack. This page records
what it covers, where it conflicts with the engine, and what the engine skill
must add.

## Installed pack

- Upstream: <https://github.com/RobLe3/cc-blender-skill>, commit
  `a2634b588e80265e796aa53f8ab178d75105c2af` (2026-10-12), version 1.4.0, MIT.
- Pristine copy: `~/.claude/vendor/cc-blender-skill` with `PINNED.txt`.
- Installed: 30 skills in `~/.claude/skills/`, installed 2026-11-05.
- Change from upstream: every `allowed-tools` line was removed. Upstream
  pre-approved Bash for all 30 skills and asset downloads for one. Normal
  permission prompts apply instead.
- Left out: the pack's `tests/`, which run code and open a local socket.
- The pack expects a live Blender MCP session. No MCP is configured yet.

## Coverage against the technique spec

| Spec area | Pack coverage | Engine action |
| --- | --- | --- |
| Engine choice | `blender-rendering` has a Cycles or EEVEE decision tree | Reuse |
| Studio and HDRI light | `blender-lighting` covers three-point, HDRI and studio rigs | Reuse. Add the team rim rule |
| Metals, glass, anisotropy | `blender-materials` | Reuse |
| Camera, push, depth of field | `blender-cameras` | Reuse. Add drift on every hold |
| Glare and bloom | Mentioned in `blender-rendering` and `blender-cameras` | Add glare as its own layer |
| Motion blur | `blender-rendering` | Add step counts for 3 to 6 frame slams |
| Look matching to a reference | `reference-look-calibration` | Reuse for proof-frame checks |
| Motion QA | `animation-quality-gate` makes contact sheets | Reuse for slam and drift checks |
| HUD and ring motion | `orbital-hud-motion` | Reference for rotating rings behind marks |
| Logo from references | `mascot-logo-reconstruction` | Reference only. Engine logos come from SVG |
| Headless fill from JSON | Not covered | Build |
| Film Transparent and alpha | Not covered | Build |
| ProRes 4444 output | Not covered | Build. Settings are tested in the technique spec |
| SVG logo extrusion, bevel, weighted normals | Not covered | Build |
| Team hex to linear color | Not covered | Build |
| Slam and settle motion | Not covered | Build |
| Brand-made mattes and wipes | Not covered | Build |
| Transcript and Manim cue timing | Not covered | Build from the LineUps CueContract |

## Conflict to resolve

`blender-rendering` says never to use the Standard view transform and to use
AgX for almost everything. That holds for photographic renders. It breaks team
brand colors, because AgX desaturates bright color.

Engine rule: for broadcast graphics and any frame with registered team colors,
the engine skill wins. Use Standard, or Khronos PBR Neutral for lit logos.
The engine skill must say so in its own text. The registry and the proof-frame
color check enforce it.

## Build later

1. The engine skill. Slot contract, `fill.py`, render flags, output checks,
   and the precedence rule above.
2. An authoring MCP. Official Blender Lab MCP or blenderwright, on localhost,
   for building lane masters in the GUI. Production renders stay on the
   command line.
3. Scripts: SVG to beveled logo, hex to linear, proof-frame color readback,
   ProRes 4444 alpha probe, slam timing check.
4. Upstream updates. Diff a new upstream commit against the pristine copy
   before reinstalling, and strip `allowed-tools` again.
