# Josh Sayre — thank-you videos ingest handoff

Paste the **Claude execution prompt** below into Claude. This packet deliberately
keeps the task smaller than the VSL pass.

## Locked facts

- Client: Josh Sayre / I Want More Closings
- Source: [Thank You Page](https://drive.google.com/file/d/154BYrQkYybXfCeBtzLcIrrBidqktAfC3/view)
- Source owner: `josh@iwantmoreclosings.com`
- Source metadata: MP4, 1920x1080, 36:22.413, 8.31 GB
- The source is one continuous recording containing approximately ten videos.
- Shared folder: [Thank You Page Videos](https://drive.google.com/drive/folders/17gk4zBPtj99GbTlOI9GIqZmgqbPpFFC1)
- Script: [Thank You Page Scripts (Word for Word)](https://docs.google.com/document/d/1uMEbBlCXqBQT887rb5uQmGUexS-eOOTBJ-U1IOb8Ga0/edit)
- Google access is read-only. Never rename, move, replace, or delete Josh's Drive
  source.
- This job needs clean cuts and captions. It does **not** inherit the VSL motion
  graphics scope.

## Folder and naming contract

Do not create any folder or bin named `Selects`.

```text
Josh Sayre / Thank You Page
  00_ADMIN
  01_SOURCE
  02_CUTS
  03_CAPTIONS
  04_TIMELINE
  05_EXPORTS
```

Filename pattern:

```text
JS_TY01_<short-topic>_v01.ext
```

Rules:

- Keep every filename under 45 characters, including the extension.
- `01` through `10` mean source timeline order only.
- Use the script's real topic in 2-4 plain words; do not invent marketing names.
- Use letters, numbers, underscores, and hyphens only.
- Never use `select`, `selected`, `final-final`, recording dates, or camera names.
- The matching video, transcript, and caption file share the same basename.

## Claude execution prompt

> Handle the Josh Sayre thank-you-page ingest as a focused production task. Work
> from this handoff and the linked script. Do not reopen or redesign the completed
> Josh VSL motion package.
>
> **Goal:** turn the single 36:22.413 master named `Thank You Page` into ten
> correctly ordered, caption-ready videos with obvious filenames under 45
> characters.
>
> 1. Confirm the source file locally or download it from the locked Drive link.
>    Preserve the Drive original exactly. Record the local path, byte size,
>    duration, frame rate, audio layout, and checksum.
> 2. Extract or export the Word-for-Word script. Use its ten actual section titles
>    as the semantic map.
> 3. Transcribe the master with word timestamps. Use Whisper/whisper.cpp or the
>    existing local transcription tool; do not send client footage to a new cloud
>    service.
> 4. Detect candidate boundaries using all three signals: spoken reset/take
>    language, silence/black-frame gaps, and the opening/closing lines in the
>    script. Do not split only from automatic silence detection.
> 5. Produce `josh-thank-you-cut-manifest.csv` with these columns:
>    `order,topic,source_in,source_out,duration,opening_words,closing_words,confidence,notes`.
>    There must be exactly ten rows, ordered by the master timeline.
> 6. Produce matching plain-text transcripts and UTF-8 `.srt` captions using the
>    basename `JS_TY01_<short-topic>_v01` through `JS_TY10_<short-topic>_v01`.
>    Captions: maximum two lines, natural phrase breaks, no single-word orphan,
>    preserve Josh's wording, and mark uncertain words instead of guessing.
> 7. Stage lossless or visually lossless cuts in `02_CUTS`. Avoid re-encoding when
>    frame-accurate boundaries permit it; otherwise document the codec used.
> 8. Create a short QC report covering: ten-count match, A/V sync, clipped words,
>    accidental dead air, caption timing, filename length, and unresolved script
>    mismatches.
>
> **Stop gate:** complete discovery, transcription, boundary analysis, cut
> manifest, staged clips, and caption files. Do not modify an existing Premiere
> project, create a delivery export, upload anything, or mutate Eagle until Jerami
> reviews the ten-row manifest and filenames.
>
> **Token discipline:** inspect the source metadata once, read only the relevant
> script, and report exceptions instead of narrating routine commands. Do not
> research naming systems, animation libraries, Josh's VSL, or unrelated client
> assets. Lead the final response with the local staging path and a compact table
> of the ten proposed clips.

## Jerami review gate

```text
[ ] Exactly ten source sections found
[ ] Every cut begins and ends on complete speech
[ ] Topics match the Word-for-Word script
[ ] Names are obvious and under 45 characters
[ ] No folder or artifact uses “Selects”
[ ] Captions preserve Josh's actual wording
[ ] Premiere, Eagle, Drive, and delivery destinations remain unmodified
```

After approval, the next pass is mechanical: place the ten clips and captions in
Premiere, perform basic audio/picture cleanup, QC, and export. Motion graphics are
out of scope unless a specific thank-you video earns a separately approved beat.
