import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import pngjs from "pngjs";

const { PNG } = pngjs;

const root = process.cwd();
const outDir = path.join(root, "output/playwright");
const baseUrl = process.env.AI_WORKFLOW_BASE_URL ?? "http://127.0.0.1:3000/ai-workflow-portfolio";

const cases = [
  { name: "system", tab: "System" },
  { name: "evidence", tab: "Evidence" },
  { name: "ai", tab: "AI Specialist Match", artifact: "review_first_implementation_loop" },
  { name: "resume", tab: "Resume", artifact: "resume_timeline_map" },
  { name: "source-readme", tab: "Source Map", artifact: "ai_workflow_readme_map" },
];

function samplePng(file) {
  const png = PNG.sync.read(fs.readFileSync(file));
  const points = [
    [2, png.height - 2],
    [Math.floor(png.width / 2), png.height - 2],
    [png.width - 3, png.height - 2],
    [2, Math.floor(png.height / 2)],
    [png.width - 3, Math.floor(png.height / 2)],
  ];

  return points.map(([x, y]) => {
    const idx = (png.width * y + x) << 2;
    return { x, y, rgba: Array.from(png.data.slice(idx, idx + 4)) };
  });
}

async function clickButtonByText(page, text) {
  const clicked = await page.locator("button").evaluateAll((nodes, label) => {
    const normalized = (value) => (value || "").replace(/\s+/g, " ").trim();
    const button = nodes.find((node) => normalized(node.textContent) === normalized(label));
    if (!button) return false;
    button.click();
    return true;
  }, text);

  if (!clicked) {
    throw new Error(`Missing button: ${text}`);
  }
}

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
});
await page.emulateMedia({ colorScheme: "dark" });
await page.goto(baseUrl, { waitUntil: "networkidle" });

const report = [];

for (const testCase of cases) {
  await clickButtonByText(page, testCase.tab);
  await page.waitForTimeout(250);
  await page.evaluate(() => window.scrollTo(0, document.scrollingElement.scrollHeight));
  await page.waitForTimeout(150);
  await page.evaluate(() => window.scrollTo(9999, window.scrollY));
  await page.waitForTimeout(100);

  const metrics = await page.evaluate((artifact) => {
    const root = document.scrollingElement;
    const frame = artifact
      ? document.querySelector(`[data-likec4-artifact="${artifact}"]`)
      : document.querySelector("[data-likec4-artifact]");
    const img = frame?.querySelector("img");

    return {
      innerWidth: window.innerWidth,
      scrollWidth: root.scrollWidth,
      scrollX: window.scrollX,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      htmlBg: getComputedStyle(document.documentElement).backgroundColor,
      frame: frame
        ? (() => {
            const rect = frame.getBoundingClientRect();
            return {
              width: rect.width,
              height: rect.height,
              top: rect.top,
              bottom: rect.bottom,
              artifact: frame.getAttribute("data-likec4-artifact"),
            };
          })()
        : null,
      imgSrc: img ? img.currentSrc || img.src : null,
    };
  }, testCase.artifact);

  const shot = path.join(outDir, `ai-workflow-mobile-${testCase.name}.png`);
  await page.screenshot({ path: shot, fullPage: false });
  const samples = samplePng(shot);

  if (metrics.scrollWidth > metrics.innerWidth + 1) {
    throw new Error(`${testCase.name}: horizontal overflow ${metrics.scrollWidth} > ${metrics.innerWidth}`);
  }
  if (metrics.scrollX !== 0) {
    throw new Error(`${testCase.name}: scrollX moved to ${metrics.scrollX}`);
  }

  for (const sample of samples) {
    const [r, g, b] = sample.rgba;
    if (r > 245 && g > 245 && b > 245) {
      throw new Error(`${testCase.name}: white edge or bottom pixel at ${sample.x},${sample.y}`);
    }
  }

  if (testCase.artifact) {
    if (!metrics.frame) {
      throw new Error(`${testCase.name}: missing artifact frame`);
    }
    if (!metrics.imgSrc.includes(`/portfolio/likec4-static/dark/${testCase.artifact}.svg`)) {
      throw new Error(`${testCase.name}: wrong static dark source ${metrics.imgSrc}`);
    }
    if (metrics.frame.width > metrics.innerWidth + 1) {
      throw new Error(`${testCase.name}: frame wider than viewport`);
    }
    if (metrics.frame.height < 140) {
      throw new Error(`${testCase.name}: frame too short ${metrics.frame.height}`);
    }
  }

  report.push({ ...testCase, metrics, samples, shot });
}

await browser.close();

const reportPath = path.join(outDir, "ai-workflow-mobile-report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(
  JSON.stringify(
    report.map(({ name, metrics, shot }) => ({
      name,
      scrollWidth: metrics.scrollWidth,
      innerWidth: metrics.innerWidth,
      scrollX: metrics.scrollX,
      frame: metrics.frame,
      shot,
    })),
    null,
    2,
  ),
);
