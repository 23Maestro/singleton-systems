import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';
import { build } from 'esbuild';
import { processStudioChatSend } from '../lib/studio-chat-send.mjs';
import { closeStudioProject } from '../lib/studio-project-closeout.mjs';

const run = promisify(execFile);

test('starting a ready Lineups record twice returns the same Catena Media project', async t => {
  const bundle = await build({
    stdin: { contents: `
      export * from './app/api/studio/projects/route.ts';
      export * as assets from './app/api/studio/assets/route.ts';
      export { studioProjectHttp } from './convex/studioProjectHttp.ts';
      export { studioAssetHttp } from './convex/studioAssetHttp.ts';
      export * as projects from './convex/studioProjects.ts';
      export { getFunctionName } from 'convex/server';
      export { newSession } from './lib/studio-session.ts';
    `, resolveDir: process.cwd() },
    bundle: true, platform: 'node', format: 'esm', write: false,
  });
  const api = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].contents).toString('base64'));
  const dir = await mkdtemp(join(tmpdir(), 'studio-lineups-'));
  const key = 'fixture-producer-credential-with-enough-bytes';
  const backendKey = 'fixture-backend-credential-with-enough-bytes';
  const tables = new Map([['studioProjects', []], ['studioProjectReviews', []], ['studioChatSends', []], ['studioProjectAssets', []]]);
  const blobs = new Map();
  const storage = {
    async store(blob) { const id = crypto.randomUUID(); blobs.set(id, blob); return id; },
    async get(id) { return blobs.get(id) ?? null; },
    async delete(id) { blobs.delete(id); },
  };
  const db = {
    async insert(table, row) { tables.get(table).push({ ...row, _id: crypto.randomUUID() }); },
    async patch(id, changes) { Object.assign([...tables.values()].flat().find(row => row._id === id), changes); },
    async delete(id) {
      const rows = [...tables.values()].find(entries => entries.some(row => row._id === id));
      assert.ok(rows);
      rows.splice(rows.findIndex(row => row._id === id), 1);
    },
    query(table) {
      let matches = tables.get(table);
      return {
        withIndex(_name, buildIndex) {
          const filter = { eq(field, value) { matches = matches.filter(row => row[field] === value); return filter; } };
          buildIndex(filter);
          return this;
        },
        async unique() {
          assert.ok(matches.length <= 1);
          return structuredClone(matches[0] ?? null);
        },
        async collect() { return structuredClone(matches); },
        async first() { return structuredClone(matches[0] ?? null); },
        async take(count) { return structuredClone(matches.slice(0, count)); },
      };
    },
  };
  const previous = { ...process.env };
  const nativeFetch = globalThis.fetch;
  process.env.VIDEO_REVIEW_PRODUCER_TOKEN = key;
  process.env.VIDEO_REVIEW_BACKEND_TOKEN = backendKey;
  process.env.VIDEO_REVIEW_PRODUCER_HOST_ID = 'review-host';
  process.env.STUDIO_OWNER_KEY = 'fixture-owner-access-with-enough-bytes-for-signing';
  const dispatch = (ref, args) => api.projects[api.getFunctionName(ref).split(':')[1]]._handler({ db, storage }, args);
  const backend = request => {
    const action = new URL(request.url).pathname === '/studio-assets' ? api.studioAssetHttp : api.studioProjectHttp;
    return action._handler({ runMutation: dispatch, runQuery: dispatch, storage }, request);
  };
  const server = createServer(async (req, res) => {
    const body = req.method === 'POST' ? Buffer.concat(await Array.fromAsync(req)) : undefined;
    const request = new Request('http://' + req.headers.host + req.url, {
      method: req.method, headers: req.headers, body,
    });
    const path = new URL(request.url).pathname;
    const response = await (path === '/studio-assets' ? backend(request)
      : path === '/api/studio/assets' ? api.assets[req.method](request) : api[req.method](request));
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  });
  t.after(async () => {
    globalThis.fetch = nativeFetch;
    for (const key of ['VIDEO_REVIEW_PRODUCER_TOKEN', 'VIDEO_REVIEW_BACKEND_TOKEN', 'VIDEO_REVIEW_SITE_URL', 'VIDEO_REVIEW_PRODUCER_HOST_ID', 'STUDIO_OWNER_KEY']) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
    server.close();
    await rm(dir, { recursive: true, force: true });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  process.env.VIDEO_REVIEW_SITE_URL = origin;
  globalThis.fetch = (url, init) => new URL(url).pathname.startsWith('/api/')
    ? nativeFetch(url, init) : backend(new Request(url, init));
  const record = join(dir, 'episode.json');
  const asanaTask = '1234567890123456';
  const threadId = '01a1c6f6-a137-74b3-9ff4-2905186ba0ea';
  await writeFile(record, JSON.stringify({ episodeSlug: 'week-12-power-rankings', asanaTask }));
  const start = async (...args) => JSON.parse((await run(process.execPath, [
    'plugins/s-systems/skills/lineups-editor/scripts/studio-lineups-start.mjs', '--episode', record, '--title', 'Week 12 Power Rankings', ...args,
  ], { env: { ...process.env, STUDIO_ORIGIN: origin, CODEX_THREAD_ID: threadId } })).stdout);
  const first = await start();
  assert.equal(first.client, 'Catena Media');
  assert.deepEqual(first.task, { owner: 'asana', id: asanaTask });
  assert.equal(first.url, origin + '/studio?project=' + first.projectId);
  assert.deepEqual(await start(), first);

  // A fresh visitor can browse Studio without a bookmark, cookie or producer token.
  const catalog = await nativeFetch(origin + '/api/studio/projects');
  assert.equal(catalog.status, 200);
  assert.equal(catalog.headers.get('X-Studio-Can-Manage'), 'false');
  const records = await catalog.json();
  assert.deepEqual(records.map(row => [row.projectId, row.client]), [[first.projectId, 'Catena Media']]);
  const producerCatalog = await nativeFetch(origin + '/api/studio/projects', { headers: { Authorization: 'Bearer ' + key } });
  assert.equal(producerCatalog.headers.get('X-Studio-Can-Manage'), 'true');
  assert.equal((await nativeFetch(origin + '/api/studio/projects', {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', projectId: first.projectId }),
  })).status, 401);
  assert.equal((await nativeFetch(origin + '/api/studio/projects?projectId=' + first.projectId, {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', projectId: first.projectId }),
  })).status, 403);
  assert.equal((await nativeFetch(origin + '/api/studio/projects?pendingChatHost=review-host')).status, 401);

  const storyboard = 'https://review.example.invalid/week-12';
  const options = ['--storyboard', storyboard];
  const handedOff = await start(...options);
  assert.equal(handedOff.projectId, first.projectId);
  assert.equal(handedOff.storyboardUrl, storyboard);
  assert.deepEqual(handedOff.origin, { hostId: 'review-host', threadId });
  const detail = await nativeFetch(origin + '/api/studio/projects?projectId=' + first.projectId, {
    headers: { Authorization: 'Bearer ' + key },
  });
  const saved = await detail.json();
  assert.equal(saved.storyboardUrl, storyboard);
  assert.equal(saved.sourceChatId, threadId);
  const packet = join(dir, 'packet.json');
  const hash = 'a'.repeat(64);
  const reviewPacket = {
    episodeId: 'week-12-power-rankings', revision: hash, fps: 25, initialScene: 'S01',
    scenes: [{
      id: 'S01', title: 'Opening', duration: 4, versions: [
        { id: 'plan', label: 'Scene plan', stage: 'Plan', kind: 'plan', sha256: hash },
        { id: 'motion', label: 'Export', stage: 'Motion', kind: 'video', sha256: hash, url: 'assets/scene.mp4' },
      ],
    }],
  };
  await writeFile(packet, JSON.stringify(reviewPacket));
  const packetArgs = [...options, '--packet', packet, '--media-base', 'https://review.example.invalid/bundle/'];
  const published = await start(...packetArgs);
  const readProject = async () => (await nativeFetch(origin + '/api/studio/projects?projectId=' + first.projectId, {
    headers: { Authorization: 'Bearer ' + key },
  })).json();
  assert.equal(published.projectId, first.projectId);
  const publishedPacket = JSON.parse((await readProject()).packet);
  assert.equal(published.packetRevision, publishedPacket.revision);
  assert.deepEqual(publishedPacket.scenes[0].versions.map(version => version.stage), ['Plan', 'Motion']);
  assert.equal(publishedPacket.scenes[0].versions[1].url, 'https://review.example.invalid/bundle/assets/scene.mp4');
  assert.equal((await start(...packetArgs)).packetRevision, published.packetRevision);

  const headers = { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  const endpoint = origin + '/api/studio/projects';
  const revision = published.packetRevision;
  const batch = {
    statuses: { S01: 'Changes Requested' },
    notes: [{
      id: '1fd20312-01de-4c2b-a800-243dd2a51f13', episodeId: reviewPacket.episodeId,
      sceneId: 'S01', versionId: 'motion', mediaSha256: hash,
      body: 'Hold the first frame.', time: 1.25, snapshot: 'data:image/jpeg;base64,/9j/2Q==', marks: [],
      replies: ['Will adjust.'], resolved: false,
    }],
  };
  const save = (feedback, expectedVersion = 0) => nativeFetch(endpoint, {
    method: 'POST', headers, body: JSON.stringify({
      action: 'save-review', projectId: first.projectId, revision, expectedVersion, feedback,
    }),
  });
  const result = await save(batch);
  assert.equal(result.status, 200, await result.clone().text());
  assert.deepEqual(await result.json(), { version: 1 });
  assert.deepEqual(await (await save(batch)).json(), { version: 1 });
  assert.equal((await save({ ...batch, statuses: { S01: 'Approved' } })).status, 409);
  assert.equal((await save({ ...batch, notes: [{ ...batch.notes[0], mediaSha256: 'b'.repeat(64) }] }, 1)).status, 409);
  const savedReview = await nativeFetch(endpoint + '?projectId=' + first.projectId + '&reviewRevision=' + revision, { headers });
  assert.deepEqual(await savedReview.json(), { version: 1, feedback: batch });

  const post = command => nativeFetch(endpoint, { method: 'POST', headers, body: JSON.stringify(command) });
  const queue = { action: 'queue-chat-send', projectId: first.projectId, revision, version: 1 };
  const queued = await post(queue);
  assert.equal(queued.status, 200, await queued.clone().text());
  const request = await queued.json();
  assert.equal(request.status, 'queued');
  const ownerHeaders = { Cookie: 'studio_owner=' + api.newSession() };
  const ownerStatus = () => nativeFetch(endpoint + '?projectId=' + first.projectId + '&chatSendId=' + request.requestId, { headers: ownerHeaders });
  assert.deepEqual(await (await ownerStatus()).json(), { requestId: request.requestId, status: 'queued' });
  assert.equal((await nativeFetch(endpoint + '?projectId=' + crypto.randomUUID() + '&chatSendId=' + request.requestId, { headers: ownerHeaders })).status, 404);
  assert.deepEqual(await (await post(queue)).json(), request);
  const pending = () => nativeFetch(endpoint + '?pendingChatHost=review-host', { headers });
  assert.deepEqual(await (await pending()).json(), [request.requestId]);
  assert.equal((await nativeFetch(endpoint + '?pendingChatHost=another-host', { headers })).status, 403);
  assert.equal((await post({ ...queue, threadId: crypto.randomUUID() })).status, 400);
  const sendEndpoint = endpoint + '?chatSendId=' + request.requestId;
  assert.deepEqual(await (await save({
    ...batch, statuses: { S01: 'Approved' }, notes: [{ ...batch.notes[0], snapshot: null }],
  }, 1)).json(), { version: 2 });
  const snapshot = await (await nativeFetch(sendEndpoint, { headers })).json();
  assert.deepEqual(snapshot.origin, { hostId: 'review-host', threadId });
  assert.deepEqual(snapshot.feedback, batch);
  // Keep the real HTTP path. Only the Codex socket and storage are fixtures.
  const turns = [];
  const turnId = crypto.randomUUID();
  const client = { async call(method, input) {
    assert.equal(input.threadId, threadId);
    if (method === 'thread/turns/list') return { data: turns };
    if (method === 'thread/read' || method === 'thread/resume') return { thread: { id: threadId, status: { type: 'idle' } } };
    assert.equal(method, 'turn/start');
    assert.equal(input.clientUserMessageId, request.requestId);
    assert.match(input.input[0].text, /Hold the first frame/);
    assert.match(input.input[0].text, /Changes Requested/);
    assert.doesNotMatch(input.input[0].text, /"Approved"/);
    const frame = new URL(input.input[0].text.match(/"frameUrl":"([^"]+)"/)?.[1]);
    assert.equal((await nativeFetch(frame)).status, 200);
    const still = await nativeFetch(frame, { headers: ownerHeaders });
    assert.equal(still.headers.get('content-type'), 'image/jpeg');
    assert.deepEqual(Buffer.from(await still.arrayBuffer()), Buffer.from('/9j/2Q==', 'base64'));
    turns.push({ id: turnId, items: [{ type: 'userMessage', content: input.input }] });
    throw new Error('Simulated lost Codex reply');
  } };
  const relay = { origin, hostId: 'review-host', token: key, requestId: request.requestId };
  await assert.rejects(processStudioChatSend(client, { ...relay, hostId: 'wrong-host' }), /different chat host/);
  const offlineClient = { async call() { throw new Error('Codex host is offline'); } };
  await assert.rejects(processStudioChatSend(offlineClient, relay), /Codex host is offline/);
  assert.deepEqual(await (await ownerStatus()).json(), { requestId: request.requestId, status: 'queued' });
  await assert.rejects(processStudioChatSend(client, relay), /lost Codex reply/);
  assert.equal((await (await nativeFetch(sendEndpoint, { headers })).json()).status, 'claimed');
  assert.equal((await post({ action: 'delete', projectId: first.projectId })).status, 400);
  assert.equal((await post({ action: 'confirm-chat-send', projectId: first.projectId, requestId: request.requestId,
    threadId: crypto.randomUUID(), turnId })).status, 400);
  const receipt = { requestId: request.requestId, threadId, turnId };
  assert.deepEqual(await processStudioChatSend(client, relay), receipt);
  assert.deepEqual(await (await ownerStatus()).json(), { requestId: request.requestId, status: 'delivered', turnId });
  assert.deepEqual(await processStudioChatSend(client, relay), receipt);
  assert.equal(turns.length, 1);
  assert.deepEqual(await (await pending()).json(), []);
  assert.equal((await (await nativeFetch(sendEndpoint, { headers })).json()).turnId, turnId);
  const nextSend = await (await post({ ...queue, version: 2 })).json();
  const activeTurnId = crypto.randomUUID();
  const activeTurn = { id: activeTurnId, status: 'inProgress', items: [] };
  turns.push(activeTurn);
  const activeClient = { async call(method, input) {
    assert.equal(input.threadId, threadId);
    if (method === 'thread/turns/list') return { data: turns };
    if (method === 'thread/read') return { thread: { id: threadId, status: { type: 'active' }, turns: [activeTurn] } };
    assert.equal(method, 'turn/steer');
    assert.equal(input.expectedTurnId, activeTurnId);
    assert.equal(input.clientUserMessageId, nextSend.requestId);
    activeTurn.items.push({ type: 'userMessage', content: input.input });
    return { turnId: activeTurnId };
  } };
  const nextRelay = { ...relay, requestId: nextSend.requestId };
  const activeReceipt = { requestId: nextSend.requestId, threadId, turnId: activeTurnId };
  const transcript = join(dir, 'source-chat.jsonl');
  await writeFile(transcript, [
    JSON.stringify({ type: 'session_meta', payload: { id: threadId } }),
    JSON.stringify({ type: 'event_msg', payload: { type: 'task_started', turn_id: activeTurnId } }),
  ].join('\n') + '\n');
  const staleClient = { async call(method, input) {
    if (method === 'thread/read') return { thread: { id: threadId, status: { type: 'notLoaded' }, path: transcript } };
    return activeClient.call(method, input);
  } };
  await assert.rejects(processStudioChatSend(staleClient, nextRelay), /source chat is running/);
  assert.equal((await (await nativeFetch(endpoint + '?chatSendId=' + nextSend.requestId, { headers })).json()).status, 'queued');
  assert.deepEqual(await processStudioChatSend(activeClient, nextRelay), activeReceipt);
  assert.deepEqual(await processStudioChatSend(activeClient, nextRelay), activeReceipt);
  assert.equal(activeTurn.items.length, 1);

  await writeFile(packet, JSON.stringify({ ...reviewPacket, episodeId: 'another-episode' }));
  await assert.rejects(start(...packetArgs), /does not match the episode/);
  assert.equal(JSON.parse((await readProject()).packet).revision, published.packetRevision);

  await assert.rejects(start('--storyboard', storyboard, '--chat-id',
    '01a1c6f6-a137-74b3-9ff4-2905186ba0eb', '--host-id', 'review-host'), /does not match this Codex chat/);

  await writeFile(record, JSON.stringify({ episodeSlug: 'a-different-episode', asanaTask }));
  await assert.rejects(start(), /Studio start failed/);

  const linkedClose = { action: 'close-linked', projectId: first.projectId, task: { owner: 'asana', id: asanaTask } };
  assert.equal((await post({ ...linkedClose, task: { owner: 'asana', id: '1234567890987654' } })).status, 400);
  const closeout = { outcome: 'complete', tasks: [{ id: asanaTask, completed: true }] };
  const target = { projectId: first.projectId, owner: 'asana', origin, token: key };
  await assert.rejects(closeStudioProject({ ...closeout, outcome: 'pending' }, target), /completed readback/);
  assert.deepEqual(await closeStudioProject(closeout, target), { projectId: first.projectId, status: 'closed' });
  assert.deepEqual(await closeStudioProject(closeout, target), { projectId: first.projectId, status: 'closed' });
  assert.equal((await readProject()).status, 'closed');
  assert.equal((await save(batch, 2)).status, 409);
  const other = crypto.randomUUID();
  assert.equal((await post({ action: 'create', projectId: other, client: 'Intent Solutions', title: 'Unrelated', task: null })).status, 200);
  assert.equal((await post({ action: 'delete', projectId: first.projectId })).status, 200);
  assert.equal(await readProject(), null);
  assert.equal((await nativeFetch(sendEndpoint, { headers })).status, 404);
  assert.equal(blobs.size, 0);
  assert.deepEqual(tables.get('studioProjects').map(row => row.projectId), [other]);

  await writeFile(record, JSON.stringify({ episodeSlug: reviewPacket.episodeId, asanaTask }));
  const media = Buffer.from('Studio fixture motion');
  const sha256 = createHash('sha256').update(media).digest('hex');
  await mkdir(join(dir, 'assets'));
  await writeFile(join(dir, 'assets', 'scene.mp4'), media);
  reviewPacket.scenes[0].versions[1].sha256 = sha256;
  await writeFile(packet, JSON.stringify(reviewPacket));
  const uploaded = await start(...options, '--packet', packet);
  assert.equal(uploaded.client, 'Catena Media');
  assert.equal(uploaded.origin.threadId, threadId);
  assert.deepEqual(await start(...options, '--packet', packet), uploaded);
  const uploadedProject = await (await nativeFetch(endpoint + '?projectId=' + uploaded.projectId, { headers })).json();
  const mediaUrl = new URL(JSON.parse(uploadedProject.packet).scenes[0].versions[1].url, origin);
  assert.equal((await nativeFetch(mediaUrl)).status, 200);
  assert.deepEqual(Buffer.from(await (await nativeFetch(mediaUrl, { headers })).arrayBuffer()), media);
  const range = await nativeFetch(mediaUrl, { headers: { ...headers, Range: 'bytes=0-1' } });
  assert.equal(range.status, 206);
  assert.equal(range.headers.get('accept-ranges'), 'bytes');
  assert.equal(range.headers.get('content-range'), 'bytes 0-1/' + media.length);
  assert.deepEqual(Buffer.from(await range.arrayBuffer()), media.subarray(0, 2));
  const tail = await nativeFetch(mediaUrl, { headers: { ...headers, Range: 'bytes=-3' } });
  assert.equal(tail.status, 206);
  assert.deepEqual(Buffer.from(await tail.arrayBuffer()), media.subarray(-3));
  const pastEnd = await nativeFetch(mediaUrl, { headers: { ...headers, Range: 'bytes=' + media.length + '-' } });
  assert.equal(pastEnd.status, 416);
  assert.equal(pastEnd.headers.get('content-range'), 'bytes */' + media.length);
  assert.equal((await post({ action: 'delete', projectId: uploaded.projectId })).status, 200);
  assert.equal((await nativeFetch(mediaUrl, { headers })).status, 404);
  assert.equal(blobs.size, 0);
});
