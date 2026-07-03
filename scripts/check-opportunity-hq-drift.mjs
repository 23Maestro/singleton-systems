import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contractPath = path.join(root, "docs/harness/README.md");
const contract = fs.readFileSync(contractPath, "utf8");
const laneMatch = contract.match(/\[lane\] ([^\n]+)/);

if (!laneMatch) {
  fail(["docs/harness/README.md is missing the [lane] contract"]);
}

const lanes = laneMatch[1].split("|").map((lane) => lane.trim());
const laneText = lanes.join(" | ");
const laneList = lanes.join("\n");

const checks = [
  {
    file: "docs/harness/README.md",
    must: [`[lane] ${laneText}`],
    mustNot: [],
  },
  {
    file: "docs/harness/02_routing/README.md",
    must: [`[lane] ${laneText}`],
    mustNot: [],
  },
  {
    file: "docs/home-hub.md",
    must: [laneList, "Portfolio -> portfolio tasks and assets"],
    mustNot: ["Proof -> proof tasks and assets"],
  },
  {
    file: "docs/integration-map.md",
    must: ["portfolio/harness.jsonl"],
    mustNot: ["proof/harness.jsonl"],
  },
  {
    file: "/Users/singleton23/.codex/skills/cerebral-router/SKILL.md",
    must: [
      "Opportunity HQ owns the five durable project lanes: `Cash Jobs`, `Career Jobs`,\n  `Freelance`, `Offer`, `Portfolio`.",
      "Applications, Freelance, Singleton, and Portfolio should be",
    ],
    mustNot: [
      "`Freelance`, `Offer`, `Proof`.",
      "Applications, Freelance, Singleton, and Proof should be",
    ],
  },
  {
    file: "/Users/singleton23/.codex/skills/singleton-systems/SKILL.md",
    must: [
      laneList,
      "Portfolio -> portfolio tasks and assets",
      "Money Priority = Strategic for Offer and Portfolio",
      "Applications, Freelance, Singleton, and Portfolio should be views of the task database.",
    ],
    mustNot: [
      "Offer\nProof",
      "Proof -> proof tasks and assets",
      "Money Priority = Strategic for Offer and Proof",
      "Applications, Freelance, Singleton, and Proof should be views of the task database.",
    ],
  },
  {
    file: "/Users/singleton23/.codex/skills/opportunity-hq-updater/SKILL.md",
    must: [laneList, "Portfolio -> portfolio tasks and assets"],
    mustNot: ["Offer\nProof", "Proof -> proof tasks and assets"],
  },
  {
    file: "/Users/singleton23/Raycast/career-hq/src/lib/config.ts",
    must: lanes.map((lane) => `"${lane}"`).concat(["export const PROJECT_LANES = ["]),
    mustNot: ['"Proof",'],
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
  fail(errors);
}

console.log(`Opportunity HQ drift check passed: ${laneText}`);

function fail(errors) {
  console.error("Opportunity HQ drift check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}
