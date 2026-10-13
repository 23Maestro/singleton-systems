# Lineups episode lifecycle

Use this for every Catena Media Lineups video from intake through cleanup.
Each video is one episode project. The subject, team, league, or ranking is
episode data. It cannot create a new workflow, review-page design, lane, or
Figma source family.

## project record

Create or update one Asana task when the episode files are ingested. Keep it in
the `Content Editor` project (`1218890014545436`) under `Catena`. Record:

- episode title and stable slug;
- source delivery and Eagle folder;
- confirmed delivery deadline as the Asana due date and time (10 AM America/New_York when only a date is supplied);
- transcript and client notes;
- Pre-Figma and Post-Figma review paths;
- Premiere project and final export target.

Leave the task incomplete from intake through review. Complete it only after
the finished edit, required delivery readback, and Eagle filing pass. Do not
invent a due date. Ask for the delivery deadline when it is missing.

## fixed flow

```text
ingest files
  -> create or update Asana task and due date
  -> file source media and packet in Eagle
  -> complete the Whisper word-level transcript
  -> review the full transcript against all seven lanes; bind discoveryPath to its hash
  -> select supported candidates without a scene quota
  -> run Manim timing validation and write the passed cue proof
  -> create the episode scene manifests with the validated Whisper/Manim timing
  -> generate and publish the locked Pre-Figma review
  -> approved Figma source-family episode copies
  -> locked Post-Figma review
  -> Premiere edit and delivery readback
  -> file approved renders and final export in Eagle
  -> complete Asana task
  -> remove episode-specific Decision Maps and active gate records
```

## timing order and hook caveat

The timing order is a hard stop, not a suggestion:

```text
source media
  -> Whisper word-level transcript
  -> full-transcript seven-lane discovery with excerpts, outcomes and asset-search evidence
  -> candidate selection and pacing
  -> Manim timing validation and cue proof
  -> scene manifest with the passed timing receipt
  -> generate and publish the Pre-Figma review page
  -> human candidate decisions
  -> Figma Motion
  -> Post-Figma review
  -> Premiere placement
```

Manim must run after the Whisper transcript is complete and before the associated
Pre-Figma review page is created. The Pre-Figma page may display the validated
trigger phrase, cue, frame rate, and proof status, but it must not be generated
from an unvalidated timing map.

The hook caveat is explicit: current preflight validates the manifest's
`manimTimingValidated` contract, cue math, and motion proof; it does not
independently launch a fresh Manim run at mutation time. The upstream Manim
validation therefore needs a current cue-proof receipt tied to the Whisper
transcript hash and cue-map hash. A missing or stale receipt is a stop, not a
reason to defer validation until Figma or Premiere.

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

Anchor every compact visual-preview pill at the top center of its image or
motion frame with a safe inset. This includes source-preview, motion-placeholder,
and missing-asset labels. Never bottom-align these pills or let them overlap the
candidate title, team name, subject, or key image content.

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

The Lineups Figma file cannot be mutated or exported without an active scene
manifest. Activate the manifest before building an episode copy. For every Rank
Reveal scene, the gate also verifies:

- canonical source `1277:558` named `Recurring Board / Rank Reveal / 10 Teams`;
- ten normalized 96 x 78 logo-wrapper assignments;
- cumulative visible ranks from 10 through the newly revealed rank;
- Rank 10 only: one scene-start 10-to-1 row-shell cascade;
- ranks 9 through 1: no repeated board cascade and only the current team name
  and normalized logo animate;
- one verified team-content cue and exact cue math within 0.001 seconds;
- Manim declared as timing validator and Figma Motion as the sole engine;
- a passed Manim cue-proof receipt tied to the Whisper transcript and cue-map hashes before Pre-Figma publication;
- a live Figma Motion opacity track aligned to the cue start and duration;
- live Figma readback matching the manifest before export.

Use this record shape for each active episode:

```json
{
  "episodeSlug": "episode-slug",
  "asanaTask": "1234567890123456",
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

When the Asana task is complete, run the deadline checker described in [Lineups episode closeout](lineups-episode-closeout.md).
At intake, enroll the exact Asana task ID, due date, transcript/discovery paths,
and optional exact final-export name in `config/lineups/review-gates.json`.

The scheduled check reads current Asana status and dates. A completed task or
exact bound Drive video retires its enrollment. More than four hours past the
deadline, assume submitted and probe Jerami about continued editing. Archive
the enrollment and matching active scene before clearing them. An assumption
cannot complete Asana or satisfy a scene's delivery/readback gates.

Keep receipts, proof, readback, transcripts, public review pages, Figma sources,
and Eagle assets as history. Removing review pages, previews, or client media
is a separate cleanup action with its own exact targets and approval. Never
clear another active episode. Cleanup cannot remove another active episode.
Restore a closed episode only with a revised
deadline and current evidence; never carry approval across changed evidence.

Discovery is a separate prerequisite: every lane must cover the complete current
Whisper transcript and record candidates, rejected opportunities or a reasoned
no-fit. Active review records and scene manifests carry `transcriptPath` and
`discoveryPath`. Candidate reviews also bind `cueMapPath` and `timingProofPath`
to the passed current receipt. Timing proof never substitutes for discovery.

## review publication

`localhost` is a QA address. Do not put it in the episode's review handoff as
its published URL. Verify the hosted episode page, its evidence links and its
entry on the hosted Decision Maps index before calling publication complete.
Record the actual hosted review URL in Asana. Keep the durable local packet as
the recovery source. When the checked-out index differs from production,
prepare a scoped publication from the verified live source; do not deploy
unrelated checkout changes. Follow the deployment skill's production gate.

Runtime evidence and retry handling follow [the Lineups template system](../../../../../docs/lineups-template-system.md). A boolean timing flag cannot replace a current Manim receipt. Bind human approval to the scene and evidence revision.
