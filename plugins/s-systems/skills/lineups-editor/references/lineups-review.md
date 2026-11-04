# review and place

## episode review lifecycle

Read `lineups-episode-lifecycle.md` for the project record, locked review UIs,
Asana task flow, and closeout boundary.

Pre-Figma review and Post-Figma review are fixed Lineups stages. Reuse the
established Decision Map structure for each episode. Replace the episode title,
date, transcript beats, lane and option choices, source links, candidate count,
and review state. Do not create a new review-page design or a new Figma option
for each video.

The Pre-Figma stage is generated only after the completed Whisper transcript
passes Manim timing validation. It reviews transcript mapping and proposed lane,
option, and setting choices before Figma work. The Post-Figma stage reviews
current episode copies, motion previews, and proof after Figma work. Both stages use the
approved source families in Figma Components. Episode Workspace holds the
temporary episode copies.

Episode-specific Decision Maps are temporary review surfaces. Figma source
components and Eagle assets are the durable sources. An Asana task may be
completed only after its required review and delivery readback pass and its
approved motion renders are in Eagle. When the task is complete, remove that episode's
Pre-Figma and Post-Figma Decision Map directories plus their index, route,
redirect, gate, and test registrations. Keep this lifecycle, the reusable stage
structure, approved Figma source components, Eagle assets, and durable evidence
receipts.

## pre-Premiere gate

Before placement, inspect a fresh 1920 x 1080 screenshot and confirm:

- the selected lane and option match the transcript;
- the image covers the frame and the face is clear;
- text is readable, aligned, and free of overflow;
- repeated spacing is equal;
- the photo is relevant and is not repeated nearby;
- no source note, unexplained wash, or unapproved background appears;
- all episode values and art can be replaced without rebuilding the design.
- Asset Swap, Simple and Full comparison player assets have real alpha and clean edges.
- Cinematic 2-up has both full photos visible at the opening and the top-left title.
- Asset Swap inherits the guarded background, geometry, layer order, crop
  roles, and motion from the approved component.

Premiere placement waits until this gate passes.

Runtime evidence and retry handling follow [the Lineups template system](../../../../../docs/lineups-template-system.md). A boolean timing flag cannot replace a current Manim receipt. Bind human approval to the scene and evidence revision.
