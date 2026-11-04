import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import test from 'node:test';

const cli = new URL('./workflow-ledger.mjs', import.meta.url).pathname;

test('one workflow record produces matching, linked repository and web tables', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'workflow-ledger-'));
  try {
    mkdirSync(path.join(root, 'tools'));
    writeFileSync(path.join(root, 'tools/timing.py'), '# timing source\n');
    const records = {
      schemaVersion: 1,
      scope: 'First workflow only.',
      repositories: [{id: 'systems', name: 'Singleton Systems', root: '.', browserBase: 'https://github.com/example/systems/blob/main'}],
      workflows: [{id: 'lineups', name: 'Lineups', client: 'Catena Media', summary: 'Transcript-led football edits.',
        components: [{id: 'timing', name: 'CueContract + Manim', purpose: 'Make the graphic follow the spoken cue.',
          sources: [{label: 'Timing code', repository: 'systems', path: 'tools/timing.py'}],
          checks: [{label: 'Timing check', url: 'https://example.com/timing-check'}],
          examples: [{label: 'Week 7 proof', url: 'https://example.com/week7'}],
          evidence: {state: 'documented', note: 'Source exists. This build has no fresh timing test.'}}]}],
    };
    const source = path.join(root, 'ledger.json');
    const markdown = path.join(root, 'docs/workflow-ledger.md');
    const site = path.join(root, 'web');
    const generate = () => spawnSync(process.execPath, [cli, 'generate', '--records', source, '--markdown', markdown, '--site', site], {encoding: 'utf8'});
    writeFileSync(source, JSON.stringify(records));
    let result = generate();
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const md = readFileSync(markdown, 'utf8');
    const html = readFileSync(path.join(site, 'index.html'), 'utf8');
    for (const output of [md, html]) {
      assert.ok(output.includes('Make the graphic follow the spoken cue.'));
      assert.ok(output.includes('Week 7 proof'));
      assert.ok(output.includes('documented'));
      assert.ok(output.includes('This build has no fresh timing test.'));
    }
    assert.ok(md.includes('../tools/timing.py'));
    assert.ok(html.includes('https://github.com/example/systems/blob/main/tools/timing.py'));
    assert.ok(!html.includes(root), 'hosted page must not leak machine paths');
    records.workflows[0].components[0].purpose = 'Keep each graphic on its spoken word.';
    writeFileSync(source, JSON.stringify(records));
    result = generate();
    assert.equal(result.status, 0, result.stdout + result.stderr);
    for (const file of [markdown, path.join(site, 'index.html')]) {
      const text = readFileSync(file, 'utf8');
      assert.ok(text.includes('Keep each graphic on its spoken word.'));
      assert.ok(!text.includes('Make the graphic follow the spoken cue.'));
    }
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

test('a client workflow is findable by name and links to a separate source repository', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'workflow-ledger-client-'));
  try {
    mkdirSync(path.join(root, 'video-workflows'));
    writeFileSync(path.join(root, 'video-workflows/lesson.md'), '# Screen-led lesson flow\n');
    const records = {schemaVersion: 1, scope: 'Selected clients only.',
      repositories: [{id: 'video-workflows', name: 'Video workflows', root: 'video-workflows', browserBase: 'https://github.com/example/video-workflows/blob/master'}],
      workflows: [{id: 'intent-keys', name: 'Intent Keys', client: 'Intent Solutions', summary: 'Max sends files. We build screen-led lessons.',
        components: [{id: 'receive-packet', name: 'Receive the episode packet', purpose: 'Read the new brief before choosing takes.',
          sources: [{label: 'Lesson guide', repository: 'video-workflows', path: 'lesson.md'}], checks: [], examples: [],
          evidence: {state: 'documented', note: 'Current episode brief owns the lesson.'}}]}]};
    const source = path.join(root, 'ledger.json');
    writeFileSync(source, JSON.stringify(records));
    const markdown = path.join(root, 'docs/ledger.md');
    const site = path.join(root, 'site');
    const result = spawnSync(process.execPath, [cli, 'generate', '--records', source, '--markdown', markdown, '--site', site], {encoding: 'utf8'});
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const md = readFileSync(markdown, 'utf8');
    const html = readFileSync(path.join(site, 'index.html'), 'utf8');
    assert.ok(md.includes('[Intent Keys](#intent-keys)'), 'repo readers need a workflow index');
    assert.ok(html.includes('href="#intent-keys"'), 'web readers need a direct workflow link');
    assert.ok(md.includes('../video-workflows/lesson.md'));
    assert.ok(html.includes('https://github.com/example/video-workflows/blob/master/lesson.md'));
    assert.ok(html.includes('Max sends files. We build screen-led lessons.'));
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});
