import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import test from 'node:test';

const script = path.resolve('scripts/check-lineups-episodes.mjs');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lineups-closeout-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const directory = path.join(root, 'config/lineups');
  fs.mkdirSync(directory, {recursive: true});
  const registry = [{episodeSlug: '2026-10-09-jaguars', asanaTask: 'task-jags', dueDate: '2026-10-09'},
    {episodeSlug: '2026-10-15-next', asanaTask: 'task-next', dueDate: '2026-10-15'}];
  const scene = {scene: {episodeId: '2026-10-09-jaguars', sceneId: 'S12'}, enforcement: {active: true}};
  fs.writeFileSync(path.join(directory, 'review-gates.json'), JSON.stringify(registry));
  fs.writeFileSync(path.join(directory, 'active-scene.json'), JSON.stringify(scene));
  fs.writeFileSync(path.join(directory, 'durable-proof.json'), 'preserve this evidence');
  return {root, directory, registry, scene};
}
function run(f, now, extra = []) {
  const result = spawnSync(process.execPath, [script, '--root', f.root, '--now', now, ...extra], {encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test('overdue closeout retires only its review enrollment and active scene, with recoverable history and a user prompt', t => {
  const f = fixture(t);
  const result = run(f, '2026-10-09T18:01:00Z', ['--apply']);
  assert.equal(result.episodes[0].status, 'assumed-submitted');
  assert.match(result.episodes[0].prompt, /still editing/);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.directory, 'review-gates.json'))), [f.registry[1]]);
  assert.equal(fs.existsSync(path.join(f.directory, 'active-scene.json')), false);
  const history = JSON.parse(fs.readFileSync(result.episodes[0].closeoutPath));
  assert.deepEqual(history.enrollment, f.registry[0]);
  assert.deepEqual(history.activeScene, f.scene);
  assert.equal(history.deliveryVerified, false);
  assert.equal(fs.readFileSync(path.join(f.directory, 'durable-proof.json'), 'utf8'), 'preserve this evidence');
  assert.equal(run(f, '2026-10-09T18:02:00Z', ['--apply']).episodes.length, 1);
});

test('fresh Asana readback respects a postponed deadline and retires a completed task', t => {
  const f = fixture(t);
  const file = path.join(f.root, 'observations.json');
  const observations = {checkedAt: '2026-10-09T18:01:00Z', episodes: {'2026-10-09-jaguars': {
    asana: {gid: 'task-jags', completed: false, due_at: '2026-10-10T14:00:00Z'},
  }}};
  fs.writeFileSync(file, JSON.stringify(observations));
  assert.equal(run(f, '2026-10-09T18:01:00Z', ['--observations', file, '--apply']).episodes[0].status, 'active');
  observations.episodes['2026-10-09-jaguars'].asana.completed = true;
  fs.writeFileSync(file, JSON.stringify(observations));
  assert.equal(run(f, '2026-10-09T18:01:00Z', ['--observations', file, '--apply']).episodes[0].status, 'completed-in-asana');
});

test('only the exact episode video in the bound final-export folder confirms submission', t => {
  const f = fixture(t);
  f.registry[0].finalExport = {folderId: 'final-exports', name: 'Jaguars-final.mp4', notBefore: '2026-10-07T12:00:00Z'};
  fs.writeFileSync(path.join(f.directory, 'review-gates.json'), JSON.stringify(f.registry));
  const file = path.join(f.root, 'observations.json');
  const video = {id: 'final-video', name: 'Jaguars-final.mp4', mimeType: 'video/mp4', parents: ['another-folder'], trashed: false, modifiedTime: '2026-10-09T12:00:00Z'};
  const observations = {checkedAt: '2026-10-09T13:00:00Z', episodes: {'2026-10-09-jaguars': {driveFiles: [video]}}};
  fs.writeFileSync(file, JSON.stringify(observations));
  assert.equal(run(f, '2026-10-09T13:00:00Z', ['--observations', file]).episodes[0].status, 'active');
  video.parents = ['final-exports'];
  fs.writeFileSync(file, JSON.stringify(observations));
  const result = run(f, '2026-10-09T13:00:00Z', ['--observations', file, '--apply']);
  assert.equal(result.episodes[0].status, 'confirmed-submitted');
  assert.equal(JSON.parse(fs.readFileSync(result.episodes[0].closeoutPath)).deliveryVerified, true);
});

