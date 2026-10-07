# John Prayer native fade

Approved by Jerami on 2026-10-06. Use only for John Prayer unless another
lane receives its own approval.

`john-prayer-native-fade-v1.prproj` contains the editable graphic-only
sequence. Copy its native Graphic clip above the footage. Do not nest the
sequence: Multiply must blend with the footage in the destination timeline.
Put the video-specific transparent title above the graphic.

Set PNG export `contentsOnly: true` on each Figma title frame. Confirm
1080×1920 and actual transparent pixels before import. Premiere's current
frame export targets the active sequence; activate each sequence before export.
Read timeline trim values back. The current MCP in/out trim operation can
return success with zero values; use verified `Time.seconds` values when needed.

`../john-prayer-batch.json` records the 17 new review sequences and their
per-video assets. Sound finishing and full playback review remain pending.

The machine-readable recipe and measured typography are in
`../figma-masters/pastor-john-prayer.json`. The shared lane contract indexes it.
Keep the approved 1080×1920 geometry. The working opening hold is 3 seconds.
Match sequence frame rate to each source. Opus Clip owns captions.

Review each video's crop, headline wrapping, cover frame and complete edit.
Approval of the style does not mark the remaining videos edited or exported.
