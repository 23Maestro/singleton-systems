import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {prepareStadium, stadiumReadbackCode} from './stadiums.mjs';

test('Figma plans upload the selected Eagle photo and flag a missing team', () => {
  const ready = prepareStadium({lane: 'comparison', title: 'The Steelers beat the Ravens 39-8', sceneId: 'C01'});
  assert.equal(ready.asset.focusTeam, 'Pittsburgh Steelers');
  assert.equal(ready.upload.tool, 'upload_assets');
  assert.match(ready.upload.filePath, /MWCF3QSEECA1M/);
  const missing = prepareStadium({lane: 'asset swap', focusTeam: 'Ravens', sceneId: 'C02'});
  assert.equal(missing.asset.status, 'missing');
  assert.equal(missing.background, undefined);
});

test('Figma image swap preserves crop, effects, geometry and source pixels', () => {
  const background = prepareStadium({lane: 'comparison', focusTeam: 'Steelers', sceneId: 'C01', stadiumImageHash: 'a'.repeat(40)}).background;
  const node = {id: 'episode-background', locked: true, x: -821, width: 3424,
    effects: [{type: 'LAYER_BLUR', radius: 26.4}],
    fills: [{type: 'IMAGE', imageHash: '508bd3cdcf3b17bf83fe30c50b1b2b11c66e3043', scaleMode: 'FILL', imageTransform: [[1,0,0],[0,1,0]]}]};
  const source = structuredClone(node);
  const context = {working: {id: 'episode', findAll: predicate => [node].filter(predicate)}, mutatedNodeIds: []};
  vm.runInNewContext(stadiumReadbackCode(background, true) + '; globalThis.result = measuredBackground;', context);
  assert.equal(node.fills[0].imageHash, 'a'.repeat(40));
  assert.deepEqual(node.fills[0].imageTransform, source.fills[0].imageTransform);
  assert.deepEqual(node.effects, source.effects);
  assert.equal(node.x, source.x); assert.equal(node.width, source.width); assert.equal(node.locked, true);
  assert.equal(source.fills[0].imageHash, '508bd3cdcf3b17bf83fe30c50b1b2b11c66e3043');
  assert.equal(context.result.eagleItemId, 'MWCF3QSEECA1M');
});
