import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";

test("anyone with a review link can save a frame note without signing in", { timeout: 90000 }, async () => {
  const url = process.env.VIDEO_REVIEW_PUBLIC_TEST_URL;
  assert.ok(url, "Choose the shared review URL.");
  const reviewId = new URL(url).pathname.split("/").at(-1), base = new URL(url).origin;
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(url);
    await page.getByRole("heading", { name: "Online frame review" }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Owner sign in" }).count(), 0, "The shared review has no password gate.");
    await page.locator("video").evaluate(async video => { video.muted = true; await video.play(); });
    await page.waitForFunction(() => document.querySelector("video")?.currentTime > 0.4);
    await page.getByRole("button", { name: "Capture frame" }).click();
    const hash = await page.getByRole("img", { name: "Captured frame", exact: true }).evaluate(async image => {
      const bytes = await (await fetch(image.src)).arrayBuffer();
      return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map(n => n.toString(16).padStart(2, "0")).join("");
    });
    const body = `Public link check ${Date.now()}: saved without a password.`;
    await page.getByLabel("Frame note", { exact: true }).fill(body);
    await page.getByRole("button", { name: "Save note", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Saved." }).waitFor();
    assert.equal((await context.cookies()).some(cookie => cookie.name === "video_review_owner"), false);
    await page.reload();
    await page.getByText(body, { exact: true }).waitFor();
    const review = await (await fetch(`${base}/api/video-reviews/${reviewId}`)).json();
    const saved = review.notes.find(note => note.body === body);
    assert.equal(saved.snapshotSha256, hash);
    const snapshot = await fetch(saved.snapshotUrl);
    assert.equal(createHash("sha256").update(Buffer.from(await snapshot.arrayBuffer())).digest("hex"), hash);
    const crossOrigin = await context.request.post(`${base}/api/video-reviews/${reviewId}/notes`, { headers: { Origin: "https://example.com" }, multipart: { note: "{}" } });
    assert.equal(crossOrigin.status(), 403);
    assert.equal((await fetch(`${base}/api/video-reviews/uploads`, { method: "POST" })).status, 401);
    if (process.env.VIDEO_REVIEW_PUBLIC_PROOF) await writeFile(process.env.VIDEO_REVIEW_PUBLIC_PROOF, JSON.stringify({ url, saved, authenticated: false }, null, 2));
  } finally { await browser.close(); }
});
