import { rm } from "node:fs/promises";
import path from "node:path";

const generatedPaths = [
  "output",
  "tmp",
  ".cache",
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
