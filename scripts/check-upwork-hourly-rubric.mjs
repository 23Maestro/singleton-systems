import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  estimateRuntime,
  estimateRuntimes,
  formatHours,
  runtimeSeconds,
} from "../plugins/s-systems/skills/upwork-hourly-rubric/scripts/estimate-catena-hours.mjs";

const root = process.cwd();
const skillRoot = path.join(root, "plugins/s-systems/skills/upwork-hourly-rubric");
const rubric = JSON.parse(
  fs.readFileSync(path.join(skillRoot, "references/catena-lineups-rubric.json"), "utf8"),
);

assert.equal(runtimeSeconds("13:41"), 821);
assert.deepEqual(estimateRuntime("13:41"), { runtime: "13:41", hours: 9 });
assert.deepEqual(estimateRuntime("15:36"), { runtime: "15:36", hours: 9.5 });
assert.equal(estimateRuntimes(["13:41", "15:36"]).totalHours, 18.5);
assert.equal(formatHours(9), "9:00");
assert.equal(formatHours(9.5), "9:30");
assert.equal(formatHours(18.5), "18:30");

for (const [runtime, hours] of [
  ["10:00", 8],
  ["11:59", 8],
  ["12:00", 9],
  ["13:59", 9],
  ["14:00", 9.5],
  ["15:59", 9.5],
  ["16:00", 10],
  ["17:59", 10],
  ["18:00", 10.5],
  ["20:00", 10.5],
]) {
  assert.equal(estimateRuntime(runtime).hours, hours, `${runtime} should estimate ${hours} hours`);
}

assert.throws(() => estimateRuntime("09:59"), /outside the Catena rubric/);
assert.throws(() => estimateRuntime("20:01"), /outside the Catena rubric/);
assert.throws(() => estimateRuntime("13:60"), /Invalid runtime/);
assert.equal(rubric.initial_figma_setup.status, "already_charged");
assert.equal(rubric.initial_figma_setup.repeat_automatically, false);

const skill = fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8");
assert.match(skill, /finished runtime is the required input/);
assert.match(skill, /initial six-hour template build has been charged/);
assert.doesNotMatch(skill, /Final runtime is one input/);

console.log("Upwork hourly rubric checks passed: 13:41 -> 9:00, 15:36 -> 9:30, total 18:30.");
