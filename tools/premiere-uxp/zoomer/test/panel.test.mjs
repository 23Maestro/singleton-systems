import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const presetButtons = [...html.matchAll(/<button class="preset" data-preset="([^"]+)">/g)]
  .map((match) => match[1]);

test("panel is exactly eight preset buttons", () => {
  assert.deepEqual(presetButtons, [
    "push-soft",
    "push-punch",
    "push-settle",
    "drift",
    "push-recompose-L",
    "push-recompose-R",
    "pull-drama-slow",
    "pull-drama-snap",
  ]);
  assert.equal((html.match(/<button\b/g) || []).length, 8);
});

test("panel keeps diagnostics and target controls out of the primary UI", () => {
  assert.doesNotMatch(html, /Probe API|Clear log|All clips|Selected clip/);
  assert.match(html, /role="status"/);
});
