# Lineups treatment system

Read this before mapping a Catena Media Lineups transcript, finding player art,
building a scene, or touching Premiere.

## plain language

- **Lane** names the type of visual the transcript needs.
- **Option** names the approved look inside that lane.
- **Setting** changes content capacity, such as subject count, season count, or
  stat count.
- **Engine** names the authoring tool: Figma or Unreal. It never renames a lane.

Keep component, variant, instance, and property language inside the Figma
implementation notes.

## engine choice after selection

After transcript discovery, pacing and human candidate selection, a selected
**Lane 4 / Comparison / player 2-up** must ask: **Figma or Unreal?** There is no default.
Keep the existing option name and subject count; record the engine separately.
The seven lane names and numbers in `config/lineups/engine-routing.json` stay
fixed across both tools. The fixed team routes below take precedence.

Before authoring, run `python3 scripts/lineups-templates.py engine-choice MANIFEST`.
It checks the selected candidate against current transcript discovery. Ask the
returned question in chat. Record Jerami's answer using `--engine figma|unreal
--answer 'actual answer'`. This saves `engineChoice` in the scene manifest.
Discovery preflight rejects a missing, stale or mismatched choice. Re-ask when
the transcript revision, candidate, option or subject count changes. The answer
is per scene; never turn one answer into an episode-wide engine default.

Figma retrieves the registered option in Components with its existing asset
rules. Unreal points to `config/unreal/comparison-template-01.json`, the approved
player comparison master: fuller bodies and legs, mask-only background removal,
team edge lighting, dimensional logos and one small smooth camera push. Its card
is hidden for conceptual comparisons or shows 1–5 sourced rows at 36 px or larger.
The demo's generated cutouts remain a demo-only exception. A team or period
comparison can record an Unreal preference, but returns a reference gap until
an approved source exists; do not invent a replacement.

Choosing Unreal does not pass the episode Mark/Manim hold and exit checks or the
production handoff gate. No production renderer default changes. Review-only
copies must remain labeled Unreal; never send them through Figma receipts.

## episode workspace

At episode start, use `singleton-figma-system` for the shared Figma structure.
Use simple episode titles and actual-workday labels at exactly 300 px. Keep
episodes left to right by known work date, with wide gaps for a quick Loom pan.
Keep a spec for each approved lane used. Loose cutouts, logos, original photos,
extra render parts, and old versions live on `Player Cut Outs + Logos`, grouped
by episode. Preserve the scene artwork, IDs, approved sources, and motion.
Apply this at the first authorized Figma build; the review gates still apply.

## seven lanes

### 1. quick action photo

Use for an ordinary player or team mention with no data that changes the
argument. Stay on Mark when a photo adds no value. Requested default: 4.5 seconds.
Record requested seconds separately from actual frame-rounded duration. Use
nearest-half-up: 113 frames at 25 fps is 4.52 seconds. Render padding remains
separate; this default does not shorten other lanes.

### 2. quick stat

Choose one of two options:

1. **Single-frame statement** — one full-frame photo, an optional upper-left
   topic, and one centered lower-third statement. Build a 6.5-second master.
2. **Two-photo progression** — a contextual photo followed by the subject or
   consequence photo. Build one 10-second Figma scene with two five-second
   photo states. Keep the upper-left topic visible across both states. Reveal
   the supporting statement on the second state.

Use the [approved Components callout](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/lineups?node-id=868-776):
Inter Bold at 64 px, fixed 190 px
height, 72 px side padding, and vertically centered text. Hug width only;
never collapse height to the text. Reduce type only for a long line that
exceeds the safe width, preserving panel height and padding. Keep all copy on one horizontal
line. One point has no pipe. Use one pipe only when two separate, parallel facts
belong in the same statement. Do not add labels or a subtitle. The card hugs the
complete statement while remaining large enough to read at playback size. A
subject name appears once. Do not repeat it in the topic. The optional
upper-left topic may use the approved small qualifier and large topic stack.
Populate it with transcript-derived language when the passage needs framing.

Components owns this standard. Past episodes are examples. The template
registry binds each approved look to its source, and measured callout checks
must pass after copy changes. A lane match does not prove a visual match.

The two-photo progression stays photo-led. Do not use Field Night. Premiere
owns its transitions: Blur Dissolve may sit at the start and end, while a light
leak may cross the photo change. These treatments may also be used separately
elsewhere; do not impose a global transition order or alternation rule.

### 3. stat breakdown

Use one subject with three or four data points. The approved option is an action
photo on the left and a solid data panel on the right. Match the action to the
claim. A passing-touchdown claim needs a throwing photo.

### 4. comparison

Choose one of five options:

1. **Cinematic 2-up** — two subjects, action photos, and one clear visual
   argument.
2. **Simple comparison** — two to four subjects or periods with one main value
   each.
3. **Full comparison: 2** — two subjects with multiple comparable values.
4. **Full comparison: 3** — three subjects with multiple comparable values.
5. **Full comparison: 4** — four subjects with multiple comparable values.

Simple and full comparisons use the approved Field Night background. Cinematic
2-up keeps its photo-led split treatment. The MVP tracker is the locked simple
comparison reference. Supporting statistics are optional in Cinematic 2-up.
Show them only when the transcript supplies a true like-for-like comparison.
Leave the fields blank when the comparison is conceptual. Do not fill empty
space with jersey numbers, years, or unrelated values.

In Figma, Cinematic 2-up always uses full photos with original backgrounds. Both photos
are visible together from the opening visual frame. Never delay the second
photo until its spoken mention. Shared motion may move both photos together;
text cues may follow speech. Keep the established top-left title position.
Never suggest alpha cutouts or Alpha/Asset Swap for this option. Lamar/Huntley,
Mahomes/Purdy and Pacheco/Walker use this same rule.

Simple and Full player comparisons follow the alpha-player workflow below.
A period-only comparison with no players needs no player cutouts.

### 5. year-by-year

Use one subject across three or more seasons or periods. Choose the compact
trend table when the sequence matters. Choose the simple comparison board when
one value per period is enough. The Mahomes touchdown trend is the locked trend
table reference.

### 6. asset swap

Use for a historical, causal, or emotional progression that needs movement.
Use the approved Field Night background, centered team logo, replaceable action
art, and transcript-timed swaps. The Patriots and 49ers scenes are locked
references.

Field Night, its measured source background geometry, the 1920 x 1080 export frame,
layer order, crop roles, and approved motion pattern are guarded. Episode
cutouts, team logos, transcript-derived copy, and reveal timing are replaceable.
Every subject in a cutout slot must have real alpha. Do not place a rectangular
photo, fake background, blur mask, or full-frame crop in that slot. Stop when an
approved component cannot support the episode without changing a guarded part.

The reviewed Asset Swap background keeps its 3424 x 1956.9296875 crop and
native motion. Its exact offset, image, blur and tracks are recorded in
`config/lineups/source-guards.json`. Lock this source background; preserve the
1920 x 1080 export frame. The former 2040 x 1166 rule does not resize existing
sources or episodes.

Record every selected source ID and Figma image hash in the episode asset
ledger. A source image may appear only once in an episode, including use as a
photo and reuse as a cutout. Replace the later occurrence before review.

Three-subject swaps use the left, center, and right thirds. Put the logo and
middle subject on the 960 px centerline. Put the side subjects near 320 px and
1600 px, and choose inward-facing poses when suitable sources exist.

Eagle tag writes require Jerami's approval for the exact operation. Do not add,
replace, rename, merge, or group tags during intake or asset selection without
that approval.

### 7. recurring board

Use when Mark returns to a named show premise. Current options are **Rank
Reveal** and **Super Bowl Bubble Board**. Update current teams, logos, ranks, and
labels inside the approved design. Rank Reveal stays conditional to ranked
episodes.

Mark's Power Rankings is a weekly Tuesday-afternoon filming workflow during the
season. Treat the next episode as new data in the same Rank Reveal system, not a
new design pass.

`Recurring Board / Rank Reveal / 10 Teams` (`1277:558`) is the only canonical
Rank Reveal source. The pre-normalized source was deleted. Assign logos only
through `Asset/Team Logo/Normalized/*` 96 x 78 wrappers. Set the ten teams and
logos once for the episode, then reveal cumulatively from rank 10 through rank 1.
Every state keeps all previously revealed rows visible. Rank 10 starts with
a scene-start 10-to-1 row-shell cascade. Ranks 9 through 1 keep the board
static and animate only the current team name and normalized logo.
The episode motion artifact is a verified detached working copy. The canonical
component remains the sole reusable source; detached episode copies never
become alternate masters.

Each reveal is transcript-driven. The scene manifest names the verified phrase
or word timestamp. Manim validates `sceneTime = transcriptTimestamp -
verifiedAnchorTimestamp` and the frame rate. Figma Motion alone renders the row
reveal from that cue. A static board, missing track, raw logo component, broken
cumulative state, or Premiere retime fails the Rank Reveal workflow.

## data-driven background

Stat breakdown, Simple and Full comparison, year-by-year, and recurring boards
use Field Night without the football. Keep the background locked and separate
from the editable artwork inside Figma. Bind its Figma node and image hash in
the scene manifest and verify them in the mutation readback. Photo-led options
keep their photos. Asset Swap keeps its football-visible Field Night background.

## alpha player assets and scene exports

Asset Swap, Simple comparison and Full comparison require real-alpha player
assets for player compositing. Figma Cinematic 2-up uses full photos with original
backgrounds and never uses player cutouts. Alpha belongs to the replaceable player
asset; it does not make the complete scene a transparent export.

Search Eagle for a suitable existing player cutout first. If one is unavailable,
choose a suitable simple action photo from Eagle or the approved photo sources
and use Figma's native Remove background tool. Preserve the source photo. Verify
real alpha, face and uniform detail, equipment, and clean edges against a
contrasting background before using the cutout. Reject rectangular photo
backgrounds and failed edges. Keep the approved composition and crop roles.

Quick Action Photo, Quick Stat, Stat Breakdown, Year-by-year, and Recurring Board
have no automatic player-cutout requirement. Keep the approved full photos or
board artwork for those lanes.

Export complete motion scenes with their approved backgrounds included.
Keeping background and artwork as separate editable Figma layers does not
require separate transparent artwork exports. Export a transparent overlay only
when Jerami explicitly requests that deliverable.

## full-transcript discovery

After obvious rankings and Quick Action opportunities, attempt the complete
transcript against all seven lanes before pacing or scene selection. Record
supported candidates, rejected possibilities with reasons, or genuine no-fit
outcomes. No scene quota creates filler. Missing assets remain explicit search
work; lack of an asset does not erase a supported passage.

The ledger records `schemaVersion: 1`, `episodeId`, the exact transcript file's
`transcriptSha256`, `fullTranscriptReviewed: true`, and seven `lanes` rows. Each
row records `lane`, all zero-based Whisper `reviewedSegmentIds` in source order,
and `findings`. Every finding records `outcome` and `reason`. Candidates and
rejections also record contiguous `segmentIds`, an actual `excerpt`, and `start`
and `end` in seconds within those segments. Candidates record `assetSearch`
with `status` (`needed`, `verified`, or `not-required`) and `evidence` naming
search work or source IDs. A no-fit row explains the lack of transcript support.

Bind `discoveryPath` and `transcriptPath` in the review-stage registry. Bind
`discoveryPath` and `timing.transcriptPath` in scene manifests. Run
`npm run check:lineups:framing` before advancing the review. Scoped mutation and
review-export preflight consume the same ledger. Missing, incomplete or stale
evidence blocks progression. Timing proof cannot satisfy discovery. These
checks establish structure, excerpts, coverage and freshness; human review
judges editorial reasoning.

## automatic routing

```text
0 data points                          -> quick action photo
1-2 data points                        -> quick stat
3-4 data points about one subject      -> stat breakdown
2 subjects and a visual argument       -> cinematic 2-up
2-4 subjects or periods, one value     -> simple comparison
2-4 subjects, several shared values    -> full comparison
1 subject across 3+ periods            -> year-by-year
named recurring premise                -> recurring board
progression that needs movement        -> asset swap
```

Choose the lightest lane that proves the passage. When two options fit equally,
avoid repeating the same look in consecutive scenes. The system cannot invent
a new option during an edit. A new design stays experimental until Jerami
promotes it.

The seven lanes stay fixed. Approved patterns live as named options inside a
lane. An episode chooses an existing option and changes its settings. A new
pattern requires review before it joins the option menu; it does not become an
eighth lane.

## transcript-to-graphic copy

Preserve the speaker's meaning, attribution, causal ownership, and spoken
order. Compress or closely paraphrase the transcript. Do not invent a new
editorial angle. When the transcript says the defense created four takeaways
and the offense remained inefficient, the graphic may say `4 DEFENSIVE
TAKEAWAYS WEREN'T ENOUGH`. It must not imply that Arch committed four turnovers.

## image rules

- Use every suitable client-provided Eagle asset. A supplied contextual photo
  is not rejected because it is not an action shot.
- For new searches, prefer action photography for active players. Avoid roster
  portraits and players posed at the camera. Sideline, event, archival, and
  contextual photos are approved when they fit the transcript, especially for
  coaches and retired players. Action-first is a search preference, not a veto.
- Search Eagle first. For missing artwork, use Google or Google Images with
  `{missing asset} {episode year} week {episode week}`. Add the team, opponent,
  or `action photo` when it narrows the result. For this episode, for example:
  `Tyler Huntley Baltimore Ravens 2026 week 6 action photo`.
- Read `lineups-asset-search.md` and use the Keychain-backed
  `scripts/firecrawl-source-inspect.py` helper to inspect recorded candidate
  source pages for original image links, captions, dates, and credits. Its
  PreToolUse hook binds each request to the scene and current search evidence.
  If Firecrawl fails, record the failure and inspect the pages through the
  browser. Search thumbnails
  are leads; verify the original photo before selecting it. Record its source
  URL, date, team context, credit or license, and checksum in the asset ledger.
- Use the episode's year and week, even when preparing an older episode.
  Broaden to the prior game week or a verified archival action photo when the
  exact search has no suitable result. Record that fallback. Keep supported
  scenes in the review with `assetSearch.status: "needed"` until selection;
  missing artwork cannot reject a transcript-supported candidate.
- Every photo scene exports at 1920 x 1080. Scale the photo until it fills or
  extends beyond the frame. Side bars and uncovered edges fail review.
- Keep faces clear. Match the action to the claim. Avoid nearby photo repeats.
- Keep source links and research notes off the graphic.
- Verify current college or NFL team, roster status, and jersey number before
  labeling a player.

## pacing

Preserve the delivered Lineups profile unless new finished-export evidence
changes it: about 84% Mark, about 16% inserts, a typical five-second insert, 75%
at eight seconds or less, 90% at twelve seconds or less, and about one insert
every 41 seconds.

Photo-led Quick Stat and Stat Breakdown scenes use a full-clip push from 100%
on the first frame to 102.5% on the final frame. Build the standard single-photo
master at 6.5 seconds. In a Two-photo Quick Stat, reset the push for each
five-second photo state. Keep text and faces inside the safe area at 102.5%.
Do not apply this global push to Asset Swap, Comparison, or other motion comps.

## motion engine

Read `config/lineups/engine-routing.json` after transcript candidate selection.
Player 2-ups ask Jerami to choose Figma or Unreal. Period comparisons reuse
their registered Figma source. Fixed options keep their recorded route; a
different episode route needs a fresh, source-bound answer from Jerami.

The Figma production path uses Figma Motion as its sole visual motion engine.
An Unreal review master does not bypass its open production gates. Manim validates the Whisper word anchors, cue math,
frame rate, and composition timing; it never renders the scene. The required
order is Whisper word-level transcript -> Manim timing validation and cue proof
-> Pre-Figma review page -> human candidate decisions -> Lane 4 2-up engine
question when applicable -> the selected authoring path. Figma production uses
Figma Motion. The cue
list owns `transcriptTimestamp`, `sceneTime`, action, and duration. The hook
checks the math and motion proof before Figma mutation or export.

Team callout uses `config/lineups/team-callout-contract.json`, including its
current source fingerprint and all 8 protected node roles. It does not use
the Single-frame statement callout contract. Fetch the exact bound nodes and
check their measured properties. Keep the normal episode approval receipts.

For Rank Reveal with the current-team panel and row highlight, bind all 4
`figma.rankReveal.contentNodeIds` roles: `teamText`, `logo`, `currentTeamPanel`,
and `rowHighlight`. Their opacity tracks use the same team-content cue.
The earlier 2-node layout remains readable for prior records. New nodes cannot
be added as unnamed tracks or used to replay the whole board.

Every composition is at least 10 seconds long and extends at least two seconds
beyond its last content cue. This padding is intentional so Premiere can trim a
longer source instead of sending the scene back to Figma.

## active-system rule

Approved options live in the current menu. Working pages use copies of those
approved options. Idea boards remain references. Rejected drafts, replaced
masters, and stale labels leave active pages after each review pass.

## episode review lifecycle

Read `lineups-episode-lifecycle.md` for the project record, locked review UIs,
Asana task flow, and closeout boundary.

Pre-Figma review and Post-Figma review are fixed Lineups stages. Reuse the
established Decision Map structure for each episode. Replace the episode title,
date, transcript beats, lane and option choices, source links, candidate count,
and review state. Do not create a new review-page design or a new Figma option
for each video.

The Pre-Figma stage is generated only after the completed Whisper transcript
passes Manim timing validation. It reviews transcript mapping and proposed lane,
option, and setting choices before Figma work. The Post-Figma stage reviews
current episode copies, motion previews, and proof after Figma work. Both stages use the
approved source families in Figma Components. Episode Workspace holds the
temporary episode copies.

Episode-specific Decision Maps are temporary review surfaces. Figma source
components and Eagle assets are the durable sources. An Asana task may be
completed only after its required review and delivery readback pass and its
approved motion renders are in Eagle. When the task is complete, remove that episode's
Pre-Figma and Post-Figma Decision Map directories plus their index, route,
redirect, gate, and test registrations. Keep this lifecycle, the reusable stage
structure, approved Figma source components, Eagle assets, and durable evidence
receipts.

## pre-Premiere gate

Before placement, inspect a fresh 1920 x 1080 screenshot and confirm:

- the selected lane and option match the transcript;
- the image covers the frame and the face is clear;
- text is readable, aligned, and free of overflow;
- repeated spacing is equal;
- the photo is relevant and is not repeated nearby;
- no source note, unexplained wash, or unapproved background appears;
- all episode values and art can be replaced without rebuilding the design.
- Asset Swap, Simple and Full comparison player assets have real alpha and clean edges.
- Cinematic 2-up has both full photos visible at the opening and the top-left title.
- Asset Swap inherits the guarded background, geometry, layer order, crop
  roles, and motion from the approved component.

Premiere placement waits until this gate passes.

Runtime evidence and retry handling follow [the Lineups template system](../../../../../docs/lineups-template-system.md). A boolean timing flag cannot replace a current Manim receipt. Bind human approval to the scene and evidence revision.

## selected team routes

Jerami selected these engine routes on October 21, 2026:

| Lane | Option | Engine | Source |
| --- | --- | --- | --- |
| 2 / Quick Stat | Team callout | Figma | `quick-stat.team-callout`, component `1843:1021` |
| 4 / Comparison | Team matchup, 2 teams | Unreal | `comparison.team-matchup.2` |
| 4 / Comparison | Logo stat cards, 2 teams | Unreal | `comparison.logo-stat-cards.2` |

These routes do not ask for the engine again. The selected transcript candidate
and revision must still match. Player 2-up keeps the Figma/Unreal question.
The two team-logo entries use `config/unreal/team-logo-template.json`; their old
Figma nodes are preserved for recovery, not used as fallback authoring targets.
They remain pending native and human review.

Team callout uses the team's primary color for the logo block and name tab,
white text for the name, and dark copy on white. The body hugs the copy
with 48 px on each side. The 240 px logo block and full callout sit 36 px from
the bottom at 1920 × 1080. Keep the clean soft shadow. See
`config/lineups/team-callout-contract.json`. Human review and episode motion
proof remain open.

Team stadium plates use dry matte grass. Keep colored light in the stands and
roofline, with restrained neutral field light. Logos and panels stay editable.
Entrance cues follow Mark and same-revision Manim. Hold static with no animation
out; Premiere owns the cut or transition.

### locked paired-logo card style

Rams/Seahawks is the sole card style for both team options. Use angled stripes
near the team's colors, a large team logo, a thin shiny border and a dark name
strip. Swap team colors, logo and name; show a record or rank only when needed.
Browns/Ravens and Chiefs/Chargers use this same style.

Use Three.js to generate one reusable GLB card shell with real geometry and
standard PBR materials. Team colors are replaceable material inputs. Review
one native Unreal still against the locked reference before adding logos,
text, stadium or motion. Unreal owns logo depth, lighting, camera and a smooth
entrance, then static hold with no animation out. Prototype maps and the shell
proof are not approved reusable masters.
The source image and hash are in `config/unreal/team-logo-template.json`.