test('10 AM New York deadlines survive DST and exactly four hours does not close an episode', t => {
  const f = fixture(t);
  const summer = run(f, '2026-10-09T18:00:00Z');
  assert.equal(summer.episodes[0].dueAt, '2026-10-09T14:00:00.000Z');
  assert.equal(summer.episodes[0].status, 'active');
  f.registry[0].dueDate = '2026-11-05';
  fs.writeFileSync(path.join(f.directory, 'review-gates.json'), JSON.stringify(f.registry));
  const winter = run(f, '2026-11-05T19:00:00Z');
  assert.equal(winter.episodes[0].dueAt, '2026-11-05T15:00:00.000Z');
  assert.equal(winter.episodes[0].status, 'active');
  assert.equal(run(f, '2026-11-05T19:00:01Z').episodes[0].status, 'assumed-submitted');
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.directory, 'review-gates.json'))), f.registry);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.directory, 'active-scene.json'))), f.scene);
});

test('completed Asana tasks do not receive an assumed-submitted prompt; malformed or stale observations change nothing', t => {
  const f = fixture(t);
  const file = path.join(f.root, 'observations.json');
  const save = value => fs.writeFileSync(file, JSON.stringify(value));
  const good = {checkedAt: '2026-10-09T18:01:00Z', episodes: {'2026-10-09-jaguars': {asana: {gid: 'task-jags', completed: true}}}};
  save(good);
  assert.equal(run(f, '2026-10-09T18:01:00Z', ['--observations', file]).episodes[0].prompt, null);
  for (const bad of [{...good, checkedAt: '2026-10-08T18:01:00Z'},
    {...good, episodes: {'2026-10-09-jaguars': {asana: {gid: 'wrong-task', completed: true}}}}]) {
    save(bad);
    const result = spawnSync(process.execPath, [script, '--root', f.root, '--now', '2026-10-09T18:01:00Z', '--observations', file, '--apply'], {encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.directory, 'review-gates.json'))), f.registry);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.directory, 'active-scene.json'))), f.scene);
  }
});

test('closeout preserves another active episode and retries from an existing archive safely', t => {
  const f = fixture(t);
  const next = {...f.scene, scene: {episodeId: f.registry[1].episodeSlug, sceneId: 'S01'}};
  fs.writeFileSync(path.join(f.directory, 'active-scene.json'), JSON.stringify(next));
  const result = run(f, '2026-10-09T18:01:00Z', ['--apply']);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.directory, 'active-scene.json'))), next);
  const history = fs.readFileSync(result.episodes[0].closeoutPath);
  // Simulate interruption after archive creation but before registry replacement.
  fs.writeFileSync(path.join(f.directory, 'review-gates.json'), JSON.stringify(f.registry));
  const retry = run(f, '2026-10-09T18:02:00Z', ['--apply']);
  assert.equal(retry.episodes[0].closeoutPath, result.episodes[0].closeoutPath);
  assert.deepEqual(fs.readFileSync(result.episodes[0].closeoutPath), history);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.directory, 'active-scene.json'))), next);
});

test('a previous export with the same filename cannot confirm this episode', t => {
  const f = fixture(t);
  f.registry[0].finalExport = {folderId: 'final-exports', name: 'Jaguars-final.mp4', notBefore: '2026-10-07T12:00:00Z'};
  fs.writeFileSync(path.join(f.directory, 'review-gates.json'), JSON.stringify(f.registry));
  const file = path.join(f.root, 'observations.json');
  const video = {id: 'old-video', name: 'Jaguars-final.mp4', mimeType: 'video/mp4', parents: ['final-exports'], trashed: false, modifiedTime: '2026-10-01T12:00:00Z'};
  fs.writeFileSync(file, JSON.stringify({checkedAt: '2026-10-09T13:00:00Z', episodes: {'2026-10-09-jaguars': {driveFiles: [video]}}}));
  assert.equal(run(f, '2026-10-09T13:00:00Z', ['--observations', file]).episodes[0].status, 'active');
});
