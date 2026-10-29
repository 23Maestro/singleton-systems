# Corner glow

Use this recipe when Jerami asks for the Lineups corner glow, a glowing corner,
or the same accent in another client system. Keep the current client's colors,
logo and type. Do not add it to unrelated work by default.

## Measured source

Read on October 23, 2026:

- Lineups: file `o7E24iymIT80MTXGYIogVH`, Components page `428:27`,
  Team callout `1843:1021`, vector `1892:7859`.
- Intent Keys: file `zBDLSbTNPZhBgrWs5az58z`, component `2:20`, vector `2:29`.
  Intent already binds the accent, stroke and 6 blur sizes to variables.

The accent is an open curved path along the upper-left corner. It is separate
from the full card border. Keep it separate from the logo, text and surface.
A shadow on the whole card does not reproduce this treatment.

```text
Native vector size: 234.875 × 234.050903 px
Placement inside a 240 px block: x 2.625, y 4.013437
Stroke: 3 px, no fill
Path:
M 234.875 0.05054725706577301
L 29.375 0.05091531574726105
C 9.875 -0.5136718600988388 1.5 3.486186981201172 1.5 18.630313873291016
L 0 234.0509033203125
```

Apply 6 DROP_SHADOW effects to the path. Each uses the accent color at alpha 1,
normal blend, offset (0, 0), spread 0 and showShadowBehindNode true.
Blur radii in px: `0.19125, 0.3825, 1.33875, 2.6775, 4.59, 8.0325`.
The tight layers keep the edge bright. The wide layers give it a soft halo.
Lineups uses team colors. Intent uses `#FF7A24`.

## Figma reuse

Clone the native vector into the target client's source component. In an Auto
Layout wrapper, make this decorative layer absolute. Bind its stroke and each
effect color to the client's accent variable. Bind blur radii and stroke width
to the client's geometry variables. Expose a Boolean show/hide property when
the component needs that choice. Keep the source component and its instances
linked. Do not detach a library instance to force child sizing.

Scale the corner uniformly to suit the target height; keep the curve round.
Do not stretch this square path across a long card. The card's normal border
owns the remaining edge. Keep glow overscan outside the content box and inspect
it against the intended background. Clipped blur fails review.

## HTML and HyperFrames

Use `scripts/corner-glow.mjs` to emit a parameterized SVG. It ports the measured
path and 6 independent shadow layers. Native Figma SVG export confirms Gaussian
sigma is half the Figma blur radius. CSS drop-shadow chains compound earlier
shadows; use separate SVG filter branches for this recipe.

The helper accepts a unique filter ID, accent color and uniform scale. Keep
its SVG separate from the text. HyperFrames owns any timed highlight; use the
same word cues as the edit map. Manim validates timing only.

## Type and focus

Intent's callout hierarchy is a 48 px uppercase action header over a 96 px key,
with a static left logo and centered, content-hugging copy.
For new 1920 × 1080 Intent reference sheets, use 40 px or larger supporting
copy, including the footer. Put the key above its meaning. If copy cannot fit
at a readable size, split the graphic or cut redundant wording. Do not shrink
technical notes into fine print. Check the exported frame at normal size.

Highlight a sheet entry only when the speech names it. Keep the other entries
readable and preserve their order. Removing entries or guessing word timing is
not part of this recipe.
