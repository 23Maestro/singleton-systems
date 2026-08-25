# Edit Style Profile

Use this gate whenever a client supplies a finished video as an editing
reference. Audit the full runtime before designing the target edit.

## Event ledger

Create one timecoded row for every meaningful screen state. Start at the first
frame and end at the final frame. Rows must cover the runtime with no gaps or
overlaps.

```text
start | end | duration | base visual | overlays | transition
purpose | reusable pattern | likely engine | audio note
```

Use a mutually exclusive base visual value:

- speaker
- B-roll
- vertical footage
- still image
- full-screen graphic
- end card
- black or hold

Record overlays separately. Include lower thirds, labels, captions, callouts,
speaker graphics, and branding. Split a row when the base visual, overlay,
framing, or transition changes meaningfully.

Scene detection finds candidates. It does not replace frame review. Inspect
contact sheets across the full runtime, then review exact frames around every
candidate boundary. Mark an audio cue as confirmed only after listening.

## Required metrics

Calculate all durations against the full runtime:

- speaker visible percentage
- speaker-only percentage
- speaker plus graphics percentage
- B-roll percentage
- full-screen graphics percentage
- vertical footage and still-image percentage
- graphic occurrence count and average hold
- punch-in count and frequency
- B-roll insert count and frequency
- title-card, lower-third, and end-card counts
- average time between meaningful visual changes

State the counting rules beside the metrics. Keep base categories mutually
exclusive. Overlay counts may overlap them.

## Pattern families

Group repeated choices into reusable families. Each family needs source ranges,
layout rules, motion behavior, editorial purpose, and likely engine.

```text
Edit Style Profile
  -> Figma components and approved states
  -> Figma Motion or another selected motion engine
  -> Premiere editorial rhythm and assembly
```

## Target storyboard gate

Do not map target footage until the ledger, metrics, and families exist. Each
target row must contain:

```text
reference range and pattern
  -> matching target transcript beat
  -> preserve, adapt, or improve
  -> Figma, Remotion, or Premiere
```

Approval of the profile does not authorize Premiere mutation.
