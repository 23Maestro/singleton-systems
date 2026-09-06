#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const eagleCli = path.join(scriptDir, "eagle-api-cli.js");
const proposalSchema = path.join(scriptDir, "..", "references", "lineups-asset-proposals.schema.json");
const leagues = new Set(["NFL", "CFB"]);
const roles = new Set(["Player", "Coach"]);
const photoTypes = new Set(["Action", "Transparent", "Logo"]);

function slug(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateProposal(proposal) {
  if (!proposal?.id) throw new Error("Every proposal needs an Eagle item id");
  if (!proposal.subject || !slug(proposal.subject)) throw new Error(`${proposal.id}: subject is required`);
  if (!leagues.has(proposal.league)) throw new Error(`${proposal.id}: league must be NFL or CFB`);
  if (!proposal.team?.trim()) throw new Error(`${proposal.id}: team is required`);
  if (!photoTypes.has(proposal.photoType)) throw new Error(`${proposal.id}: invalid photo type`);
  if (proposal.photoType === "Logo") {
    if (proposal.role != null) throw new Error(`${proposal.id}: logos cannot have a role`);
  } else if (!roles.has(proposal.role)) {
    throw new Error(`${proposal.id}: person photos require Player or Coach`);
  }
  if (proposal.confidence !== "high") throw new Error(`${proposal.id}: identity needs review`);
}

function nextNames(existingNames, proposals) {
  const counters = new Map();
  for (const name of existingNames) {
    const match = String(name).match(/^(.*)-([1-9]\d*)$/);
    if (match) counters.set(match[1], Math.max(counters.get(match[1]) ?? 0, Number(match[2])));
  }
  return proposals.map((proposal) => {
    validateProposal(proposal);
    const base = slug(proposal.photoType === "Logo" ? proposal.team : proposal.subject);
    const number = (counters.get(base) ?? 0) + 1;
    counters.set(base, number);
    const tags = proposal.photoType === "Logo"
      ? [proposal.league, proposal.team, "Logo"]
      : [proposal.league, proposal.team, proposal.role, proposal.photoType];
    return { id: proposal.id, name: `${base}-${number}`, tags };
  });
}

function planUpdates(existing, proposals) {
  const targetIds = new Set(proposals.map((proposal) => proposal.id));
  if (targetIds.size !== proposals.length) throw new Error("Proposal file contains duplicate Eagle item ids");
  return nextNames(existing.filter((item) => !targetIds.has(item.id)).map((item) => item.name), proposals);
}

function callEagle(tool, params) {
  const response = JSON.parse(execFileSync(process.execPath, [eagleCli, "call", tool, "--json", JSON.stringify(params)], {
    encoding: "utf8",
  }));
  if (response.success !== true) throw new Error(response.message || `Eagle ${tool} failed`);
  return response;
}

function allEagleItems() {
  const items = [];
  for (let offset = 0; ; offset += 1000) {
    const page = callEagle("item_get", { limit: 1000, offset });
    items.push(...(page.data ?? []));
    if ((page.data ?? []).length < 1000) return items;
  }
}

function lockedGroups(proposals) {
  const response = callEagle("tag_group_get", {
    names: ["League", "Team", "Role", "Photo Type"],
    fullDetails: true,
  });
  const groups = new Map((response.data ?? []).map((group) => [group.name, group]));
  const fixed = new Map([
    ["League", ["NFL", "CFB"]],
    ["Role", ["Player", "Coach"]],
    ["Photo Type", ["Action", "Transparent", "Logo"]],
  ]);
  for (const [name, tags] of fixed) {
    const group = groups.get(name);
    if (!group || JSON.stringify([...group.tags].sort()) !== JSON.stringify([...tags].sort())) {
      throw new Error(`${name}: Eagle tag group does not match the locked contract`);
    }
  }
  const teamGroup = groups.get("Team");
  if (!teamGroup) throw new Error("Team: Eagle tag group is missing");
  const missingTeams = [...new Set(proposals.map((proposal) => proposal.team))]
    .filter((team) => !teamGroup.tags.includes(team));
  return { missingTeams, teamGroupId: teamGroup.id };
}

function readProposals(file) {
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  return Array.isArray(parsed) ? parsed : parsed.items;
}

function identify(manifestFile) {
  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  if (!Array.isArray(manifest.items) || manifest.items.length === 0) throw new Error("Identification manifest has no items");
  const images = manifest.items.map((item) => path.resolve(item.imagePath));
  for (const image of images) if (!fs.existsSync(image)) throw new Error(`Image was not found: ${image}`);
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "lineups-identify-"));
  const output = path.join(temp, "proposals.json");
  const prompt = [
    "Identify the primary football person or team logo in each attached image.",
    "Return one item for each input, in the same order. Use high confidence only when the identity is clear; otherwise use review.",
    "Action means a standard full photo. Transparent means a real alpha cutout. Do not infer transparent from a plain background.",
    JSON.stringify(manifest.items.map(({ id, imagePath }) => ({ id, file: path.basename(imagePath) }))),
  ].join("\n");
  try {
    const auth = spawnSync("codex", ["login", "status"], { encoding: "utf8" });
    if (auth.status !== 0 || !auth.stdout.includes("Logged in using ChatGPT")) {
      throw new Error("Codex must be logged in with ChatGPT; API-key billing is blocked");
    }
    const result = spawnSync("codex", [
      "exec", "--ephemeral", "--sandbox", "read-only",
      "--output-schema", proposalSchema, "--output-last-message", output,
      "-i", ...images, "-",
    ], { input: prompt, encoding: "utf8" });
    if (result.status !== 0) throw new Error(result.stderr || "Codex identification failed");
    const proposals = readProposals(output);
    const expectedIds = manifest.items.map((item) => item.id);
    if (JSON.stringify(proposals.map((item) => item.id)) !== JSON.stringify(expectedIds)) {
      throw new Error("Codex identification did not return the requested Eagle item ids in order");
    }
    return proposals;
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

function parseArgs(argv) {
  const args = { apply: false };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--apply") args.apply = true;
    else if (argv[index] === "--proposals") args.proposals = argv[++index];
    else if (argv[index] === "--identify") args.identify = argv[++index];
  }
  if (Boolean(args.proposals) === Boolean(args.identify)) {
    throw new Error("Usage: lineups-asset-gate.mjs (--proposals <file> | --identify <manifest>) [--apply]");
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const proposals = args.proposals
    ? readProposals(path.resolve(args.proposals))
    : identify(path.resolve(args.identify));
  if (!Array.isArray(proposals) || proposals.length === 0) throw new Error("Proposal file has no items");
  for (const proposal of proposals) validateProposal(proposal);
  const { missingTeams, teamGroupId } = lockedGroups(proposals);

  const existing = allEagleItems();
  const byId = new Map(existing.map((item) => [item.id, item]));
  for (const proposal of proposals) {
    if (!byId.has(proposal.id)) throw new Error(`${proposal.id}: Eagle item was not found`);
  }

  const updates = planUpdates(existing, proposals);
  console.log(JSON.stringify({ mode: args.apply ? "apply" : "dry-run", addToTeamGroup: missingTeams, items: updates }, null, 2));
  if (!args.apply) return;

  callEagle("item_update", { items: updates });
  if (missingTeams.length) {
    callEagle("tag_group_add_tags", {
      operations: [{ groupId: teamGroupId, tags: missingTeams, removeFromSource: true }],
    });
    const teamGroup = callEagle("tag_group_get", { ids: [teamGroupId], fullDetails: true }).data?.[0];
    if (!teamGroup || missingTeams.some((team) => !teamGroup.tags.includes(team))) {
      throw new Error("Team: Eagle tag group readback is incomplete");
    }
  }
  const readback = callEagle("item_get", { ids: updates.map((item) => item.id), fullDetails: true, limit: updates.length });
  const actual = new Map((readback.data ?? []).map((item) => [item.id, item]));
  for (const expected of updates) {
    const item = actual.get(expected.id);
    if (!item || item.name !== expected.name || JSON.stringify([...item.tags].sort()) !== JSON.stringify([...expected.tags].sort())) {
      throw new Error(`${expected.id}: Eagle readback did not match the locked name and tags`);
    }
  }
  console.log(`Verified ${updates.length} Eagle item${updates.length === 1 ? "" : "s"}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

export { nextNames, planUpdates, slug, validateProposal };
