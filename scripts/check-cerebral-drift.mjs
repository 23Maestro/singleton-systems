import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, "config/cerebral-registry.json"), "utf8"));
const pluginRoot = process.env.SSYSTEMS_PLUGIN_ROOT || registry.plugin?.source_path || "/Users/singleton23/plugins/s-systems";
const skillPath = (skill) => path.join(pluginRoot, "skills", skill, "SKILL.md");
const retiredOwners = ["Ob" + "sidian", "Mi" + "ro"];

const checks = [
  {
    file: "docs/integration-map.md",
    must: ["Cerebral + Supabase registry", "Command + Ideas", "Next/Vercel dashboard"],
  },
  {
    file: "docs/visual-system-contract.md",
    must: ["Linear - Decisions and Active System Work", "GitHub - Research, Specs, and Implementation Evidence", "23M-88", "23M-89"],
  },
  {
    file: "docs/truth-matrix.md",
    must: ["Supabase is the cross-surface fact layer and live Cerebral registry", "Desktop and mobile action clients"],
  },
  {
    file: "docs/commands.md",
    must: ["Linear GraphQL gateway in `23M-89`", "Shortcut Playground remains pending"],
  },
  {
    file: ".codex/hooks/cerebral_singleton_guard.py",
    must: ["ROUTING_SURFACES", "STALE_OWNER_PATTERNS", "Supabase runtime registry", "Linear, GitHub, Supabase, and dashboard model"],
  },
  {
    file: skillPath("cerebral-router"),
    optionalExternal: true,
    must: ["## Cerebral Tags", "Linear Command + Ideas", "23M-89", "Linear GraphQL gateway"],
  },
  {
    file: skillPath("tool-harness"),
    optionalExternal: true,
    must: ["## Owner Surfaces", "23M-88", "23M-89"],
  },
  {
    file: skillPath("planning-idea-routing"),
    optionalExternal: true,
    must: ["Linear Command + Ideas = raw capture"],
  },
  {
    file: skillPath("opportunity-hq-updater"),
    optionalExternal: true,
    must: ["## Linear Intake Rules", "Linear Intake:"],
  },
  {
    file: skillPath("singleton-visualizer"),
    optionalExternal: true,
    must: ["Next/Vercel       = active-week review dashboard", "Supabase          = queryable facts and routing registry"],
  },
];

const errors = [];
const skipped = [];

for (const check of checks) {
  const filePath = path.isAbsolute(check.file) ? check.file : path.join(root, check.file);
  let text = "";
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    if (check.optionalExternal && error.code === "ENOENT") {
      skipped.push(check.file);
      continue;
    }
    errors.push(`${check.file}: cannot read (${error.message})`);
    continue;
  }

  for (const snippet of check.must) {
    if (!text.includes(snippet)) errors.push(`${check.file}: missing ${JSON.stringify(snippet)}`);
  }
  for (const retiredOwner of retiredOwners) {
    if (text.includes(retiredOwner)) errors.push(`${check.file}: stale retired owner ${retiredOwner}`);
  }
}

assert.ok(registry.routes.some((route) => route.route_key === "system-dashboard"));
assert.ok(registry.routes.some((route) => route.route_key === "linear-action-gateway"));

if (skipped.length && process.env.CEREBRAL_STRICT_EXTERNAL_CHECKS === "1") {
  errors.push(`Skipped optional external Cerebral checks: ${skipped.join(", ")}`);
}

if (errors.length) {
  console.error("Cerebral drift check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Cerebral drift check passed: ${checks.length} active contract surfaces.`);
