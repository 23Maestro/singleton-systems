#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const skillRoot = path.resolve(path.dirname(scriptPath), "..");
const rubric = JSON.parse(
  fs.readFileSync(path.join(skillRoot, "references", "catena-lineups-rubric.json"), "utf8"),
);

export function runtimeSeconds(runtime) {
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(runtime);
  if (!match) throw new Error(`Invalid runtime: ${runtime}. Use mm:ss.`);
  return Number(match[1]) * 60 + Number(match[2]);
}

export function estimateRuntime(runtime) {
  const seconds = runtimeSeconds(runtime);
  const band = rubric.bands.find(
    (candidate) =>
      seconds >= runtimeSeconds(candidate.minimum) && seconds <= runtimeSeconds(candidate.maximum),
  );
  if (!band) throw new Error(`Runtime ${runtime} is outside the Catena rubric (10:00-20:00).`);
  return { runtime, hours: band.hours };
}

export function estimateRuntimes(runtimes) {
  if (runtimes.length === 0) throw new Error("Provide at least one runtime in mm:ss format.");
  const estimates = runtimes.map(estimateRuntime);
  return {
    profile: rubric.profile,
    estimates,
    totalHours: estimates.reduce((total, estimate) => total + estimate.hours, 0),
    weeklyLimitHours: rubric.weekly_limit_hours,
  };
}

export function formatHours(hours) {
  const totalMinutes = Math.round(hours * 60);
  return `${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

if (path.resolve(process.argv[1] ?? "") === scriptPath) {
  try {
    const json = process.argv.includes("--json");
    const runtimes = process.argv.slice(2).filter((argument) => argument !== "--json");
    const result = estimateRuntimes(runtimes);
    if (json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      for (const estimate of result.estimates) {
        console.log(`${estimate.runtime} -> ${formatHours(estimate.hours)}`);
      }
      console.log(`Total -> ${formatHours(result.totalHours)}`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
