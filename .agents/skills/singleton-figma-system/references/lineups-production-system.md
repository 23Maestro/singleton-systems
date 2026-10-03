# Lineups production system

Use this internal reference for Catena Media Lineups work. Read the approved
front-facing contract first:

`plugins/s-systems/skills/client-video-storyboard/references/lineups-treatment-system.md`

Do not expose Figma implementation terms in Jerami's menus, storyboards, or
review notes. Use lane, option, and setting there.

## page ownership

- `Foundations` holds approved colors, type, spacing, Field Night art, and
  measured reference examples.
- `Components` holds the only editable source for every approved option.
- `Episode Workspace` holds episode copies and motion work.
- `V1 Lineups` remains an idea and reference board until an option is promoted.

Do not keep duplicate source components on two pages. When an option is
promoted, move its source to Components and replace other working versions with
instances. Remove rejected drafts and stale labels from active pages.

Every approved option and reusable motion state must remain an instance of its
source family. Do not rebuild state A, state B, or an episode variation from
loose substitute layers.

## canvas rules

- Do not create black, white, or image background planes behind documentation
  sections. The Figma page is the canvas.
- Use black documentation text by default. Keep section headings at 112 px or
  larger and support labels at 48 px or larger.
- Center scene-title text. Use Auto Width or a hugging container with tight
  bounds. Place operator labels at a consistent offset above each composition.
  Use white only on an intentional dark documentation surface.
- Figma's native frame-name label is interface chrome. Rename it clearly, but
  use a separate operator text layer when alignment, color, or type size must
  be controlled.
- Keep production art inside explicit 1920 x 1080 export frames.
- Scale image fills to cover the export frame. The source may extend beyond the
  frame. Do not leave side bars or uncovered edges.
- Keep editable bounds tight. Text frames hug their visible copy. Alpha-cutout
  containers hug the usable subject art. Do not leave a left-aligned text frame
  or cutout container spanning the full export width. The outer export frame
  remains 1920 x 1080.
- Use large operator-facing labels. Check them at zoomed-out working scale.
- Use numerals in scene copy, operator labels, and episode layer names. Write
  `3 WEEKS`, `2 SEASONS AGO`, and `3 WINS`; preserve the original transcript
  wording in evidence and spoken-word cue anchors.
- Align comparison subjects by their visible head tops and optical scale,
  then check the final motion state. Equal image-container heights alone do
  not establish visual alignment.
- Organize episode pages as horizontal lane columns with a shared top baseline.
  Order active columns as Quick Action Photos, Quick Stats, Stat Breakdowns,
  Comparison, Asset Swap, Year-by-Year, and Recurring Boards. Omit unused lanes
  and number the visible columns consecutively. Use a two-column scene grid
  inside lanes with multiple scenes and one column for a single scene. Keep
  each scene's centered title and timing label above its composition.
- Every episode composition has native Figma motion, including Quick Action
  Photos. Verify transcript entrances and retain at least five seconds of the
  final held state after the last motion keyframe. Keep editorial trim lengths
  separate from padded composition durations.

Before structural writes, load `file-hygiene` and `layer-cleanup`. Before an
Auto Layout conversion or sizing refactor, also load
`safe-auto-layout-conversion`. Before color or contrast work, also load
`accessibility-review` and use its static-media mode.

## approved source families

Build one source family for each lane:

1. Quick action photo.
2. Quick stat with `Single-frame statement` and `Two-photo progression`
   options. Both allow an optional upper-left topic and a centered hugging
   lower-third. Two-photo progression has two five-second photo states in one
   10-second scene.
3. Stat breakdown with a photo slot, subject, headline, three or four values,
   labels, and optional dividers.
4. Comparison with `Cinematic`, `Simple`, and `Full` layouts. Cinematic uses two
   subjects and permits empty supporting-stat fields. Simple uses two to four
   subjects or periods and one main value. Full uses subject-count settings of
   two, three, and four.
5. Year-by-year with `Trend table` and `Simple board` layouts and adjustable
   period count.
6. Asset swap with guarded Field Night art, centered logo, alpha-only
   replaceable people, start/end states, and transcript-timed motion copies.
7. Recurring board with `Rank Reveal` and `Super Bowl Bubble` layouts and
   adjustable item count.

Stat breakdown, Simple comparison, Full comparison, year-by-year, and recurring
boards use the locked no-football Field Night art. The approved image hash is
`6c84d05a7f038c5e3f9f14a4103cd9b533251e70` (source `594:1256`). Keep the background
and artwork as separate editable Figma layers. `figma.background` records the
setting, node ID, image hash, lock state, and separate-artwork state. Figma
mutation readback must return that object from live node properties. These layer
requirements do not require separate transparent artwork exports. Export the
complete motion scene with its approved background included. A transparent
overlay is a separate deliverable only when Jerami explicitly requests it.
Asset Swap keeps its football-visible Field Night source. Cinematic comparison
keeps its approved photo-led composition.

## editable and guarded values

Expose episode art, logos, transcript-derived copy, reveal timing, names,
headlines, values, labels, item count, period count, subject count, order, and
visibility. Use image slots, text properties, booleans, instance swaps, named
slots, and count variants where they fit.

