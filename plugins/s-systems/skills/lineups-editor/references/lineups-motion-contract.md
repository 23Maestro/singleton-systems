# Lineups motion contract

Use only for Catena Media Lineups. Follow the treatment system's current
per-scene engine route before authoring. Player 2-up asks Figma or Unreal with
no default. Keep approved fixed team routes and their pending-review states.
Production Unreal remains disabled until episode timing and handoff proof pass.
The Figma contract below applies to the Figma production path; never route an
Unreal review copy through Figma receipts.

For every Figma production motion candidate, use this fixed contract:

- `motion.engine` is `figma` and `motion.engineVersion` is `figma-motion`;
- `motion.timingValidator` is `manim`;
- Whisper supplies word-level transcript timestamps;
- Manim validates transcript cue math, frame rate, and composition timing only;
- Figma Motion is the sole visual motion engine and must have read-back manual
  keyframe tracks aligned to every approved non-zero cue;
- each composition is at least 10 seconds long and extends at least two seconds
  beyond its final content cue for trim-safe Premiere placement;
- Premiere places the rendered scene at the verified transcript anchor and does
  not retime the motion by eye.

The Lineups hook rejects cue math that differs by more than 0.001 seconds. It
also requires `entranceTimes` to match the cue list in order. The frame rate is
stored as a numerator and denominator. Use `24000 / 1001` for a 23.976 Premiere
sequence.

For Lineups `Rank Reveal`, the fixed relationship is narrower: Figma Motion is
the engine and Manim is the timing validator. Set `motion.engine` to `figma`,
`motion.engineVersion` to `figma-motion`, and `motion.timingValidator` to
`manim`. Manim checks the transcript anchor, cue equation, frame rate, order,
and duration. It does not render or rebuild the ranking board.

For Rank Reveal, a static Figma instance does not pass. Rank 10 is the only
state that animates the full board: begin at scene time 0 and stagger the row
shells 10 through 1. At the verified team cue, reveal the rank-10 team name and
normalized logo. Ranks 9 through 1 keep the board and every previously revealed
rank visible; animate only the newly revealed team name and normalized logo at
that scene's verified team cue. Never inherit or replay Rank 10's board cascade
on a later state. The manifest and live track readback must agree before export.
The detached copy is the motion artifact; the canonical component remains the
only reusable visual source.

## Figma production timing gate

Manim does not render Lineups scenes. It runs after Whisper has produced the
word-level transcript and before the associated Pre-Figma review page is
generated. It validates the Whisper word anchors, scene-time math, frame rate,
and duration before the candidate review is published or Figma Motion work
begins.

1. Keep Figma as the approved visual source and Figma Motion as the sole engine
   for this production path.
2. Set `motion.engine` to `figma`, `motion.engineVersion` to `figma-motion`, and
   `motion.timingValidator` to `manim`.
3. Keep `motion.sourcePath` and `motion.sceneClass` null.
4. Run Manim against the completed Whisper transcript and cue map.
5. Record the passed cue-proof receipt before generating the Pre-Figma review page.
6. Load the validated contract with `validate_manim_timing_from_manifest()`.
7. Write the validated cue times into Figma Motion manual keyframes.
8. Make every composition at least 10 seconds long and keep at least two seconds
   after its final content cue for trim-safe Premiere placement.

```bash
node scripts/lineups-cue-proof.mjs \
  --manifest path/to/scene-manifest.json \
  --output path/to/cue-proof
```

The proof command captures the frame before, at, and after every cue. Review
those images before setting the manifest proof status to `passed`.

```python
from tools.lineups_motion.manim_scene import validate_manim_timing_from_manifest

CONTRACT = validate_manim_timing_from_manifest()
```

Run the timing validation from the repository root so it can import the shared
helper:

```bash
PYTHONPATH=. LINEUPS_MANIFEST_PATH=path/to/scene-manifest.json \
  python3 -c 'from tools.lineups_motion.manim_scene import validate_manim_timing_from_manifest; validate_manim_timing_from_manifest()'
```
