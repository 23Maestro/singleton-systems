# Lineups color accessibility brief

Status: working brief for review. This is not an approved production contract.

## Goal

Replace the old cyan-dominant package with a more legible, reusable visual
system while keeping Lineups brand recognition. The redesign should support a
short, evidence-led recommendation to Ed and leadership.

## Business context

- Ed has already responded positively to the Figma system and asked leadership
  to review the color treatment.
- A new head of social is auditing performance while video production is
  paused.
- Catena's current opening is a reusable weekly visual package that strengthens
  social output without changing each editor's cut workflow.

## Glossary

- **Base surface:** A large, persistent area such as the right rail, lower
  third, or frame surround.
- **Accent:** A limited highlight used for dividers, progress marks, short
  labels, or brief motion cues.
- **Contrast ratio:** The measured difference in relative luminance between a
  foreground and its background.
- **Normal text:** Text that should meet at least 4.5:1 under WCAG 2.2 AA.
- **Large text:** Text that should meet at least 3:1 under WCAG 2.2 AA.
- **Accessibility heuristic:** WCAG contrast testing applied to this broadcast
  graphic as an objective design check. It is not a claim that WCAG directly
  governs every video overlay.

## Measured evidence

| Pair | Ratio | Result |
| --- | ---: | --- |
| White on old cyan `#15CDF2` | 1.90:1 | Fails normal and large text |
| Black on old cyan `#15CDF2` | 11.05:1 | Passes normal text |
| Lineups blue on white | 2.59:1 | Fails normal and large text |
| Warm white `#F7F7F2` on new navy `#0C2434` | 14.83:1 | Passes normal text |
| Gray `#A8BBC2` on deep surface `#08181D` | 9.11:1 | Passes normal text |
| Dark text `#071014` on warm white `#F7F7F2` | 17.87:1 | Passes normal text |
| White on proposed cyan `#00AFED` | 2.51:1 | Fails normal and large text |
| White on sampled deep gradient blue `#0464F6` | 5.05:1 | Passes normal text |

Brightness alone is not the accessibility failure. The foreground and
background pairing is. Cyan can remain recognizable when it is not carrying
low-contrast text across a large permanent surface.

## Locked decisions

- Cyan is an accent only. It is never a large permanent surface.
- The permanent base uses the deepest blue sampled from the Lineups.com
  reference gradient. The current screenshot sample is approximately `#0464F6`.
- The trophy and sports-ball corner uses the reference gradient from light cyan
  at the top left to deep blue at the bottom right. The current sampled
  endpoints are approximately `#01AFEC` and `#0464F6`.
- White display text over cyan may use a narrow black stroke around each glyph.
  The stroke must follow the live text, remain thin, and pass review at the
  1920 x 1080 delivery size. Do not stroke the containing frame.
- The redesign keeps an objective contrast readout beside the visual review.
- The recommendation to Ed will present measured results and invite independent
  verification. It will not frame the old design as incompetent or leadership
  as wrong.
- The static newsletter panel is not part of the new base package. A promotional
  callout, if needed, should be an occasional motion treatment.

## Open decisions

- Confirm the sampled gradient colors against the original web asset if a
  non-screenshot source becomes available.
- Decide which text treatments receive the black glyph stroke.
- Set the final stroke thickness after a 1920 x 1080 screenshot review.
- Choose the first current V1 graphic to duplicate as the color-test variant.

## Sources

- [WCAG 2.2 contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [WCAG 2.2 non-text contrast](https://www.w3.org/WAI/WCAG22/understanding/non-text-contrast.html)
- [WCAG 2.2 use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)
