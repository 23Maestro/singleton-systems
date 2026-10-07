# John’s Figma lane masters

Readiness: ready-for-build. Planning only; publication does not start the build. No due date is set.

## Problem Statement

John’s current batch has 18 Prayer videos and 6 Bold Beliefs videos. The brief and visual contracts supply the direction, but reusable production masters are still unbuilt. Jerami needs covers and opening treatments he can repeat without deciding the look again for every video.

## Solution

Build two Figma lane masters. Each has a 1080×1920 cover and a matching opening treatment. Prayer stays quiet and personal. Bold Beliefs stays direct and structured. Use restrained UI components to refine label containers or accents without adding visual clutter.

Figma owns design. Premiere owns footage and final assembly. Opus Clip owns captions. HyperFrames + GSAP remains an optional renderer when the required handoff cannot be produced through Figma.

## User Stories

1. As Jerami, I want the batch limited to 18 Prayer and 6 Bold Beliefs videos, so that reference-only lanes add no work.
2. As Jerami, I want one reusable master per active lane, so that I can repeat the approved look across John’s 24 videos.
3. As Jerami, I want the brief and contract linked to each master, so that I can check the design’s source.
4. As Jerami, I want Poppins Bold and SemiBold with Stadium Lights colors, so that the work follows John’s adopted brand direction.
5. As Jerami, I want a clear A PRAYER FOR label, so that Prayer stays recognizable.
6. As Jerami, I want Prayer’s white lead and violet final phrase above a dark lower fade, so that the supplied visual remains the model.
7. As Jerami, I want short Prayer headlines and breathing room, so that personal prayer footage keeps its quiet treatment.
8. As Jerami, I want a separate Bold Beliefs series label and concise statement headline, so that it does not inherit the Prayer design.
9. As Jerami, I want John prominent with his face clear in both lanes, so that graphics support the footage.
10. As Jerami, I want covers composed in 9:16, so that the smaller supplied preview is adapted without stretching.
11. As Jerami, I want role-matched UI containers available, so that a plain shape can receive a restrained design refinement.
12. As Jerami, I want component choices to preserve the required words and graphic density, so that refinement does not change the lane.
13. As Jerami, I want component provenance and reuse permission recorded, so that a community asset’s license is checked before delivery.
14. As Jerami, I want the first component choice reviewed in Figma, so that unreviewed decoration does not spread through the batch.
15. As Jerami, I want each title checked against its transcript, so that headline compression preserves the spoken meaning.
16. As Jerami, I want each cover frame tied to its own source, so that another video’s frame is never substituted silently.
17. As Jerami, I want title wording and line breaks editable through instances, so that I can work quickly without duplicating master logic.
18. As Jerami, I want a cover and matching opening pair, so that each video has a consistent visual handoff.
19. As Jerami, I want a static transparent opening allowed, so that holding or fading it in Premiere needs no forced animation.
20. As Jerami, I want no compulsory full-screen intro, so that the opening can stay over footage.
21. As Jerami, I want measured geometry after first approval, so that the existing ±10% adjustments have a real baseline.
22. As Jerami, I want later covers reviewed as a contact sheet, so that I can check consistency without opening each in Premiere.
23. As Jerami, I want the first opening from each lane tested over real footage in Premiere, so that transparency and framing are proved.
24. As Jerami, I want technical checks kept separate from visual approval, so that passing metadata tests cannot approve a design.
25. As Jerami, I want manual checks available until automatic hook activation is proved, so that production does not depend on an unverified blocker.
26. As Jerami, I want native captions disabled in the Opus handoff, so that the finished video does not contain duplicate captions.

## Implementation Decisions

