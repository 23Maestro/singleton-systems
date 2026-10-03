// Seam: rendered scene seek. The seed shell holds its scene-2 position until planting starts.
import { createRequire } from 'module';
import path from 'path';
const require = createRequire('/Users/singleton23/.npm/_npx/b21eaa1f02a67d30/node_modules/');
const puppeteer = require('puppeteer-core');
const here = path.dirname(new URL(import.meta.url).pathname);
const file = path.resolve(process.argv[2] || path.join(here, '../review-v19-36_5.html'));
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--allow-file-access-from-files'] });
const p = await b.newPage(); await p.setViewport({ width: 3840, height: 2160 });
await p.goto('file://' + file, { waitUntil: 'load' });
const rows = await p.evaluate(() => {
  const tl = Object.values(window.__timelines)[0], out = [];
  for (let t = 6.5; t <= 14.5; t += 0.5) { tl.seek(t, false); const r = document.getElementById('shell').getBoundingClientRect(); out.push([t, (r.left + r.right) / 2, (r.top + r.bottom) / 2]); }
  return out;
});
await b.close();
let fail = 0;
for (const [t, x, y] of rows) { const off = Math.hypot(x - rows[0][1], y - rows[0][2]), ok = off <= 6; if (!ok) fail++; console.log(`${ok ? 'ok  ' : 'FAIL'} t=${t}s seed center=(${x.toFixed(0)}, ${y.toFixed(0)}) off=${off.toFixed(0)}px`); }
console.log(fail ? 'FAIL' : 'PASS'); process.exit(fail ? 1 : 0);
