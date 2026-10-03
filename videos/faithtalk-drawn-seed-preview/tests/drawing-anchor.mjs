// Seam: rendered scene playback/seek. Renders only the drawing layer at sampled
// seek times and checks its pixel center against the fixed frame anchor.
// Usage: node tests/drawing-anchor.mjs [composition.html]
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

// ponytail: borrows puppeteer-core from the hyperframes npx cache; add a package dep if that cache moves.
const require = createRequire('/Users/singleton23/.npm/_npx/b21eaa1f02a67d30/node_modules/');
const puppeteer = require('puppeteer-core');

const here = path.dirname(new URL(import.meta.url).pathname);
const file = path.resolve(process.argv[2] || path.join(here, '../review-v19-36_5.html'));
const ANCHOR = [1920, 1080];      // spec: premium-assembly-2026-09-26.json intro.spatial_lock.anchor
const TOL = 24;                   // px at 3840x2160; stages 2 and 4 already hold within 20
const TIMES = Array.from({ length: 34 }, (_, i) => 3.5 + i / 2); // seed settled (3.5 s) .. 20 s

const dir = mkdtempSync(path.join(tmpdir(), 'anchor-'));
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--allow-file-access-from-files'] });
const p = await b.newPage();
await p.setViewport({ width: 3840, height: 2160 });
await p.goto('file://' + file, { waitUntil: 'load' });
await p.addStyleTag({ content: 'html,body,#root{background:transparent!important} #root>*:not(#drawing-scene){display:none!important} #seed-cast-shadow,#seed-contact-shadow{display:none}' });
const frames = [];
for (const t of TIMES) {
  await p.evaluate(t => { Object.values(window.__timelines)[0].seek(t, false); gsap.set('#drawing-scene', { opacity: 1 }); }, t);
  const f = path.join(dir, `${t.toFixed(1)}.png`);
  await p.screenshot({ path: f, omitBackground: true });
  frames.push([t, f]);
}
await b.close();

const py = `
import sys,json,numpy as np
from PIL import Image
out=[]
for t,f in json.loads(sys.argv[1]):
    a=np.asarray(Image.open(f))[:,:,3]>128
    ys,xs=np.nonzero(a)
    out.append([t,(xs.min()+xs.max())/2,(ys.min()+ys.max())/2] if len(xs) else [t,None,None])
print(json.dumps(out))`;
const rows = JSON.parse(execFileSync('python3', ['-c', py, JSON.stringify(frames)]).toString());

let fail = 0;
for (const [t, cx, cy] of rows) {
  const off = cx == null ? Infinity : Math.hypot(cx - ANCHOR[0], cy - ANCHOR[1]);
  const ok = off <= TOL;
  if (!ok) fail++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} t=${t.toFixed(1)}s center=(${cx?.toFixed(0)}, ${cy?.toFixed(0)}) off=${off.toFixed(0)}px`);
}
console.log(`\n${fail ? 'FAIL' : 'PASS'}: ${rows.length - fail}/${rows.length} frames within ${TOL}px of anchor ${ANCHOR}. Frames: ${dir}`);
process.exit(fail ? 1 : 0);