- Adapt the existing contract resolver, graphics planner and handoff checker. Figma becomes the authoring owner. HyperFrames rendering requires an explicit fallback plan.
- Create a John lane-master component set with cover and opening variants. Record Figma file/node identities when built. The intake FigJam board stays a reference map.
- Prayer uses Poppins and Stadium Lights. Preserve the violet label with dark uppercase text, the lower headline hierarchy and dark fade. Do not tint natural footage blue or violet.
- Bold Beliefs gets its own structured layout. A clear series label and concise headline remain required. Its exact geometry is established in the first review.
- UI substitutions have a defined role: series-label container, headline support container or restrained brand accent. Record source and permission. Use an original component when a suitable reusable asset cannot be cleared.
- Keep font family, palette, required labels and hierarchy fixed. Shape substitution is a qualitative choice; ±10% applies to measured geometry. It is not a visual-similarity score.
- Per-video data includes lane, transcript-derived headline, line breaks, selected source frame and source identity. Bind the exact Premiere sequence before placement.
- Default exports are a PNG cover and transparent PNG opening. Premiere controls the opening hold or fade. Three seconds is an example, not a client requirement.
- Animated openings need a tested alpha handoff. Native Figma video export is not assumed to be ProRes 4444. A verified conversion or explicit fallback may produce the audio-free MOV.
- Generated media stays on HomeSSD after storage checks. Durable client sources stay on MediaSSD or in Eagle. No internal media fallback is allowed.
- Record measured baselines and first visual approval before batch reuse. File checks cannot prove typography, source selection or actual transparency.
- Scoped Figma hooks give policy reminders. They do not enforce master-node identity. Automatic activation of the new graphics hook remains unverified.
- Keep Asana state at Not started and Planning. This project has no readiness field or tag; record ready-for-build in the description without creating a global label.

## Testing Decisions

- The primary acceptance seam is the finished 9:16 cover/opening pair compared with the lane’s approved Figma master, followed by one opening test over real footage in Premiere. Jerami confirmed this seam.
- Check the required label, phone-scale readability, face clearance and lane treatment in the visible result. Record the selected component and measured baseline.
- Confirm static PNG transparency over footage. For animated MOV, also check playback, planned duration and frame rate against the actual Premiere sequence.
- Reuse the existing CLI contract tests and isolated graphics/storage fixtures. Test public outcomes: defaults, explicit fallback selection, stale-plan rejection, alpha metadata and import checks.
- The adapted graphics suite passes 31 tests. Fixture metadata is not a rendered sample or visual approval.
- Probe runtime hook activation separately before relying on automatic blocking. Use the manual graphics check for current production handoffs.
- Acceptance requires one approved pair per lane and a reusable instance that accepts different source copy without changing the fixed treatment.

## Out of Scope

Sermon, Lifestyle/Walking and Quote lanes; Ben or Eric masters; editing all 24 John videos during template setup; new caption styling; heavy animation; purchased assets without authorization; client messages; changing payment terms; automatic agent launches; commits or pushes.

## Further Notes

The two Figma masters remain unbuilt. Component selection and exact baseline measurements belong to the first design pass. This spec records direction and acceptance; it does not claim visual approval.

Sources and task links:

- [Ian’s visual direction](https://docs.google.com/document/d/1AmoyonXDcWnqPpYkCecxGnOVVxBk1dJbpdMSaRLkaSc/edit)
- [Edit brief](https://docs.google.com/document/d/1YsDSsA1NJq_UZPMMqTy9ZPiamBr2PUbZ/edit)
- [John’s brand book](https://docs.google.com/presentation/d/1-em4fWQRk5jL5AfOMyekNHHZvBJ-PRRoBSvPuA0aMKY/edit)
- [Prayer sources](https://drive.google.com/drive/folders/19AVZc_21-UO_a08Wi89BBxZgFE49uDG9)
- [Bold Beliefs sources](https://drive.google.com/drive/folders/1UGngy4ZQI2DDl2-BBWrmgQ9HV56HpC3s)
- [Visual intake board](https://www.figma.com/board/9XxBtJQCNLNNQZJaB02xiS)
- [John’s Asana task](https://app.asana.com/1/1216086803382161/project/1218890014545436/task/1219007029307127)
- [Existing Prayer sample task](https://app.asana.com/1/1216086803382161/project/1218890014545436/task/1219037240683523)
- [Published master-build spec](https://app.asana.com/1/1216086803382161/project/1218890014545436/task/1219234947208233)
