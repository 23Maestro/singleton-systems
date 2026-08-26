# Client Edit Boundaries

Eagle owns source assets, references, transcript files, client notes, tags, and
review context. Organize by client and project, then by useful asset role.

Premiere owns sequences, bins, timeline edits, and exports. Remotion, HyperFrames,
Cavalry, and Blender own coded motion scenes and their rendered handoff; read
`references/motion-engine-routing.md` to pick one primary owner per beat. Neither
Eagle nor Premiere is task state.

Before changing Eagle metadata, identify the exact asset and intended folder,
tag, annotation, or rename. Before any Premiere handoff, confirm aspect ratio,
runtime, transcript lock, export target, and whether the project bridge is
available. Stop at an asset or storyboard packet when it is unavailable.

## Premiere bin & color convention (locked, use every time)

Never dump imports into the project root. Every asset lands in its numbered
bin with its bin's color label set on the item itself, every session, no
exceptions — this is the fix for a cluttered/inconsistent project panel.

| Bin / asset family | Visible color family | Alternation rule |
|---|---|---|
| `01 Footage` | Gray | Alternate dark gray and light gray at source edits |
| `02 Audio` | Green | Alternate two green variants at dialogue edits |
| Lineups overlay | Blue | One continuous overlay clip; no alternation needed |
| Lower thirds / section titles | Red | Alternate red and dark red at every title change |
| `03 Graphics` and `05 Stills` | Orange | Alternate orange and dark orange between adjacent assets |
| `04 Music` and sound effects | Dark purple | Keep editorial audio visually separate from dialogue |
| `06 Motion Renders` | Pink | Use pink for Figma and motion-engine exports |
| `07 Exports` | Keep out of the edit timeline | Rendered and queued output |

If a project already has bins with different names/colors than this table
(e.g. inherited from an older template), match its existing scheme instead of
renaming — but apply that scheme's colors to every new item without asking.
Only add a new numbered bin (continuing the sequence, next unused color) when
no existing bin fits; don't invent parallel bins for a category that already
has one.

Color names describe Jerami's visible custom Premiere palette. Do not assume
Adobe's default numeric label index matches the visible color. Inspect the
current project or label preferences before automating an index.

## Verified Premiere ingest transaction

Use the same transaction for every asset type, including source dialogue,
music, and sound effects:

1. List items and bins. Resolve the destination bin ID.
2. Import with `binName` when the operation supports it.
3. Resolve the imported item ID from the response or its exact media path.
4. Call `move_item_to_bin` with the item ID and destination bin ID even if the
   import response says the bin was used.
5. Apply the verified visible color label to the project item.
6. List project items again and inspect the item's `treePath`.
7. Treat the ingest as failed while the `treePath` remains at project root.
   Repeat the move by ID, then read it back again.

The Premiere bridge may return a successful `binName` while the item remains
at root. Never use the import response as placement verification. The read-back
`treePath` is authoritative. Finish this transaction before timeline work;
never postpone it as a cleanup pass.

Audio classification is explicit: source dialogue goes in `02 Audio`; music
beds and sound effects go in `04 Music`. Apply the green family to dialogue and
dark purple to music and effects. Alternate variants where repeated clips need
visible boundaries.
