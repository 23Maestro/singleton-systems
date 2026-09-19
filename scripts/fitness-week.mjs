#!/usr/bin/env node
// Run in Codex, after reviewing this week's real logs and source videos.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import {
  prepareWeek,
  monday,
  localDay,
  addDays,
  dateSchema,
} from "../lib/fitness/model.ts";
const args = process.argv.slice(2);
const value = (flag) =>
  args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined;
const week = dateSchema.parse(
  value("--week") ?? addDays(monday(localDay()), 7),
);
const run = (fn, payload = {}) =>
  JSON.parse(
    execFileSync("npx", ["convex", "run", fn, JSON.stringify(payload)], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
      maxBuffer: 4 * 1024 * 1024,
    }),
  );
const state = run("fitness:summary");
const workouts = prepareWeek(state, week);
const payload = { workouts };
mkdirSync("output/fitness", { recursive: true });
const path = `output/fitness/week-${week}.json`;
writeFileSync(
  path,
  JSON.stringify({ revision: state.revision, ...payload }, null, 2),
);
console.log(
  JSON.stringify(
    {
      week,
      completedSets: state.completedSets,
      preview: path,
      sessions: workouts.map((w) => ({
        day: w.id,
        split: w.split,
        movements: w.exercises.map((e) => e.exercise.name),
      })),
    },
    null,
    2,
  ),
);
if (args.includes("--publish"))
  console.log(
    run("fitness:publish", {
      payload: JSON.stringify(payload),
      revision: state.revision,
    }),
  );
else
  console.log(
    "Review this file, then rerun with --publish. Existing sessions are preserved.",
  );
