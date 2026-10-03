import { spawnSync } from "node:child_process";

const python = process.env.PYTHON || "python3";
const checks = [
  ["-m", "unittest", "tools.lineups_motion.tests.test_templates"],
  ["scripts/lineups-templates.py", "check", "config/lineups/canonical-template-verification.json"],
  ["scripts/lineups-templates.py", "check", "config/lineups/fixtures/valid/callout-readback.json"],
];
for (const args of checks) {
  const result = spawnSync(python, args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "Lineups template check failed");
  process.stdout.write(result.stdout);
  process.stdout.write(result.stderr);
}
console.log("Lineups templates passed: exact source retrieval, lane fit, and measured callout fidelity.");
