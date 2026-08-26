# client video title cards

Use these rules when Jerami approves a branded title-card family as a repeatable video kit.

## geometry source

Treat Jerami's confirmed Figma move as the geometry source. Measure the live x and y deltas before cleaning the family. Preserve the intent of that move, replace eyeballed values with repeatable numbers, and write the final rule into the component-set description.

Do not reset a hand-adjusted node to an earlier export or conversational value.

## scene anatomy

Use these names in specs and review notes:

```text
brand lockup    Keeper & Kin mark plus company name
topic tab       compact top-right label
scene title     main title, using the approved client headline
support card    boxed supporting line beneath a scene title
info cards      repeated cards in a three-column explainer row
```

The brand lockup and title stack have separate horizontal anchors. Moving the brand lockup does not authorize moving the scene title, support card, subtitle, or info cards. Preserve each confirmed anchor until Jerami moves that exact family.

Align a support card with its scene title. Use optical alignment when the card has a left accent: its outer frame may sit up to 10 px left of the title so the text and visual weight align.

Keep the company mark visually stronger than the series label. Record the company and series as separate fields in the package notes.

## compact topic tab

- Build the tab with horizontal auto-layout and hug its label content.
- Size the tab near 88 percent of the first approved draft when Jerami asks for the 50-to-44 ratio.
- Use equal side padding. Do not leave fixed-width space after short labels.
- Center the rotated diamond through auto-layout. Check rendered bounds, not raw rotated-node coordinates.
- Keep the tab at the top-right. Align it vertically with the company lockup.
- On split-photo scenes, favor horizontal distance from the lockup. Do not stack the tab beneath the lockup.
- Use numerals when Jerami shortens an ordinal, such as `1ST MONTH`.

## split-photo scene

Keep the approved photo split and divider fixed. Preserve the brand lockup, scene title, and support-card anchors independently. Align the support card to the scene title by rendered edge.

Measure the topic-tab x position from Jerami's approved move. Reuse that left edge across related split-photo scenes when it produces the intended separation from the lockup. Do not force one right margin across tabs with different label widths.

## full-frame scene

Place the company lockup at the approved outer safe edge. Preserve the title stack at its own approved anchor.

For the approved 1920 x 1080 three-card row, use `x = 220 / 751 / 1282`, `width = 500`, and a 31 px gap. The first card aligns with the scene title. The final card's visible right edge aligns with the topic-tab label edge. Reuse that row for matching three-card explainers.

## punctuation

- Scene titles have no terminal period.
- A one-line subtitle, support card, or info-card sentence has no terminal period.
- Keep periods when the approved copy contains two complete statements. `You know them best. Make sure others do too.` is the locked Keeper & Kin exception.
- Do not change punctuation in a confirmed scene while adjusting geometry.

## package boundary

Keeper & Kin is the company brand. Command K9 is the video series. Keep Keeper & Kin as the visual heading and record Command K9 as the series context.

Speaker overlays are a separate component family. Keep the company logo etched into the right side and the glow or signal accent in the opposite corner. Leave their geometry unchanged unless Jerami explicitly asks to reopen them.
Use [client-video-alpha-overlays.md](client-video-alpha-overlays.md) when that family is reopened or animated.
