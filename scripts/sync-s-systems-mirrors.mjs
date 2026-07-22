import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

const apply = process.argv.includes("--apply");
const root = process.cwd();
const source = path.join(root, "plugins", "s-systems") + "/";
const home = os.homedir();
const targets = [
  path.join(home, "plugins", "s-systems") + "/",
  path.join(home, ".claude", "plugins-dev", "s-systems") + "/",
];

for (const target of targets) {
  const args = ["-a", "--delete", "--exclude", ".DS_Store"];
  if (!apply) args.push("--dry-run", "--itemize-changes");
  args.push(source, target);
  const result = spawnSync("rsync", args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || `rsync failed for ${target}`);
  const output = result.stdout.trim();
  console.log(`${apply ? "synced" : "would sync"}: ${target}`);
  if (output) console.log(output);
}

if (!apply) console.log("Run `npm run plugins:sync:apply` after reviewing this release diff.");
