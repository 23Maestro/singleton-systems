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

## canvas rules

- Do not create black, white, or image background planes behind documentation
  sections. The Figma page is the canvas.
- Use black documentation text by default. Keep section headings at 112 px or
  larger and support labels at 48 px or larger.
- Keep production art inside explicit 1920 x 1080 export frames.
- Scale image fills to cover the export frame. The source may extend beyond the
  frame. Do not leave side bars or uncovered edges.
- Use large operator-facing labels. Check them at zoomed-out working scale.

## approved source families

Build one source family for each lane:

1. Quick action photo.
2. Quick stat with an optional subject label, optional headline, and a centered
   hugging lower-third.
3. Stat breakdown with a photo slot, subject, headline, three or four values,
   labels, and optional dividers.
4. Comparison with `Cinematic`, `Simple`, and `Full` layouts. Cinematic uses two
   subjects. Simple uses two to four subjects or periods and one main value.
   Full uses subject-count settings of two, three, and four.
5. Year-by-year with `Trend table` and `Simple board` layouts and adjustable
   period count.
6. Asset swap with Field Night, centered logo, replaceable people, start/end
   states, and transcript-timed motion copies.
7. Recurring board with `Rank Reveal` and `Super Bowl Bubble` layouts and
   adjustable item count.

Field Night is the default background setting for Simple comparison, Full
comparison, and Asset swap. Cinematic comparison remains photo-led.

## editable and guarded values

Expose episode art, logos, names, headlines, values, labels, item count, period
count, subject count, order, and visibility. Use image slots, text properties,
booleans, instance swaps, named slots, and count variants where they fit.

Guard typography, spacing, accent color, divider width, safe areas, Field Night
art, and 1920 x 1080 export geometry. Use equal repeated spacing. Use a solid
100% center divider in Cinematic comparison with enough width for 48 px stat
labels.

## quick-stat geometry

Keep the subject name once. Center the stat card near the bottom. Let the card
hug its contents, then scale the whole card for readability. A slight approved
transparency is allowed. Do not place the card over the top-left name or
headline.

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