Guard typography, spacing, accent color, divider width, safe areas, Field Night
art, its 2040 x 1166 background geometry, layer order, crop roles, approved
motion, and 1920 x 1080 export geometry. Guarded layers cannot be detached,
replaced, resized, or animated in an episode copy. Use equal repeated spacing.
Use a solid 100% center divider in Cinematic comparison with enough width for
48 px stat labels.

The guarded Asset Swap background comes from the approved football-visible
Field Night layer in the Components source. Do not replace it with an episode
photo, regenerate it, or cover it with full-frame episode art.

Every Asset Swap subject slot requires a true-alpha image. Reject rectangular
photos, fake backgrounds, blur masks, and full-frame crops in those slots. Stop
when the source component cannot support the episode without changing a guarded
value.

Bind every episode source ID and final Figma image hash in `figma.assetLedger`.
Reject a repeated source ID or image hash anywhere in the same episode.

For three-subject Asset Swaps, place the left, center, and right slot centers at
about 320 px, 960 px, and 1600 px. The logo and center subject must share the
960 px centerline. Choose side poses that face inward when the available source
set supports it.

## alpha player assets

Asset Swap and Comparison require real-alpha player assets for player
compositing. This applies to Cinematic 2-up, Simple comparison, and Full
comparison with two, three, or four subjects. A period-only comparison with no
players needs no player cutouts. The other five lanes have no automatic
player-cutout requirement. Player-asset alpha and final scene-export alpha are
separate decisions.

Search Eagle for suitable existing alpha player art first. If none is suitable,
choose a simple action photo from Eagle or the approved photo sources. Preserve
the original, place it in Figma, select the image layer, and use Figma Design's
native `Remove background` action. Let Computer Use trigger the visible action.
Batch the selection when Figma allows it. Preserve approved geometry and crop
roles when placing the result.

Review every result against a contrasting background. The cutout passes only
when it has real alpha, keeps the subject's face, uniform, equipment, and edge
detail intact, and contains no rectangular photo background. A failed edge or
changed subject returns to the original.

Do not send identity-sensitive sports photos through generative image editing
for routine background removal. If the native Figma action is unavailable or
fails review, preserve the original and report the failure before substituting
another removal tool.

## quick-stat geometry

