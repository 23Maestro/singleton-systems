---
name: accessibility-review
description: Measure accessibility and legibility in Figma with computed WCAG contrast and element-level findings. Use for color, contrast, text readability, non-text contrast, target size, reflow, or an accessibility review of a selected frame.
---

# Accessibility review

Audit the selected Figma scope with measured values. Do not judge contrast by appearance alone.

Source: [accessibility-review by Keval Gadhiya](https://www.figma.com/community/skill/75662/accessibility-review), published under the Figma Community Free Resource License.

Load `figma-use` before a Figma tool call. Read the current selection again before the audit so stale node IDs do not enter the report.

## Choose the correct mode

For product UI, review applicable WCAG 2.2 AA criteria. For a static video, broadcast, social, or advertising graphic, limit the verdict to static visual evidence:

- text contrast;
- meaningful graphic and divider contrast;
- use of color alone;
- text size, spacing, clipping, and readability at delivery size;
- live text versus baked image text;
- image or gradient areas that make contrast unstable.

Do not report tap-target, keyboard, focus, accessible-name, runtime, or reflow compliance for a static media graphic.

## Scope

- Measure every visible text node and meaningful icon inside the selection, including rendered overrides inside component instances.
- Count repeated instances separately because their colors may differ.
- Exclude decorative shapes and operator documentation from product totals.
- State what was measured, what passed, what failed, and what was outside the static design's scope.

## Contrast

Use relative luminance and compute the ratio. Composite alpha against the effective background first.

- Normal text needs 4.5:1.
- Large text needs 3:1. Large means at least 24 px, or at least 18.66 px when bold.
- Meaningful icons, dividers, focus rings, and UI boundaries need 3:1 when that criterion applies.
- Disabled controls are exempt.

For text on a photo or gradient, do not invent one sampled ratio. Measure the worst credible area or require a stable backing plate, scrim, stroke, or shadow treatment. State the method.

A text outline can improve local edge separation, but it does not automatically make an unstable background compliant. Measure the rendered foreground treatment against the effective background.

## Findings

Return one consolidated finding per failing element. Combine all failures for that element. Rank measured AA failures first. Keep inferred risks separate from measured failures.

When the current Figma surface supports native annotations, use one `Accessibility Review` annotation per failing element and one summary annotation on the reviewed frame. Preserve unrelated annotations. On a rerun, clear only resolved accessibility annotations and update the summary.

The report must include:

- selection and delivery mode;
- element count;
- foreground, background, font size, weight, and computed ratio for each text check;
- pass or fail threshold;
- exact fix direction;
- limits that need runtime or delivery-size verification.

For Lineups static graphics, compare the current cyan treatment with the proposed deep-blue base and cyan-accent treatment using the same text samples and delivery frame.
