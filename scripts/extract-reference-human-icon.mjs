import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";

const root = process.cwd();
const sourceSvg =
  "/tmp/codex-remote-attachments/019f4229-1d61-7621-ad18-5c23c9786556/F35B311C-62C6-4398-9373-56B1D430D2D8/1-2.svg";
const outDir = path.join(root, "public", "remotion-assets");
const debugDir = path.join(root, "output", "remotion-asset-extraction");
const sourcePng = path.join(debugDir, "reference-card-source.png");
const iconPng = path.join(outDir, "human-reference-icon.png");

await mkdir(outDir, { recursive: true });
await mkdir(debugDir, { recursive: true });

const svgData = await readFile(sourceSvg, "utf8");
const svgUrl = `data:image/svg+xml;base64,${Buffer.from(svgData).toString("base64")}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 726, height: 1214 }, deviceScaleFactor: 1 });
await page.setContent(`
  <html>
    <body style="margin:0;background:transparent">
      <img src="${svgUrl}" style="width:726px;height:1214px;display:block" />
    </body>
  </html>
`);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: sourcePng, omitBackground: true });
await browser.close();

const full = PNG.sync.read(await readFile(sourcePng));

let minX = full.width;
let minY = full.height;
let maxX = 0;
let maxY = 0;

for (let y = Math.round(full.height * 0.34); y < Math.round(full.height * 0.86); y += 1) {
  for (let x = 0; x < full.width; x += 1) {
    const index = (y * full.width + x) * 4;
    const r = full.data[index];
    const g = full.data[index + 1];
    const b = full.data[index + 2];
    const a = full.data[index + 3];
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    if (a > 20 && luminance < 80) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

const padding = 24;
const clip = {
  x: Math.max(0, minX - padding),
  y: Math.max(0, minY - padding),
  width: Math.min(full.width - Math.max(0, minX - padding), maxX - minX + padding * 2),
  height: Math.min(full.height - Math.max(0, minY - padding), maxY - minY + padding * 2),
};

const cropped = new PNG({ width: clip.width, height: clip.height });

for (let y = 0; y < clip.height; y += 1) {
  for (let x = 0; x < clip.width; x += 1) {
    const srcIndex = ((clip.y + y) * full.width + (clip.x + x)) * 4;
    const dstIndex = (y * clip.width + x) * 4;
    const r = full.data[srcIndex];
    const g = full.data[srcIndex + 1];
    const b = full.data[srcIndex + 2];
    const a = full.data[srcIndex + 3];
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const darkAlpha = luminance < 105 ? 255 : luminance < 170 ? Math.round((170 - luminance) * 2.6) : 0;

    cropped.data[dstIndex] = 0;
    cropped.data[dstIndex + 1] = 0;
    cropped.data[dstIndex + 2] = 0;
    cropped.data[dstIndex + 3] = Math.min(a, darkAlpha);
  }
}

await writeFile(iconPng, PNG.sync.write(cropped));

console.log(iconPng);
