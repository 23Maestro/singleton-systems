import { spawnSync } from "node:child_process";

const python = process.env.PYTHON || "python3";
const nativeSchema = spawnSync(process.execPath, ['--test', 'scripts/lineups-blender-schema.test.mjs', 'lib/lineups/stadiums.test.mjs'], {encoding: 'utf8'});
if (nativeSchema.status !== 0) throw new Error(nativeSchema.stderr || nativeSchema.stdout || 'Blender schema check failed');
const checks = [
  ["-m", "unittest", "tools.lineups_motion.tests.test_templates", "tools.lineups_motion.tests.test_engine_choice", "tools.lineups_motion.tests.test_designs", "tools.lineups_motion.tests.test_contract_gate", "tools.lineups_motion.tests.test_blender_variants", "tools.lineups_motion.tests.test_blender_source", "tools.lineups_motion.tests.test_rank_panel", "tools.lineups_motion.tests.test_stadiums"],
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
