# FaithTalk TV: reference-first alignment

September 24, 2026. This plan supersedes claims that the current Concept 02 board is already matched to the client PDF. Jerami reviewed it and requested exact scene and element alignment before motion polish.

## Owner and schedule

[FaithTalk TV in Linear](https://linear.app/23maestro/project/faithtalk-tv-f713f2b595e0) owns status and blockers. Scope: $600, two revision rounds, intro, editable outro, studio screen. Saturday September 26 is the desired completion target for Monday review; Sunday September 27 was the earlier absolute latest. Pending client inputs remain real blockers to final delivery.

## Reference hierarchy

1. Jerami's latest instructions and the September 24 client call.
2. [Client PDF](references/alignment-2026-09-24/client-storyboard.pdf): Concept 01 intro, Concept 02 outro. Page 7 is the directional-card and studio reference.
3. Final supplied logos, exact colors, destinations, script and VO when received.
4. [Minimal Broadcast](https://elements.envato.com/minimal-broadcast-package-for-premiere-pro-clean-t-FCQPRWV) for motion treatment only. It must not change the client's approved composition.

Retain the agreed TV text sizes: 80 / 56 / 52 / 40 px at the 1920×1080 design scale, scaled to 4K. If those sizes conflict with measured source wrapping or placement, record the exact conflict; do not silently shrink text or redesign the card. Brand codes and source geometry must be measured, not guessed from the existing Figma board.

## Exact scope of the reference

Page 7 contains four directional cards, in order:

| Card | Current Figma node | Source requirement / first observed gap | Linear |
| --- | --- | --- | --- |
| Contact/Connect | `24:760` | Center green band; heading; handle with gold social icons on the same row; URL; four credits columns beneath. Current frame has no credits and substitutes a separate platform-name row. | [23M-198](https://linear.app/23maestro/issue/23M-198) |
| Share Your Story/Featured | `24:786` | Two-line headline group over image; submission block centered within lower green panel; gold bottom rule. Measure both groups separately; horizontal CENTER is not proof of correct placement. | [23M-199](https://linear.app/23maestro/issue/23M-199) |
| Call to Prayer | `24:813` | Quote over image; request and URL inside lower green panel; gold bottom rule; network mark upper right. Current image differs from the reference's human/terrain composition. | [23M-200](https://linear.app/23maestro/issue/23M-200) |
| Next Week teaser | `24:859` | Text and FaithTalk lockup form one centered group over green-treated congregation; network mark upper right. Check source proportions, spacing and image crop. | [23M-201](https://linear.app/23maestro/issue/23M-201) |

The three lower-row studio backdrops are alternatives. The room photograph is a mockup. Neither is an additional outro CTA. The brief also requires a clean ending: track that separately and do not invent a fifth reference card. The existing production section includes closing `24:892` and studio `24:922`; make their purpose distinct from the four directional cards.

Jerami reported duplicate story content. Locate its actual playback/board context and reconcile it against the four-card inventory. A reusable master or isolated motion study is not automatically a second playback scene. Do not dismiss the reported duplication or delete useful masters without tracing it.

## One-scene verification loop

Start [23M-197: source measurement](https://linear.app/23maestro/issue/23M-197), beginning with Connect. Then work Connect → Story → Prayer → Next Week one at a time. Do not change all cards in one operation.

1. Crop the original reference card. Inventory every visible element, including credits, icons, logo, rules, background and panel.
2. Record independent expected values: normalized x/y/width/height, alignment anchors, spacing, text/line breaks, color role, image crop and panel bounds. Distinguish measured geometry from provisional asset substitutions.
3. Inspect the corresponding Figma node. Record expected versus actual and the mismatch before editing. This is the visual equivalent of the failing check.
4. Fix only that scene. Preserve user edits, shared type styles and earlier concepts. Inspect instance/master relationships before modifying a shared component.
5. Export the settled frame and compare it with the reference at equal scale, side by side and with an alignment overlay when useful. Recheck each element. Save before/after proof and the mismatch result. Do not derive expected values from the implementation.
6. Change a representative editable text value and verify its centering, wrapping and boundaries; restore the approved draft value afterward. Missing final assets remain listed as exceptions, not silently approved.
7. Record the result, then move to the next scene. Do not call a board complete because the tool succeeded, text is CENTER, or safe-area checks passed.

This is a visual fidelity task. Apply the named implement/TDD skills at the observable design/render boundary. Automated checks can verify scene count, duplicate content, bounds and output metadata. They cannot establish composition fidelity without image comparison. Do not build a broad test framework or tests that merely repeat authored coordinates.

## Motion gate

[23M-202](https://linear.app/23maestro/issue/23M-202) is blocked by all four card tickets. Only after static matching, animate one card and verify entrance, settled hold, exit and actual playback. The settled frame must preserve the matched design. Then extend the treatment scene by scene. Slight gradient refinement is allowed if it retains the reference coverage, composition and legibility.

The existing story study (`26:911`) is 960×540, 10 fps, approximately six seconds. It demonstrates timing only. It is not a matched design or a broadcast deliverable. Its earlier frame checks do not prove reference fidelity.

## Remaining project tasks

- [23M-194](https://linear.app/23maestro/issue/23M-194): parent outro alignment and motion.
- [23M-195](https://linear.app/23maestro/issue/23M-195): client logos/colors/Illustrator sources, GLTV mark, final copy/VO, confirmed destinations, credits and teaser assets. Layout inspection can proceed while these are pending.
- [23M-196](https://linear.app/23maestro/issue/23M-196): approved intro revisions only: happier inspirational music, natural hands/prayer, warm sunrise silhouette. Preserve the praised seed/drawing sequence.
- [23M-203](https://linear.app/23maestro/issue/23M-203): studio and ending treatment, blocked by final branding. Confirm the studio alternative in place of treating all options as required scenes.
- [23M-204](https://linear.app/23maestro/issue/23M-204): final assembly, editable handoff demonstration and 3840×2160 / 29.97 fps playback/metadata QA, blocked by inputs, intro revisions, matched outro motion and studio/ending.

Client editing software remains unconfirmed. Do not promise a MOGRT or Premiere template merely because a reusable Figma design exists. No new purchase, generation, storage deletion, client message or delivery is part of this alignment handoff.

## Evidence captured for this plan

- [Original page 7 render](references/alignment-2026-09-24/pdf-page-7.png).
- [Current production board screenshot](references/alignment-2026-09-24/figma-production-before.png).
- [Current Figma production section](https://www.figma.com/design/v6sFPJsZp0u3CqyjYy50yV?node-id=24-745).
- [Call notes](CALL-NOTES-2026-09-24.md) and [replacement review board](references/client-revisions/index.html).

Planning inspection confirmed card identities, missing Connect credits/icons, different background treatments and placeholder network marks. Exact per-element geometry, all duplicate-content contexts, design corrections and final visual acceptance remain unfinished. Figma designs were not corrected during this planning pass.
