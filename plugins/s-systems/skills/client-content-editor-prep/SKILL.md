---
name: client-content-editor-prep
description: Use when client footage must be culled, grouped by tour or topic, mapped from Eagle into Premiere bins, and renamed for the next editor without building a storyboard or timeline edit.
---

# Client Content Editor Prep

Prepare client footage so another editor can begin immediately. This skill owns
organization and handoff, not creative editing.

```text
Eagle manifest -> Premiere bins -> project-item names -> verified handoff
```

## Boundary

- Eagle remains the source of truth for original assets, transcripts, tour
  classification, camera labels, and rejects.
- Premiere owns bins and non-destructive project-item display names.
- Never rename or delete source files to satisfy a client naming convention.
- Do not create a storyboard, assemble a timeline, color-grade, export, or infer
  extra tour categories unless the user expands the assignment.
- Keep rejected or ambiguous media recoverable. Exclude it from Premiere by
  default and report it separately.

Load `s-systems:eagle` and follow its client edit boundaries before Premiere
mutation. Use the `premiere-pro-mcp` skill for bridge startup and Premiere
operations.

## Workflow

1. Inspect the exact Eagle folder membership and resolve each usable asset to a
   local media path. Treat the Eagle item ID and original filename as immutable
   provenance.
2. Read `references/manifest-contract.md` and write both JSON and CSV manifests
   before bulk import. Use one row per source clip. When Eagle folder IDs are
   known, prefer `scripts/build-eagle-premiere-manifest.mjs` so ordering,
   uniqueness, path checks, and CSV quoting stay deterministic.
3. Derive tour groups from transcript and folder evidence. A user estimate is a
   shape, not a required category count. Keep categories lean and surface
   ambiguous clips instead of inventing a confident assignment.
4. Use one global client sequence across usable clips. Order by tour, then transcript-supported story order;
   fall back to source capture order when story order is not defensible.
5. Inspect the Premiere project, sequences, bins, and existing label scheme.
   Create only the missing tour and camera bins under the existing numbered
   footage bin.
6. For every usable manifest row, perform the verified Premiere ingest
   transaction: import, resolve item ID, move by ID, apply the verified footage
   color, and read back `treePath`.
7. Rename only the Premiere project item to the manifest's `premiere_name`.
   Preserve the extension only when the client explicitly requires it in the
   visible project-item name.
8. Save after a verified batch. Reconcile manifest counts against Eagle and
   Premiere before continuing to timeline work.

## Completion report

Return only the useful handoff facts:

- usable, rejected, ambiguous, imported, and renamed counts;
- count by tour and camera;
- manifest paths;
- any missing media, duplicate paths, root-level imports, or rename failures;
- the next editorial action.
