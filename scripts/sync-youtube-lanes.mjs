#!/usr/bin/env node
// Mirror lane YouTube profiles (config/<lane>/youtube.json) to ~/.claude/youtube/lanes/<lane>.json,
// where the installed yt-* skills read them. Dry run by default; --apply writes.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const target = path.join(os.homedir(), ".claude", "youtube", "lanes");
const apply = process.argv.includes("--apply");

const lanes = fs.readdirSync(path.join(root, "config"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, "config", entry.name, "youtube.json")))
  .map((entry) => entry.name);

if (apply) fs.mkdirSync(target, { recursive: true });
for (const lane of lanes) {
  const source = path.join(root, "config", lane, "youtube.json");
  const profile = JSON.parse(fs.readFileSync(source, "utf8"));
  if (profile.lane !== lane) throw new Error(`${source}: lane field "${profile.lane}" must match folder "${lane}"`);
  const dest = path.join(target, `${lane}.json`);
  const same = fs.existsSync(dest) && fs.readFileSync(dest, "utf8") === fs.readFileSync(source, "utf8");
  if (apply && !same) fs.copyFileSync(source, dest);
  console.log(`${same ? "same   " : apply ? "wrote  " : "would  "} ${lane} (${profile.status}) -> ${dest}`);
}
