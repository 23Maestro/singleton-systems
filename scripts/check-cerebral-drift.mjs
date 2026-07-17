import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, "config/cerebral-registry.json"), "utf8"));
const pluginRoot = process.env.SSYSTEMS_PLUGIN_ROOT || registry.plugin?.source_path || "/Users/singleton23/plugins/s-systems";
const skillPath = (skill) => path.join(pluginRoot, "skills", skill, "SKILL.md");
const staleBearRawCapture = ["Bear", "raw capture"].join(" ");
const staleBearQuickCapture = ["Bear is", "quick capture"].join(" ");
const staleBearRemainsArchive = ["Bear remains", "archive/import only"].join(" ");
const staleBearEqualsRawCapture = ["Bear =", "raw capture"].join(" ");
const staleBearCaptureOffload = ["Bear", "capture/offload"].join(" ");
const staleBearInbox = ["Bear", "#inbox"].join(" ");

const checks = [
  {
    file: "docs/integration-map.md",
    maxLines: 220,
    must: [
      "Lean index for where work belongs",
      "config/cerebral-registry.json",
      "docs/visual-system-contract.md",
      "docs/truth-matrix.md",
      "Platform -> Artist -> Attack -> Proof -> Post",
      "portfolio/harness.jsonl",
      "https://singleton-systems.com/decision-maps",
    ],
    mustNot: [
      "## Money Clock / Survival Context",
      "## Legacy ChatGPT Project Reference",
      "## App Quirks To Respect",
      "## Open Later",
    ],
  },
  {
    file: ".codex/hooks/cerebral_singleton_guard.py",
    must: [
      "drift_warnings",
      "Cerebral route:",
      "[preflight] Check registry, Homebrew, and repo-local npm facts",
      "Do not assert absence without verification evidence",
      "use Cerebral tags",
      "HTML comps should be readable human review surfaces",
      "triggerable project/bucket context packets",
      "ROUTING_SURFACES",
      "STALE_OWNER_PATTERNS",
    ],
    mustNot: [staleBearRawCapture, staleBearQuickCapture],
  },
  {
    file: skillPath("cerebral-router"),
    optionalExternal: true,
    must: [
      "## Cerebral Tags",
      "[shape] capture | task | sub-task | dependency | proof | command idea | operating rule | HTML comp",
      "project/bucket context like a container for attention",
    ],
    mustNot: ["## Clause Tags"],
  },
  {
    file: skillPath("tool-harness"),
    optionalExternal: true,
    must: [
      "Obsidian = raw capture",
      "Legacy Markdown exports = archive/import reference only",
      "## Triggerable Containers",
      "project/bucket -> context packet -> selected skills/tools -> review gate -> verified output",
      "isolated triggerable states per project/bucket",
    ],
    mustNot: ["background automation", staleBearEqualsRawCapture, staleBearRemainsArchive],
  },
  {
    file: skillPath("cerebral-router"),
    optionalExternal: true,
    must: [
      "Obsidian capture/offload",
      "raw thought / unclear / under 10 minutes\n  -> Obsidian `_Inbox`",
      "direct B2B lead / cold email / outbound sequence / ICP / objection\n  -> Opportunity HQ, agency-growth",
    ],
    mustNot: [staleBearInbox, staleBearCaptureOffload, staleBearQuickCapture],
  },
  {
    file: skillPath("singleton-visualizer"),
    optionalExternal: true,
    must: [
      "## HTML Comps / Playground Pattern",
      "https://github.com/christophschoeni/agent-html-artifacts",
      "human-facing review artifact",
      "self-contained\nHTML artifacts for long human-facing plans",
      "not become a second source of truth",
    ],
    mustNot: ["## Clause Tags"],
  },
  {
    file: skillPath("offer-proof-content"),
    optionalExternal: true,
    must: [
      "## Social Reference Variables",
      "reference_set = exactly 2 people per network",
      "attack_type = Jab | Feint | Haymaker",
      "Zander Whitehurst plus\nAishwarya Srinivasan",
      "## LinkedIn Gary Vee Rhythm",
      "Monday    Jab",
      "Friday    Haymaker",
    ],
    mustNot: [],
  },
  {
    file: skillPath("linkedin-content-creator"),
    optionalExternal: true,
    must: [
      "platform`, `reference_set`, `direct_style`, `post_format`, and `attack_type",
      "Zander Whitehurst and Aishwarya Srinivasan",
      "3:1:1 LinkedIn rhythm",
      "Wednesday Feint",
    ],
    mustNot: [],
  },
  {
    file: skillPath("instagram-curator"),
    optionalExternal: true,
    must: [
      "platform`, `reference_set`, `direct_style`, `post_format",
      "2 style references per network",
    ],
    mustNot: [],
  },
  {
    file: skillPath("ad-creative-strategist"),
    optionalExternal: true,
    must: [
      "distinguish social/style references\nfrom ad claims",
      "platform`, `reference_set`, `direct_style`, `post_format",
    ],
    mustNot: [],
  },
  {
    file: "docs/diagrams/2026-07-01-cerebral-system.html",
    must: ["2026-07-01 Cerebral System", "HTML Review Surface", "Triggerable States"],
    mustNot: ["clause", "Codex Brain"],
  },
  {
    file: "app/decision-maps/page.tsx",
    must: [
      'canonical: "/decision-maps"',
      'href: "/decision-maps/visual-daily-planning-wayfinder/"',
      'href: "/decision-maps/excalidraw-setup-pass/"',
    ],
    mustNot: [],
  },
  {
    file: "public/decision-maps/visual-daily-planning-wayfinder/index.html",
    sameAs: "docs/harness/visual-daily-planning-wayfinder.html",
    must: [],
    mustNot: [],
  },
  {
    file: "public/decision-maps/excalidraw-setup-pass/index.html",
    sameAs: "docs/harness/excalidraw-setup-pass.html",
    must: [],
    mustNot: [],
  },
];

const errors = [];
const skipped = [];

for (const check of checks) {
  const filePath = path.isAbsolute(check.file)
    ? check.file
    : path.join(root, check.file);

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
    if (!text.includes(snippet)) {
      errors.push(`${check.file}: missing ${JSON.stringify(snippet)}`);
    }
  }

  for (const snippet of check.mustNot) {
    if (text.includes(snippet)) {
      errors.push(`${check.file}: stale ${JSON.stringify(snippet)}`);
    }
  }

  if (check.maxLines) {
    const lines = text.split(/\r?\n/).length;
    if (lines > check.maxLines) {
      errors.push(`${check.file}: ${lines} lines exceeds ${check.maxLines}-line Cerebral gate`);
    }
  }

  if (check.sameAs) {
    const sourcePath = path.join(root, check.sameAs);
    const sourceText = fs.readFileSync(sourcePath, "utf8");
    if (text !== sourceText) {
      errors.push(`${check.file}: drifted from ${check.sameAs}; run npm run decision-maps:sync`);
    }
  }
}

if (skipped.length) {
  const message = `Skipped optional external Cerebral checks: ${skipped.join(", ")}`;
  if (process.env.CI || process.env.CEREBRAL_STRICT_EXTERNAL_CHECKS === "1") {
    errors.push(message);
  } else {
    console.warn(message);
  }
}

if (errors.length) {
  console.error("Cerebral drift check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Cerebral drift check passed.");
