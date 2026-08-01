import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseCutList,
  mergeRemovals,
  planCuts,
} from "../src/cutlist.js";

const src = (d) => ({ version: 1, source: { duration: d }, removals: [] });

test("parses a normal cut list", () => {
  const { cutList, report } = parseCutList({
    version: 1,
    source: { name: "a.mp4", duration: 100, fps: 29.97 },
    removals: [{ start: 1, end: 2, kind: "cue", note: "flub" }],
  });
  assert.equal(report.errors.length, 0);
  assert.equal(cutList.removals.length, 1);
  assert.equal(cutList.source.duration, 100);
});

test("accepts a bare array and array-form entries", () => {
  const { cutList } = parseCutList([[1, 2, "gap", "dead air"], { start: 5, end: 6 }]);
  assert.equal(cutList.removals.length, 2);
  assert.equal(cutList.removals[0].kind, "gap");
  assert.equal(cutList.removals[1].kind, "manual");
});

test("bad JSON does not throw", () => {
  const { cutList, report } = parseCutList("{nope");
  assert.equal(cutList, null);
  assert.match(report.errors[0], /Not valid JSON/);
});

test("garbage entries are skipped, good ones survive", () => {
  const { cutList, report } = parseCutList({
    removals: [
      { start: 1, end: 2 },
      null,
      { start: "x", end: 5 },
      { start: 9, end: 9 },
      { start: 4, end: 3 },
      { start: -1, end: 1 },
      { start: 10, end: 12 },
    ],
  });
  assert.equal(cutList.removals.length, 3); // 1-2, -1->0-1, 10-12
  assert.equal(report.warnings.length, 5);
  assert.equal(cutList.removals.find((r) => r.index === 5).start, 0);
});

test("missing removals array is an error, not a crash", () => {
  assert.equal(parseCutList({ source: {} }).cutList, null);
  assert.equal(parseCutList(null).cutList, null);
  assert.equal(parseCutList(42).cutList, null);
});

test("merges overlapping and adjacent removals", () => {
  const m = mergeRemovals([
    { start: 1, end: 3, note: "a" },
    { start: 2.5, end: 4, note: "b" },
    { start: 10, end: 11, note: "c" },
  ]);
  assert.equal(m.length, 2);
  assert.equal(m[0].end, 4);
  assert.equal(m[0].merged, 2);
});

test("plan is ordered last-first so ripple deletes stay valid", () => {
  const { plan } = planCuts(
    { ...src(100), removals: [
      { start: 1, end: 2 }, { start: 50, end: 51 }, { start: 20, end: 21 },
    ] },
    100
  );
  assert.deepEqual(plan.map((p) => p.start), [50, 20, 1]);
});
test("ranges past the sequence end are skipped, earlier cuts still apply", () => {
  const { plan, report } = planCuts(
    { ...src(1571), removals: [
      { start: 10, end: 12, note: "keeps" },
      { start: 1600, end: 1610, note: "past end - segment missing" },
      { start: 20, end: 22, note: "keeps" },
    ] },
    900 // sequence is much shorter than the cut list's source
  );
  assert.equal(plan.length, 2);
  assert.equal(report.skipped.length, 1);
  assert.match(report.skipped[0].reason, /past sequence end/);
  assert.match(report.warnings[0], /drift/);
});

test("a range straddling the end is clamped, not dropped", () => {
  const { plan, report } = planCuts(
    { ...src(100), removals: [{ start: 95, end: 120 }] },
    100
  );
  assert.equal(plan.length, 1);
  assert.equal(plan[0].end, 100);
  assert.equal(report.clamped.length, 1);
});

test("degenerate-after-clamp ranges are skipped", () => {
  const { plan, report } = planCuts(
    { ...src(100), removals: [{ start: 99.995, end: 130 }] },
    100
  );
  assert.equal(plan.length, 0);
  assert.equal(report.skipped.length, 1);
});

test("unknown sequence duration still produces a plan", () => {
  const { plan, report } = planCuts(
    { ...src(null), removals: [{ start: 1, end: 2 }] },
    undefined
  );
  assert.equal(plan.length, 1);
  assert.match(report.warnings[0], /duration unknown/);
});

test("empty cut list is a no-op, not an error", () => {
  const { plan, report } = planCuts({ ...src(100), removals: [] }, 100);
  assert.equal(plan.length, 0);
  assert.match(report.warnings[0], /Nothing to do/);
});

test("projected duration accounts for merged overlaps", () => {
  const { report } = planCuts(
    { ...src(100), removals: [
      { start: 10, end: 20 }, { start: 15, end: 25 },
    ] },
    100
  );
  assert.equal(report.totalRemoved, 15); // merged 10-25, not 20
  assert.equal(report.projectedDuration, 85);
});
