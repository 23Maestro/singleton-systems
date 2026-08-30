import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, "config/cerebral-registry.json"), "utf8"));
const pluginRoot = registry.plugin.source_path;
const skillPath = (skill) => path.join(pluginRoot, "skills", skill, "SKILL.md");
const retiredOwners = ["Ob" + "sidian", "Mi" + "ro"];

const checks = [
  {
    file: "docs/integration-map.md",
    must: ["Cerebral + Supabase registry", "Command + Ideas", "Next/Vercel dashboard"],
  },
  {
    file: "docs/visual-system-contract.md",
    must: ["Linear - Decisions and Active System Work", "GitHub - Implementation Evidence", "23M-88", "23M-89"],
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
    must: ["ROUTING_SURFACES", "STALE_OWNER_PATTERNS", "Supabase runtime registry", "Linear, GitHub, Supabase, and dashboard model", "writing_context()"],
  },
  {
    file: "CONTEXT.md",
    must: ["Writing Review and System Maintenance", "trigger patterns are accepted aliases", "`all_buckets` is retired as a Lane value", "A receipt uses `not_required`, `recorded`, or `failed`"],
  },
  {
    file: skillPath("cerebral-router"),
    must: ["## Cerebral Tags", "Linear Command + Ideas", "23M-89", "Linear GraphQL gateway"],
  },
  {
    file: skillPath("planning-idea-routing"),
    must: ["Linear Command + Ideas = raw capture"],
  },
  {
    file: skillPath("opportunity-hq-updater"),
    must: ["## Linear Intake Rules", "Linear Intake:", "Correction = edit instruction", "No process commentary in deliverables"],
  },
  {
    file: skillPath("wayfinder"),
    must: ["Correction = edit instruction", "No process commentary in deliverables", "wayfinder:map", "Never launch or delegate to a sub-agent"],
  },
  {
    file: "docs/harness/README.md",
    must: ["## Writing Rules", "Correction = edit instruction", "No process commentary in deliverables"],
  },
  {
    file: skillPath("singleton-visualizer"),
    must: ["Next/Vercel       = active-week review dashboard", "Supabase          = queryable facts and routing registry"],
  },
  {
    file: skillPath("client-video-storyboard"),
    must: ["references/lineups-treatment-system.md", "seven lanes", "lane, option, and setting"],
  },
  {
    file: skillPath("portfolio-evidence-capture"),
    must: [
      "Portfolio checkpoint available",
      "Wait for Jerami's decision",
      "Keep at most 12 approved",
      "evidence-receipt.md",
    ],
  },
  {
    file: path.join(pluginRoot, "skills", "client-video-storyboard", "references", "lineups-treatment-system.md"),
    must: [
      "quick action photo",
      "quick stat",
      "stat breakdown",
      "Cinematic 2-up",
      "Simple comparison",
      "year-by-year",
      "asset swap",
      "recurring board",
      "action photography",
      "1920 x 1080",
      "pre-Premiere gate",
    ],
  },
  {
    file: ".agents/skills/singleton-figma-system/SKILL.md",
    must: ["references/lineups-production-system.md", "approved seven-lane menu", "active-page pruning rule"],
  },
  {
    file: ".agents/skills/singleton-figma-system/references/lineups-production-system.md",
    must: [
      "Do not create black, white, or image background planes",
      "112 px",
      "Components` holds the only editable source",
      "Field Night",
      "1920 x 1080",
      "prune the page in the same pass",
    ],
  },
];

const errors = [];
const wayfinder = fs.readFileSync(path.join(root, skillPath("wayfinder")), "utf8");
for (const stale of ["Fire the research subagents", "Research (AFK)", "`/research` subagent", "research/<name>", "Linear ledger"]) {
  if (wayfinder.includes(stale)) errors.push(`${skillPath("wayfinder")}: stale autonomous or ledger behavior ${JSON.stringify(stale)}`);
}

for (const check of checks) {
  const filePath = path.join(root, check.file);
  let text = "";
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (error) {
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

const lineupsActiveFiles = [
  skillPath("client-video-storyboard"),
  path.join(pluginRoot, "skills", "client-video-storyboard", "references", "lineups-treatment-system.md"),
  ".agents/skills/singleton-figma-system/references/lineups-production-system.md",
];
for (const file of lineupsActiveFiles) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  for (const stale of ["Lineups Motion Data-Driven V1", "action photo plus compact stat", "compact table or year trend"]) {
    if (text.includes(stale)) errors.push(`${file}: stale Lineups name ${JSON.stringify(stale)}`);
  }
}

assert.ok(registry.routes.some((route) => route.route_key === "system-dashboard"));
assert.ok(registry.routes.some((route) => route.route_key === "linear-action-gateway"));

if (errors.length) {
  console.error("Cerebral drift check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Cerebral drift check passed: ${checks.length} active contract surfaces.`);
