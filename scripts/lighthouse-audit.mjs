import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const targetUrl = process.env.LIGHTHOUSE_URL || process.argv[2] || "https://singleton-systems.com";
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputDir = join(process.cwd(), ".tmp", "audits");
const outputPath = join(outputDir, `${stamp}-lighthouse.json`);
const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

mkdirSync(outputDir, { recursive: true });

const result = spawnSync(
  "npx",
  [
    "--yes",
    "lighthouse",
    targetUrl,
    "--only-categories=performance,accessibility,best-practices,seo",
    "--output=json",
    `--output-path=${outputPath}`,
    "--quiet",
    "--chrome-flags=--headless=new --no-sandbox",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      CHROME_PATH: chromePath,
    },
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const report = JSON.parse(readFileSync(outputPath, "utf8"));
const categories = report.categories;

console.log(`\nLighthouse audit: ${targetUrl}`);
console.log(`Report: ${outputPath}`);

for (const [key, category] of Object.entries(categories)) {
  console.log(`${key}: ${Math.round(category.score * 100)}`);
}
