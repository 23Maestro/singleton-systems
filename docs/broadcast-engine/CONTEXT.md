# Broadcast engine

The system that turns LineUps scene data into lit, television-grade graphics
that look like one designer made them. It sits under the existing LineUps
workflow and reuses its templates, cues and review gates.

## Language

### The look

**Package**:
Every graphic made for one show or property, sharing one look.
_Avoid_: brand kit, theme, collection

**Look kit**:
The shared lighting, finishes, camera behavior and post treatment that every
graphic in a package uses.
_Avoid_: style, preset, theme

**Finish**:
One surface treatment from the look kit, such as chrome, glossy plate, satin,
brushed metal or glass.
_Avoid_: material, texture, shader

**Signature finish**:
The one finish that defines an event or show world and repeats across its
sets, particles and transitions.
_Avoid_: theme material, hero texture

**Element family**:
A kind of broadcast graphic with its own job: ID, event world, player
element, live graphic, studio open or brand transition.
_Avoid_: category, graphic type

### Templates and data

**Graphic lane**:
One of the seven LineUps graphic types, such as Comparison or Quick Stat.
_Avoid_: lane (on its own; Lane means a work initiative in the shared gate)

**Template**:
The registry entry for one graphic lane option. It names its approved source
and what an episode may change.
_Avoid_: master, component, preset

**Lane master**:
The approved Blender source a template points to.
_Avoid_: template file, blend, scene file

**Slot**:
A named, replaceable part of a lane master that an episode fills, such as a
player cutout, team mark, team color or stat.
_Avoid_: placeholder, variable, field

**Scene row**:
The data that fills every slot of one lane master for one scene.
_Avoid_: CSV row, payload, job

**Engine**:
The tool that owns one layer of a graphic: Blender, HyperFrames, Premiere or
Figma. Unreal is retired for new LineUps builds; its saved work is history.
_Avoid_: renderer, app

**Layer**:
One engine's output for a scene, delivered with transparency for the others
to stack.
_Avoid_: pass, overlay, comp

### Motion

**Cue**:
The spoken moment in the transcript that a graphic event must land on.
_Avoid_: mark, trigger, hit

**Slam**:
An entrance that starts oversized and lands at full size within a few frames,
on a cue.
_Avoid_: pop, punch-in, bounce

**Drift**:
The slow, continuous move that keeps a graphic alive after it lands.
_Avoid_: idle, float, settle

**Hold**:
The span between a graphic landing and its exit cue.
_Avoid_: dwell, pause

**Brand transition**:
A move between shots built from a team's or show's own marks and shapes.
_Avoid_: wipe, generic transition

### Production

**Authoring**:
Building or changing a lane master until it is approved.
_Avoid_: setup, design pass

**Production**:
Filling an approved lane master from scene rows and rendering layers for an
episode.
_Avoid_: build, export

**Render run**:
One pass of production over a set of scene rows.
_Avoid_: batch job, queue

**Proof frame**:
A single rendered frame checked against the look and slot rules before a full
render.
_Avoid_: preview, test render, thumbnail

## Relationships

- A **Package** has one **Look kit**. Each event or show world in it may add
  one **Signature finish**.
- A **Template** belongs to one **Graphic lane** and points to one approved
  source per **Engine**. In Blender that source is a **Lane master**.
- A **Lane master** has many **Slots**. A **Scene row** fills all of them.
- A **Render run** reads many **Scene rows** and produces **Layers**.
- A **Slam** lands on a **Cue**. A **Drift** runs through the **Hold**.

## Flagged ambiguities

- "Lane" meant both a work initiative and a LineUps graphic type. In this
  context it is always **Graphic lane**.
- "Template" was used for both the registry entry and the file it points to.
  **Template** is the entry. **Lane master** is the Blender file.
- "Hit" was used for music accents in the reel study. LineUps graphics land on
  spoken **Cues**. A music accent is outside this glossary until an episode
  uses music timing.
