# Lineups episode lifecycle

Use this for every Catena Media Lineups video from intake through cleanup.
Each video is one episode project. The subject, team, league, or ranking is
episode data. It cannot create a new workflow, review-page design, lane, or
Figma source family.

## prior-production lookup

Before reporting a missing source, blocked workflow or need for a new template:

1. Read the latest matching production handoff in `docs/handoffs/` and the
   episode record under `config/lineups/closeouts/`. Follow its scene, source
   and export evidence. Current Components sources still own the approved look.
2. Match the content kind and approved option. A team across 2 weeks compares
   periods. It is not a player pair just because it has 2 values.
3. Name the reusable source and its engine. Keep a new engine experiment
   separate from the saved working route. Unreal is retired for new builds;
   its saved exports stay as history and never erase an existing Figma source.
4. If a current rule rejects that source, report the exact rule, expected value,
   observed value and evidence revision. Call this a validation conflict. Do
   not ask Jerami to recall the record or approve the same design again.

Week 8's starting record is
[`docs/handoffs/2026-10-21-week7-figma-review.md`](../../../../../docs/handoffs/2026-10-21-week7-figma-review.md):
23 Figma exports and 4 preserved Unreal exports (history). The Week 7 edit packet records
S01 as Ravens rank 3 last week versus rank 10 this week. Week 8 C01 and C02
already name Figma source `598:215`, registry key `comparison.simple.2`.
Use this evidence before proposing rank-comparison design work.

Reuse does not approve new episode content or choose an engine for Jerami.
Keep each required engine answer and scene review. Report conflicting engine
rules explicitly before changing their scope.

The player 2-up engine question does not apply to period comparisons. Team
callout and Rank Reveal reuse retain their recorded source bindings and look.

## project record

Create or update one Asana task when the episode files are ingested. Keep it in
the `Content Editor` project (`1218890014545436`) under `Catena`. Record:

- episode title and stable slug;
- actual workday or workday range, America/New_York time zone, and the work
  record that supports it; keep source dates and deadlines separate;
- source delivery and Eagle folder;
- confirmed delivery deadline as the Asana due date and time (10 AM America/New_York when only a date is supplied);
- transcript and client notes;
- Studio project ID and review URL;
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

Follow these 8 steps in order:

1. Resolve the episode, its Asana task and its Eagle source.
2. Complete the Whisper word-level transcript. Check unclear speech and the
   source offsets. Time words with forced alignment when Whisper times drift.
3. Review the full transcript across all 7 lanes. Use the latest meaning-led
   examples. Keep supported alternatives and asset needs visible. There is no
   scene quota. Check themes against the JSON discovery ledger with Jev.
4. Bind each proposed event to its spoken word or phrase. Issue a timing-only
   Manim receipt per scene, tied to the exact transcript, discovery and cue
   revision. No render is needed here.
5. Build the candidate packet and attach it to the episode's existing Studio
   project. Test the hosted project: scene roster, evidence, preview paths,
   saved feedback and reload. Return its direct HTTPS project link.
6. Jerami reviews the candidates and approves builds.
7. Build approved scenes in their recorded Figma or Blender route. Reuse current
   approved sources and the current Blender design work. Attach finished art
   and motion to the same Studio project.
8. Check finished motion with audio after the approved builds. That check runs
   in the chat Jerami named. Then follow the approval, Premiere, delivery, Eagle
   filing, Asana and Studio closeout rules below.

```text
episode, Asana task and Eagle source
  -> Whisper word-level transcript, checked
  -> seven-lane discovery bound to the transcript hash
  -> spoken cues and timing-only Manim receipts
  -> candidate packet in the existing Studio project, tested on the hosted site
  -> Jerami approves builds
  -> approved scenes built in Figma or Blender; art and motion attached in Studio
  -> finished motion checked with audio (other chat)
  -> Premiere edit and delivery readback
  -> file approved renders and final export in Eagle
  -> complete Asana task
  -> close its linked Studio project and retire the active gate records
```

## timing order and hook caveat

The timing order is a hard stop, not a suggestion:

