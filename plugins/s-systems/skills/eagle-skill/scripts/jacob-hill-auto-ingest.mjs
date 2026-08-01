#!/usr/bin/env node
// Locked Jacob Hill LAX ingest/rename convention.
// Categorizes new play clips against the recruiting-priority skill list in
// references/jacob-hill-lax-skills.jsonl, then renames them
// JH_<JOBCODE><NN>_<topic>.ext in priority order (01 = highest recruiting
// priority, i.e. On-ball defense, down through 12 = Off-ball IQ).
//
// Usage:
//   node jacob-hill-auto-ingest.mjs --folder-id <eagleFolderId> --job-code <BB|MSC|...> [--apply]
//
// Without --apply, prints the proposed rename table and exits (dry run).
// Items that don't match any keyword are listed under UNMATCHED and never
// renamed automatically - inspect and categorize those by hand.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(__dirname, "eagle-api-cli.js");
const SKILLS_PATH = path.join(
  __dirname,
  "..",
  "references",
  "jacob-hill-lax-skills.jsonl"
);
const EXPECTED_LIBRARY = "Content Editor.library";

function callCli(tool, args) {
  const out = execFileSync(
    "node",
    [CLI, "call", tool, "--json", JSON.stringify(args)],
    { encoding: "utf8" }
  );
  return JSON.parse(out);
}

function loadSkills() {
  return readFileSync(SKILLS_PATH, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .sort((a, b) => a.rank - b.rank);
}

function normalizeTopic(rawName) {
  // Strip a leading numeric/order token, convert Eagle's "+" separators to
  // hyphens, drop trailing junk, and keep a take-number suffix like "(2)".
  let name = rawName.trim();
  name = name.replace(/^\d+\s+/, "");
  const takeMatch = name.match(/\((\d+)\)\s*$/);
  const take = takeMatch ? `-${takeMatch[1]}` : "";
  name = name.replace(/\(\d+\)\s*$/, "");
  name = name
    .replace(/\+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return name + take;
}

function categorize(rawName, skills) {
  const haystack = rawName.toLowerCase().replace(/\+/g, " ");
  for (const skill of skills) {
    if (skill.keywords.some((kw) => haystack.includes(kw))) {
      return skill;
    }
  }
  return null;
}

function parseArgs(argv) {
  const args = { apply: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--folder-id") args.folderId = argv[++i];
    else if (argv[i] === "--job-code") args.jobCode = argv[++i];
    else if (argv[i] === "--apply") args.apply = true;
  }
  if (!args.folderId || !args.jobCode) {
    console.error(
      "Usage: node jacob-hill-auto-ingest.mjs --folder-id <id> --job-code <BB|MSC|...> [--apply]"
    );
    process.exit(1);
  }
  return args;
}

function main() {
  const { folderId, jobCode, apply } = parseArgs(process.argv.slice(2));

  const appInfo = callCli("get_app_info", {});
  const libraryPath = appInfo?.data?.libraryPath ?? "";
  if (!libraryPath.endsWith(EXPECTED_LIBRARY)) {
    console.error(
      `Refusing to run: Eagle library is "${libraryPath}", expected it to end with "${EXPECTED_LIBRARY}". Confirm the correct library is open before mutating.`
    );
    process.exit(1);
  }

  const skills = loadSkills();

  const itemsResp = callCli("item_get", { folders: [folderId], limit: 500 });
  const items = (itemsResp.data ?? []).filter(
    (item) => !item.name.startsWith("JH_") // skip items already in the locked naming convention
  );

  if (items.length === 0) {
    console.log("No un-renamed items found in that folder. Nothing to do.");
    return;
  }

  const byRank = new Map();
  const unmatched = [];

  for (const item of items) {
    const skill = categorize(item.name, skills);
    if (!skill) {
      unmatched.push(item);
      continue;
    }
    if (!byRank.has(skill.rank)) byRank.set(skill.rank, []);
    byRank.get(skill.rank).push({ item, skill });
  }

  const ordered = [...byRank.keys()]
    .sort((a, b) => a - b)
    .flatMap((rank) => byRank.get(rank));

  const renames = ordered.map(({ item, skill }, idx) => {
    const order = String(idx + 1).padStart(2, "0");
    const topic = normalizeTopic(item.name);
    const proposed = `JH_${jobCode}${order}_${topic}`;
    return { id: item.id, current: item.name, proposed, category: skill.category };
  });

  console.log(`\nProposed renames (${renames.length}) - priority order 01..${renames.length}:\n`);
  for (const r of renames) {
    console.log(`  ${r.id}  ${r.current.padEnd(30)} -> ${r.proposed}.<ext>   [${r.category}]`);
  }

  if (unmatched.length > 0) {
    console.log(`\nUNMATCHED (${unmatched.length}) - not renamed, needs manual review/preview:\n`);
    for (const item of unmatched) {
      console.log(`  ${item.id}  ${item.name}`);
    }
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write these names to Eagle.");
    return;
  }

  const updateResp = callCli("item_update", {
    items: renames.map((r) => ({ id: r.id, name: r.proposed })),
  });
  console.log(`\n${updateResp.message}`);
}

main();
