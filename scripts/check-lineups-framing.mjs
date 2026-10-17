import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {requireDiscovery, checkTiming} from '../lib/lineups/discovery.mjs';

const root = process.cwd();
const readJson = relative => JSON.parse(fs.readFileSync(path.resolve(root, relative), 'utf8'));
const hash = relative => crypto.createHash('sha256').update(fs.readFileSync(path.resolve(root, relative))).digest('hex');
const publicRoute = file => `/${file.replace(/^public\//, '').replace(/\/index\.html$/, '')}`;
const registryPath = process.env.LINEUPS_REVIEW_GATES_PATH ?? 'config/lineups/review-gates.json';

for (const entry of readJson(registryPath)) {
  assert.match(entry.episodeSlug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Active Lineups episode needs a stable slug');
  assert.match(entry.asanaTask, /^\d+$/, `${entry.episodeSlug}: missing Asana task`);
  assert.match(entry.dueDate, /^\d{4}-\d{2}-\d{2}$/, `${entry.episodeSlug}: missing confirmed due date`);
  assert.ok(entry.preFigma?.path && entry.preFigma?.title && Number.isInteger(entry.preFigma?.candidateCount), `${entry.episodeSlug}: incomplete Pre-Figma stage record`);
  requireDiscovery(entry, root);
  if (entry.preFigma.candidateCount > 0) {
    assert.ok(entry.timingProofPath && entry.cueMapPath, 'Pre-Figma timing proof and cue map are required');
    const timingProof = readJson(entry.timingProofPath);
    const cueMap = readJson(entry.cueMapPath);
    assert.equal(timingProof.result, 'passed', 'Pre-Figma timing proof must pass');
    const pageHtml = fs.readFileSync(path.resolve(root, entry.preFigma.path), 'utf8');
    const pageData = pageHtml.match(/const beats=(\[.*?\]);\s*const key=/s);
    const sharedData = pageHtml.match(/<script>const reviewData=(.*?);const reviewerPhotoChoices=/s);
    assert.ok(pageData || sharedData, 'Pre-Figma candidate data is missing');
    const pageCandidates = sharedData ? JSON.parse(sharedData[1]).candidates : JSON.parse(pageData[1]);
    assert.deepEqual(pageCandidates.map(scene => scene.id), cueMap.candidates.map(scene => scene.id), 'Pre-Figma page candidate roster is stale');
    for (const [index, candidate] of cueMap.candidates.entries()) {
      for (const field of ['lane', 'option', 'anchor', 'duration', 'copy', 'excerpt', 'assetIds']) {
        assert.deepEqual(pageCandidates[index][field], candidate[field], `Pre-Figma ${candidate.id} ${field} drifted from the proved cue map`);
      }
    }
    assert.ok(pageHtml.includes(timingProof.cueMapSha256), 'Pre-Figma decision export must bind the proved cue map');
    assert.equal(timingProof.episodeId, entry.episodeSlug, 'Timing proof episode mismatch');
    assert.equal(timingProof.transcriptSha256, hash(entry.transcriptPath), 'Timing proof transcript is stale');
    assert.equal(timingProof.discoverySha256, hash(entry.discoveryPath), 'Timing proof discovery is stale');
    assert.equal(timingProof.cueMapSha256, hash(entry.cueMapPath), 'Timing proof cue map is stale');
    assert.equal(timingProof.sceneCount, entry.preFigma.candidateCount, 'Timing proof candidate count changed');
    assert.deepEqual(timingProof.scenes.map(scene => scene.sceneId), cueMap.candidates.map(scene => scene.id), 'Timing proof scenes changed');
    for (const scene of timingProof.scenes) {
      assert.equal(scene.result, 'passed', 'Scene timing proof must pass');
      assert.equal(scene.manifestSha256, hash(scene.manifestPath), 'Scene timing manifest is stale');
      const manifest = readJson(scene.manifestPath);
      requireDiscovery(manifest, root);
      const timing = checkTiming(manifest, root, false);
      assert.equal(timing.status, 0, timing.stderr || timing.error?.message || 'Current Manim timing receipt is required before Pre-Figma review');
    }
  }
  if (!entry.postFigma) {
    assert.ok(fs.readFileSync(path.resolve(root, entry.preFigma.path), 'utf8').includes(entry.preFigma.title), 'Pre-Figma title is missing');
    console.log(`${entry.episodeSlug}: discovery passed for Pre-Figma review`);
    continue;
  }
  assert.ok(entry.postFigma?.readyLabel && entry.postFigma?.dateLabel && Number.isInteger(entry.postFigma?.built) && Number.isInteger(entry.postFigma?.needsReview), `${entry.episodeSlug}: incomplete Post-Figma stage record`);

  const proof = readJson(entry.proof);
  const map = readJson(entry.map);
  const scenes = readJson(proof.readback.path);
  const rules = proof.rules;
  const expectedIds = entry.candidates;
  const expectedSourceIds = entry.sourceCandidates;

  assert.equal(new Set(expectedIds).size, expectedIds.length, `${entry.episodeSlug}: duplicate public candidate ID`);
  assert.equal(new Set(expectedSourceIds).size, expectedSourceIds.length, `${entry.episodeSlug}: duplicate source candidate ID`);
  assert.equal(expectedIds.length, expectedSourceIds.length, `${entry.episodeSlug}: public and source candidate counts differ`);
  assert.equal(hash(proof.readback.path), proof.readback.sha256, 'Figma readback changed; capture and inspect it again');
  assert.equal(hash(entry.map), proof.mapSha256, 'Review map changed; capture fresh preview proof');
  assert.deepEqual(scenes.filter(scene => expectedSourceIds.includes(scene.id)).map(scene => scene.id), expectedSourceIds, `${entry.episodeSlug}: Figma source candidates changed or reordered`);
  assert.deepEqual(map.candidates.map(scene => scene.id), expectedIds, 'Decision Map is missing or reorders a candidate');
  assert.deepEqual(map.candidates.map(scene => scene.sourceSceneId), expectedSourceIds, 'Decision Map lost production scene provenance');
  assert.equal(map.built, entry.postFigma.built, `${entry.episodeSlug}: built count changed`);
  assert.equal(map.needsReview, entry.postFigma.needsReview, `${entry.episodeSlug}: review count changed`);

  for (const candidate of map.candidates) {
    const scene = scenes.find(item => item.id === candidate.sourceSceneId);
    assert.ok(scene, `${candidate.id}: missing Figma source ${candidate.sourceSceneId}`);
    assert.equal(scene.width, rules.posterWidth, `${scene.id}: Figma width must be 1920`);
    assert.equal(scene.height, rules.posterHeight, `${scene.id}: Figma height must be 1080`);
    assert.equal(scene.visible, true, `${scene.id}: candidate root is hidden`);
    assert.equal(scene.staticPreviewComplete, true, `${scene.id}: static canvas preview is incomplete`);
    assert.equal(scene.lane, candidate.lane, `${scene.id}: lane drifted between Figma proof and Decision Map`);
    assert.equal(scene.engine, candidate.sourceEngine, `${scene.id}: source engine drifted`);
    assert.ok(proof.visualReview[candidate.id], `${candidate.id}: missing preview generation receipt`);

    if (['quick action photo', 'quick stat'].includes(scene.lane)) {
      assert.equal(scene.fullFrameCoverage, true, `${scene.id}: full-frame photo leaves an uncovered edge or uses FIT`);
    }
    assert.ok(scene.overlayOpacityMax <= rules.overlayOpacityMax + 0.0001, `${scene.id}: readability wash exceeds 20%`);

    if (candidate.engine === 'Manim') {
      assert.equal(scene.motionEngine, 'Figma Motion', `${scene.id}: Manim timing must drive Figma Motion`);
      assert.equal(scene.transcriptMotion, true, `${scene.id}: transcript-driven motion is missing`);
    }
    assert.ok(candidate.motionPreview, `${candidate.id}: rendered motion review is missing`);
    assert.equal(candidate.motion.width, rules.motionWidth, `${candidate.id}: motion width`);
    assert.equal(candidate.motion.height, rules.motionHeight, `${candidate.id}: motion height`);
    assert.equal(candidate.motion.fps, rules.motionFps, `${candidate.id}: motion frame rate`);
    assert.equal(hash(`${path.dirname(entry.map)}/${candidate.motionPreview}`), candidate.sourceMedia.sha256, `${candidate.id}: public video differs from its Eagle source`);

    const sceneHtml = fs.readFileSync(path.join(root, path.dirname(entry.map), `${candidate.id}.html`), 'utf8');
    assert.ok(sceneHtml.includes(`${publicRoute(entry.map)}/index.html#${candidate.id}`), `${candidate.id}: scene backlink is wrong`);
    assert.ok(sceneHtml.includes(candidate.figmaUrl), `${candidate.id}: Figma source link is wrong`);
  }

  for (const file of proof.files) {
    assert.equal(hash(file.path), file.sha256, `Stale preview: ${file.path}`);
    if (file.kind === 'poster') {
      assert.equal(file.width, rules.posterWidth, `${file.path}: poster width`);
      assert.equal(file.height, rules.posterHeight, `${file.path}: poster height`);
    } else {
      assert.equal(file.width, rules.motionWidth, `${file.path}: motion width`);
      assert.equal(file.height, rules.motionHeight, `${file.path}: motion height`);
      assert.equal(file.fps, rules.motionFps, `${file.path}: motion preview must be 25 fps`);
    }
  }

  const indexHtml = fs.readFileSync(path.join(root, path.dirname(entry.map), 'index.html'), 'utf8');
  assert.ok(indexHtml.includes('href="/decision-maps"'), 'Review index must link back to the Decision Maps interface');
  assert.ok(indexHtml.includes(entry.postFigma.readyLabel), `${entry.episodeSlug}: Post-Figma review banner changed`);
  assert.ok(indexHtml.includes(entry.postFigma.dateLabel), `${entry.episodeSlug}: Post-Figma review date changed`);
  assert.ok(indexHtml.includes(`href="${publicRoute(entry.preFigma.path)}"`), `${entry.episodeSlug}: Post-Figma review must link to its Pre-Figma state`);

  const preFigmaHtml = fs.readFileSync(path.join(root, entry.preFigma.path), 'utf8');
  assert.ok(preFigmaHtml.includes(entry.preFigma.title), `${entry.episodeSlug}: Pre-Figma title is missing`);
  assert.ok(preFigmaHtml.includes(`${entry.preFigma.candidateCount} planned scenes`), `${entry.episodeSlug}: Pre-Figma count changed`);
  assert.equal((preFigmaHtml.match(/\["S\d{2}",/g) || []).length, entry.preFigma.candidateCount, `${entry.episodeSlug}: Pre-Figma candidate count changed`);
  assert.ok(preFigmaHtml.includes('href="/decision-maps"'), 'Pre-Figma review must link to the Decision Maps interface');
  assert.ok(preFigmaHtml.includes(`href="${publicRoute(entry.map)}"`), `${entry.episodeSlug}: Pre-Figma review must link to its Post-Figma state`);

  console.log(`Lineups review gate ${entry.asanaTask}: ${map.candidates.length} public scenes, ${scenes.length} source scenes, and ${proof.files.length} current files passed`);
}