```text
source media
  -> Whisper word-level transcript
  -> full-transcript seven-lane discovery with excerpts, outcomes and asset-search evidence
  -> theme review against the JSON discovery ledger
  -> candidate selection and pacing
  -> Manim timing validation and cue proof
  -> scene manifest with the passed timing receipt
  -> attach the verified storyboard to Studio
  -> human candidate decisions
  -> Figma Motion or the approved Blender master
  -> review the current artwork and motion in Studio
  -> finished motion with audio (other chat)
  -> Premiere placement
```

Run Manim after the Whisper transcript is complete and before building the
Studio storyboard. Use the passed timing receipt for the trigger phrase, cue,
frame rate, and proof status.

The hook caveat is explicit: current preflight validates the manifest's
`manimTimingValidated` contract, cue math, and motion proof; it does not
independently launch a fresh Manim run at mutation time. The upstream Manim
validation therefore needs a current cue-proof receipt tied to the Whisper
transcript hash and cue-map hash. A missing or stale receipt is a stop, not a
reason to defer validation until the build or Premiere.

## locked Pre-Figma UI

Studio replaces the Pre-Figma and Post-Figma pages for new episodes. The page
templates below serve earlier links and the source packet that Studio reads.
New episode handoffs use the Studio project URL.

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

This stage serves earlier links only. Post-Figma uses the same header, typography, media sizing, spacing, source-link
style, and review controls as Pre-Figma. The shared bundle owns both stages.
Use fixed filters for all seven approved lanes. Show verified scene media first,
then its title, timestamp, lane, option, timed transcript, Figma source, proof
link, and review state. Scene details retain this order.

An empty stage says that scene previews are pending. Never label a source photo
or color plan as a finished Figma scene. Bind Post-Figma choices to the current
preview evidence so changing a render makes its old choices stale.

Use the command below only when rebuilding an earlier published link.
For a new Studio handoff, use the local packet build in the repository's
`tools/review_workspace/README.md`.

```bash
python3 scripts/render-lineups-review.py --episode EPISODE_DIRECTORY --preview-root SITE_DIST
npm run check:lineups:review
```

Set `reviewSlug` in `review.json` for a Studio source packet so the folder
does not carry a stage name. Each episode supplies `review.json`, its current cue map, passed timing receipt,
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
- a passed Manim timing receipt tied to the Whisper transcript and cue-map hashes before Studio handoff;
- a live Figma Motion opacity track aligned to the cue start and duration;
- live Figma readback matching the manifest before export.

Use this record shape for each new active episode:

```json
{
  "episodeSlug": "episode-slug",
  "asanaTask": "1234567890123456",
  "dueDate": "YYYY-MM-DD",
  "transcriptPath": "config/lineups/episodes/episode-slug/transcript/whisper.json",
  "discoveryPath": "config/lineups/episodes/episode-slug/storyboard/lane-discovery.json",
  "cueMapPath": "config/lineups/episodes/episode-slug/storyboard/cue-map.json",
  "timingProofPath": "config/lineups/episodes/episode-slug/storyboard/cue-proof-receipt.json",
  "studio": {
    "projectId": "studio-project-uuid",
    "packetPath": "/Volumes/HomeSSD/Generated/CATENA_MEDIA/previews/episode-slug/studio/packet.json",
    "candidateCount": 0
  }
}
```

`check:lineups:framing` reads `studio` before `preFigma`. It checks the packet
roster and revision against the proved cue map and every scene receipt.
Earlier records keep their `preFigma`, `postFigma`, `map` and `proof` fields.

## closeout

After task closeout confirms Asana completion, use its `finish` or `check`
command with `--studio-project PROJECT_ID` to close the linked project.
Use **Delete project** in Studio for a manual purge of its review data.

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

Use the Studio command in the skill's storyboard handoff. Keep the verified
source packet and generated preview assets in the Catena preview workspace.
Open the returned HTTPS project link and read back the episode, packet revision,
and source chat. Record that Studio URL in Asana. Keep the local packet as
the recovery source. Follow the deployment skill's production gate for site
releases.

Runtime evidence and retry handling follow [the Lineups template system](../../../../../docs/lineups-template-system.md). A boolean timing flag cannot replace a current Manim receipt. Bind human approval to the scene and evidence revision.
