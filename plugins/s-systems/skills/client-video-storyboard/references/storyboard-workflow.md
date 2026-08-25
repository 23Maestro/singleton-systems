# Client Video Storyboard Workflow

## Intake

Confirm source media, transcript or script, client notes, references, target
runtime, aspect ratio, caption expectations, delivery format, and review owner.
Mark transcript language as locked, flexible, or missing.

## Reference gate

When a client supplies a style reference, complete the full reference audit
before the target storyboard. Read `reference-edit-profile.md`.

```text
full reference audit
  -> quantified Edit Style Profile
  -> reusable visual and motion families
  -> client-specific storyboard
  -> edit
  -> post-edit learning pass
```

Do not promote a short sampled match into a style rule. The target storyboard
must cite the source range and family from the finished profile.

## Breakdown

Run only the stages the client profile needs:

```text
URL or local video
  -> ffprobe metadata
  -> native captions, then local Whisper fallback
  -> scene detection and adaptive sampling
  -> compact frame manifest and contact sheets
  -> full reference ledger and metrics when a reference exists
  -> recurring visual and motion families
  -> target transcript and visual beat mapping
  -> Eagle asset matching
  -> storyboard with one primary engine per beat
  -> human review
  -> Premiere mutation
```

Keep raw frames and source assets in Eagle. Keep active work, decisions, and
trial status in Linear. Keep approved visual components and variables in Figma.
Do not copy task state into Supabase or Eagle.

Figma records approved component states. Figma Motion can own phrase-timed 2D
scenes and alpha overlays. Other motion engines remain available when the beat
calls for them. Premiere owns the target edit and its editorial rhythm. Name
one primary engine for each target beat.

## Profiles

- Catena / LSR short: use the locked vertical timeline mold; prove the next
  full run before calling the path repeatable.
- Catena / Lineups long: use the approved Figma broadcast kit, timed transcript,
  and Eagle episode assets before Premiere.
- Future Voices cleanup: inspect source and audio, map rough cuts and filler
  cleanup, then stop for review; skip scene sampling and asset matching unless
  the edit needs them.

## Client Note Compression

When client notes arrive as a wall of context, extract only what changes the
edit. Ignore hiring terms, payment, grading, repeated framing, pleasantries, and
deadline pressure unless the user asks to track them. Keep requirements tied to
sequence order, clip selection, trimming, audio, graphics, captions, runtime,
aspect ratio, or delivery.

Useful queries:

- Only list what changes the edit.
- Give me the edit-only requirements. No business, admin, or context. 10 bullets max.
- Strip this to timeline instructions only.
- Clean the writing and reduce word count.

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
