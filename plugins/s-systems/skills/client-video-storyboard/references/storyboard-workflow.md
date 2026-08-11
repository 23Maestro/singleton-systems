# Client Video Storyboard Workflow

## Intake

Confirm source media, transcript or script, client notes, references, target
runtime, aspect ratio, caption expectations, delivery format, and review owner.
Mark transcript language as locked, flexible, or missing.

## Breakdown

Run only the stages the client profile needs:

```text
URL or local video
  -> ffprobe metadata
  -> native captions, then local Whisper fallback
  -> scene detection and adaptive sampling
  -> compact frame manifest and contact sheets
  -> transcript and visual beat mapping
  -> Eagle asset matching
  -> storyboard with one primary engine per beat
  -> human review
  -> Premiere mutation
```

Keep raw frames and source assets in Eagle. Keep active work, decisions, and
trial status in Linear. Keep approved visual components and variables in Figma.
Do not copy task state into Supabase or Eagle.

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

Eagle owns assets and review context. Premiere owns bins, sequences, timeline,
and exports. Codex maps sources and prepares the packet. Jerami reviews the
assembled draft unless the client contract says otherwise.

Before Premiere mutation, inspect project info, items, sequences, active
sequence, and bins. If the bridge or requested panel is unavailable, stop at
the packet. Never overwrite a client project or export without review.
