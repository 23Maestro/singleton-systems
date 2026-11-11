import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const read = path => JSON.parse(fs.readFileSync(path));
const ajv = new Ajv({allErrors: true, strict: false});
addFormats(ajv);
const validate = ajv.compile(read('config/lineups/scene-manifest.schema.json'));

test('a Blender scene binds native data without inventing a Figma scene', () => {
  const scene = read('config/lineups/fixtures/valid/scene-manifest.json');
  delete scene.figma;
  Object.assign(scene.scene, {lane: 'stat breakdown', approvedOption: 'stat breakdown', blenderVariant: '3B'});
  Object.assign(scene.motion, {engine: 'blender', engineVersion: 'blender-cli'});
  scene.blender = {source: read('config/lineups/template-registry.json').templates.find(t => t.key === 'stat-breakdown.blender.card').source,
    data: {path: 'fixture-data.json', sha256: 'a'.repeat(64)}};
  scene.export.motionProof.engine = 'blender';
  scene.discoveryPath = 'fixture-discovery.json';
  scene.timing.proofPath = 'fixture-timing.json';
  scene.review.approvedEvidenceSha256 = 'b'.repeat(64);
  assert.equal(validate(scene), true, JSON.stringify(validate.errors));
  const badVersion = structuredClone(scene);
  badVersion.motion.engineVersion = 'figma-motion';
  assert.equal(validate(badVersion), false);
  delete scene.blender.data;
  assert.equal(validate(scene), false);
});
