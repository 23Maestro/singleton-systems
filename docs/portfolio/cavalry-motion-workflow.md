# Cavalry Motion Workflow

## Decision

Cavalry is the project’s dedicated 2D motion-design tool. It replaces the
typical After Effects role for kinetic typography, procedural graphic systems,
and restrained transitions. It does not replace Blender, and it does not turn
Remotion into an animation editor.

```text
Transcript + storyboard
  -> Remotion: clean, programmable comps and transparent assets
  -> Cavalry: art-directed 2D motion, type, reveal systems, graphic transitions
  -> Blender: real assets, paper, camera, lighting, depth, and physical space
  -> Editor: dialogue, sound, pacing, and final assembly
```

## Tool Boundaries

| Tool | Owns | Does not own |
| --- | --- | --- |
| Remotion | repeatable grids, data-led layouts, transparent source assets | the final “motion-design” feel |
| Cavalry | typography choreography, callouts, procedural rigs, 2D transitions | room lighting, physical food assets, or camera realism |
| Blender | desk world, paper material, shadows, cans/food, dimensional camera movement | complex editorial text animation |
| Editor | timing against voiceover, sound design, final picture edit | rebuilding individual visual systems |

## Motion Rule

Every storyboard beat gets one primary owner before it is built. A visual may
travel to another app as an exported asset, but it should not be reconstructed
in more than one place.

Use Cavalry when the idea is readable as graphic choreography. Use Blender when
the idea depends on light, camera parallax, contact shadows, or a real object.

## Current Film

### Storyboard Map

| Beat | Visual job | Primary owner | Handoff |
| --- | --- | --- | --- |
| Opening setup: “I have a story for you” | Cream paper field, restrained archive frame, logo only if a clean approved asset is available | Cavalry | Hold long enough for the narration to establish the story |
| “Good old year of 1944” | `1940s` settles, then the `0s` recede and the `4` resolves into `1944` | Cavalry | Researcher plates begin after the year is legible |
| “A group of researchers” | Four transparent ink portraits stagger in as printed evidence, with two stronger foreground figures and two lighter background figures | Cavalry | Portraits hold while the speaker names the study |
| “36 men volunteer” / “Minnesota Starvation Experiment” | The title card gives way to the clinical 6x6 participant grid | Remotion, then Blender | Grid becomes a physical paper layer on the desk |
| Starvation phase | Grid darkens and scales down while calendar sheets flip through the six-month progression | Remotion, then Blender | Camera trucks away from the calendar world |
| Return of food and mania | Pantry assets drift or tumble into physical space; Gotham callouts float as restrained labels; yellow appears as a controlled light accent | Blender with Cavalry accents | Editorial assembly owns the final timing and sound |

### Scene 0: 1940s -> 1944

Primary owner: Cavalry.

- Warm white/near-paper field with black Gotham type and the approved Choose Courage logo.
- The opening uses the PDF's archive-card language: `WORLD WAR II` replaces the
  template label, the logo settles with a restrained blur-like fade, tracks right,
  and clears before `1940s` takes focus.
- `1940s` enters with a short, weighted settle, not a bouncy preset.
- The two zeroes quietly lose presence first; the `4` arrives on the spoken
  clarification of `1944`.
- Four graphic researcher portraits appear after the year is understood. Each
  has its own transparent image layer and an ink reveal: 14 frames per image,
  5 frames between images, then a static hold. The larger pair establishes the
  composition; the lighter pair sits behind the year as printed evidence. They
  are graphic plates, not animated people. There is no jitter, bounce, or fake
  parallax in Cavalry.
- In Blender, those image plates sit 2-4 mm above the paper and inherit only a
  tiny camera-parallax shift and soft contact shadow as the document tilts onto
  the desk. This is where the card becomes a real object.
- Export a transparent title pass if Blender needs to place it over the desk,
  otherwise export the full matte.

### Scene 1: Clinical Setup

Primary owners: Remotion then Blender.

- Remotion owns the disciplined 36-person grid and its fade/stagger.
- Blender turns that grid into a paper object in the desk world: fine paper
  texture, shallow bend, contact shadows, restrained camera push.

### Scene 2: Starvation Phase

Primary owners: Remotion then Blender.

- Remotion owns the factual darkening/scaling and calendar labels.
- Blender owns calendar paper flips and the camera move that leaves the grid.

### Scene 3: Return of Food and Mania

Primary owners: Blender with Cavalry accents.

- Blender owns pantry assets, food/can motion, light, debris, and the physical
  reveal from the paper world.
- Cavalry may provide a small number of Gotham labels/callouts. Yellow remains
  a light or accent, never a flat poster-card background.

## Cavalry Integration V1

The first integration is deliberately user-triggered and local:

1. Project-owned JavaScript UI scripts live in `cavalry/scripts/`.
2. In Cavalry, use `Help > Show Scripts Folder`, then copy the needed script
   into that folder once.
3. Run the needed script from `Window > Scripts`.
4. Save the resulting `.cv` scene inside the project and render from Cavalry’s
   Render Manager.

This gives Codex a stable, reviewable surface to build and improve without
depending on GUI clicking or remote-control claims.

## Automation Reality

Cavalry 2.7.2 has a documented JavaScript API for building layers, setting
attributes, creating connections, and render-time scene preparation. Its
unattended CLI rendering, `--prompt`, and render/list commands are Enterprise
features, so we do not make a paid license a hidden requirement for this
workflow.

V1 is therefore: scripts create or modify a scene in the app; the artist
reviews and renders. If the project later earns Enterprise, the same scene and
asset conventions can be connected to headless rendering rather than rebuilt.

## First Kit

`cavalry/scripts/build-1944-title.js` is the initial scene-builder. It creates
the Scene 0 typographic timing and four editable transparent researcher layers.
It intentionally does not add jitter, “motion lines,” fake 3D, or an oversold
research-paper effect. Those would be the wrong source of quality for this beat.

## Storyboard Intake

Before building, map each transcript section with these fields:

```text
timecode | spoken beat | visual job | motion owner | assets | output | review note
```

That map decides whether a beat belongs in Remotion, Cavalry, Blender, or stays
editorial footage. It keeps us from forcing a Blender task into Cavalry or a
motion-design task into programmed CSS.