Use the [Components callout source](https://www.figma.com/design/o7E24iymIT80MTXGYIogVH/lineups?node-id=868-776)
(`868:776`): Inter Bold at 64 px, a
fixed 190 px panel height, 72 px left and right padding, and vertically centered
text. Hug width only. Never set the panel's vertical sizing to Hug or Auto.
Keep these measurements in every source and episode copy. Reduce the font
only when a long statement exceeds the safe width; preserve height and padding.
Keep the copy on one
horizontal line. One point has no pipe. Two separate, parallel facts use one
pipe. Do not use labels or subtitles. Keep the subject name once. Center the
card near the bottom. Let it hug the complete statement, then scale the whole
card for readability. A slight approved transparency is allowed. Do not place
the card over the upper-left topic.

Preserve the approved bottom edge when the statement changes height. In the
current 1920 x 1080 source, the wrapper starts at y = -7 and the panel ends at
y = 1006 inside that wrapper, leaving 81 px below the panel in the scene.
The fixed 190 px panel uses wrapper top padding = 816. Center it on x = 960
after the copy hugs horizontally. The approved 64 px text box is 77 px high,
leaving 56.5 px above and below it. Do not collapse this breathing room when
copy changes.

The machine-readable authority is `config/lineups/callout-contract.json`.
It binds the source file, Components page, exact role node IDs, protected
geometry and styling, and a SHA-256 fingerprint. Episode examples are reference
evidence; they never own this standard.

The upper-left topic may use the approved small qualifier and large topic
stack. Keep both fields transcript-derived. Hide an unused field through the
component setting; do not add filler copy.

For Single-frame statement, build a 6.5-second master and keyframe scale from
100% on the first frame to 102.5% on the final frame. For Two-photo progression,
build one 10-second scene with two five-second states. Keep the upper-left topic
present across both states, reveal the supporting statement on state two, and
reset the 100% to 102.5% push for each photo. Text and faces must remain inside
the safe area at 102.5%.

Do not bake the light leak or Blur Dissolve into the Figma render. Premiere owns
the opening and closing Blur Dissolves and the midpoint light leak. This is the
approved assembly for Two-photo progression, not a global transition hierarchy.

## template retrieval and drift checks

`config/lineups/template-registry.json` binds approved options and capacities
to exact Components node IDs. Resolve by its stable key, never by page order,
search keywords, or an episode name. Template names are display labels.

Use `python3 scripts/lineups-templates.py resolve quick-stat.single` to retrieve
a source. `fetch-sources` emits a read-only Figma tool input; execute it with
`figma-use`, save its actual JSON response, then run
`python3 scripts/lineups-templates.py check <readback.json>`.
Missing IDs, wrong source ownership, and unsupported capacities fail without
substituting an old episode design. The unbound Simple board option remains a
reference gap until its canonical source is registered.

For lane fit, pass reviewed requirements to
`python3 scripts/lineups-templates.py fit <candidate.json>`. Include transcript
evidence, visual purpose, supported counts, and comparison kind. Player
compositing requires verified real alpha; team-logo and period comparisons do
not need player cutouts. Multiple eligible looks require review. The resolver
checks declared requirements; it does not infer or approve transcript meaning.

Quick Stat manifests must include `figma.templateBinding`: template key,
callout contract ID, source fingerprint, and exact episode wrapper/panel/text
IDs. Generate readback with `fetch-callouts <bindings.json>`; read properties
from live nodes. Mutation readback and delivery receipts must include
`calloutReadback` and `sourceCallout`. A matching source ID or prose revision
alone does not prove design fidelity. The hook rejects changed typography,
panel sizing, padding, appearance, centering, baseline, and text overflow.
Long-copy type reduction requires a recorded fit override with measured overflow
at 64 px; it never updates the reusable source.

`npm run check:lineups:templates` tests retrieval, ambiguous lane fit, and the
historical callout regressions against saved live readbacks. Registry entries
declare visual-check coverage. The other lanes retain their existing geometry,
background, alpha, asset, and motion gates; full style comparisons for them
remain uncovered. Review their screenshots before calling them complete.

## repeated logo alignment

Use one right-side logo slot with a shared center for ranking cards. Center the
visible artwork vertically in each card and horizontally in that slot. Measure
opaque artwork bounds; transparent file padding does not define alignment.
Preserve aspect ratio. Normalize visual size across logos and inspect the result
at 1920 x 1080. Uniform frame dimensions alone do not pass. Card gaps follow the
available frame space and visual balance; an example gap is not a fixed token.

For Rank Reveal, use only the canonical component
`Recurring Board / Rank Reveal / 10 Teams` (`1277:558`). The broken
pre-normalized master is not a legacy option; it has been deleted. Every logo
swap must target an `Asset/Team Logo/Normalized/*` 96 x 78 wrapper. Never assign
a raw logo atom directly to a ranking row. Preserve the 10-to-1 cumulative
reveal order and keep previously revealed rows visible. Rank 10 alone owns the
scene-start 10-to-1 row-shell cascade. Ranks 9 through 1 must not inherit that
cascade; they animate only the current rank's team name and normalized logo at
the transcript-proven cue. Verify the canonical instance first, then detach the
episode motion copy because Figma cannot write keyframes to instance sublayers.
Do not turn that detached copy into another reusable master.

## motion-render ownership

All Lineups motion uses a fixed split of responsibility. Figma owns the
approved visual source and Figma Motion is the sole visual motion engine. Manim
is the transcript timing validator only. The active
manifest must set `motion.engine` to `figma`, `motion.engineVersion` to
`figma-motion`, and `motion.timingValidator` to `manim`. Validate the cue math
through `validate_manim_timing_from_manifest()`, then write those cue times into
Figma Motion manual keyframes. Do not render any Lineups scene in Manim.

The Lineups Figma file fails closed without an active scene manifest. Create the
manifest before any episode composition. A static episode instance is not a
motion handoff. For every motion scene, verify the canonical instance, then
detach only the episode working copy before writing transcript-timed keyframes;
the detached copy must never become another reusable master. Read back the
Figma Motion track for the newly revealed row and
prove its keyframes begin at the cue time and complete at the approved duration.
The Rank 10 board cascade begins at scene time 0. Every later state keeps its
board static and visible so component-level generic motion cannot leak across
the weekly sequence.

Do not rebuild approved geometry in Manim. Do not copy cue times from a visual
timeline by eye. The scene manifest owns cue math and frame rate. Every motion
composition is at least 10 seconds long and extends at least two seconds beyond
its last content cue so Premiere always receives trim-safe padding.

Approved episode MP4s live in Eagle under `Episode / 06 Motion Renders`.
Premiere links to that Eagle-managed file and organizes it in the project bin
named `06 Motion Renders`. Delete temporary exports only after Eagle ingest and
Premiere readback both pass. Do not keep a second final motion-render folder in
`23Projects`.

The manifest records the approved Figma source revision and at least two hashed
1920 x 1080 proof frames. Both values must match the Figma-to-export and
export-to-Premiere receipts. Asset Swap delivery uses artifact role
`final-premiere-render` with background policy `football-visible-baked`.
Premiere readback must match the exact sequence, clip, track, start, duration,
and end values in the current manifest.

## lifecycle

```text
reference -> approved option -> source component -> episode copy -> screenshot
          -> export proof -> Premiere
```

After approval, prune the page in the same pass. Archive useful evidence outside
the active production sections. Delete rejected drafts when Jerami has already
removed or rejected them. A page that still presents old and current sources as
equal choices fails review.

## validation

Validate one source family at a time. Return every changed node ID. Capture a
fresh screenshot of the source family and one 1920 x 1080 episode example.
Check long names, maximum count, minimum count, image coverage, face visibility,
equal spacing, text overflow, and setting replacement before promoting the next
family.
