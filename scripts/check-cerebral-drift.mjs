import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const staleBearRawCapture = ["Bear", "raw capture"].join(" ");
const staleBearQuickCapture = ["Bear is", "quick capture"].join(" ");
const staleBearRemainsArchive = ["Bear remains", "archive/import only"].join(" ");
const staleBearEqualsRawCapture = ["Bear =", "raw capture"].join(" ");
const staleBearCaptureOffload = ["Bear", "capture/offload"].join(" ");
const staleBearInbox = ["Bear", "#inbox"].join(" ");

const checks = [
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
    file: "/Users/singleton23/plugins/s-systems/skills/cerebral-router/SKILL.md",
    must: [
      "## Cerebral Tags",
      "[shape] capture | task | sub-task | dependency | proof | command idea | operating rule | HTML comp",
      "project/bucket context like a container for attention",
    ],
    mustNot: ["## Clause Tags"],
  },
  {
    file: "/Users/singleton23/plugins/s-systems/skills/tool-harness/SKILL.md",
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
    file: "/Users/singleton23/plugins/s-systems/skills/cerebral-router/SKILL.md",
    must: [
      "Obsidian capture/offload",
      "raw thought / unclear / under 10 minutes\n  -> Obsidian `_Inbox`",
      "direct B2B lead / cold email / outbound sequence / ICP / objection\n  -> Opportunity HQ, agency-growth",
    ],
    mustNot: [staleBearInbox, staleBearCaptureOffload, staleBearQuickCapture],
  },
  {
    file: "/Users/singleton23/plugins/s-systems/skills/singleton-visualizer/SKILL.md",
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
    file: "/Users/singleton23/plugins/s-systems/skills/offer-proof-content/SKILL.md",
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
    file: "/Users/singleton23/plugins/s-systems/skills/linkedin-content-creator/SKILL.md",
    must: [
      "platform`, `reference_set`, `direct_style`, `post_format`, and `attack_type",
      "Zander Whitehurst and Aishwarya Srinivasan",
      "3:1:1 LinkedIn rhythm",
      "Wednesday Feint",
    ],
    mustNot: [],
  },
  {
    file: "/Users/singleton23/plugins/s-systems/skills/instagram-curator/SKILL.md",
    must: [
      "platform`, `reference_set`, `direct_style`, `post_format",
      "2 style references per network",
    ],
    mustNot: [],
  },
  {
    file: "/Users/singleton23/plugins/s-systems/skills/ad-creative-strategist/SKILL.md",
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
];

const errors = [];

for (const check of checks) {
  const filePath = path.isAbsolute(check.file)
    ? check.file
    : path.join(root, check.file);

  let text = "";
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (error) {
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
}

if (errors.length) {
  console.error("Cerebral drift check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Cerebral drift check passed.");
