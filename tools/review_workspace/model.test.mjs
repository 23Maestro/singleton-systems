import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, selectScene, selectVersion, updateStatus, updateDraft, saveNote, feedbackBatch } from './model.mjs';

const packet = { episodeId: 'week8', revision: 'cue-hash', scenes: [
  { id: 'P01', versions: [{ id: 'art', sha256: 'image-hash' }, { id: 'motion', sha256: 'video-hash' }] },
  { id: 'P02', versions: [{ id: 'art', sha256: 'other-hash' }] },
] };

test('scene and version switches retain the exact draft and selected version', () => {
  const state = createState(packet);
  selectVersion(state, packet, 'motion');
  updateDraft(state, packet, { body: 'Move this label', time: 1.25, marks: [{ x: .2, y: .3, width: .1, height: .2 }] });
  selectScene(state, packet, 'P02');
  updateDraft(state, packet, { body: 'Keep this photo' });
  selectScene(state, packet, 'P01');
  assert.equal(state.versions.P01, 'motion');
  assert.equal(state.drafts['P01:motion'].body, 'Move this label');
  assert.equal(state.drafts['P01:motion'].time, 1.25);
  selectVersion(state, packet, 'art');
  assert.equal(state.drafts['P01:motion'].body, 'Move this label');
});

test('status changes are per scene and cannot create delivery or production approval', () => {
  const state = createState(packet);
  updateStatus(state, packet, 'Approved');
  assert.equal(state.statuses.P01, 'Approved');
  assert.equal(state.statuses.P02, undefined);
  assert.equal(feedbackBatch(state, packet).delivery, 'not-sent');
  assert.equal(feedbackBatch(state, packet).productionApproval, false);
  assert.throws(() => updateStatus(state, packet, 'Delivered'));
});

test('saving binds a note to media identity; repeated save cannot duplicate it', () => {
  const state = createState(packet);
  selectVersion(state, packet, 'motion');
  updateDraft(state, packet, { body: 'Crop the left edge', time: 2.4, snapshot: 'data:image/png;base64,test', marks: [] });
  saveNote(state, packet, 'note-1');
  selectScene(state, packet, 'P02');
  assert.deepEqual(state.notes[0], { id: 'note-1', episodeId: 'week8', sceneId: 'P01', versionId: 'motion', mediaSha256: 'video-hash', body: 'Crop the left edge', time: 2.4, snapshot: 'data:image/png;base64,test', marks: [], replies: [], resolved: false });
  assert.throws(() => saveNote(state, packet, 'note-1'));
  assert.equal(state.notes.length, 1);
  const restored = createState(packet, JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored.notes, state.notes);
});

test('changed packet revision isolates prior notes and invalid selections', () => {
  const state = createState(packet);
  updateDraft(state, packet, { body: 'Original source' });
  const changed = createState({ ...packet, revision: 'new-cue-hash' }, state);
  assert.deepEqual(changed.drafts, {});
  assert.throws(() => selectScene(state, packet, 'invented-scene'));
  assert.throws(() => selectVersion(state, packet, 'invented-revision'));
});

test('a built scene opens on its newest motion; a planned scene opens on its plan; P flips every scene', async () => {
  const { defaultVersion, togglePlanView, context } = await import('./model.mjs');
  const staged = { episodeId: 'w10', revision: 'r', scenes: [
    { id: 'C08', versions: [{ id: 'm2', stage: 'Motion' }, { id: 'a1', stage: 'Artwork' }, { id: 'm1', stage: 'Motion' }, { id: 'plan', stage: 'Plan' }] },
    { id: 'C09', versions: [{ id: 'plan9', stage: 'Plan' }] },
  ] };
  assert.equal(defaultVersion(staged.scenes[0]).id, 'm2');
  assert.equal(defaultVersion(staged.scenes[1]).id, 'plan9');
  const state = createState(staged);
  assert.equal(context(state, staged).version.id, 'm2');
  selectVersion(state, staged, 'a1');
  togglePlanView(state);
  assert.equal(context(state, staged).version.id, 'plan');
  selectScene(state, staged, 'C09');
  assert.equal(context(state, staged).version.id, 'plan9');
  togglePlanView(state);
  selectScene(state, staged, 'C08');
  assert.equal(context(state, staged).version.id, 'm2');
});

test('a built scene shows no version dropdown; the plan offers only the storyboard and source photos', async () => {
  const { versionChoices } = await import('./model.mjs');
  const scene = { id: 'C08', versions: [
    { id: 'audio', stage: 'Motion', label: 'Motion + Mark audio' }, { id: 'bm', stage: 'Motion', label: 'Blender motion' },
    { id: 'ba', stage: 'Artwork', label: 'Blender 4B team cards' }, { id: 'photo', stage: 'Artwork', label: 'Source photo' },
    { id: 'plan', stage: 'Plan', label: 'Build Storyboard' }] };
  assert.deepEqual(versionChoices(scene, scene.versions[0]), []);
  assert.deepEqual(versionChoices(scene, scene.versions[4]).map(v => v.id), ['plan', 'photo']);
  const rank = { id: 'R10', versions: [{ id: 'plan', stage: 'Plan', label: 'Build Storyboard' }] };
  assert.deepEqual(versionChoices(rank, rank.versions[0]).length, 1);
});
