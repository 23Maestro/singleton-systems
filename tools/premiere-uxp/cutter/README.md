# Bad Take Remover — Premiere Pro UXP panel

Applies a pre-computed cut list to the active sequence as ripple deletes.

The split that matters: **Whisper + FFmpeg decide the cuts, the panel only
applies them.** Detection stays outside Premiere where it can be tested,
iterated, and re-run cheaply. The panel is a dumb, durable applicator.

```
audio → whisper (word timing) ─┐
                                ├─→ cut engine → cutlist.json → [this panel] → ripple deletes
video → ffmpeg (RMS envelope) ─┘                      │
                                                       └─→ ffmpeg preview render
```

## Why it does not break when a segment is missing

This is the design requirement, and it's enforced in `src/cutlist.js`:

- **Every removal is validated independently.** Bad JSON, null entries,
  non-numeric or inverted ranges are skipped with a reason; the rest still apply.
- **Ranges past the sequence end are skipped, not fatal.** A range straddling the
  end is clamped instead of dropped.
- **Source/sequence length drift is detected and reported**, then it proceeds —
  applying a list to a re-conformed or trimmed sequence is a legitimate thing to
  want.
- **Cuts are applied last-first.** A ripple delete shortens the timeline, so
  earliest-first would invalidate every later timecode. Reverse order keeps each
  cut's coordinates correct when its turn comes.
- **One transaction per cut.** A failure mid-run cannot roll back the cuts that
  already succeeded. The panel reports what landed and what didn't.

13 tests cover exactly these paths:

```bash
npm test
```

## Cut list format

```json
{
  "version": 1,
  "source": { "name": "clip.mp4", "duration": 1571.836938, "fps": 29.97 },
  "removals": [
    { "start": 58.766, "end": 73.31, "kind": "gap",  "note": "dead air 15.32s -> 0.78s" },
    { "start": 140.29, "end": 142.14, "kind": "cue", "note": "Here's, here's the problem." }
  ]
}
```

`kind` is one of `cue` (whole bad take), `span` (stutter inside a good line),
`gap` (dead air), `head`, `tail`, `manual`. A bare array of removals, and
array-form entries `[start, end, kind, note]`, are both accepted.

`samples/josh-iwmc-vsl.cutlist.json` is a real 205-removal list.

## Install

```bash
# UXP Developer Tool → Add Plugin → select this folder's manifest.json → Load
```

Then Window → Bad Take Remover.

## Validate this first

The live Premiere load established two implementation details:

1. **ES modules did not execute in the installed UXP host.** `npm run build`
   bundles the three source modules into `dist/main.js`, loaded as a classic
   script. The source split and tested logic stay unchanged.
2. **The API surface in `src/ppro.js`.** The implementation now follows Adobe's
   current sample: `SequenceEditor.getEditor(sequence)`, callback-created
   `TrackItemSelection`, and `project.lockedAccess()`. **Hit "Probe API"
   first** — it reports exactly what the installed build exposes, and every call
   is feature-detected, so a renamed method shows up as a message in the log
   instead of a dead plugin.

`src/ppro.js` is the only file that touches Premiere. When Adobe moves the API,
that is the one file to fix.

## Deadline worth knowing

Adobe ends **CEP/ExtendScript support for Premiere in September 2026**; CEP 12
was the last major version. That's why this is UXP and not an ExtendScript panel.
The `premiere-pro` MCP is ExtendScript-backed, so it's a useful prototyping bench
but not a shipping target — same sunset.
