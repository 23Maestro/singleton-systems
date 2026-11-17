import { test } from "node:test";
import assert from "node:assert/strict";
import { createShareHttp } from "../lib/codex-share/http.mjs";
import { startSharedThread } from "../lib/codex-share/start-thread.mjs";
import { PassThrough, Writable } from "node:stream";
import { EventEmitter } from "node:events";

test("shares text and screenshots only for the Tailscale owner", async () => {
  const calls = [];
  const handler = createShareHttp({ login: "owner@example.com", saveImages: async images => { calls.push(images); return ["/tmp/fixture.jpg"]; },
    startThread: async input => { calls.push(input); return { threadId: "thread-1" }; } });
  const body = { images: ["aGVsbG8="], note64: Buffer.from("Review this").toString("base64"), text64: Buffer.from("https://x.com/example/status/1").toString("base64") };
  const request = headers => new Request("http://localhost/share", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
  assert.equal((await handler(request({}))).status, 403);
  assert.equal((await handler(request({ "tailscale-user-login": "owner@example.com", origin: "https://bad.test" }))).status, 403);
  const result = await (await handler(request({ "tailscale-user-login": "owner@example.com" }))).json();
  assert.equal(result.threadId, "thread-1");
  assert.equal(calls[1].note, "Review this");
  assert.equal(calls[1].sharedText, "https://x.com/example/status/1");
  assert.deepEqual(calls[1].imagePaths, ["/tmp/fixture.jpg"]);
});

test("rejects empty shares before starting Codex", async () => {
  let called = false;
  const handler = createShareHttp({ login: "owner", saveImages: async () => [], startThread: async () => { called = true; } });
  const request = new Request("http://localhost/share", { method: "POST", headers: { "content-type": "application/json", "tailscale-user-login": "owner" }, body: JSON.stringify({ images: [], note64: "", text64: "" }) });
  assert.equal((await handler(request)).status, 400);
  assert.equal(called, false);
});

test("only an explicit expense recording request enters the review flow", async () => {
  let prepared = 0, started = 0;
  const handler = createShareHttp({ login: "owner", saveImages: async () => ["/tmp/test.jpg"], startThread: async () => { started++; return { threadId: "thread" }; },
    prepareExpenses: async () => { prepared++; return { status: "review", id: "draft", entries: [{ name: "Lunch", amount: 4, date: "2026-11-13" }], duplicates: [] }; } });
  const req = note => new Request("http://localhost/share", { method: "POST", headers: { "content-type": "application/json", "tailscale-user-login": "owner" }, body: JSON.stringify({ images: ["aGVsbG8="], text64: "", note64: Buffer.from(note).toString("base64") }) });
  const review = await (await handler(req("Add these expenses"))).json();
  assert.equal(review.status, "review"); assert.match(review.summary, /Lunch/); assert.equal(started, 0);
  assert.equal((await (await handler(req("Analyze my expenses"))).json()).status, "started");
  assert.equal(prepared, 1); assert.equal(started, 1);
});

test("passes the user context, link and social routing to a new Codex task", async () => {
  let sentTurn;
  const spawnProcess = () => {
    const proc = new EventEmitter(); proc.stdout = new PassThrough(); proc.stderr = new PassThrough();
    proc.stdin = new Writable({ write(chunk, _encoding, callback) {
      const msg = JSON.parse(String(chunk));
      const emit = data => proc.stdout.write(JSON.stringify(data) + "\n");
      if (msg.id === 1) queueMicrotask(() => emit({ id: 1, result: {} }));
      if (msg.id === 4) queueMicrotask(() => emit({ id: 4, result: { data: [{ id: "project-1", roots: [{ path: "/repo" }] }] } }));
      if (msg.id === 2) queueMicrotask(() => emit({ id: 2, result: { thread: { id: "thread-1" } } }));
      if (msg.id === 5) queueMicrotask(() => emit({ id: 5, result: {} }));
      if (msg.id === 3) { sentTurn = msg.params; queueMicrotask(() => { emit({ id: 3, result: { turn: { id: "turn-1" } } }); emit({ method: "turn/completed" }); }); }
      callback();
    } });
    proc.kill = () => {};
    return proc;
  };
  const result = await startSharedThread({ cwd: "/repo", note: "Review this", sharedText: "https://x.com/a/status/1", imagePaths: [], spawnProcess });
  assert.equal(result.threadId, "thread-1");
  assert.match(sentTurn.input[0].text, /scrapecreators-api/);
  assert.match(sentTurn.input[0].text, /Review this/);
  assert.match(sentTurn.input[0].text, /https:\/\/x\.com\/a\/status\/1/);
});
