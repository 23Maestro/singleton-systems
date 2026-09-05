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
`6c84d05a7f038c5e3f9f14a4103cd9b533251e70` (source `594:1256`). Export transparent
foreground artwork separately. `figma.background` records the setting, node ID,
image hash, lock state, and separate-artwork state. Figma mutation readback must
return that object from live node properties. Asset Swap keeps its football-visible
Field Night source. Cinematic comparison remains photo-led.

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

## alpha-cutout trial — 2026-08-26

Test Figma Design's native `Remove background` action as the primary cutout
path for one to ten motion-scene candidates. Preserve the Eagle original,
place the selected images in Figma, select the image layers, and let Computer
Use trigger the visible action. Batch the selection when Figma allows it.

Review every result against a contrasting background. The cutout passes only
when it has real alpha, keeps the subject's face, uniform, equipment, and edge
detail intact, and contains no rectangular photo background. A failed edge or
changed subject returns to the original.

Do not send identity-sensitive sports photos through generative image editing
for routine background removal. Use a local removal model when the Figma action
is unavailable or fails review. Keep this path in trial status until one live
episode batch passes the cutout review.

## quick-stat geometry

Use Anton at 60 px for the full lower-third statement. Keep the copy on one
horizontal line. One point has no pipe. Two separate, parallel facts use one
pipe. Do not use labels or subtitles. Keep the subject name once. Center the
card near the bottom. Let it hug the complete statement, then scale the whole
card for readability. A slight approved transparency is allowed. Do not place
the card over the upper-left topic.

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

## repeated logo alignment

Use one right-side logo slot with a shared center for ranking cards. Center the
visible artwork vertically in each card and horizontally in that slot. Measure
opaque artwork bounds; transparent file padding does not define alignment.
Preserve aspect ratio. Normalize visual size across logos and inspect the result
at 1920 x 1080. Uniform frame dimensions alone do not pass. Card gaps follow the
available frame space and visual balance; an example gap is not a fixed token.

## motion-render ownership

Figma owns the approved visual source. Each beat names one render engine. A
Figma Motion beat reads the shared cue list into manual keyframes. A Manim beat
uses an approved Figma state as raster or exported vector input and reads the
same cue list through `tools/lineups_motion`.

Do not rebuild approved geometry in Manim. Do not copy cue times from a visual
timeline by eye. The scene manifest owns cue math and frame rate.

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
