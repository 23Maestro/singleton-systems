// Seam tests for Command Center scheduling math (lib/command-center-schedule.ts).
// Expected values are literal worked examples, pinned to America/New_York (EDT, UTC-4 on 2026-10-05).
process.env.TZ = "America/New_York";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_MINUTES,
  blockSpan,
  minuteFromOffset,
  movePlacement,
  newPlacement,
  resizePlacement,
  snapMinutes,
} from "../lib/command-center-schedule.ts";

const HOUR = 56;
const block = {
  id: "b1",
  owner: "asana",
  owner_id: "1",
  selected_date: "2026-10-05",
  starts_at: "2026-10-05T13:00:00.000Z", // 9:00 local
  ends_at: "2026-10-05T14:30:00.000Z", // 10:30 local
};

test("snaps to 15-minute intervals", () => {
  assert.equal(snapMinutes(7), 0);
  assert.equal(snapMinutes(8), 15);
  assert.equal(snapMinutes(22), 15);
  assert.equal(snapMinutes(23), 30);
  assert.equal(snapMinutes(61), 60);
});

test("pointer offset maps to a snapped minute of the day", () => {
  assert.equal(minuteFromOffset(0, HOUR), 0);
  assert.equal(minuteFromOffset(HOUR * 9, HOUR), 540);
  // 9:00 + 20px = 21.4 min -> 9:15
  assert.equal(minuteFromOffset(HOUR * 9 + 20, HOUR), 555);
  assert.equal(minuteFromOffset(-30, HOUR), 0);
  assert.equal(minuteFromOffset(HOUR * 30, HOUR), 1440);
});

test("a dropped task defaults to one hour", () => {
  const placed = newPlacement("2026-10-05", 570);
  assert.equal(DEFAULT_MINUTES, 60);
  assert.deepEqual(placed, {
    selectedDate: "2026-10-05",
    startsAt: "2026-10-05T13:30:00.000Z",
    endsAt: "2026-10-05T14:30:00.000Z",
  });
});

test("a drop near midnight keeps the full hour inside the day", () => {
  const placed = newPlacement("2026-10-05", 1430);
  assert.equal(placed.startsAt, "2026-10-06T03:00:00.000Z"); // 23:00 local
  assert.equal(placed.endsAt, "2026-10-06T04:00:00.000Z"); // 24:00 local
});

test("block span reads start, end, and duration in local minutes", () => {
  assert.deepEqual(blockSpan(block), { start: 540, end: 630, duration: 90 });
});

test("a block ending at midnight spans to 1440", () => {
  const late = {
    ...block,
    starts_at: "2026-10-06T03:00:00.000Z",
    ends_at: "2026-10-06T04:00:00.000Z",
    selected_date: "2026-10-05",
  };
  assert.deepEqual(blockSpan(late), { start: 1380, end: 1440, duration: 60 });
});

test("moving keeps duration and changes the day", () => {
  const moved = movePlacement(block, "2026-10-07", 8 * 60 + 15);
  assert.deepEqual(moved, {
    selectedDate: "2026-10-07",
    startsAt: "2026-10-07T12:15:00.000Z",
    endsAt: "2026-10-07T13:45:00.000Z",
  });
});

test("moving past the end of the day clamps to keep the duration", () => {
  const moved = movePlacement(block, "2026-10-05", 1400);
  assert.equal(moved.startsAt, "2026-10-06T02:30:00.000Z"); // 22:30 local
  assert.equal(moved.endsAt, "2026-10-06T04:00:00.000Z");
});

test("resizing moves only the end and keeps the start", () => {
  const resized = resizePlacement(block, 12 * 60);
  assert.deepEqual(resized, {
    selectedDate: "2026-10-05",
    startsAt: block.starts_at,
    endsAt: "2026-10-05T16:00:00.000Z",
  });
});

test("resizing never goes below 15 minutes or past midnight", () => {
  assert.equal(resizePlacement(block, 500).endsAt, "2026-10-05T13:15:00.000Z");
  assert.equal(resizePlacement(block, 5000).endsAt, "2026-10-06T04:00:00.000Z");
});
