/**
 * Regenerates the Singleton Systems wordmark SVGs as pure outlined paths.
 *
 * The wordmark is Poppins Medium (500) at size 116, tracking -6, with the two
 * lines at x=68/y=104 and x=118/y=214 in a 660x260 viewBox. Those numbers are
 * the original locked design spec — do not change them.
 *
 * Output contains ZERO text and ZERO font references, so it renders identically
 * everywhere regardless of which fonts a viewer has installed. That font
 * dependency is what caused the July 2026 wordmark drift.
 *
 * Requires Poppins-Medium.ttf (SIL OFL, https://github.com/google/fonts,
 * ofl/poppins/Poppins-Medium.ttf). Pass its path as argv[2]. The font is only
 * needed to REGENERATE; the committed SVGs are self-contained.
 *
 *   node scripts/generate-wordmark-svgs.mjs /path/to/Poppins-Medium.ttf
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const FONT = process.argv[2];
if (!FONT) {
  console.error("usage: node scripts/generate-wordmark-svgs.mjs <Poppins-Medium.ttf>");
  process.exit(1);
}

const SPEC = { size: 116, tracking: -6, x1: 68, y1: 104, x2: 118, y2: 214, vb: [660, 260] };

const PY = `
import sys, json
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform
f = TTFont(sys.argv[1]); upm = f["head"].unitsPerEm
cmap = f.getBestCmap(); hmtx = f["hmtx"]; gs = f.getGlyphSet()
S = 100.0; sc = S / upm
def g(ch):
    gn = cmap[ord(ch)]
    pen = SVGPathPen(gs, ntos=lambda v: format(round(v, 2), "g"))
    gs[gn].draw(TransformPen(pen, Transform(sc, 0, 0, -sc, 0, 0)))
    return {"d": pen.getCommands(), "adv": hmtx[gn][0] * sc}
print(json.dumps({L: [g(c) for c in L] for L in ["Singleton", "Systems."]}))
`;

const G = JSON.parse(execFileSync("python3.13", ["-c", PY, FONT], { encoding: "utf8", maxBuffer: 1 << 26 }));

const r = (n) => +n.toFixed(3);
function line(name, xLeft, baseline) {
  const s = SPEC.size / 100;
  const glyphs = G[name];
  let x = xLeft;
  const out = [];
  for (let i = 0; i < glyphs.length; i++) {
    out.push(`<path d="${glyphs[i].d}" transform="translate(${r(x)},${r(baseline)}) scale(${r(s)})"/>`);
    x += glyphs[i].adv * s + (i < glyphs.length - 1 ? SPEC.tracking : 0);
  }
  return out.join("");
}

function build(fill, desc) {
  const [w, h] = SPEC.vb;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="title desc">
<title id="title">Singleton Systems wordmark</title>
<desc id="desc">${desc}</desc>
<g fill="${fill}">${line("Singleton", SPEC.x1, SPEC.y1)}${line("Systems.", SPEC.x2, SPEC.y2)}</g>
</svg>
`;
}

const black = build("#050505", "A stacked black wordmark reading Singleton Systems.");
const white = build("#ffffff", "A stacked white wordmark reading Singleton Systems.");

const root = process.cwd();
const targets = [
  ["public/singleton-systems-wordmark.svg", black],
  ["public/brand/ssystems-logo-wordmark-black.svg", black],
  ["public/brand/ssystems-logo-wordmark-white.svg", white],
];
for (const [rel, content] of targets) {
  writeFileSync(path.join(root, rel), content, "utf8");
  console.log(`wrote ${rel}  (${content.length} bytes)`);
}
