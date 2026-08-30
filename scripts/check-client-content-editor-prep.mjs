import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { downloadAsset } from "../plugins/s-systems/skills/eagle-skill/scripts/frameio-share-download.mjs";
import { matchingEagleItems } from "../plugins/s-systems/skills/eagle-skill/scripts/client-auto-ingest.mjs";

const root = process.cwd();
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "client-content-editor-prep-check-"));
const buildScript = path.join(
  root,
  "plugins/s-systems/skills/client-content-editor-prep/scripts/build-eagle-premiere-manifest.mjs",
);
const reconcileScript = path.join(
  root,
  "plugins/s-systems/skills/client-content-editor-prep/scripts/reconcile-premiere-manifest.mjs",
);

function run(script, args) {
  return spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: "utf8" });
}

try {
  const unsafeSpec = path.join(fixture, "unsafe-spec.json");
  fs.writeFileSync(
    unsafeSpec,
    JSON.stringify({
      prefix: "CLIENT",
      outputBase: "../escape",
      groups: [{ folderId: "fixture", tour: "Tour", camera: "A" }],
    }),
  );
  const unsafe = run(buildScript, ["--spec", unsafeSpec, "--output-dir", fixture]);
  assert.notEqual(unsafe.status, 0);
  assert.match(unsafe.stderr, /Unsafe output base/);
  assert.equal(fs.existsSync(path.join(path.dirname(fixture), "escape.json")), false);

  const emptyManifest = path.join(fixture, "empty.json");
  const emptyItems = path.join(fixture, "empty-items.json");
  fs.writeFileSync(emptyManifest, "[]\n");
  fs.writeFileSync(emptyItems, '{"items":[]}\n');
  const empty = run(reconcileScript, ["--manifest", emptyManifest, "--items-file", emptyItems]);
  assert.equal(empty.status, 0, empty.stderr);
  assert.match(fs.readFileSync(path.join(fixture, "empty.csv"), "utf8"), /^sequence_number,/);

  const incompleteManifest = path.join(fixture, "incomplete.json");
  const incompleteItems = path.join(fixture, "incomplete-items.json");
  fs.writeFileSync(
    incompleteManifest,
    JSON.stringify([
      {
        sequence_number: 1,
        premiere_name: "CLIENT-001",
        original_name: "clip.mov",
        eagle_item_id: "eagle-1",
        media_path: "/fixture/clip.mov",
        tour: "Tour",
        camera: "A",
        destination_bin: "Footage/Tour/A",
        classification: "usable",
        confidence: "high",
        reason: "fixture",
        premiere_item_id: "",
        premiere_tree_path: "",
        status: "planned",
      },
    ]),
  );
  fs.writeFileSync(
    incompleteItems,
    JSON.stringify({ items: [{ id: "premiere-1", name: "CLIENT-001", mediaPath: "/fixture/clip.mov" }] }),
  );
  const incomplete = run(reconcileScript, [
    "--manifest",
    incompleteManifest,
    "--items-file",
    incompleteItems,
  ]);
  assert.equal(incomplete.status, 1);
  assert.equal(JSON.parse(fs.readFileSync(incompleteManifest, "utf8"))[0].status, "failed");

  const downloadDir = path.join(fixture, "downloads");
  fs.mkdirSync(downloadDir);
  fs.writeFileSync(path.join(downloadDir, "clip.mov.part"), "abc");
  const completed = await downloadAsset(
    { id: "asset-1", name: "clip.mov", size: 3, url: "https://unused.invalid" },
    downloadDir,
  );
  assert.equal(completed, path.join(downloadDir, "clip.mov"));
  assert.equal(fs.readFileSync(completed, "utf8"), "abc");

  const duplicateMatches = matchingEagleItems(
    [
      { id: "one", name: "clip", ext: "mov", size: 3 },
      { id: "two", name: "clip", ext: "mov", size: 3 },
    ],
    { path: "/fixture/clip.mov", size: 3 },
  );
  assert.equal(duplicateMatches.length, 2);
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}

console.log("Client content editor prep checks passed: safe outputs, empty and incomplete manifests, exact partial resume, and ambiguous Eagle readback.");
