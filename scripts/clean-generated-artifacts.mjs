import { rm } from "node:fs/promises";
import path from "node:path";

const generatedPaths = [
  "output",
  "tmp",
  ".cache",
  ".next",
  ".playwright-cli",
  ".turbo",
  "coverage",
  "playwright-report",
  "test-results",
  "blob-report",
  "docs/visual-maps/dist",
  "docs/visual-maps/archive",
  ".DS_Store",
  "tsconfig.tsbuildinfo",
];

for (const relativePath of generatedPaths) {
  await rm(path.join(process.cwd(), relativePath), {
    force: true,
    recursive: true,
  });
}

console.log(`Removed generated artifacts: ${generatedPaths.join(", ")}`);
