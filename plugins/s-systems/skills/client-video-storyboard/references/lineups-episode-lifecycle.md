# Lineups episode lifecycle

Use this for every Catena Media Lineups video from intake through cleanup.
Each video is one episode project. The subject, team, league, or ranking is
episode data. It cannot create a new workflow, review-page design, lane, or
Figma source family.

## project record

Create or update one Linear issue when the episode files are ingested. Keep it
inside the Catena Media project. Record:

- episode title and stable slug;
- source delivery and Eagle folder;
- confirmed delivery deadline as the Linear due date;
- transcript and client notes;
- Pre-Figma and Post-Figma review paths;
- Premiere project and final export target.

Use `Todo` when the episode is accepted but work has not started. Use `In
Progress` when editing starts. Use `In Review` while Jerami is reviewing a
packet, design, or export. Use `Done` only after the finished edit, required
delivery readback, and Eagle filing pass. Do not invent a due date. Ask for the
delivery deadline when it is missing.

## fixed flow

```text
ingest files
  -> create or update Linear issue and due date
  -> file source media and packet in Eagle
  -> locked Pre-Figma review
  -> approved Figma source-family episode copies
  -> locked Post-Figma review
  -> Premiere edit and delivery readback
  -> file approved renders and final export in Eagle
  -> Linear Done
  -> remove episode-specific Decision Maps and active gate records
```

## locked Pre-Figma UI

Use the same hierarchy for every episode:

1. Client and Lineups stage label.
2. Episode title and due date.
3. Source runtime, planned scene count, and review status.
4. Transcript-order candidate list.
5. One candidate card per beat with time range, lane, option, setting, copy,
   source state, and review decision.
6. Links back to Decision Maps and forward to Post-Figma review.

Keep the approved typography, spacing, colors, card geometry, responsive
behavior, and navigation. Replace only project-record data and candidate
content. Do not redesign the page for a team, subject, or episode.

## locked Post-Figma UI

Use the same hierarchy for every episode:

1. Client and Lineups stage label.
2. Episode title, due date, current scene count, and review status.
3. Fixed lane filters.
4. One scene card per candidate with poster or motion preview, transcript
   context, Figma source link, proof note, and review state.
5. Fixed scene-detail view with the same metadata and timed proof frames.
6. Links back to Decision Maps and the matching Pre-Figma review.

Keep the approved typography, spacing, colors, card geometry, filters,
responsive behavior, and navigation. Replace only project-record data, scene
content, proof, and source links. New UI ideas remain outside the episode until
Jerami approves a template change.

## project-driven gate

Shared code reads the active episode record. It cannot contain a team name,
fixed scene count, fixed date, or episode path. Put those values in the episode
record. The gate checks the current record's candidate order, Figma readback,
preview hashes, dimensions, frame rate, source IDs, and review links.

Use this record shape for each active episode:

```json
{
  "episodeSlug": "episode-slug",
  "linearIssue": "TEAM-123",
  "dueDate": "YYYY-MM-DD",
  "map": "public/decision-maps/YYYY-MM-DD-episode-slug-post-figma-review/review-map.json",
  "proof": "config/lineups/episode-slug-review-proof.json",
  "preFigma": {
    "path": "public/decision-maps/YYYY-MM-DD-episode-slug-pre-figma-review/index.html",
    "title": "Episode title.<br>Pre-Figma review.",
    "candidateCount": 0
  },
  "postFigma": {
    "readyLabel": "Ready for Jerami Review.",
    "dateLabel": "Client / Lineups · review date",
    "built": 0,
    "needsReview": 0
  },
  "candidates": [],
  "sourceCandidates": []
}
```

## closeout

When the Linear issue is `Done`, confirm the approved renders and final export
remain in Eagle. Then remove only that episode's:

- Pre-Figma and Post-Figma public Decision Map directories;
- Decision Maps index entries and redirects;
- active review-gate record;
- episode proof and readback files;
- temporary local preview exports.

Keep the Linear issue, durable evidence receipts, this lifecycle, shared UI
rules, generic gate code, framing tests, Figma source components, and all Eagle
assets. Cleanup cannot remove another active episode.
