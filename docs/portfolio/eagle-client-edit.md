# Eagle Client Edit Contract

Eagle owns client assets, source notes, rendered previews, licensing context,
and review evidence. It does not own task state, deadlines, or code runtime.

## Boundaries

```text
Eagle       -> assets and review context
Premiere    -> bins, timeline, pacing, exports
Remotion    -> source code and exploratory renders
Linear / Opportunity HQ -> tasks and follow-up
```

Put client edit assets under `Video Projects / YYYY-MM-DD Project Name`. Keep
the transcript and edit map with that asset set. Do not create parallel asset
folder systems or a new top-level category per client.

Filesystem intake for the Content Editor Lane uses
`/Volumes/HomeSSD/HOME/01_eagle-staging/Content Editor/<client>/<date>`.
Source-preserve watchers route camera subfolders into the matching Eagle source
folders, retain original filenames, and remove staging copies only after Eagle
readback confirms the same filename and byte size in the intended folder.

`Client Review Staging` holds only the human review checklist. It is the pause
before Premiere staging, timeline mutation, export overwrite, or delivery.

For Premiere control, inspect project info, sequences, items, active sequence,
and bins first. Ask before destructive changes. Promote Remotion output to
Eagle only when it needs review, reuse, source context, or Premiere handoff.
