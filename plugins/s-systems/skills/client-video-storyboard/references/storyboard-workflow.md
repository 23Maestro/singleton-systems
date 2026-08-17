# Client Video Storyboard Workflow

## Intake

Confirm source media, transcript or script, client notes, references, target
runtime, aspect ratio, caption expectations, delivery format, and review owner.
Mark transcript language as locked, flexible, or missing.

## Packet

Include:

- source inventory and gaps;
- story goal and audience;
- one row per meaningful screen change;
- exact transcript anchor or time range;
- visual direction and required asset;
- decision label: locked, proposed, needs review, or blocked;
- Premiere bin/timeline handoff and export checklist.

File the packet and transcript into Eagle, inside the source video's folder,
as the last packet step — never leave the only copy in a private scratch/tmp
directory. Scratch dirs are not durable; Eagle is the client's system of
record and where the next session will look.

## Premiere ingest gate

Read `premiere-ingest-contract.md` before importing.
Each asset must land directly in its numbered role bin and receive the bin's
color label on the project item during the same ingest step. Never import into
the project root for later cleanup. If the project already has a compatible
bin and label scheme, preserve it and classify every new item into it.

Use this transaction for every video, audio file, still, graphic, MOGRT, music
bed, sound effect, motion render, and end card:

1. List the project items and bins. Resolve the destination bin ID.
2. Import with the destination `binName` when supported.
3. Resolve the imported project item ID from the response or media path.
4. Call `move_item_to_bin` with the item ID and destination bin ID even when
   the import response claims the correct bin. Some Premiere bridge imports
   report `binName` while leaving the item in the project root.
5. Apply the agreed project-item color label immediately.
6. List project items again. Confirm the exact `treePath` contains the intended
   numbered bin.
7. If the item is still at root, repeat the move by ID and read back again.
8. Start timeline placement only after the root contains no loose imported
   media.

Do not accept a success message as verification. The final `treePath` is the
bin-placement proof.

Eagle owns assets and review context. Premiere owns bins, sequences, timeline,
and exports. Codex maps sources and prepares the packet. Jerami reviews the
assembled draft unless the client contract says otherwise.

Before Premiere mutation, inspect project info, items, sequences, active
sequence, and bins. If the bridge or requested panel is unavailable, stop at
the packet. Never overwrite a client project or export without review.
