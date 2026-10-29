import { build } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";

const root = process.cwd();
const site = path.join(root, "sites/dashboard-visual-review-2026-10-24");
const dist = path.join(site, "dist");
await mkdir(dist, { recursive: true });
await build({ entryPoints: ["tools/dashboard-preview/main.tsx"], bundle: true, outfile: path.join(dist, "app.js"), minify: true, jsx: "automatic", define: { "process.env.NODE_ENV": '"production"' }, tsconfig: "tsconfig.json" });
execFileSync(process.execPath, ["node_modules/tailwindcss/lib/cli.js", "-i", "tools/dashboard-preview/preview.css", "-o", path.join(dist, "app.css"), "--minify"], { stdio: "inherit" });
const styles = await Promise.all(["command-center.css", "shadcn.css", "visual-refresh.css"].map((name) => readFile(path.join(root, "app/command-center", name), "utf8")));
await writeFile(path.join(dist, "app.css"), (await readFile(path.join(dist, "app.css"), "utf8")) + "\n" + styles.join("\n"));
await writeFile(path.join(dist, "index.html"), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="description" content="Singleton Systems dashboard visual review with sample records."><title>Dashboard visual review · Singleton Systems</title><link rel="stylesheet" href="./app.css"></head><body><div id="root"></div><script src="./app.js" defer></script></body></html>');
const files = ["app/command-center/CommandCenterApp.tsx", "app/command-center/ClientBoard.tsx", "app/command-center/TaskEditor.tsx", "app/command-center/DescriptionEditor.tsx", "app/command-center/DurationWheel.tsx", "app/command-center/SchedulePicker.tsx", "app/command-center/visual-refresh.css", "components/ui/calendar.tsx", "lib/command-center-description.ts", "lib/command-center-projects.ts", "components.json"];
const hashes = Object.fromEntries(await Promise.all(files.map(async (file) => [file, createHash("sha256").update(await readFile(file)).digest("hex")])));
await writeFile(path.join(site, "source-proof.json"), JSON.stringify({ baseCommit: "7aab5f2c64bdee68ebc1333489de1d88fa731282", entry: "tools/dashboard-preview/main.tsx", sampleData: true, ownerWrites: false, files: hashes }, null, 2) + "\n");
console.log(JSON.stringify({ site, dist, sourceFiles: files.length, sampleData: true }));
