// Public UI/API seam. Run with the isolated proof.env and its local Next/Convex services.
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { chromium } from "playwright";

test("a reviewer captures a frame, saves its note and recovers it in another browser", { timeout: 90000 }, async () => {
  const base = process.env.VIDEO_REVIEW_TEST_URL;
  assert.ok(base && process.env.VIDEO_REVIEW_TEST_MEDIA, "Choose the isolated review proof environment.");
  const video = await readFile(process.env.VIDEO_REVIEW_TEST_MEDIA);
  const mediaHash = createHash("sha256").update(video).digest("hex");
  const media = createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "video/mp4", "Access-Control-Allow-Origin": "*", "Content-Length": video.length });
    response.end(video);
  });
  await new Promise(resolve => media.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    const reviewId = randomUUID(), renderId = randomUUID();
    const registered = await fetch(`${base}/api/video-reviews`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.VIDEO_REVIEW_PRODUCER_TOKEN}` },
      body: JSON.stringify({ reviewId, renderId, title: "Frame review proof", revision: "v01", media: { url: `http://127.0.0.1:${media.address().port}/proof.mp4`, sha256: mediaHash, width: 640, height: 360, duration: 26 }, origin: { hostId: "local", threadId: process.env.VIDEO_REVIEW_TEST_THREAD_ID } }),
    });
    assert.equal(registered.status, 200, `Render registration: ${await registered.text()}`);
    const wrongOriginRevision = await fetch(`${base}/api/video-reviews`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.VIDEO_REVIEW_PRODUCER_TOKEN}` },
      body: JSON.stringify({ reviewId, renderId: randomUUID(), title: "Frame review proof", revision: "v02", media: { url: `http://127.0.0.1:${media.address().port}/proof.mp4`, sha256: mediaHash, width: 640, height: 360, duration: 26 }, origin: { hostId: "local", threadId: randomUUID() } }),
    });
    assert.equal(wrongOriginRevision.status, 409, "A later revision must preserve the review's creation origin.");
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${base}/decision-maps/review/${reviewId}`);
    await page.getByRole("heading", { name: "Frame review proof" }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Owner sign in" }).count(), 0);
    await page.locator("video").evaluate(async video => { video.muted = true; await video.play(); });
    await page.waitForFunction(() => document.querySelector("video")?.currentTime > 0.4);
    await page.getByRole("button", { name: "Capture frame" }).click();
    assert.equal(await page.locator("video").evaluate(video => video.paused), true);
    const captured = await page.getByRole("img", { name: "Captured frame" }).evaluate(async image => {
      const bytes = await (await fetch(image.src)).arrayBuffer();
      return { bytes: Array.from(new Uint8Array(bytes)), hash: Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map(n => n.toString(16).padStart(2, "0")).join("") };
    });
    await page.getByLabel("Frame note", { exact: true }).fill("Keep this frame tied to v01.");
    await page.getByRole("button", { name: "Save note" }).click();
    await page.getByRole("status").filter({ hasText: "Saved." }).waitFor();
    const saved = await (await fetch(`${base}/api/video-reviews/${reviewId}`)).json();
    assert.equal(saved.notes.length, 1);
    const note = saved.notes[0];
    assert.equal(note.renderId, renderId);
    assert.equal(note.mediaSha256, mediaHash);
    assert.equal(note.snapshotSha256, captured.hash);
    assert.equal(note.width, 640);
    assert.equal(note.height, 360);
    assert.ok(note.presentedTime > 0);
    assert.equal(saved.renders[0].origin, undefined, "The public viewer does not expose internal chat IDs.");
    const retry = await context.request.post(`${base}/api/video-reviews/${reviewId}/notes`, {
      headers: { Origin: base },
      multipart: { note: JSON.stringify({ noteId: note.noteId, renderId, body: note.body, presentedTime: note.presentedTime }), snapshot: { name: "frame.png", mimeType: "image/png", buffer: Buffer.from(captured.bytes) } },
    });
    assert.equal(retry.status(), 200);
    assert.equal((await (await fetch(`${base}/api/video-reviews/${reviewId}`)).json()).notes.length, 1);
    await page.reload();
    await page.getByText("Keep this frame tied to v01.", { exact: true }).waitFor();
    const another = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const reader = await another.newPage();
    await reader.goto(page.url());
    await reader.getByText("Keep this frame tied to v01.", { exact: true }).waitFor();
    assert.equal(await reader.getByRole("button", { name: "Owner sign in" }).count(), 0);
    const snapshot = await fetch(note.snapshotUrl);
    assert.equal(createHash("sha256").update(Buffer.from(await snapshot.arrayBuffer())).digest("hex"), captured.hash);
    const denied = await another.request.post(`${base}/api/video-reviews/${reviewId}/notes`, { headers: { Origin: "https://example.com" }, multipart: { note: "{}" } });
    assert.equal(denied.status(), 403);
    if (process.env.VIDEO_REVIEW_PROOF_DIR) {
      await page.screenshot({ path: join(process.env.VIDEO_REVIEW_PROOF_DIR, "2026-10-27-frame-note-desktop.png"), fullPage: true });
      await reader.screenshot({ path: join(process.env.VIDEO_REVIEW_PROOF_DIR, "2026-10-27-frame-note-mobile.png"), fullPage: true });
    }
    if (process.env.VIDEO_REVIEW_PROOF_RECORD) await writeFile(process.env.VIDEO_REVIEW_PROOF_RECORD, JSON.stringify({ reviewId, renderId, mediaHash, note, url: page.url() }, null, 2));
    const changedId = randomUUID();
    const changed = await fetch(`${base}/api/video-reviews`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.VIDEO_REVIEW_PRODUCER_TOKEN}` },
      body: JSON.stringify({ reviewId: changedId, renderId: randomUUID(), title: "Changed source", revision: "v02", media: { url: `http://127.0.0.1:${media.address().port}/proof.mp4`, sha256: "0".repeat(64), width: 640, height: 360, duration: 26 }, origin: { hostId: "local", threadId: process.env.VIDEO_REVIEW_TEST_THREAD_ID } }),
    });
    assert.equal(changed.status, 200);
    await page.goto(`${base}/decision-maps/review/${changedId}`);
    await page.getByRole("status").filter({ hasText: "Render bytes no longer match this revision." }).waitFor({ timeout: 4000 });
    assert.equal(await page.getByRole("button", { name: "Capture frame" }).isDisabled(), true);
  } finally {
    await browser.close();
    await new Promise(resolve => media.close(resolve));
  }
});
