import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
import config from '../../next.config.mjs';

const source = new URL('./', import.meta.url);
const published = new URL('../../public/studio/', import.meta.url);

test('Studio resolves directly with assets under its stable route', async () => {
  const routes = await config.rewrites();
  assert.ok(routes.beforeFiles.some(r => r.source === '/studio' && r.destination === '/studio/index.html'));
  const html = await readFile(new URL('index.html', published), 'utf8');
  assert.match(html, /<base href="\/studio\/">/);
  assert.match(html, /<title>Studio \| Singleton Systems<\/title>/);
  for (const request of ['app.mjs', 'review.css']) {
    for (const entry of ['https://www.singleton-systems.com/studio', 'https://www.singleton-systems.com/studio/']) {
      assert.equal(new URL(request, new URL('/studio/', entry)).pathname, `/studio/${request}`);
    }
    assert.ok((await stat(new URL(request, published))).size > 0);
  }
  for (const file of ['app.mjs', 'model.mjs', 'review.css', 'studio-home.mjs']) {
    assert.deepEqual(await readFile(new URL(file, published)), await readFile(new URL(file, source)));
  }
});

test('Studio starts without the completed pilot packet', async () => {
  const html = await readFile(new URL('index.html', published), 'utf8');
  assert.doesNotMatch(html, /type="password"|<form id="login">/);
  for (const client of ['Catena Media', 'Intent Solutions', 'Singleton Systems']) assert.match(html, new RegExp(client));
  assert.match(await readFile(new URL('studio-home.mjs', published), 'utf8'), /No active edits/);
  await assert.rejects(stat(new URL('packet.json', published)), { code: 'ENOENT' });
  await assert.rejects(stat(new URL('assets', published)), { code: 'ENOENT' });
});
