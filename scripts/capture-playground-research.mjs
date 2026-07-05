import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = process.cwd();
const date = "2026-07-05";
const referenceDir = path.join(root, "docs/ui-reference/playground-research", date);
const sampleDir = path.join(root, "docs/diagrams/html-playground-samples");
fs.mkdirSync(referenceDir, { recursive: true });

const lanes = [
  "design-playground",
  "data-explorer",
  "concept-map",
  "document-critique",
  "diff-review",
  "code-map"
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });

const notes = [
  `# Playground Research References`,
  ``,
  `Date: ${date}`,
  ``,
  `These screenshots are local browser captures of the lane-specific golden samples after comparing the official plugin, the OpenCode port, and the richer JointJS reference direction. They are visual references for the current OpenCode-style scaffold, not a requirement to adopt JointJS yet.`,
  ``
];

await page.goto("https://github.com/anthropics/claude-plugins-official/tree/main/plugins/playground", { waitUntil: "domcontentloaded" });
await page.screenshot({ path: path.join(referenceDir, "official-plugin-source.png"), fullPage: false });
notes.push(`## official plugin source`);
notes.push(`- Screenshot: official-plugin-source.png`);
notes.push(`- Informs: baseline plugin structure, router skill, and template family that the local port follows.`);
notes.push(``);

await page.goto("https://github.com/rosschambers/opencode-playground", { waitUntil: "domcontentloaded" });
await page.screenshot({ path: path.join(referenceDir, "opencode-port-source.png"), fullPage: false });
notes.push(`## OpenCode port source`);
notes.push(`- Screenshot: opencode-port-source.png`);
notes.push(`- Informs: the current local comp for controls, live preview, prompt output, dark theme, and no-dependency single-file output.`);
notes.push(``);

for (const lane of lanes) {
  const htmlPath = path.join(sampleDir, `${date}-${lane}.html`);
  await page.goto(pathToFileURL(htmlPath).href);
  await page.waitForLoadState("domcontentloaded");
  const screenshotName = `${lane}.png`;
  await page.screenshot({ path: path.join(referenceDir, screenshotName), fullPage: true });
  notes.push(`## ${lane}`);
  notes.push(`- Screenshot: ${screenshotName}`);
  notes.push(`- Informs: ${lane} layout, control density, dark preview treatment, preset shape, prompt-output placement, and mobile-safe text rhythm.`);
  notes.push(``);
}

await page.goto("https://www.jointjs.com/blog/build-better-claude-code-playgrounds-with-jointjs", { waitUntil: "domcontentloaded" });
await page.screenshot({ path: path.join(referenceDir, "jointjs-richer-future-reference.png"), fullPage: false });
notes.push(`## richer future reference`);
notes.push(`- Screenshot: jointjs-richer-future-reference.png`);
notes.push(`- Informs: future richer diagram direction for concept-map and code-map lanes only. The current skill remains dependency-free for baseline OpenCode-style playgrounds.`);
notes.push(``);

fs.writeFileSync(path.join(referenceDir, "notes.md"), `${notes.join("\n")}\n`);
await browser.close();

console.log(referenceDir);
