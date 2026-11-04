import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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
  for (const request of ['app.mjs', 'review.css', 'packet.json']) {
    for (const entry of ['https://www.singleton-systems.com/studio', 'https://www.singleton-systems.com/studio/']) {
      assert.equal(new URL(request, new URL('/studio/', entry)).pathname, `/studio/${request}`);
    }
    assert.ok((await stat(new URL(request, published))).size > 0);
  }
  for (const file of ['app.mjs', 'model.mjs', 'review.css']) {
    assert.deepEqual(await readFile(new URL(file, published)), await readFile(new URL(file, source)));
  }
});

test('Every shipped scene version keeps its verified media bytes', async () => {
  const packet = JSON.parse(await readFile(new URL('packet.json', published), 'utf8'));
  assert.ok(packet.scenes.length > 0);
  for (const scene of packet.scenes) {
    for (const version of scene.versions) {
      if (!version.url) continue;
      assert.match(version.url, /^assets\/[a-f0-9]{16}\.[a-z0-9]+$/);
      const bytes = await readFile(new URL(version.url, published));
      assert.ok(bytes.length <= 25 * 1024 * 1024);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), version.sha256);
    }
    for (const url of [scene.thumbnail, ...scene.versions.map(v => v.poster)].filter(Boolean)) {
      assert.match(url, /^assets\/[a-f0-9]{16}\.[a-z0-9]+$/);
      assert.ok((await stat(new URL(url, published))).size > 0);
    }
  }
});
