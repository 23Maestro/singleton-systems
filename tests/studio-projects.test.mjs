import assert from 'node:assert/strict';
import test from 'node:test';
import { studioCommand } from '../lib/studio-projects.ts';

const projectId = 'c5d9b2f5-cc99-4d0b-a3b3-29a8e3e8d8d1';
test('project commands require an exact project and supported client', () => {
  assert.equal(studioCommand.parse({ action: 'create', projectId, client: 'Catena Media', title: 'Week 10', task: { owner: 'asana', id: '123' } }).title, 'Week 10');
  assert.equal(studioCommand.safeParse({ action: 'create', projectId, client: 'Unknown', title: 'Week 10', task: null }).success, false);
  assert.equal(studioCommand.safeParse({ action: 'delete', projectId: '*' }).success, false);
  assert.equal(studioCommand.safeParse({ action: 'delete', projectId, all: true }).success, false);
});
test('task links must name a real supported owner and non-empty task ID', () => {
  assert.equal(studioCommand.safeParse({ action: 'create', projectId, client: 'Singleton Systems', title: 'Edit', task: { owner: 'asana', id: '' } }).success, false);
  assert.equal(studioCommand.safeParse({ action: 'create', projectId, client: 'Intent Solutions', title: 'Edit', task: { owner: 'unknown', id: '123' } }).success, false);
});
