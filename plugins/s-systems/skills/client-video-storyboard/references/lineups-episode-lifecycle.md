# Lineups episode lifecycle

Use this for every Catena Media Lineups video from intake through cleanup.
Each video is one episode project. The subject, team, league, or ranking is
episode data. It cannot create a new workflow, review-page design, lane, or
Figma source family.

## recover prior production first

Before planning reuse or declaring a gap, read the latest matching production
handoff and episode closeout. Follow its source IDs into the template registry
and saved readback. Compare the working source with the current rule.

Week 7 used 23 Figma and 4 Unreal exports. Its period comparison used Figma
source `598:215`. A same-team rank change can reuse that source. The player
2-up engine question does not apply to period comparisons. Team callout and
Rank Reveal reuse must retain their recorded source bindings and current look.

When a rule conflicts, name the exact rule and source. A prior export does not
replace a fresh episode's timing proof or human review. Preserve the engine
owner for the selected option; do not invent approval for a new template.

## project record

Create or update one Asana task when the episode files are ingested. Keep it in
the `Content Editor` project (`1218890014545436`) under `Catena`. Record:

- episode title and stable slug;
- actual workday or workday range, America/New_York time zone, and the work
  record that supports it; keep source dates and deadlines separate;
- source delivery and Eagle folder;
- confirmed delivery deadline as the Asana due date and time (10 AM America/New_York when only a date is supplied);
- transcript and client notes;
- Pre-Figma and Post-Figma review paths;
- Premiere project and final export target.

Leave the task incomplete from intake through review. Complete it only after
the finished edit, required delivery readback, and Eagle filing pass. Do not
invent a due date. Ask for the delivery deadline when it is missing.

## episode workspace at start

Load `singleton-figma-system` when the episode starts. It owns the shared Figma
workspace standard and the Lineups lane specs. At the first authorized build,
make the episode area with a simple title and actual-workday label, both at
exactly 300 px. Add it to the left-to-right row by known work date, with wide
gaps and a shared top baseline for a quick Loom pan. Keep month-only dates
explicit; do not turn them into guessed weekdays.

Use native Sections for the approved lanes in use. Each lane spec records its
approved option/source, scene IDs, output size, supported counts, asset and copy
slots, timing, guarded values, and review proof. Keep loose cutouts, logos,
original photos, extra render parts, and old versions on the existing
`Player Cut Outs + Logos` page, grouped by episode. Preserve current scene
artwork, IDs, master links, and motion. Inspect the overview and provide a
direct episode link. Intake does not authorize Figma construction before review.

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

Jerami approved the photo-first review template on October 13, 2026.
The shared source is `tools/lineups_review/`. Its version and file hashes are
locked in `config/lineups/review-template.json`.

Use the same hierarchy for every episode:

1. Client and stage label, compact episode title, and confirmed due date.
2. The fixed **Flow**, **Assets needed**, **Asset ledger / lanes** tabs.
3. Full-width photos or color-driven scene plans above their supporting context.
4. Scene title, exact time range, lane, option, and the words spoken in that range.
5. Quiet source links and consistent review controls. Keep production notes in
   collapsed details or the evidence tab.

Use one candidate card per beat in transcript order. Group alternatives separately.
Keep the full transcript with lane labels on every passage behind its own
expander. A candidate excerpt includes only words fully inside that candidate's
source interval. A full team passage cannot be labeled with a five-second range.

Tab 2 uses the shared photo-subject navigation and at most two original photo
choices per asset. Show the photos first, then full-photo/source links and the
scene's timestamp, lane, option, and timed transcript below. Keep Google search
strings, Google Images, and Firecrawl under **Find another photo**. Persist photo
choices and retain the review export. Missing photos remain explicit search work;
they cannot remove a supported scene from Flow or approve a scene.

Preserve original photo backgrounds and use contain sizing in the review. Never
turn a wide photo into a narrow cropped column. Board plans without
finished artwork use the established color-driven fallback: blue rank-reveal
plans and charcoal/blue comparison and stat plans. These are review placeholders;
they do not change the approved Figma background or motion source.

Anchor compact visual-preview pills at the top center of the image or motion
frame with a safe inset. Keep typography, spacing, colors, geometry, responsive
behavior, and navigation in the shared bundle. Episode records supply content.
Do not copy an older episode's HTML or add episode-specific CSS overrides.

## locked Post-Figma UI

Post-Figma uses the same header, typography, media sizing, spacing, source-link
style, and review controls as Pre-Figma. The shared bundle owns both stages.
Use fixed filters for all seven approved lanes. Show verified scene media first,
then its title, timestamp, lane, option, timed transcript, Figma source, proof
link, and review state. Scene details retain this order.

An empty stage says that scene previews are pending. Never label a source photo
or color plan as a finished Figma scene. Bind Post-Figma choices to the current
preview evidence so changing a render makes its old choices stale.

Generate both stages with the repository command:

```bash
python3 scripts/render-lineups-review.py --episode EPISODE_DIRECTORY --preview-root SITE_DIST
npm run check:lineups:review
```

Each episode supplies `review.json`, its current cue map, passed timing receipt,
word transcript, discovery ledger, photo proposals, and optional verified scene
previews. The renderer writes one packet under `public/decision-maps/` and copies
that same packet to Sites. Vercel serves the same generated public packet when
production publication is authorized. A preview host cannot introduce another
layout, stylesheet, or set of controls.

`npm run check:lineups:review` verifies the source lock, both generated pages,
and copied styles/scripts. It also runs before the Vercel build. A template hash
mismatch stops publication. New UI ideas remain outside the episode until
Jerami approves a template change and its lock is updated.

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
