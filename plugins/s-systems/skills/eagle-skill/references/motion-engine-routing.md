# Motion Engine Routing

Use this after the transcript or story beat is selected and before authoring a
motion scene. The deliverable form and the visual beat answer different
questions.

## Delivery Envelope

Long-form versus short-form sets the project or job envelope:

- aspect ratio and dimensions
- frame rate
- expected runtime
- caption policy
- review depth
- alpha, codec, and delivery format

Do not use form alone to select the motion engine. Record the envelope in the
project handoff or storyboard. The Eagle ingest client JSON remains an ingest
configuration, not a general production manifest.

## Primary Owner

Every beat gets one primary owner before it is built. Existing active source
keeps its current owner unless the user explicitly requests a port. Assets may
travel between tools, but do not reconstruct the same scene in multiple
engines merely to use a newly available tool.

For a new beat:

- **Figma Motion:** approved Figma component states, phrase-timed 2D reveals,
  title scenes, and transparent speaker overlays. Keep one top-level timeline
  frame per beat and animate its descendants.
- **Remotion:** existing components, repeatable systems, data-driven layouts,
  coded product interfaces, and parameterized scene families.
- **HyperFrames:** net-new standalone HTML compositions where art direction,
  choreography, typography, and a premium hero moment carry the scene. Read
  `hyperframes` before authoring and use `remotion-to-hyperframes` only for an
  explicit port.
- **Cavalry:** art-directed 2D typography, graphic reveals, procedural rigs,
  masks, and transparent graphic plates.
- **Blender:** physical objects, lighting, contact shadows, dimensional camera
  movement, paper, cloth, and other spatial behavior.
- **Premiere:** dialogue timing, editorial pacing, sound, assembly, and final
  sequence export.

## Visual-Technique Rolodex

Technique utilities sit beneath the selected motion engine. They do not create
another routing axis and should remain a small part of the overall composition
toolkit.

### JointJS

JointJS Core is installed as the optional connected-data utility. Reach for it
when the visual job is a flow, decision tree, dependency map, branching route,
or connected system. Give it normalized nodes and edges; let it calculate
ports and SVG paths. The primary motion engine still owns the visual skin,
frame-based animation, hierarchy, and final render.

```text
scene data
  -> JointJS nodes, ports, and paths
  -> Seller System or project-owned components
  -> Remotion frame animation or HyperFrames animation
  -> editorial assembly
```

Use the diagram intelligence, not the demo styling. Do not introduce JointJS
for ordinary cards, lists, charts, or decorative lines. In Remotion, JointJS
must never control real-time animation or parent layout; keep it inside a
contained geometry layer and drive all visible progress from the current frame.

Keep reusable diagram proof client-neutral and independently testable.
