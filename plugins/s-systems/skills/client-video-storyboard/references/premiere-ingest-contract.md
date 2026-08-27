# Premiere ingest contract

## Bins

Never leave imported assets in the project root.

| Bin | Contents |
|---|---|
| `01 Footage` | Mark/source video and B-roll video |
| `02 Audio` | Source dialogue and separate recorded audio |
| `03 Graphics` | Lineups overlay, MOGRTs, lower thirds, and end cards |
| `04 Music` | Music beds and sound effects |
| `05 Stills` | Player, coach, and supporting photos |
| `06 Motion Renders` | Figma and motion-engine video renders |
| `07 Exports` | Rendered and queued output |

Preserve a compatible existing project scheme. Do not create a parallel bin
for a category the project already has.

For Lineups episodes, Eagle owns the approved source file under
`Episode / 06 Motion Renders`. The Premiere bin organizes that linked file
inside the project; it is not a second disk-storage location. Delete temporary
exports only after Eagle ingest and Premiere path readback both pass. Do not
keep a duplicate final motion-render folder in `23Projects`.

## Colors

Apply labels to project items during ingest. Jerami's visible custom Premiere
palette is authoritative. Inspect its numeric label mapping before automation.

- Source footage: alternate dark gray and light gray.
- Source dialogue: alternate green variants.
- Continuous Lineups overlay: blue.
- Lower thirds and section titles: alternate red and dark red.
- Graphics and stills: alternate orange and dark orange.
- Music and sound effects: dark purple.
- Motion renders: pink.

Alternation marks clip boundaries while zoomed out. Avoid long runs of one
color across repeated clips.

## Required transaction

Use this transaction for each video, audio file, still, graphic, MOGRT, music
bed, sound effect, motion render, and end card:

1. List project items and bins. Resolve the destination bin ID.
2. Import with `binName` when supported.
3. Resolve the imported item ID from the response or exact media path.
4. Call `move_item_to_bin` with the item ID and destination bin ID even when
   the import response claims the correct bin.
5. Apply the agreed color label to the project item.
6. List project items again and inspect the asset's exact `treePath`.
7. If the path is still at project root, repeat the move by ID and read back.
8. Begin timeline placement only after no imported media remains loose at root.

The Premiere bridge can return a successful `binName` while leaving the item
at project root. The import response is not verification. The final `treePath` is the
placement verification.
