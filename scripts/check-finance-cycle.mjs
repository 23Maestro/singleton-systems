import assert from "node:assert/strict";
import {
  cycleProgress,
  daysInMonth,
  daysLeftInCycle,
  getCycleForDate,
} from "../lib/finance-cycle.ts";

// Second-half cycle: Aug 19, 2026 -> 16-31
const secondHalf = getCycleForDate(new Date(2026, 7, 19));
assert.equal(secondHalf.start, "2026-08-16");
assert.equal(secondHalf.end, "2026-08-31");
assert.equal(secondHalf.label, "Aug 16-31");

// First-half cycle: Aug 3, 2026 -> 1-15
const firstHalf = getCycleForDate(new Date(2026, 7, 3));
assert.equal(firstHalf.start, "2026-08-01");
assert.equal(firstHalf.end, "2026-08-15");
assert.equal(firstHalf.label, "Aug 1-15");

// Short month, second half: Feb 20, 2027 (non-leap) -> 16-28
const shortMonth = getCycleForDate(new Date(2027, 1, 20));
assert.equal(shortMonth.end, "2027-02-28");

// Leap year boundary
assert.equal(daysInMonth(2028, 1), 29);
assert.equal(daysInMonth(2027, 1), 28);

// Days left / progress math on the second-half Aug cycle at day 19
assert.equal(daysLeftInCycle(secondHalf, new Date(2026, 7, 19)), 12);
assert.equal(daysLeftInCycle(secondHalf, new Date(2026, 7, 31)), 0);
const progress = cycleProgress(secondHalf, new Date(2026, 7, 19));
assert.ok(progress > 0 && progress <= 100, `expected 0 < progress <= 100, got ${progress}`);

console.log("finance-cycle checks passed");
