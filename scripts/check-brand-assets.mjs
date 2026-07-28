import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Guards the Singleton Systems wordmark against font drift.
 *
 * The wordmark is Poppins Medium (500), size 116, tracking -6, lines at
 * x68/y104 and x118/y214 in a 660x260 viewBox. It ships as OUTLINED PATHS.
 *
 * Why this check exists: from 2026-06-22 to 2026-07-27 the wordmark shipped as
 * live <text> with font-family="Poppins, ...". Poppins Medium was never
 * installed, so every render silently fell back to a different font. A
 * brand-continuity pass read that fallback as a bug and swapped the wordmark to
 * Geist, which changed the logo on every page. Outlined paths carry no font
 * reference at all, so there is nothing left to fall back.
 *
 * Any of these in a wordmark SVG means the drift is back:
 *   - <text>        -> live text, needs a font at render time
 *   - font-family   -> a font lookup that can silently miss
 *   - @font-face    -> an embedded font; bloats the file and still re-introduces
 *                      a typeface dependency the design system cannot see
 *
 * Regenerate with: node scripts/generate-wordmark-svgs.mjs <Poppins-Medium.ttf>
 */

const root = process.cwd();

const WORDMARKS = [
  "public/singleton-systems-wordmark.svg",
  "public/brand/ssystems-logo-wordmark-black.svg",
  "public/brand/ssystems-logo-wordmark-white.svg",
];

// 9 glyphs in "Singleton" + 8 in "Systems." — every letter is its own <path>.
const EXPECTED_PATHS = 17;
const EXPECTED_VIEWBOX = "0 0 660 260";

for (const rel of WORDMARKS) {
  const file = path.join(root, rel);
  assert.ok(fs.existsSync(file), `${rel} is missing — the site renders the wordmark from it`);
  const svg = fs.readFileSync(file, "utf8");

  assert.equal(
    (svg.match(/<text[\s>]/g) || []).length,
    0,
    `${rel} contains <text> — the wordmark must ship as outlined paths, not live text`
  );
  assert.equal(
    (svg.match(/font-family/g) || []).length,
    0,
    `${rel} references font-family — outlined paths must not depend on an installed font`
  );
  assert.equal(
    (svg.match(/@font-face/g) || []).length,
    0,
    `${rel} embeds @font-face — outline the glyphs instead of shipping a font`
  );

  const paths = (svg.match(/<path[\s>]/g) || []).length;
  assert.equal(
    paths,
    EXPECTED_PATHS,
    `${rel} has ${paths} <path> elements, expected ${EXPECTED_PATHS} (one per glyph) — the lockup changed`
  );

  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  assert.equal(
    viewBox,
    EXPECTED_VIEWBOX,
    `${rel} viewBox is "${viewBox}", expected "${EXPECTED_VIEWBOX}" — call sites pass width=660 height=260`
  );
}

// The black brand PNG is the reference render the outlined SVGs were fitted to
// (99.88% pixel match). Keep it as the tie-breaker if the SVGs are ever doubted.
const REFERENCE_PNG = "public/brand/ssystems-logo-wordmark-black-2640x1040.png";
assert.ok(
  fs.existsSync(path.join(root, REFERENCE_PNG)),
  `${REFERENCE_PNG} is missing — it is the reference render for the wordmark`
);

console.log(`brand assets OK — ${WORDMARKS.length} wordmarks are outlined, font-free, and locked to ${EXPECTED_VIEWBOX}`);
