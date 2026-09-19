# Motion Cue Map

Use this reference after the Edit Style Profile and target storyboard select a
motion beat.

## purpose

The Edit Style Profile sets the client's measured rhythm. The Motion Cue Map
turns one target passage into timed visual events.

Use the profile percentages and average visual-change interval as runtime
targets. Choose beats that carry meaning. Do not add filler to reach a count.

## trigger types

- `WORD` uses a verified word timestamp.
- `PHRASE` uses a verified transcript-segment boundary.
- `EDIT` uses a cut, gap, or silent title-card boundary.

Do not invent a word timestamp from a phrase-level transcript. Run Whisper with
word timestamps or keep the trigger at the verified phrase boundary.

Each cue row records:

```text
scene | target range | trigger type | trigger text or edit point
visual response | reference family and range | primary engine | duration
```

## renderer-neutral contract

Store the approved beat in `motion.cues`. Do not copy timing by eye between
tools. Each cue records:

```text
cueId | elementId | triggerType | triggerText | transcriptTimestamp
sceneTime | action | duration
```

Use this equation:

```text
sceneTime = transcriptTimestamp - verifiedAnchorTimestamp
```

The Lineups hook rejects cue math that differs by more than 0.001 seconds. It
also requires `entranceTimes` to match the cue list in order. The frame rate is
stored as a numerator and denominator. Use `24000 / 1001` for a 23.976 Premiere
sequence.

Name one engine for the beat. Figma and Manim can share the same cue contract.
They cannot both own the same animation.

For Lineups `Rank Reveal`, the fixed relationship is narrower: Figma Motion is
the engine and Manim is the timing validator. Set `motion.engine` to `figma`,
`motion.engineVersion` to `figma-motion`, and `motion.timingValidator` to
`manim`. Manim checks the transcript anchor, cue equation, frame rate, order,
and duration. It does not render or rebuild the ranking board.

## Figma Motion workspace

Load `figma-use` and `figma-use-motion`.

1. Keep approved source components unchanged.
2. Create one top-level timeline frame per selected beat on a client motion page.
3. Verify the approved canonical instance, then detach the episode working copy
   before writing descendant keyframes. Figma's Plugin API cannot write motion
   to instance sublayers.
4. Animate descendants. Never animate the page-level timeline frame itself.
5. Set the timeline duration to the target beat length.
6. Use manual keyframes for phrase-specific choreography.
7. Name animated layers after their cue, such as `CUE / decompress` or
   `CUE / medications`.
8. Read back tracks and export one low-resolution motion sample before handoff.

For Rank Reveal, a static Figma instance does not pass. Rank 10 is the only
state that animates the full board: begin at scene time 0 and stagger the row
shells 10 through 1. At the verified team cue, reveal the rank-10 team name and
normalized logo. Ranks 9 through 1 keep the board and every previously revealed
rank visible; animate only the newly revealed team name and normalized logo at
that scene's verified team cue. Never inherit or replay Rank 10's board cascade
on a later state. The manifest and live track readback must agree before export.
The detached copy is the motion artifact; the canonical component remains the
only reusable visual source.

Figma Motion owns phrase-timed 2D scenes and alpha overlays when it is the named
engine. Premiere owns dialogue timing, pacing, sound, assembly, and export.

## Manim timing gate

Manim does not render Lineups scenes. It runs after Whisper has produced the
word-level transcript and before the associated Pre-Figma review page is
generated. It validates the Whisper word anchors, scene-time math, frame rate,
and duration before the candidate review is published or Figma Motion work
begins.

1. Keep Figma as the approved visual source and Figma Motion as the sole engine.
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

## canonical client profile

Keep one approved Edit Style Profile per client and presentation style. Store
the durable profile and cue map with the client in Eagle. Figma stores the
approved states and motion workspace. A later video reuses the client profile,
then maps new transcript passages to the same families.

After delivery, compare the final edit against the profile. Record approved
changes in the client profile before the next video.
