import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

const apply = process.argv.includes("--apply");
const root = process.cwd();
const source = path.join(root, "skills", "html-playground") + "/";
const target = path.join(os.homedir(), ".codex", "skills", "html-playground") + "/";
const args = [
  "-a",
  "--delete",
  "--exclude", ".DS_Store",
  "--exclude", "*.codex-backup-*",
];

if (!apply) args.push("--dry-run", "--itemize-changes");
args.push(source, target);

const result = spawnSync("rsync", args, { encoding: "utf8" });
if (result.status !== 0) {
  throw new Error(result.stderr || `rsync failed for ${target}`);
}

console.log(`${apply ? "synced" : "would sync"}: ${target}`);
if (result.stdout.trim()) console.log(result.stdout.trim());
if (!apply) console.log("Run `npm run skills:sync:apply` after reviewing this diff.");
