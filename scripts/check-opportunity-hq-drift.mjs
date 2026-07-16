import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "config/cerebral-registry.json");
const registry = fs.existsSync(registryPath)
  ? JSON.parse(fs.readFileSync(registryPath, "utf8"))
  : {};
const pluginRoot = process.env.SSYSTEMS_PLUGIN_ROOT || registry.plugin?.source_path || "/Users/singleton23/plugins/s-systems";
const skillPath = (skill) => path.join(pluginRoot, "skills", skill, "SKILL.md");
const careerHqRoot = process.env.CAREER_HQ_ROOT || "/Users/singleton23/Raycast/career-hq";
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
    file: skillPath("cerebral-router"),
    optionalExternal: true,
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
    file: skillPath("singleton-systems"),
    optionalExternal: true,
    must: [
      "opportunity-hq-updater shape durable project and task work",
      "Do not repeat their procedures here.",
    ],
    mustNot: [
      "Proof -> proof tasks and assets",
      "Applications, Freelance, Singleton, and Proof should be views of the task database.",
    ],
  },
  {
    file: skillPath("opportunity-hq-updater"),
    optionalExternal: true,
    must: [laneList, "Portfolio -> proof tasks and assets"],
    mustNot: ["Offer\nProof", "Proof -> proof tasks and assets"],
  },
  {
    file: path.join(careerHqRoot, "src/lib/config.ts"),
    optionalExternal: true,
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
    if (check.optionalExternal && error.code === "ENOENT") {
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
