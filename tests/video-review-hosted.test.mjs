// Agreed public UI/API seam, using real Next and Convex storage (local or hosted).
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { join } from "node:path";
import { chromium } from "playwright";

test("uploaded review videos keep five frame notes across browsers and revisions", { timeout: 180000 }, async () => {
  const base = process.env.VIDEO_REVIEW_TEST_URL;
  assert.ok(base && process.env.VIDEO_REVIEW_TEST_MEDIA && process.env.VIDEO_REVIEW_TEST_MEDIA_V2, "Choose the isolated review proof environment.");
  const producer = { Authorization: `Bearer ${process.env.VIDEO_REVIEW_PRODUCER_TOKEN}` };
  const origin = { hostId: "local", threadId: process.env.VIDEO_REVIEW_TEST_THREAD_ID };
  const reviewId = randomUUID(), renderId = randomUUID();
  async function upload(path) {
    const bytes = await readFile(path);
    const grant = await fetch(`${base}/api/video-reviews/uploads`, { method: "POST", headers: producer });
    assert.equal(grant.status, 200, "Trusted producer can obtain a direct upload URL.");
    const { uploadUrl } = await grant.json();
    const response = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": "video/mp4" }, body: bytes });
    assert.equal(response.status, 200);
    return { storageId: (await response.json()).storageId, hash: createHash("sha256").update(bytes).digest("hex") };
  }
  async function register(id, revision, file, duration) {
    return fetch(`${base}/api/video-reviews`, {
      method: "POST", headers: { ...producer, "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, renderId: id, title: "Online frame review", revision, media: { storageId: file.storageId, width: 640, height: 360, duration }, origin }),
    });
  }
  const first = await upload(process.env.VIDEO_REVIEW_TEST_MEDIA);
  assert.equal((await register(renderId, "v01", first, 26)).status, 200);
  assert.equal((await fetch(`${base}/api/video-reviews/uploads`, { method: "POST" })).status, 401);
  const read = async () => (await (await fetch(`${base}/api/video-reviews/${reviewId}`)).json());
  const initial = await read();
  assert.equal(initial.renders[0].media.sha256, first.hash, "Storage derives the source hash from uploaded bytes.");
  assert.equal(createHash("sha256").update(Buffer.from(await (await fetch(initial.renders[0].media.url)).arrayBuffer())).digest("hex"), first.hash);
  const browser = await chromium.launch({ headless: true });
  let proofPage;
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    proofPage = page;
    await page.goto(`${base}/decision-maps/review/${reviewId}`);
    await page.getByRole("heading", { name: "Online frame review" }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Owner sign in" }).count(), 0);
    const captures = [];
    for (const [index, target] of [0.4, 3, 9, 17, 23.2].entries()) {
      await page.locator("video").evaluate(async (video, { index, target }) => {
        video.muted = true;
        if (index === 0) { await video.play(); return; }
        video.pause();
        if (index === 2) { video.currentTime = 5; video.currentTime = 12; }
        video.currentTime = index === 4 ? 23 : target;
        if (index === 4) await video.play();
      }, { index, target });
      await page.waitForFunction(target => {
        const video = document.querySelector("video");
        return video && !video.seeking && video.readyState >= 2 && video.currentTime >= target;
      }, target);
      await page.getByRole("button", { name: "Capture frame" }).click();
      assert.equal(await page.locator("video").evaluate(video => video.paused), true);
      const hash = await page.getByRole("img", { name: "Captured frame", exact: true }).evaluate(async image => {
        const bytes = await (await fetch(image.src)).arrayBuffer();
        return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map(n => n.toString(16).padStart(2, "0")).join("");
      });
      const body = `Frame note ${index + 1}: keep this moment on v01.`;
      await page.getByLabel("Frame note", { exact: true }).fill(body);
      if (index === 1) {
        const route = `**/api/video-reviews/${reviewId}/notes`;
        await page.route(route, handler => handler.abort());
        await page.getByRole("button", { name: "Save note", exact: true }).click();
        await page.getByRole("status").filter({ hasText: "Your draft is still here." }).waitFor();
        assert.equal(await page.getByLabel("Frame note", { exact: true }).inputValue(), body);
        await page.unroute(route);
      }
      await page.getByRole("button", { name: "Save note", exact: true }).click();
      await page.getByRole("status").filter({ hasText: "Saved." }).waitFor();
      const saved = (await read()).notes.find(note => note.body === body);
      assert.ok(saved);
      assert.equal(saved.snapshotSha256, hash);
      assert.ok(Math.abs(saved.presentedTime - target) < (index === 0 || index === 4 ? 0.5 : 0.081), "Snapshot time follows the presented frame, including rapid seeks.");
      assert.equal(createHash("sha256").update(Buffer.from(await (await fetch(saved.snapshotUrl)).arrayBuffer())).digest("hex"), hash);
      captures.push(saved);
    }
    assert.equal((await read()).notes.length, 5);
    await page.reload();
    await page.getByText(captures[4].body, { exact: true }).waitFor();
    assert.equal(await page.getByRole("article").count(), 5);
    const readerContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const reader = await readerContext.newPage();
    await reader.goto(page.url());
    await reader.getByText(captures[4].body, { exact: true }).waitFor();
    assert.equal(await reader.getByRole("article").count(), 5);
    assert.equal(await reader.getByRole("button", { name: "Owner sign in" }).count(), 0);
    const second = await upload(process.env.VIDEO_REVIEW_TEST_MEDIA_V2), secondId = randomUUID();
    assert.notEqual(second.hash, first.hash);
    assert.equal((await register(secondId, "v02", second, 2)).status, 200);
    assert.equal((await register(renderId, "v01", second, 2)).status, 409, "A rerender cannot replace the old render ID.");
    await reader.reload();
    await reader.getByText(captures[4].body, { exact: true }).waitFor();
    await reader.getByLabel("Render revision").selectOption(secondId);
    await reader.getByText("No saved notes on this revision.", { exact: true }).waitFor();
    await reader.getByLabel("Render revision").selectOption(renderId);
    await reader.getByText(captures[4].body, { exact: true }).waitFor();
    const recovered = await read();
    assert.deepEqual(recovered.notes, captures);
    assert.equal(recovered.renders.find(render => render.renderId === renderId).media.sha256, first.hash);
    if (process.env.VIDEO_REVIEW_PROOF_DIR) {
      await page.screenshot({ path: join(process.env.VIDEO_REVIEW_PROOF_DIR, "2026-10-28-hosted-review-desktop.png"), fullPage: true });
      await reader.screenshot({ path: join(process.env.VIDEO_REVIEW_PROOF_DIR, "2026-10-28-hosted-review-mobile.png"), fullPage: true });
    }
    if (process.env.VIDEO_REVIEW_PROOF_RECORD) await writeFile(process.env.VIDEO_REVIEW_PROOF_RECORD, JSON.stringify({ reviewId, renderId, sourceHash: first.hash, notes: captures, url: reader.url(), revisions: recovered.renders }, null, 2));
  } catch (error) {
    if (proofPage && process.env.VIDEO_REVIEW_PROOF_DIR) {
      await proofPage.screenshot({ path: join(process.env.VIDEO_REVIEW_PROOF_DIR, "2026-10-28-review-failure.png"), fullPage: true });
      console.error((await proofPage.locator("main").innerText()).slice(-1800));
    }
    throw error;
  } finally { await browser.close(); }
});
