// The Studio stage of check-lineups-framing: real Manim receipts, then stale and missing evidence must fail.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import test from 'node:test';

const root = process.cwd();
const installed = path.join(os.homedir(), '.pyenv/versions/3.12.3/bin/python3');
const python = process.env.PYTHON || (fs.existsSync(installed) ? installed : 'python3');
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2));
const lanes = ['quick action photo', 'quick stat', 'stat breakdown', 'comparison', 'year-by-year', 'asset swap', 'recurring board'];

function episode() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lineups-studio-gate-'));
  const words = [['Number', 1.0, 1.3], ['ten', 1.3, 1.6], ['Pittsburgh', 2.0, 2.5], ['Steelers.', 2.5, 3.0]];
  const transcript = path.join(dir, 'whisper.json');
  write(transcript, {transcription: words.map(([text, from, to]) => ({text: ' ' + text, offsets: {from: from * 1000, to: to * 1000},
    tokens: [{text: ' ' + text, offsets: {from: from * 1000, to: to * 1000}}]}))});
  const discovery = path.join(dir, 'lane-discovery.json');
  write(discovery, {schemaVersion: 1, episodeId: 'studio-gate', transcriptSha256: sha(transcript), fullTranscriptReviewed: true,
    lanes: lanes.map(lane => ({lane, reviewedSegmentIds: [0, 1, 2, 3], findings: lane === 'recurring board'
      ? [{outcome: 'candidate', candidateId: 'R10', reason: 'Spoken rank', segmentIds: [0, 1, 2, 3],
          excerpt: 'Number ten Pittsburgh Steelers.', start: 1, end: 3, assetSearch: {status: 'not-required', evidence: 'Board source'}}]
      : [{outcome: 'no-fit', reason: 'No passage'}]}))});
  const manifestPath = path.join(dir, 'R10.manifest.json');
  const manifest = {schemaVersion: 2, scene: {episodeId: 'studio-gate', sceneId: 'R10', lane: 'recurring board'}, discoveryPath: discovery,
    motion: {engine: 'figma', engineVersion: 'figma-motion', timingValidator: 'manim', sourcePath: null, sceneClass: null,
      frameRate: {numerator: 25, denominator: 1}, cues: [
        {cueId: 'R10-opening', elementId: 'visual', triggerType: 'PHRASE', triggerText: 'Number ten', transcriptTimestamp: 1, sceneTime: 0, action: 'Open', duration: 0.4},
        {cueId: 'R10-1', elementId: 'team', triggerType: 'PHRASE', triggerText: 'Pittsburgh Steelers', transcriptTimestamp: 2, sceneTime: 1, action: 'Reveal', duration: 0.4}]},
    timing: {transcriptSource: 'whisper', timestampResolution: 'word', transcriptPath: transcript, verifiedAnchorTimestamp: 1,
      contentEnd: 6.5, paddedCompositionEnd: 10, entranceTimes: [0, 1], proofPath: path.join(dir, 'R10.receipt.json'), manimTimingValidated: true},
    export: {dimensions: {width: 1920, height: 1080}}, review: {status: 'pending'}};
  write(manifestPath, manifest);
  const issued = spawnSync(python, ['-m', 'tools.lineups_motion.timing_evidence', '--issue'],
    {cwd: root, input: JSON.stringify({root, manifest}), encoding: 'utf8', env: {...process.env, PYTHONPATH: root}});
  assert.equal(issued.status, 0, issued.stderr);
  fs.writeFileSync(manifest.timing.proofPath, issued.stdout);
  const cueMap = path.join(dir, 'cue-map.json');
  write(cueMap, {episodeId: 'studio-gate', candidates: [{id: 'R10'}]});
  const proof = path.join(dir, 'cue-proof-receipt.json');
  write(proof, {episodeId: 'studio-gate', result: 'passed', sceneCount: 1, transcriptSha256: sha(transcript), discoverySha256: sha(discovery),
    cueMapSha256: sha(cueMap), scenes: [{sceneId: 'R10', result: 'passed', manifestPath, manifestSha256: sha(manifestPath)}]});
  const packet = path.join(dir, 'packet.json');
  write(packet, {episodeId: 'studio-gate', revision: sha(cueMap), scenes: [{id: 'R10'}]});
  const entry = {episodeSlug: 'studio-gate', asanaTask: '1220404457026180', dueDate: '2026-11-11', transcriptPath: transcript,
    discoveryPath: discovery, cueMapPath: cueMap, timingProofPath: proof,
    studio: {projectId: 'e4fcae4d-ff63-4c5a-a784-ff85bbd8e125', packetPath: packet, candidateCount: 1}};
  return {dir, entry, transcript, manifest, manifestPath, packet};
}

function gate(dir, entry) {
  const gates = path.join(dir, 'gates.json');
  write(gates, [entry]);
  return spawnSync(process.execPath, ['scripts/check-lineups-framing.mjs'], {cwd: root, encoding: 'utf8',
    env: {...process.env, LINEUPS_REVIEW_GATES_PATH: gates}});
}

test('Studio stage passes with current receipts and needs no Pre-Figma page', () => {
  const {dir, entry} = episode();
  const result = gate(dir, entry);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /timing passed for Studio candidate review/);
});

test('stale transcript, missing receipt and stale packet roster fail', () => {
  const stale = episode();
  fs.appendFileSync(stale.transcript, '\n');
  assert.notEqual(gate(stale.dir, stale.entry).status, 0);

  const missing = episode();
  fs.rmSync(missing.manifest.timing.proofPath);
  assert.match(gate(missing.dir, missing.entry).stderr, /receipt/i);

  const roster = episode();
  write(roster.packet, {episodeId: 'studio-gate', revision: 'a'.repeat(64), scenes: [{id: 'R10'}]});
  assert.match(gate(roster.dir, roster.entry).stderr, /Studio packet must bind the proved cue map/);

  const incomplete = episode();
  delete incomplete.entry.studio.projectId;
  assert.match(gate(incomplete.dir, incomplete.entry).stderr, /incomplete Studio stage record/);
});
