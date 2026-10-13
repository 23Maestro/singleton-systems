import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import crypto from 'node:crypto';
import {hashValue} from '../lib/transactions/contract.mjs';
import {createLineupsReconciliation} from '../lib/transactions/lineups-adapter.mjs';
import {prepareSceneEvidence, prepareMediaEvidence} from './lib/lineups-test-evidence.mjs';

const root = process.cwd();
const python = process.env.PYTHON || 'python3';
const hook = path.join(root, '.codex/hooks/lineups_enforcement.py');

function episodeCase() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lineups-discovery-'));
  const transcriptPath = path.join(dir, 'transcript.json');
  fs.writeFileSync(transcriptPath, JSON.stringify({transcription: [{text: 'Mark introduces the show.', offsets: {from: 0, to: 1000}}]}));
  const ledger = {
    schemaVersion: 1, episodeId: 'test-episode',
    transcriptSha256: crypto.createHash('sha256').update(fs.readFileSync(transcriptPath)).digest('hex'),
    fullTranscriptReviewed: true,
    lanes: ['quick action photo', 'quick stat', 'stat breakdown', 'comparison', 'year-by-year', 'asset swap', 'recurring board'].map(lane => ({lane, reviewedSegmentIds: [0], findings: [{outcome: 'no-fit', reason: 'Only an introduction; no supported visual argument.'}]})),
  };
  const discoveryPath = path.join(dir, 'discovery.json');
  const html = path.join(dir, 'index.html');
  fs.writeFileSync(html, '<h1>Test review</h1>');
  const record = {episodeSlug: 'test-episode', asanaTask: '123', dueDate: '2026-10-08', transcriptPath, discoveryPath, preFigma: {path: html, title: 'Test review', candidateCount: 0}};
  function review() {
    fs.writeFileSync(discoveryPath, JSON.stringify(ledger));
    const registry = path.join(dir, 'review-gates.json');
    fs.writeFileSync(registry, JSON.stringify([record]));
    return spawnSync('node', ['scripts/check-lineups-framing.mjs'], {cwd: root, encoding: 'utf8', env: {...process.env, PYTHON: python, LINEUPS_REVIEW_GATES_PATH: registry}});
  }
  return {dir, ledger, record, review};
}

function sceneCase() {
  const c = episodeCase();
  c.review();
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'config/lineups/fixtures/valid/scene-manifest.json')));
  manifest.scene.episodeId = c.record.episodeSlug;
  manifest.timing.transcriptPath = c.record.transcriptPath;
  manifest.discoveryPath = c.record.discoveryPath;
  assert.equal(prepareSceneEvidence(c.dir, manifest).status, 0);
  const manifestPath = path.join(c.dir, 'scene.json');
  function run(event, tool, input, response, runtime = python) {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    const result = spawnSync(runtime, [hook], {cwd: root, encoding: 'utf8', input: JSON.stringify({hook_event_name: event, cwd: root, tool_name: tool, tool_input: input, tool_response: response}), env: {...process.env, LINEUPS_MANIFEST_PATH: manifestPath}});
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim() ? JSON.parse(result.stdout) : {};
  }
  return {...c, manifest, run, approve: () => prepareSceneEvidence(c.dir, manifest)};
}

test('Pre-Figma progression rejects an episode without discovery even with timing proof', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lineups-discovery-'));
  try {
    const registry = path.join(dir, 'review-gates.json');
    fs.writeFileSync(registry, JSON.stringify([{
      episodeSlug: 'test-episode', asanaTask: '123', dueDate: '2026-10-08',
      preFigma: {path: 'unused.html', title: 'Test', candidateCount: 1},
      timing: {manimTimingValidated: true},
    }]));
    const result = spawnSync('node', ['scripts/check-lineups-framing.mjs'], {
      cwd: root, encoding: 'utf8', env: {...process.env, PYTHON: python, LINEUPS_REVIEW_GATES_PATH: registry},
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /discovery/i);
  } finally { fs.rmSync(dir, {recursive: true, force: true}); }
});

