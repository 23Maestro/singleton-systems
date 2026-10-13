import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {parseArgs} from 'node:util';

const {values} = parseArgs({options: {
  root: {type: 'string', default: process.cwd()}, now: {type: 'string'}, apply: {type: 'boolean', default: false},
  observations: {type: 'string'},
}});
const directory = path.resolve(values.root, 'config/lineups');
const registryPath = path.join(directory, 'review-gates.json');
const activePath = path.join(directory, 'active-scene.json');
const now = new Date(values.now ?? Date.now());
assert(Number.isFinite(now.getTime()), 'Invalid check time');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const observations = values.observations ? read(path.resolve(values.observations)) : {episodes: {}};
if (values.observations) {
  const age = now.getTime() - Date.parse(observations.checkedAt);
  assert(Number.isFinite(age) && age >= -60000 && age <= 3600000, 'Asana/Drive observations must be fresh');
}
const write = (file, data) => {
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(data, null, 2)}\n`, {flag: 'wx'});
  fs.renameSync(temporary, file);
};

function deadline(date) {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(date), 'Episode requires a due date');
  const guess = new Date(`${date}T10:00:00Z`);
  assert(guess.toISOString().slice(0, 10) === date, 'Invalid episode date');
  const hour = Number(new Intl.DateTimeFormat('en-US', {timeZone: 'America/New_York', hour: 'numeric', hourCycle: 'h23'}).format(guess));
  return new Date(guess.getTime() + (10 - hour) * 3600000);
}

fs.mkdirSync(directory, {recursive: true});
const lockPath = path.join(directory, '.episode-check.lock');
const lock = fs.openSync(lockPath, 'wx');
try {
  const registry = read(registryPath);
  assert(Array.isArray(registry), 'Review registry must be an array');
  const active = fs.existsSync(activePath) ? read(activePath) : null;
  const results = registry.map(enrollment => {
    assert(/^[a-z0-9][a-z0-9-]+$/.test(enrollment.episodeSlug), 'Invalid episode slug');
    const observed = observations.episodes?.[enrollment.episodeSlug] ?? {};
    const task = observed.asana;
    if (task) assert(task.gid === enrollment.asanaTask && typeof task.completed === 'boolean', 'Asana task readback is mismatched or malformed');
    const due = task?.due_at ? new Date(task.due_at) : deadline(task?.due_on ?? enrollment.dueDate);
    assert(Number.isFinite(due.getTime()), 'Invalid Asana deadline');
    const overdue = now.getTime() > due.getTime() + 4 * 3600000;
    const binding = enrollment.finalExport;
    const files = observed.driveFiles ?? [];
    assert(Array.isArray(files), 'Malformed Drive file readback');
    const notBefore = Date.parse(binding?.notBefore);
    const finalVideo = Number.isFinite(notBefore) && notBefore <= now.getTime() && files.find(file => file.id && file.name === binding.name &&
      file.parents?.includes(binding.folderId) && file.mimeType?.startsWith('video/') && file.trashed === false &&
      Date.parse(file.modifiedTime) >= notBefore && Date.parse(file.modifiedTime) <= now.getTime() + 60000);
    const status = finalVideo ? 'confirmed-submitted' : task?.completed ? 'completed-in-asana' : overdue ? 'assumed-submitted' : 'active';
    return {episodeSlug: enrollment.episodeSlug, dueAt: due.toISOString(), status, observations: observed,
      prompt: status === 'assumed-submitted' ? `${enrollment.episodeSlug}: assumed submitted after the deadline plus four hours. Are you still editing? If so, provide the revised deadline to reactivate it.` : null};
  });
  assert(new Set(results.map(item => item.episodeSlug)).size === results.length, 'Duplicate episode enrollment');
  if (values.apply) {
    for (const result of results.filter(item => item.status !== 'active')) {
      const enrollment = registry.find(item => item.episodeSlug === result.episodeSlug);
      const activeScene = active?.scene?.episodeId === result.episodeSlug ? active : null;
      const snapshot = {enrollment, activeScene};
      const hash = crypto.createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
      const archiveDirectory = path.join(directory, 'closeouts', result.episodeSlug);
      fs.mkdirSync(archiveDirectory, {recursive: true});
      result.closeoutPath = path.join(archiveDirectory, `${hash}.json`);
      if (!fs.existsSync(result.closeoutPath)) write(result.closeoutPath, {schemaVersion: 1, closedAt: now.toISOString(),
        status: result.status, deliveryVerified: result.status === 'confirmed-submitted', observations: result.observations, ...snapshot});
      if (activeScene) fs.unlinkSync(activePath);
    }
    const remaining = registry.filter(item => results.find(result => result.episodeSlug === item.episodeSlug).status === 'active');
    if (remaining.length !== registry.length) write(registryPath, remaining);
  }
  process.stdout.write(`${JSON.stringify({applied: values.apply, episodes: results}, null, 2)}\n`);
} finally {
  fs.closeSync(lock);
  fs.unlinkSync(lockPath);
}
