import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { hashValue } from "../lib/transactions/contract.mjs";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function valueAfter(flag) {
  const index = process.argv.indexOf(flag);
  return index === -1 ? null : process.argv[index + 1];
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function safeName(value) {
  return String(value).replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

const manifestArgument = valueAfter("--manifest");
const outputArgument = valueAfter("--output");
if (!manifestArgument || !outputArgument) {
  fail("Usage: node scripts/lineups-cue-proof.mjs --manifest <scene-manifest.json> --output <directory>");
}

const root = process.cwd();
const manifestPath = path.resolve(root, manifestArgument);
const outputDirectory = path.resolve(root, outputArgument);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.schemaVersion !== 2 || !Array.isArray(manifest.motion?.cues) || manifest.motion.cues.length === 0) {
  fail("The manifest needs schemaVersion 2 and at least one motion cue");
}

const numerator = manifest.motion.frameRate?.numerator;
const denominator = manifest.motion.frameRate?.denominator;
if (!Number.isInteger(numerator) || numerator <= 0 || !Number.isInteger(denominator) || denominator <= 0) {
  fail("The manifest needs a positive rational motion frame rate");
}

const exportPath = path.resolve(path.dirname(manifestPath), manifest.export.path);
const repoRelativeExport = path.resolve(root, manifest.export.path);
const videoPath = fs.existsSync(repoRelativeExport) ? repoRelativeExport : exportPath;
if (!fs.existsSync(videoPath)) fail(`Rendered video is missing: ${videoPath}`);

fs.mkdirSync(outputDirectory, { recursive: true });
const frameDuration = denominator / numerator;
const proof = {
  schemaVersion: 1,
  sceneId: manifest.scene.sceneId,
  engine: manifest.motion.engine,
  manifestSha256: hashValue(manifest),
  cueSha256: hashValue(manifest.motion.cues),
  artifactSha256: sha256(videoPath),
  frameRate: { numerator, denominator },
  frameDuration,
  cues: [],
};

for (const cue of manifest.motion.cues) {
  const samples = [
    { position: "before", time: Math.max(0, cue.sceneTime - frameDuration) },
    { position: "at", time: cue.sceneTime },
    { position: "after", time: cue.sceneTime + frameDuration },
  ];
  const evidence = { cueId: cue.cueId, sceneTime: cue.sceneTime, transcriptTimestamp: cue.transcriptTimestamp, samples: [] };
  for (const sample of samples) {
    const filename = `${safeName(cue.cueId)}-${sample.position}-${sample.time.toFixed(6)}.png`;
    const destination = path.join(outputDirectory, filename);
    const result = spawnSync(
      "ffmpeg",
      ["-hide_banner", "-loglevel", "error", "-y", "-i", videoPath, "-ss", sample.time.toFixed(9), "-frames:v", "1", destination],
      { encoding: "utf8" },
    );
    if (result.status !== 0) fail(`Frame extraction failed for ${cue.cueId}: ${result.stderr}`);
    evidence.samples.push({ ...sample, path: destination, fileSha256: sha256(destination) });
  }
  proof.cues.push(evidence);
}

const proofPath = path.join(outputDirectory, "cue-proof.json");
fs.writeFileSync(proofPath, `${JSON.stringify(proof, null, 2)}\n`);
console.log(`Lineups cue proof created: ${proofPath}`);
