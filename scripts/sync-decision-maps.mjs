import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const maps = ["visual-daily-planning-wayfinder", "excalidraw-setup-pass"];

for (const slug of maps) {
  const source = path.join(root, "docs", "harness", `${slug}.html`);
  const targetDir = path.join(root, "public", "decision-maps", slug);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(source, path.join(targetDir, "index.html"));
}

console.log(`Decision maps synced: ${maps.join(", ")}`);
