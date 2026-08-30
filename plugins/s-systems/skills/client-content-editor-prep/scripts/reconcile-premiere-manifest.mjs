#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const MANIFEST_FIELDS = [
  "sequence_number",
  "premiere_name",
  "original_name",
  "eagle_item_id",
  "media_path",
  "tour",
  "camera",
  "destination_bin",
  "classification",
  "confidence",
  "reason",
  "premiere_item_id",
  "premiere_tree_path",
  "status",
];

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new Error("Usage: reconcile-premiere-manifest.mjs --manifest <file> (--items-file <file> | --items-base64 <value>)");
    }
    result[key.slice(2)] = value;
  }
  if (!result.manifest || (!result["items-file"] && !result["items-base64"])) {
    throw new Error("Manifest and Premiere item data are required");
  }
  return result;
}

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const args = parseArgs(process.argv.slice(2));
const manifestPath = path.resolve(args.manifest);
if (!/\.json$/i.test(manifestPath)) {
  throw new Error("Manifest path must end in .json");
}
const rows = JSON.parse(await fs.readFile(manifestPath, "utf8"));
if (!Array.isArray(rows)) throw new Error("Manifest must be an array");
const itemText = args["items-file"]
  ? await fs.readFile(path.resolve(args["items-file"]), "utf8")
  : Buffer.from(args["items-base64"], "base64").toString("utf8");
const project = JSON.parse(itemText);
if (!Array.isArray(project.items)) {
  throw new Error("Premiere item data must contain an items array");
}
const items = project.items;

const byMediaPath = new Map();
for (const item of items) {
  if (!item.mediaPath) continue;
  const list = byMediaPath.get(item.mediaPath) || [];
  list.push(item);
  byMediaPath.set(item.mediaPath, list);
}

const failures = [];
for (const row of rows) {
  if (row.classification !== "usable") continue;
  const matches = byMediaPath.get(row.media_path) || [];
  if (matches.length !== 1) {
    row.status = "failed";
    failures.push({ premiere_name: row.premiere_name, reason: `media path matched ${matches.length} project items` });
    continue;
  }
  const item = matches[0];
  if (
    typeof item.id !== "string"
    || typeof item.name !== "string"
    || typeof item.treePath !== "string"
  ) {
    row.status = "failed";
    failures.push({ premiere_name: row.premiere_name, reason: "project item readback is incomplete" });
    continue;
  }
  row.premiere_item_id = item.id;
  row.premiere_tree_path = item.treePath;
  const expectedBin = `\\${row.destination_bin.replaceAll("/", "\\")}\\`;
  const inExpectedBin = item.treePath.includes(expectedBin);
  const nameMatches = item.name === row.premiere_name;
  row.status = inExpectedBin && nameMatches ? "renamed" : "failed";
  if (!inExpectedBin || !nameMatches) {
    failures.push({
      premiere_name: row.premiere_name,
      actual_name: item.name,
      tree_path: item.treePath,
      expected_bin: row.destination_bin,
    });
  }
}

const fields = rows.length > 0 ? Object.keys(rows[0]) : MANIFEST_FIELDS;
await fs.writeFile(manifestPath, `${JSON.stringify(rows, null, 2)}\n`);
const csvPath = manifestPath.replace(/\.json$/i, ".csv");
const csv = [fields.join(","), ...rows.map((row) => fields.map((field) => csvCell(row[field])).join(","))].join("\n");
await fs.writeFile(csvPath, `${csv}\n`);

const summary = {
  total_project_items: items.length,
  usable_rows: rows.filter((row) => row.classification === "usable").length,
  renamed_rows: rows.filter((row) => row.status === "renamed").length,
  excluded_rows: rows.filter((row) => row.status === "excluded").length,
  failed_rows: rows.filter((row) => row.status === "failed").length,
  failures,
};
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;
