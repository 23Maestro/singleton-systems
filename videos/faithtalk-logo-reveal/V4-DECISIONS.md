# Logo reveal v4 · September 26, 2026

Current source: index.html. Previous v3 is preserved in archive/index_v3_before_codex_timing.html.txt.

- Keep the supplied white emblem and wordmark paths. Remove the emerald silhouette behind the emblem.
- White glow accompanies the rise and fades to zero when the emblem centers at 1.12s.
- Horizontal bars enter at 0.80s. Their white cores keep the existing emerald-left and gold-right glows. Outward departure runs 1.70–2.16s; fading starts at 1.88s.
- Preserve the rise timing and a 0.24s breathing pause after the bars disappear.
- Emblem and word wrappers move left together at 2.40–3.20s. A slight perspective turn and skew return to zero at the settled lockup.
- Faith reveal starts at 2.40s. Talk starts at 2.70s, during the same move. All artwork settles by 3.56s and holds to 5s.
- Keep the black preview toggle and alpha-ready composition. No seed, new footage or audio assets.

## Glossary

Emblem: supplied white symbol, including its transparent cutouts.
Bars: two horizontal white strokes with colored exterior glows.
Word reveal: original wordmark paths exposed by the existing feathered masks.
Settled lockup: original artwork at its final position, scale and spacing with no skew or glow.

## Runtime

HyperFrames pin updated from 0.8.70 to 0.8.78. Existing v3 passed the new runtime check before motion changes. v4 check passed with zero errors and two existing structure warnings. Ten sampled frames were reviewed. Original emblem, Faith and Talk SVG/mask markup remains byte-identical to v3. The settled 4K frame has zero RGB channels differing by more than 8/255 from the previous alpha export composited on black.

Preview ready; no new MP4 or alpha master exported. Current v3 render files remain v3. Review captures and check output are on MediaSSD under 02_EDITING/CLIENTS/FAITHTALK/LOGO_REVEAL_REVIEW_2026_09_26.
