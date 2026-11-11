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
    must: ["Linear - Development Work", "Asana - Client and Consulting Work", "GitHub - Implementation Evidence", "23M-88", "23M-89"],
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
    must: ["## Cerebral Tags", "Linear Command + Ideas", "AI Consulting and Content Editor task state -> Asana", "23M-89", "Linear GraphQL gateway"],
  },
  {
    file: skillPath("planning-idea-routing"),
    must: ["Linear Command + Ideas = raw capture"],
  },
  {
    file: skillPath("opportunity-hq-updater"),
    must: ["## Intake Rules", "Linear Intake:", "Write selected AI Consulting and Content Editor work to Asana", "Correction = edit instruction", "No process commentary in deliverables", "Format Linear bodies as CommonMark", "html_notes", "notes` is plain text", "Never print escaped `\\n` as layout"],
  },
  {
    file: skillPath("wayfinder"),
    must: ["Correction = edit instruction", "No process commentary in deliverables", "wayfinder:map", "Never launch or delegate to a sub-agent"],
  },
  {
    file: "docs/harness/README.md",
    must: ["## Writing Rules", "Correction = edit instruction", "No process commentary in deliverables", "competitor swap test", "Linear operational copy uses CommonMark", "html_notes", "notes` is plain text"],
  },
  {
    file: "CODEX.md",
    must: ["docs/video-storage-workflow.md", "s-systems:video-storage", "HomeSSD placement"],
  },
  {
    file: "docs/video-storage-workflow.md",
    must: ["s-systems:video-storage", "dev-storage", "/Volumes/HomeSSD/Generated/<CLIENT>/<TYPE>/", "Eagle or MediaSSD"],
  },
  {
    file: skillPath("video-storage"),
    must: [
      "Keep the reusable edit system in Git",
      "/Volumes/HomeSSD/Generated/<CLIENT>/<TYPE>/",
      "0EB7E204-D359-47B2-B9B1-89B2DC77BC5A",
      "Do not use the internal SSD as a fallback",
      "Do not blanket",
      "explicit approval",
    ],
  },
  {
    file: ".agents/skills/dev-storage/SKILL.md",
    must: ["s-systems:video-storage", "must not move, organize, or retire that media"],
  },
  {
    file: skillPath("singleton-visualizer"),
    must: ["Next/Vercel       = active-week review dashboard", "Supabase          = queryable facts and routing registry"],
  },
  {
    file: skillPath("client-video-storyboard"),
    must: ["s-systems:lineups-editor", "Other clients keep their"],
  },
  {
    file: skillPath("lineups-editor"),
    must: [
      "references/lineups-treatment-system.md",
      "references/lineups-episode-lifecycle.md",
      "references/lineups-corrections.md",
      "references/lineups-contract-gate.md",
      "lane, option, setting and engine",
    ],
  },
  {
    file: skillPath("eagle-skill"),
    must: ["references/lineups-asset-naming.md", "scripts/lineups-asset-gate.mjs", "locked gate in dry-run mode"],
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
  ...[
    ["lineups-treatment-system.md", ["SELECT", "ASSET", "BUILD", "TEAM", "REVIEW", "lineups-lanes.md", "design-registry.json"]],
    ["lineups-lanes.md", ["quick action photo", "quick stat", "stat breakdown", "Cinematic 2-up", "Simple comparison", "year-by-year", "asset swap", "recurring board"]],
    ["lineups-assets.md", ["action photography", "1920 x 1080", "real-alpha"]],
    ["lineups-review.md", ["pre-Premiere gate", "storyboard, artwork and motion in the episode's Studio project", "Complete Asana after review, delivery readback and Eagle filing pass", "linked Studio project after the Asana readback"]],
    ["lineups-selection.md", ["full-transcript discovery", "transcript-to-graphic copy", "pacing"]],
    ["lineups-build.md", ["engine choice after selection", "episode workspace", "motion engine", "team-stadium-depth.json", "first 6 seconds"]],
    ["lineups-team-routes.md", ["rank-card.sculpted-satin", "striped card background only"]],
  ].map(([name, must]) => ({file: path.join(pluginRoot, "skills", "lineups-editor", "references", name), must})),
  {
    file: path.join(pluginRoot, "skills", "lineups-editor", "references", "lineups-episode-lifecycle.md"),
    must: [
      "Each video is one episode project",
      "confirmed delivery deadline as the Asana due date",
      "locked Pre-Figma UI",
      "locked Post-Figma UI",
      "Shared code reads the active episode record",
      "When the Asana task is complete",
      "Cleanup cannot remove another active episode",
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
      "Auto Width or a hugging container",
      "safe-auto-layout-conversion",
      "accessibility-review",
      "Components` holds the only editable source",
      "Field Night",
      "1920 x 1080",
      "prune the page in the same pass",
    ],
  },
  {
    file: ".agents/skills/safe-auto-layout-conversion/SKILL.md",
    must: ["Preserve first", "Work inside-out", "visible geometry matches the reference"],
  },
  {
    file: ".agents/skills/file-hygiene/SKILL.md",
    must: ["Operator labels", "112 px or larger", "native frame-name label"],
  },
  {
    file: ".agents/skills/accessibility-review/SKILL.md",
    must: ["WCAG 2.2 AA", "static video", "Normal text needs 4.5:1"],
  },
  {
    file: ".agents/skills/layer-cleanup/SKILL.md",
    must: ["Audit first", "Rename by role", "Do not detach instances"],
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
  path.join(pluginRoot, "skills", "lineups-editor", "references", "lineups-treatment-system.md"),
  ...["selection", "lanes", "assets", "build", "review", "team-routes"].map(name => path.join(pluginRoot, "skills", "lineups-editor", "references", `lineups-${name}.md`)),
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