test('Pre-Figma requires an outcome for each reviewed lane', () => {
  const c = episodeCase();
  try {
    c.ledger.lanes[2].findings = [];
    assert.match(c.review().stderr, /discovery.*outcome/s);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('Pre-Figma rejects partial full-transcript coverage', () => {
  const c = episodeCase();
  try {
    c.ledger.lanes[3].reviewedSegmentIds = [];
    assert.match(c.review().stderr, /discovery.*coverage/s);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('candidate discovery requires source excerpts and timestamps', () => {
  const c = episodeCase();
  try {
    c.ledger.lanes[3].findings = [{outcome: 'candidate', reason: 'A comparison', assetSearch: {status: 'needed', query: 'players'}}];
    assert.match(c.review().stderr, /discovery.*excerpt/s);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('scoped Figma preflight rejects missing discovery before timing receipts', () => {
  const c = episodeCase();
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'config/lineups/fixtures/valid/scene-manifest.json')));
    manifest.scene.episodeId = c.record.episodeSlug;
    manifest.timing.transcriptPath = c.record.transcriptPath;
    const manifestPath = path.join(c.dir, 'scene.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    const result = spawnSync(python, [hook], {cwd: root, encoding: 'utf8', input: JSON.stringify({hook_event_name: 'PreToolUse', cwd: root, tool_name: 'mcp__codex_apps__figma_use_figma', tool_input: {fileKey: manifest.figma.fileKey}}), env: {...process.env, LINEUPS_MANIFEST_PATH: manifestPath}});
    assert.match(result.stdout, /discovery/i);
    assert.equal(JSON.parse(result.stdout).hookSpecificOutput.permissionDecision, 'deny');
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('successful import before ID binding requests readback instead of crashing or claiming destination', () => {
  const c = sceneCase();
  try {
    delete c.manifest.premiere.projectItemId;
    const result = c.run('PostToolUse', 'mcp__premiere_pro__import_media', {filePath: path.resolve(root, c.manifest.export.path)}, {content: [{type: 'text', text: JSON.stringify({success: true, data: {projectItemId: 'new-item'}})}]});
    assert.match(result.hookSpecificOutput?.additionalContext || '', /new-item.*readback/i);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('successful placement before clip ID binding preserves partial success for readback', () => {
  const c = sceneCase();
  try {
    delete c.manifest.premiere.timelineClipId;
    const result = c.run('PostToolUse', 'mcp__premiere_pro__add_to_timeline', {sequenceId: c.manifest.premiere.sequenceId}, {data: {clipId: 'new-clip'}});
    assert.match(result.hookSpecificOutput?.additionalContext || '', /new-clip.*readback/i);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('full-sequence MCP data envelope verifies exact sequence, node ID and start/end fields', () => {
  const c = sceneCase();
  try {
    const p = c.manifest.premiere;
    const response = {content: [{type: 'text', text: JSON.stringify({success: true, data: {id: p.sequenceId, videoTracks: [{index: p.trackIndex, clips: [{nodeId: p.timelineClipId, start: 312.4, end: 326.6}]}]}})}]};
    const result = c.run('PostToolUse', 'mcp__premiere_pro__get_full_sequence_info', {sequenceId: p.sequenceId}, response);
    assert.match(result.hookSpecificOutput?.additionalContext || '', /placement readback passed/);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('live editorial trims and source In/Out verify separately from padded render duration', () => {
  const c = sceneCase();
  try {
    const p = c.manifest.premiere;
    p.editorialTiming = {startTime: 312.8, duration: 4.52, endTime: 317.32, sourceIn: 0.4, sourceOut: 4.92};
    assert.equal(c.approve().status, 0);
    const response = {data: {id: p.sequenceId, videoTracks: [{index: p.trackIndex, clips: [{nodeId: p.timelineClipId, start: 312.8, end: 317.32, inPoint: 0.4, outPoint: 4.92}]}]}};
    const result = c.run('PostToolUse', 'mcp__premiere_pro__get_full_sequence_info', {sequenceId: p.sequenceId}, response);
    assert.match(result.hookSpecificOutput?.additionalContext || '', /placement readback passed/);
    assert.equal(c.manifest.timing.paddedCompositionEnd, 14.2);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('Cinematic 2-up preflight requires full photos visible together at frame zero', () => {
  const c = sceneCase();
  try {
    c.manifest.scene.lane = 'comparison';
    c.manifest.scene.approvedOption = 'Cinematic 2-up';
    assert.equal(c.approve().status, 0);
    const result = c.run('PreToolUse', 'mcp__codex_apps__figma_use_figma', {fileKey: c.manifest.figma.fileKey});
    assert.match(result.hookSpecificOutput?.permissionDecisionReason || '', /Cinematic.*full photos/i);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('Quick Action Photo requires requested 4.5 seconds separately from 113 frames at 25 fps', () => {
  const c = sceneCase();
  try {
    c.manifest.scene.lane = 'quick action photo';
    c.manifest.scene.approvedOption = 'quick action photo';
    c.manifest.motion.frameRate = {numerator: 25, denominator: 1};
    assert.equal(c.approve().status, 0);
    const result = c.run('PreToolUse', 'mcp__codex_apps__figma_use_figma', {fileKey: c.manifest.figma.fileKey});
    assert.match(result.hookSpecificOutput?.permissionDecisionReason || '', /requested.*4.5/i);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('current full-transcript no-fit evidence passes without filler; revision changes fail', () => {
  const c = episodeCase();
  try {
    assert.equal(c.review().status, 0);
    fs.appendFileSync(c.record.transcriptPath, ' ');
    assert.match(c.review().stderr, /stale/);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('import destination readback cannot combine facts from different items', () => {
  const c = sceneCase();
  try {
    const p = c.manifest.premiere;
    const result = c.run('PostToolUse', 'mcp__premiere_pro__get_project_item_info', {projectItemId: p.projectItemId}, {items: [{projectItemId: p.projectItemId, treePath: 'wrong', labelReadback: 'wrong'}, {projectItemId: 'another', treePath: p.treePath, labelReadback: p.labelReadback}]});
    assert.match(JSON.stringify(result), /readback is missing/i);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('Quick Action carries 113 frames and reports 4.52 seconds separately at 25 fps', () => {
  const c = sceneCase();
  try {
    c.manifest.scene.lane = 'quick action photo';
    c.manifest.scene.approvedOption = 'quick action photo';
    c.manifest.scene.editorialDuration = {requestedDurationSeconds: 4.5, durationFrames: 113, actualDurationSeconds: 4.52, rounding: 'nearest-half-up'};
    c.manifest.motion.frameRate = {numerator: 25, denominator: 1};
    assert.equal(c.approve().status, 0);
    const p = c.manifest.premiere;
    const response = {data: {id: p.sequenceId, videoTracks: [{index: p.trackIndex, clips: [{nodeId: p.timelineClipId, start: p.approvedStartTime, end: p.approvedEndTime}]}]}};
    const result = c.run('PostToolUse', 'mcp__premiere_pro__get_full_sequence_info', {sequenceId: p.sequenceId}, response);
    assert.match(result.hookSpecificOutput?.additionalContext || '', /placement readback passed/);
    c.manifest.scene.editorialDuration.actualDurationSeconds = 4.5;
    const rejected = c.run('PostToolUse', 'mcp__premiere_pro__get_full_sequence_info', {sequenceId: c.manifest.premiere.sequenceId}, {});
    assert.match(JSON.stringify(rejected), /requested 4.5/);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('Pre-Figma candidate page requires a current cue proof, separately from discovery', () => {
  const c = episodeCase();
  try {
    c.record.preFigma.candidateCount = 1;
    assert.notEqual(c.review().status, 0, 'Candidate page advanced without timing proof');
    assert.match(c.review().stderr, /timing.*proof/i);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});


test('Cinematic layout passes MCP fixture readback; cutouts, delayed or hidden photos and shifted titles fail', () => {
  const c = sceneCase();
  try {
    c.manifest.scene.lane = 'comparison';
    c.manifest.scene.approvedOption = 'Cinematic 2-up';
    c.manifest.figma.cinematic2Up = {titlePosition: 'top-left', photos: [0, 1].map(i => ({nodeId: `photo-${i}`, sourceId: `source-${i}`, imageHash: String(i).repeat(40), assetTreatment: 'full-photo', originalBackground: true, visibleFrom: 0, openingBounds: {x: i * 960, y: 0, width: 960, height: 1080}}))};
    assert.equal(c.approve().status, 0);
    const p = c.manifest.premiere;
    const response = {success: true, data: {id: p.sequenceId, videoTracks: [{index: p.trackIndex, clips: [{nodeId: p.timelineClipId, start: p.approvedStartTime, end: p.approvedEndTime}]}]}};
    const read = () => c.run('PostToolUse', 'mcp__premiere_pro__get_full_sequence_info', {sequenceId: p.sequenceId}, response);
    assert.match(read().hookSpecificOutput?.additionalContext || '', /placement readback passed/);
    const good = structuredClone(c.manifest.figma.cinematic2Up);
    for (const mutation of [layout => {layout.photos[0].assetTreatment = 'alpha';}, layout => {layout.photos[1].visibleFrom = 2;}, layout => {layout.titlePosition = 'center';}, layout => {layout.photos[1].openingBounds.x = 1920;}]) {
      c.manifest.figma.cinematic2Up = structuredClone(good); mutation(c.manifest.figma.cinematic2Up);
      assert.match(JSON.stringify(read()), /Cinematic/);
      assert.equal(read().decision, 'block');
    }
    c.manifest.figma.cinematic2Up = good;
    c.manifest.figma.motionTracks.push({nodeId: 'photo-1', property: 'opacity', keyframes: [{time: 0, value: 0}, {time: 2, value: 1}]});
    assert.match(JSON.stringify(read()), /delayed or hidden/);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('cached system-Python hook commands reach the installed Manim runtime', () => {
  if (!fs.existsSync('/usr/bin/python3')) return;
  const c = sceneCase();
  try {
    const p = c.manifest.premiere;
    const response = {success: true, data: {id: p.sequenceId, videoTracks: [{index: p.trackIndex, clips: [{nodeId: p.timelineClipId, start: p.approvedStartTime, end: p.approvedEndTime}]}]}};
    const result = c.run('PostToolUse', 'mcp__premiere_pro__get_full_sequence_info', {sequenceId: p.sequenceId}, response, '/usr/bin/python3');
    assert.match(result.hookSpecificOutput?.additionalContext || '', /placement readback passed/);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('unrelated Figma files remain unscoped even with absent discovery', () => {
  const c = sceneCase();
  try {
    delete c.manifest.discoveryPath;
    assert.deepEqual(c.run('PreToolUse', 'mcp__codex_apps__figma_use_figma', {fileKey: 'ANOTHER-FILE'}), {});
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('failed MCP text envelopes cannot report successful Premiere readback', () => {
  const c = sceneCase();
  try {
    const p = c.manifest.premiere;
    const data = {id: p.sequenceId, videoTracks: [{index: p.trackIndex, clips: [{nodeId: p.timelineClipId, start: p.approvedStartTime, end: p.approvedEndTime}]}]};
    for (const failure of [{success: false}, {status: 'failed'}, {error: 'bridge timed out'}, {isError: true}]) {
      const response = {content: [{type: 'text', text: JSON.stringify({...failure, data})}]};
      const result = c.run('PostToolUse', 'mcp__premiere_pro__get_full_sequence_info', {sequenceId: p.sequenceId}, response);
      assert.equal(result.decision, 'block', JSON.stringify(failure));
      assert.match(result.reason, /tool response reports an error/);
    }
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('Figma progression requires measured motion tracks on the matching scene', () => {
  const c = sceneCase();
  try {
    const f = c.manifest.figma;
    const readback = {rootNodeId: f.rootNodeId, sourceComponentId: f.sourceComponentId,
      episodeInstanceId: f.episodeInstanceId, nodeType: 'FRAME', sourceRevision: f.sourceRevision, rootDimensions: f.rootDimensions,
      focalAssets: f.focalAssets.map(a => ({...a, opaqueBounds: {x: a.centerX - 100, y: 100, width: 200, height: 200}}))};
    const read = response => c.run('PostToolUse', 'mcp__codex_apps__figma_use_figma', {fileKey: f.fileKey}, response);
    assert.equal(read(readback).decision, 'block', 'Declared manifest tracks cannot prove live Figma motion');
    const good = {...readback, motionTracks: structuredClone(f.motionTracks)};
    assert.match(read(good).hookSpecificOutput?.additionalContext || '', /readback passed/);
    assert.equal(read([good, good]).decision, 'block', 'Duplicate scene identities are ambiguous');
    const noDimensions = {...good}; delete noDimensions.rootDimensions;
    assert.equal(read(noDimensions).decision, 'block', 'Declared dimensions cannot prove the scene size');
    good.motionTracks[0].keyframes[0].time = 4;
    assert.equal(read(good).decision, 'block');
    assert.equal(read({scene: readback, unrelated: {motionTracks: f.motionTracks}}).decision, 'block');
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('native float precision preserves valid photo pushes while changed motion stays blocked', () => {
  const c = sceneCase();
  try {
    c.manifest.scene.lane = 'stat breakdown'; c.manifest.scene.approvedOption = 'stat breakdown';
    c.manifest.figma.background = {setting: 'Field Night / No football', nodeId: 'background', imageHash: '6c84d05a7f038c5e3f9f14a4103cd9b533251e70', locked: true, separateFromArtwork: true};
    c.manifest.figma.motionTracks.push({cueId: 'photo-push', nodeId: 'photo', property: 'scale', duration: 14.2, keyframes: [{time: 0, value: 1}, {time: 14.2, value: 1.025}]});
    assert.equal(c.approve().status, 0);
    const f = c.manifest.figma;
    const response = {rootNodeId: f.rootNodeId, sourceComponentId: f.sourceComponentId, episodeInstanceId: f.episodeInstanceId,
      nodeType: 'FRAME', sourceRevision: f.sourceRevision, rootDimensions: {width: 1920, height: 1080}, background: f.background,
      motionTracks: structuredClone(f.motionTracks)};
    response.motionTracks.at(-1).keyframes[1].value = 1.024999976158142;
    const read = () => c.run('PostToolUse', 'mcp__codex_apps__figma_use_figma', {fileKey: f.fileKey}, response);
    const actual = read();
    assert.match(actual.hookSpecificOutput?.additionalContext || '', /readback passed/, JSON.stringify(actual));
    response.motionTracks.at(-1).keyframes[1].value = 1.03;
    assert.equal(read().decision, 'block');
    response.motionTracks.at(-1).keyframes[1].value = null;
    assert.equal(read().decision, 'block');
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('a detached data scene binds its measured episode background instead of requiring a source child ID', () => {
  const c = sceneCase();
  try {
    c.manifest.scene.lane = 'stat breakdown'; c.manifest.scene.approvedOption = 'stat breakdown';
    c.manifest.figma.background = {setting: 'Field Night / No football', nodeId: 'pending:scene-07/BACKGROUND', imageHash: '6c84d05a7f038c5e3f9f14a4103cd9b533251e70', locked: true, separateFromArtwork: true};
    assert.equal(c.approve().status, 0);
    const f = c.manifest.figma;
    const response = {rootNodeId: f.rootNodeId, sourceComponentId: f.sourceComponentId, episodeInstanceId: f.episodeInstanceId,
      nodeType: 'FRAME', sourceRevision: f.sourceRevision, rootDimensions: {width: 1920, height: 1080},
      background: {...f.background, nodeId: 'CLONED:6', plannedNodeId: 'pending:scene-07/BACKGROUND'}, motionTracks: structuredClone(f.motionTracks)};
    const read = () => c.run('PostToolUse', 'mcp__codex_apps__figma_use_figma', {fileKey: f.fileKey}, response);
    const actual = read();
    assert.match(actual.hookSpecificOutput?.additionalContext || '', /readback passed/, JSON.stringify(actual));
    response.background.imageHash = 'WRONG';
    assert.equal(read().decision, 'block');
    response.background.imageHash = f.background.imageHash;
    response.background.locked = false;
    assert.equal(read().decision, 'block');
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('export and delivery readback cannot bypass a missing or failed native Figma measurement', async () => {
  const c = sceneCase();
  try {
    const f = c.manifest.figma;
    const readback = {rootNodeId: f.rootNodeId, sourceComponentId: f.sourceComponentId, episodeInstanceId: f.episodeInstanceId,
      nodeType: 'FRAME', sourceRevision: f.sourceRevision, rootDimensions: {width: 1920, height: 1080},
      motionTracks: structuredClone(f.motionTracks),
      focalAssets: f.focalAssets.map(a => ({...a, opaqueBounds: {x: a.centerX - 100, y: 100, width: 200, height: 200}}))};
    const directory = path.join(c.dir, 'receipts'); fs.mkdirSync(directory);
    const receipt = JSON.parse(fs.readFileSync(path.join(root, 'config/lineups/fixtures/valid/receipts/scene-07.figma-to-export.receipt.json')));
    receipt.episodeId = c.manifest.scene.episodeId;
    receipt.manifestSha256 = hashValue(c.manifest);
    receipt.evidence.sceneReadback = readback;
    const save = () => {delete receipt.receiptSha256; receipt.receiptSha256 = hashValue(receipt);
      fs.writeFileSync(path.join(directory, 'scene-07.figma-to-export.receipt.json'), JSON.stringify(receipt));};
    save();
    const pre = () => c.run('PreToolUse', 'mcp__codex_apps__figma_export_video', {fileKey: f.fileKey, nodeId: f.rootNodeId});
    assert.equal(pre().hookSpecificOutput?.permissionDecision, 'deny', 'A reviewed receipt cannot invent a successful PostToolUse measurement');
    assert.match(c.run('PostToolUse', 'mcp__codex_apps__figma_use_figma', {fileKey: f.fileKey}, readback).hookSpecificOutput?.additionalContext || '', /readback passed/);
    assert.deepEqual(pre(), {});
    const valid = createLineupsReconciliation({root, manifestPath: path.join(c.dir, 'scene.json'), receiptDirectory: directory});
    assert.equal((await valid.adapters['figma-scene'].verify({readback: await valid.adapters['figma-scene'].readback()})).ok, true);
    c.run('PostToolUse', 'mcp__codex_apps__figma_use_figma', {fileKey: f.fileKey}, {success: false, error: 'Native motion failed'});
    assert.equal(pre().hookSpecificOutput?.permissionDecision, 'deny', 'Failed Post must invalidate earlier successful proof');
    c.run('PostToolUse', 'mcp__codex_apps__figma_use_figma', {fileKey: f.fileKey}, readback);
    delete receipt.evidence.sceneReadback.motionTracks;
    save();
    assert.equal(pre().hookSpecificOutput?.permissionDecision, 'deny');
    const proof = createLineupsReconciliation({root, manifestPath: path.join(c.dir, 'scene.json'), receiptDirectory: directory});
    const measured = await proof.adapters['figma-scene'].verify({readback: await proof.adapters['figma-scene'].readback()});
    assert.equal(measured.ok, false, 'Delivery must consume the same measured scene contract');
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('a timing flag alone cannot advance an enrolled scene', () => {
  const c = sceneCase();
  try {
    delete c.manifest.timing.proofPath;
    const p = c.manifest.premiere;
    const result = c.run('PostToolUse', 'mcp__premiere_pro__get_full_sequence_info', {sequenceId: p.sequenceId},
      {data: {id: p.sequenceId, videoTracks: [{index: p.trackIndex, clips: [{nodeId: p.timelineClipId, start: p.approvedStartTime, end: p.approvedEndTime}]}]}});
    assert.equal(result.decision, 'block', 'Manim configuration is not evidence of an upstream timing run');
    assert.match(result.reason, /timing.*receipt/i);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('unrelated Premiere destructive targets remain outside Lineups scope', () => {
  const c = sceneCase();
  try {
    assert.deepEqual(c.run('PreToolUse', 'mcp__premiere_pro__delete_project_item', {projectItemId: 'OTHER-WORKFLOW'}), {});
    assert.deepEqual(c.run('PreToolUse', 'mcp__premiere_pro__remove_from_timeline', {sequenceId: 'OTHER-SEQUENCE', clipId: 'OTHER-CLIP'}), {});
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('selected scenes must be actual discovered candidates in their lane', () => {
  const c = sceneCase();
  try {
    const ledger = JSON.parse(fs.readFileSync(c.manifest.discoveryPath));
    ledger.lanes.find(row => row.lane === c.manifest.scene.lane).findings[0].outcome = 'rejected';
    fs.writeFileSync(c.manifest.discoveryPath, JSON.stringify(ledger));
    const result = c.run('PreToolUse', 'mcp__codex_apps__figma_use_figma', {fileKey: c.manifest.figma.fileKey});
    assert.match(JSON.stringify(result), /selected scene.*discovered candidate/);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('timing receipt and human approval fail closed after evidence changes', () => {
  const c = sceneCase();
  try {
    const p = c.manifest.premiere;
    const response = {data: {id: p.sequenceId, videoTracks: [{index: p.trackIndex, clips: [{nodeId: p.timelineClipId, start: p.approvedStartTime, end: p.approvedEndTime}]}]}};
    const read = () => c.run('PostToolUse', 'mcp__premiere_pro__get_full_sequence_info', {sequenceId: p.sequenceId}, response);
    assert.match(read().hookSpecificOutput?.additionalContext || '', /placement readback passed/);
    const original = c.manifest.figma.sourceRevision;
    c.manifest.figma.sourceRevision = 'changed-version';
    assert.match(read().reason, /human approval is stale/);
    c.manifest.figma.sourceRevision = original;
    fs.appendFileSync(c.manifest.timing.transcriptPath, ' ');
    assert.match(read().reason, /timing receipt.*stale/);
    assert.equal(read().decision, 'block');
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('scene planning prints a pending manifest without overwriting active enrollment', () => {
  const c = sceneCase();
  const active = path.join(root, 'config/lineups/active-scene.json');
  const before = fs.existsSync(active) ? fs.readFileSync(active) : null;
  try {
    const sceneId = c.manifest.scene.sceneId;
    const configPath = path.join(c.dir, 'motion-scene-timing.json');
    fs.writeFileSync(configPath, JSON.stringify({episodeId: c.manifest.scene.episodeId,
      transcriptPath: c.manifest.timing.transcriptPath, discoveryPath: c.manifest.discoveryPath,
      duration: 14.2, frameRate: c.manifest.motion.frameRate, fileKey: 'TEST', pageId: 'PAGE',
      scenes: [{sceneId, lane: 'quick stat', approvedOption: 'Single-frame statement', anchor: 312.4,
        cueTime: 1.2, triggerText: 'four', sourceComponentId: 'SOURCE', sectionId: 'SECTION',
        sourceRevision: 'v1', topicSmall: 'Defense', topicLarge: 'Takeaways', statement: 'FOUR TAKEAWAYS', x: 0, y: 0}]}));
    const result = spawnSync('node', ['scripts/prepare-lineups-motion-scene.mjs', sceneId, '--config', configPath], {cwd: root, encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
    const plan = JSON.parse(result.stdout);
    assert.equal(plan.manifest.review.status, 'pending');
    assert.equal(plan.manifest.timing.manimTimingValidated, false);
    assert.doesNotMatch(plan.toolInput.code, /child\.remove\(/);
    assert.deepEqual(fs.existsSync(active) ? fs.readFileSync(active) : null, before);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('Cinematic cannot reuse the same image hash under two source IDs', () => {
  const c = sceneCase();
  try {
    c.manifest.scene.lane = 'comparison'; c.manifest.scene.approvedOption = 'Cinematic 2-up';
    c.manifest.figma.cinematic2Up = {titlePosition: 'top-left', photos: [0, 1].map(i => ({nodeId: `photo-${i}`, sourceId: `source-${i}`, imageHash: 'same-photo', assetTreatment: 'full-photo', originalBackground: true, visibleFrom: 0, openingBounds: {x: i * 960, y: 0, width: 960, height: 1080}}))};
    assert.equal(c.approve().status, 0);
    const result = c.run('PreToolUse', 'mcp__codex_apps__figma_use_figma', {fileKey: c.manifest.figma.fileKey});
    assert.match(JSON.stringify(result), /distinct source photos.*hash/);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('Asset Swap requires verified alpha pixels and preserved originals', () => {
  const c = sceneCase();
  try {
    delete c.manifest.figma.focalAssets.find(a => a.kind === 'photo').alphaProof;
    const result = c.run('PreToolUse', 'mcp__codex_apps__figma_use_figma', {fileKey: c.manifest.figma.fileKey});
    assert.match(JSON.stringify(result), /real alpha.*preserved original/);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('Premiere readback rejects duplicate clip identities and nested sequence mixing', () => {
  const c = sceneCase();
  try {
    const p = c.manifest.premiere;
    const clip = {nodeId: p.timelineClipId, start: p.approvedStartTime, end: p.approvedEndTime};
    const result = c.run('PostToolUse', 'mcp__premiere_pro__get_full_sequence_info', {sequenceId: p.sequenceId}, {data: {id: p.sequenceId, videoTracks: [{index: p.trackIndex, clips: [clip, clip]}]}});
    assert.equal(result.decision, 'block');
    const mixed = c.run('PostToolUse', 'mcp__premiere_pro__get_full_sequence_info', {sequenceId: p.sequenceId}, {sequenceId: p.sequenceId, nested: {sequenceId: 'OTHER', clips: [{clipId: p.timelineClipId, trackIndex: p.trackIndex, startTime: p.approvedStartTime, duration: p.approvedDuration, endTime: p.approvedEndTime}]}});
    assert.equal(mixed.decision, 'block');
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('registered source measurement can run without enrollment; changed code cannot', () => {
  const c = sceneCase();
  try {
    const query = spawnSync(python, ['scripts/lineups-templates.py', 'fetch-sources'], {cwd: root, encoding: 'utf8'});
    assert.equal(query.status, 0, query.stderr);
    const input = JSON.parse(query.stdout);
    c.manifest.figma.fileKey = input.fileKey;
    delete c.manifest.discoveryPath;
    assert.deepEqual(c.run('PreToolUse', 'mcp__codex_apps__figma_use_figma', input), {});
    const mutation = c.run('PreToolUse', 'mcp__codex_apps__figma_use_figma', {...input, code: input.code + '\nfigma.createFrame();'});
    assert.equal(mutation.hookSpecificOutput?.permissionDecision, 'deny');
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('malformed success indicators cannot promote matching Premiere data', () => {
  const c = sceneCase();
  try {
    const p = c.manifest.premiere;
    const data = {id: p.sequenceId, videoTracks: [{index: p.trackIndex, clips: [{nodeId: p.timelineClipId, start: p.approvedStartTime, end: p.approvedEndTime}]}]};
    for (const success of [0, 'false', null]) {
      const result = c.run('PostToolUse', 'mcp__premiere_pro__get_full_sequence_info', {sequenceId: p.sequenceId}, {success, data});
      assert.equal(result.decision, 'block');
    }
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('Manim issuer rejects cue words absent from independently fixed Whisper evidence', () => {
  const c = sceneCase();
  try {
    c.manifest.motion.cues[1].triggerText = 'invented';
    const runtime = process.env.PYTHON || path.join(os.homedir(), '.pyenv/versions/3.12.3/bin/python3');
    const result = spawnSync(runtime, ['-m', 'tools.lineups_motion.timing_evidence', '--issue'], {cwd: root,
      input: JSON.stringify({root, manifest: c.manifest}), encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /trigger phrase and timestamp.*Whisper/);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('export jobs cannot be rebound to another approved evidence revision', () => {
  const c = sceneCase();
  try {
    const input = {fileKey: c.manifest.figma.fileKey, nodeId: c.manifest.figma.rootNodeId};
    const response = {content: [{type: 'text', text: JSON.stringify({jobId: 'render-job-123', status: 'processing'})}]};
    assert.match(c.run('PostToolUse', 'mcp__codex_apps__figma_export_video', input, response).hookSpecificOutput?.additionalContext || '', /export response passed/);
    c.manifest.figma.sourceRevision = 'approved-second-revision';
    assert.equal(c.approve().status, 0);
    assert.match(c.run('PostToolUse', 'mcp__codex_apps__figma_export_video', input, response).reason, /cannot be rebound/);
    assert.match(c.run('PostToolUse', 'mcp__codex_apps__figma_export_video', {fileKey: input.fileKey, jobId: 'another-job'}, response).reason, /different render job/);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('alpha proof rejects stale originals and hashed opaque pixels', () => {
  const c = sceneCase();
  try {
    const proof = c.manifest.figma.focalAssets.find(a => a.kind === 'photo').alphaProof;
    fs.appendFileSync(proof.originalPath, 'changed');
    assert.match(c.run('PreToolUse', 'mcp__codex_apps__figma_use_figma', {fileKey: c.manifest.figma.fileKey}).hookSpecificOutput?.permissionDecisionReason || '', /original.*stale/);
    assert.equal(c.approve().status, 0);
    const current = c.manifest.figma.focalAssets.find(a => a.kind === 'photo').alphaProof;
    fs.copyFileSync(current.originalPath, current.alphaPath);
    current.alphaSha256 = crypto.createHash('sha256').update(fs.readFileSync(current.alphaPath)).digest('hex');
    assert.match(c.run('PreToolUse', 'mcp__codex_apps__figma_use_figma', {fileKey: c.manifest.figma.fileKey}).hookSpecificOutput?.permissionDecisionReason || '', /real alpha pixels/);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});

test('delivery proof requires actual decoded images at every transcript cue', () => {
  const c = sceneCase();
  let mediaDirectory;
  try {
    mediaDirectory = prepareMediaEvidence(c.manifest, 'lineups-cue-test');
    c.manifest.export.motionProof.frames = c.manifest.export.motionProof.frames.filter(frame => frame.time === 0 || frame.time === 14.1);
    const runtime = process.env.PYTHON || path.join(os.homedir(), '.pyenv/versions/3.12.3/bin/python3');
    const result = spawnSync(runtime, ['-m', 'tools.lineups_motion.media_evidence'], {cwd: root,
      input: JSON.stringify({root, manifest: c.manifest}), encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /decoded image.*cue/);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true}); if (mediaDirectory) fs.rmSync(mediaDirectory, {recursive: true, force: true});}
});

test('emitted canonical Quick Stat executes with native float tracks and actual cloned callout IDs', async () => {
  const c = sceneCase();
  try {
    const fileKey = 'o7E24iymIT80MTXGYIogVH';
    const sceneId = 'S03';
    const configPath = path.join(c.dir, 'quick.json');
    fs.writeFileSync(configPath, JSON.stringify({episodeId: c.manifest.scene.episodeId,
      transcriptPath: c.manifest.timing.transcriptPath, discoveryPath: c.manifest.discoveryPath,
      duration: 14.2, frameRate: {numerator: 25, denominator: 1}, fileKey, pageId: 'PAGE',
      scenes: [{sceneId, lane: 'quick stat', approvedOption: 'Single-frame statement', anchor: 312.4,
        cueTime: 1.2, triggerText: 'four', sourceComponentId: '653:184', sectionId: 'SECTION',
        sourceRevision: 'quick-source-v1', topicSmall: 'Defense', topicLarge: 'Takeaways',
        statement: 'FOUR TAKEAWAYS', x: 0, y: 0}]}));
    const result = spawnSync(process.execPath, ['scripts/prepare-lineups-motion-scene.mjs', sceneId, '--config', configPath], {encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
    const plan = JSON.parse(result.stdout);
    const measured = JSON.parse(fs.readFileSync('config/lineups/fixtures/valid/callout-readback.json')).callouts[0];
    const canonical = JSON.parse(fs.readFileSync('config/lineups/canonical-template-verification.json')).callout;
    const all = [];
    function node(id, name, type, properties = {}) {
      const n = {id, name, type, width: 1920, height: 1080, children: [], manualKeyframeTracks: {}, animationStyles: [],
        ...structuredClone(properties),
        appendChild(child) {child.parent = this; this.children.push(child);},
        findAll(predicate) {return this.children.flatMap(child => [child, ...child.findAll(() => true)]).filter(predicate);},
        findOne(predicate) {return this.findAll(predicate)[0];},
        detachInstance() {this.type = 'FRAME'; return this;},
        applyManualKeyframeTrack(property, track) {
          this.manualKeyframeTracks[property.name] = structuredClone(track);
          for (const frame of this.manualKeyframeTracks[property.name].keyframes) {
            if (frame.value.type === 'VECTOR') for (const key of ['x', 'y']) frame.value.value[key] = Math.fround(frame.value.value[key]);
            else frame.value.value = Math.fround(frame.value.value);
          }
          this.timelines = [{id: 'timeline', duration: 14.2}];
        },
        setTimelineDuration(id, duration) {this.timelines[0].duration = duration;},
      };
      all.push(n); return n;
    }
    const section = node('SECTION', 'Episode', 'SECTION');
    const source = node('653:184', 'Quick Stat', 'COMPONENT');
    source.createInstance = () => {
      const frame = node('CLONED:ROOT', 'Quick Stat', 'INSTANCE'); frame.mainComponent = source;
      frame.appendChild(node('CLONED:SMALL', 'TOPIC SMALL', 'TEXT'));
      frame.appendChild(node('CLONED:LARGE', 'TOPIC LARGE', 'TEXT'));
      frame.appendChild(node('CLONED:PHOTO', 'EDIT / PHOTO 1 / FILL 1920x1080', 'RECTANGLE'));
      const wrapper = node('CLONED:WRAPPER', 'STATEMENT / CYAN CALLOUT', 'FRAME', measured.wrapper);
      const panel = node('CLONED:PANEL', 'Panel', 'FRAME', measured.panel);
      const text = node('CLONED:TEXT', 'Statement', 'TEXT', measured.text);
      // The API assigns fresh IDs; sample measurements supply independent style/geometry.
      wrapper.id = 'CLONED:WRAPPER'; panel.id = 'CLONED:PANEL'; text.id = 'CLONED:TEXT';
      frame.appendChild(wrapper); wrapper.appendChild(panel); panel.appendChild(text);
      return frame;
    };
    for (const role of ['wrapper', 'panel', 'text']) {
      const n = node(canonical[role].id, role, role === 'text' ? 'TEXT' : 'FRAME', canonical[role]);
      n.parent = {id: canonical[role].parentId};
    }
    const figma = {fileKey, mixed: Symbol('mixed'), getNodeByIdAsync: async id => all.find(n => n.id === id), loadFontAsync: async () => {}};
    const runCode = new (Object.getPrototypeOf(async function() {}).constructor)('figma', plan.toolInput.code);
    const readback = await runCode(figma);
    Object.assign(c.manifest, plan.manifest);
    c.manifest.timing.manimTimingValidated = true;
    c.manifest.review = {status: "approved", reviewer: "Jerami", reviewedAt: "2026-10-13T14:00:00Z", correctionPayloadId: "fixture-only"};
    assert.equal(c.approve().status, 0);
    const post = () => c.run('PostToolUse', 'mcp__codex_apps__figma_use_figma', plan.toolInput, readback);
    assert.match(post().hookSpecificOutput?.additionalContext || '', /readback passed/, JSON.stringify(post()));
    assert.equal(readback.calloutReadback.panel.id, 'CLONED:PANEL');
    assert.equal(readback.motionTracks[0].keyframes.at(-1).value, 1.024999976158142);
    readback.calloutReadback.panel.height = 90;
    assert.match(JSON.stringify(post()), /panel.height/);
  } finally {fs.rmSync(c.dir, {recursive: true, force: true});}
});
