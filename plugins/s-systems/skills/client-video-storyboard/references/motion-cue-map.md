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

Store the frame rate as a numerator and denominator. Use `24000 / 1001` for a
23.976 Premiere sequence.

Name one engine for the beat. Figma and Manim can share the same cue contract.
They cannot both own the same animation.

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

Figma Motion owns phrase-timed 2D scenes and alpha overlays when it is the named
engine. Premiere owns dialogue timing, pacing, sound, assembly, and export.

## canonical client profile

Keep one approved Edit Style Profile per client and presentation style. Store
the durable profile and cue map with the client in Eagle. Figma stores the
approved states and motion workspace. A later video reuses the client profile,
then maps new transcript passages to the same families.

After delivery, compare the final edit against the profile. Record approved
changes in the client profile before the next video.

For Catena Media Lineups only, use `s-systems:lineups-editor` for its timing
proof, engine exceptions and Rank Reveal rules.
