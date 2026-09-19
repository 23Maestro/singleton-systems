import test from "node:test";
import assert from "node:assert/strict";
import {
  createWorkout,
  applyWorkoutCommand,
  counts,
  nextSplit,
  prepareWeek,
  equipment,
  dateSchema,
} from "../../lib/fitness/model.ts";
import { catalog } from "../../lib/fitness/catalog.ts";
const day = "2026-09-21";
const fresh = () => createWorkout(day, "upper", catalog, [], 20);
const state = () => ({
  workouts: [],
  library: catalog,
  media: [],
  morningDays: [],
  dumbbellMax: 20,
  equipment: [...equipment],
});
function set(w, status = "done") {
  return {
    action: "set",
    id: w.id,
    revision: w.revision,
    exercise: 0,
    set: 0,
    status,
    reps: 10,
    weight: 10,
    resistance: "Light",
  };
}
test("a completed set survives serialization and starts a real-time rest deadline", () => {
  let w = applyWorkoutCommand(
    fresh(),
    { action: "start", id: day, revision: 0 },
    1000,
  );
  w = applyWorkoutCommand(w, set(w), 2000);
  assert.equal(counts(w).done, 1);
  assert.equal(w.restUntil, 92000);
  assert.equal(counts(JSON.parse(JSON.stringify(w))).done, 1);
});
test("repeated stale completion is rejected rather than counted twice", () => {
  let w = applyWorkoutCommand(
    fresh(),
    { action: "start", id: day, revision: 0 },
    1000,
  );
  const command = set(w);
  w = applyWorkoutCommand(w, command, 2000);
  assert.throws(() => applyWorkoutCommand(w, command, 2100), /another device/);
  assert.equal(counts(w).done, 1);
});
test("undo clears completion and earned progress", () => {
  let w = applyWorkoutCommand(
    fresh(),
    { action: "start", id: day, revision: 0 },
    1000,
  );
  w = applyWorkoutCommand(w, set(w), 2000);
  w = applyWorkoutCommand(w, set(w, "pending"), 3000);
  assert.equal(counts(w).done, 0);
  assert.equal(w.exercises[0].sets[0].at, null);
  assert.equal(w.restUntil, null);
});
test("timer pause freezes remaining duration; resume uses new absolute deadline", () => {
  let w = applyWorkoutCommand(
    fresh(),
    { action: "start", id: day, revision: 0 },
    1000,
  );
  w = applyWorkoutCommand(w, set(w), 2000);
  w = applyWorkoutCommand(
    w,
    { action: "timer", id: day, revision: w.revision, operation: "pause" },
    12000,
  );
  assert.equal(w.pausedRest, 80000);
  w = applyWorkoutCommand(
    w,
    { action: "timer", id: day, revision: w.revision, operation: "resume" },
    32000,
  );
  assert.equal(w.restUntil, 112000);
});
test("an unfinished or wholly skipped session does not advance the split", () => {
  const w = fresh();
  w.startedAt = 1000;
  assert.equal(nextSplit([w]), "upper");
  w.finishedAt = 2000;
  w.exercises.forEach((e) => e.sets.forEach((s) => (s.status = "skipped")));
  assert.equal(nextSplit([w]), "upper");
  w.exercises[0].sets[0].status = "done";
  assert.equal(nextSplit([w]), "lower");
});
test("Sunday plans use four agreed dates and reruns preserve prior sets", () => {
  const s = state();
  s.workouts = prepareWeek(s, day);
  assert.deepEqual(
    s.workouts.map((w) => w.id),
    ["2026-09-21", "2026-09-22", "2026-09-24", "2026-09-26"],
  );
  assert.deepEqual(
    s.workouts.map((w) => w.split),
    ["upper", "lower", "upper", "lower"],
  );
  s.workouts[0].exercises[0].sets[0].weight = 7;
  assert.deepEqual(prepareWeek(s, day), s.workouts);
});
test("interrupted session is followed by opposite split in next week", () => {
  const s = state();
  const w = fresh();
  w.startedAt = 1000;
  s.workouts = [w];
  assert.equal(prepareWeek(s, "2026-09-28")[0].split, "lower");
});
test("loads carry actual completed work forward without exceeding owned equipment", () => {
  const w = fresh();
  w.finishedAt = 1000;
  w.exercises[0].sets[0] = {
    reps: 8,
    weight: 25,
    resistance: "Light",
    status: "done",
    at: 900,
  };
  const next = createWorkout("2026-09-28", "upper", catalog, [w], 20);
  assert.equal(next.exercises[0].sets[0].weight, 20);
  assert.equal(next.exercises[0].sets[0].reps, 8);
});
test("cannot finish with pending work or log before starting", () => {
  assert.throws(() => applyWorkoutCommand(fresh(), set(fresh())), /Start/);
  assert.throws(
    () =>
      applyWorkoutCommand(fresh(), { action: "finish", id: day, revision: 0 }),
    /remaining/,
  );
});
test("date rejects impossible dates and plan rejects non-Monday", () => {
  assert.equal(dateSchema.safeParse("2026-02-30").success, false);
  assert.throws(() => prepareWeek(state(), "2026-09-22"), /Monday/);
});
