import test from "node:test";
import assert from "node:assert/strict";
import { PRESETS, focalPosition, getPreset, resolvePreset, samplePreset } from "../src/presets.js";

test("ships exactly the eight requested presets", () => {
  assert.deepEqual(PRESETS.map((p) => p.name), [
    "push-soft", "push-punch", "push-settle", "push-recompose-R",
    "push-recompose-L", "drift", "pull-drama-slow", "pull-drama-snap",
  ]);
  for (const preset of PRESETS) {
    assert.ok(preset.description);
    assert.ok(preset.scaleKeys.length >= 2);
    assert.ok(preset.focalKeys.length >= 2);
    assert.ok(preset.duration >= 8);
    assert.equal(preset.maxScale, 112);
    assert.ok(preset.scaleKeys.every((key) => typeof key.ease === "string"));
  }
});

test("scale 1 positions every focal point at frame centre", () => {
  assert.deepEqual(focalPosition({ x: 0.1, y: 0.9 }, 1, { width: 1920, height: 1080 }), { x: 960, y: 540 });
});

test("centre focal remains at frame centre for every scale", () => {
  assert.deepEqual(focalPosition({ x: 0.5, y: 0.5 }, 1.12, { width: 1920, height: 1080 }), { x: 960, y: 540 });
});

test("recompose right animates focal while scale grows", () => {
  const samples = samplePreset("push-recompose-R", 3).samples;
  assert.deepEqual(samples.map((s) => s.focal.x), [0.5, 0.61, 0.72]);
  assert.deepEqual(samples.map((s) => s.scale), [100, 103.5, 107]);
});

test("drift direction mirrors around frame centre", () => {
  const right = resolvePreset("drift", { direction: "R" }).preset.focalKeys;
  const left = resolvePreset("drift", { direction: "L" }).preset.focalKeys;
  assert.deepEqual(right.map((k) => k.x), [0.46, 0.54]);
  assert.deepEqual(left.map((k) => k.x), [0.54, 0.46]);
});

test("intensity scales delta and guard caps at 112", () => {
  const resolved = resolvePreset("push-punch", { intensity: 1.5 });
  assert.deepEqual(resolved.preset.scaleKeys.map((k) => k.value), [100, 112]);
  assert.equal(resolved.warnings.length, 1);
});

test("pull presets remain reverse moves", () => {
  assert.ok(getPreset("pull-drama-slow").scaleKeys[0].value > getPreset("pull-drama-slow").scaleKeys.at(-1).value);
  assert.equal(getPreset("pull-drama-snap").scaleKeys[1].value, 103.4);
});

import {
  positionKeyFrames, positionError, positionPlan, easeAtFrame,
} from "../src/presets.js";

const FR = { width: 1920, height: 1080 };
const res = (name) => resolvePreset(name).preset;

test("static-focal presets need exactly one position key per scale key", () => {
  for (const name of ["push-soft", "push-punch", "pull-drama-slow", "push-settle"]) {
    const preset = res(name);
    const keys = positionKeyFrames(preset, { frameSize: FR });
    assert.equal(keys.length, preset.scaleKeys.length, `${name} key count`);
    assert.ok(positionError(preset, keys, FR) < 1e-6, `${name} should be exact`);
  }
});

test("drift is exact with two keys despite a moving focal", () => {
  const preset = res("drift");
  const keys = positionKeyFrames(preset, { frameSize: FR });
  assert.equal(keys.length, 2);
  assert.ok(positionError(preset, keys, FR) < 1e-6);
});

test("recompose presets subdivide until focal drift is under tolerance", () => {
  for (const name of ["push-recompose-R", "push-recompose-L"]) {
    const preset = res(name);
    const twoKey = [0, preset.duration];
    assert.ok(positionError(preset, twoKey, FR) > 5,
      `${name} must actually have the drift problem`);
    const keys = positionKeyFrames(preset, { frameSize: FR });
    assert.ok(keys.length > 2, `${name} must subdivide`);
    assert.ok(positionError(preset, keys, FR) <= 1.0, `${name} must land under 1px`);
  }
});

test("tolerance is honoured and bounded by maxKeys", () => {
  const preset = res("push-recompose-R");
  const tight = positionKeyFrames(preset, { frameSize: FR, tolerancePx: 0.1 });
  const loose = positionKeyFrames(preset, { frameSize: FR, tolerancePx: 5 });
  assert.ok(tight.length > loose.length);
  assert.ok(positionError(preset, tight, FR) <= 0.1);
  const capped = positionKeyFrames(preset, { frameSize: FR, tolerancePx: 0, maxKeys: 4 });
  assert.equal(capped.length, 4);
});

test("every scale-key and focal-key frame is always kept", () => {
  for (const preset of PRESETS.map((p) => res(p.name))) {
    const keys = positionKeyFrames(preset, { frameSize: FR });
    for (const k of [...preset.scaleKeys, ...preset.focalKeys]) {
      assert.ok(keys.includes(k.frame), `${preset.name} missing frame ${k.frame}`);
    }
    assert.deepEqual(keys, [...keys].sort((a, b) => a - b), "ascending");
    assert.equal(new Set(keys).size, keys.length, "no duplicates");
  }
});

test("positionPlan returns writable keys with pixels and an ease", () => {
  const plan = positionPlan(res("push-recompose-R"), FR);
  assert.ok(plan.length > 2);
  for (const key of plan) {
    assert.ok(Number.isFinite(key.pixels.x) && Number.isFinite(key.pixels.y));
    assert.equal(typeof key.ease, "string");
  }
  assert.ok(Math.abs(plan[0].pixels.x - 960) < 1e-9);
  assert.ok(Math.abs(plan[0].pixels.y - 540) < 1e-9);
  assert.ok(plan[plan.length - 1].pixels.x < 960);
});

test("easeAtFrame reports the governing segment ease", () => {
  const preset = res("push-settle");
  assert.equal(easeAtFrame(preset, 0), "linear");
  assert.equal(easeAtFrame(preset, 5), "out-back");
  assert.equal(easeAtFrame(preset, 14), "in-out-sine");
});
