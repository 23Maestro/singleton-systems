# Lineups treatment system

Read this before mapping a Catena Media Lineups transcript, finding player art,
building a scene, or touching Premiere.

## plain language

- **Lane** names the type of visual the transcript needs.
- **Option** names the approved look inside that lane.
- **Setting** changes content capacity, such as subject count, season count, or
  stat count.

Keep component, variant, instance, and property language inside the Figma
implementation notes.

## seven lanes

### 1. quick action photo

Use for an ordinary player or team mention with no data that changes the
argument. Stay on Mark when a photo adds no value.

### 2. quick stat

Choose one of two options:

1. **Single-frame statement** — one full-frame photo, an optional upper-left
   topic, and one centered lower-third statement. Build a 6.5-second master.
2. **Two-photo progression** — a contextual photo followed by the subject or
   consequence photo. Build one 10-second Figma scene with two five-second
   photo states. Keep the upper-left topic visible across both states. Reveal
   the supporting statement on the second state.

Use Anton at 60 px throughout the lower third. Keep all copy on one horizontal
line. One point has no pipe. Use one pipe only when two separate, parallel facts
belong in the same statement. Do not add labels or a subtitle. The card hugs the
complete statement while remaining large enough to read at playback size. A
subject name appears once. Do not repeat it in the topic. The optional
upper-left topic may use the approved small qualifier and large topic stack.
Populate it with transcript-derived language when the passage needs framing.

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

Field Night, its 2040 x 1166 background geometry, the 1920 x 1080 export frame,
layer order, crop roles, and approved motion pattern are guarded. Episode
cutouts, team logos, transcript-derived copy, and reveal timing are replaceable.
Every subject in a cutout slot must have real alpha. Do not place a rectangular
photo, fake background, blur mask, or full-frame crop in that slot. Stop when an
approved component cannot support the episode without changing a guarded part.

### 7. recurring board

Use when Mark returns to a named show premise. Current options are **Rank
Reveal** and **Super Bowl Bubble Board**. Update current teams, logos, ranks, and
labels inside the approved design. Rank Reveal stays conditional to ranked
episodes.

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
- Search Eagle first. Then use the approved SportsDB or OpenWiki player path.
  Do not report an asset as missing before both paths are checked.
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

## active-system rule

Approved options live in the current menu. Working pages use copies of those
approved options. Idea boards remain references. Rejected drafts, replaced
masters, and stale labels leave active pages after each review pass.

## pre-Premiere gate

Before placement, inspect a fresh 1920 x 1080 screenshot and confirm:

- the selected lane and option match the transcript;
- the image covers the frame and the face is clear;
- text is readable, aligned, and free of overflow;
- repeated spacing is equal;
- the photo is relevant and is not repeated nearby;
- no source note, unexplained wash, or unapproved background appears;
- all episode values and art can be replaced without rebuilding the design.
- Asset Swap subjects have real alpha and inherit the guarded background,
  geometry, layer order, crop roles, and motion from the approved component.

Premiere placement waits until this gate passes.
