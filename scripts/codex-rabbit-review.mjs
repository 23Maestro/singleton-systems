import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { hashValue } from "../lib/transactions/contract.mjs";
import { approveRepositoryReview, runRepositoryReview } from "../lib/reviews/engine.mjs";

function parseArgs(argv) {
  const args = { root: process.cwd(), config: null, state: null, passId: null, findings: null, approve: false, reviewer: null, evidence: null, json: false, allowIncomplete: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    const take = (label) => {
      const next = argv[++index];
      if (!next || next.startsWith("--")) throw new Error(`${label} requires a value`);
      return next;
    };
    if (value === "--repo") args.root = take("--repo");
    else if (value === "--config") args.config = take("--config");
    else if (value === "--state") args.state = take("--state");
    else if (value === "--pass") args.passId = take("--pass");
    else if (value === "--findings") args.findings = take("--findings");
    else if (value === "--approve") args.approve = true;
    else if (value === "--reviewer") args.reviewer = take("--reviewer");
    else if (value === "--evidence") args.evidence = take("--evidence");
    else if (value === "--json") args.json = true;
    else if (value === "--allow-incomplete") args.allowIncomplete = true;
    else throw new Error(`unknown argument ${value}`);
  }
  return args;
}

function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`${label} ${file}: ${error.message}`);
  }
}

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args.root);
const configPath = path.resolve(root, args.config ?? "config/reviews/singleton-systems.json");
const config = readJson(configPath, "cannot read config");
const statePath = args.state
  ? path.resolve(root, args.state)
  : path.join(os.tmpdir(), "singleton-systems", "reviews", `${hashValue(root).slice(0, 12)}-${config.reviewId}.json`);

let state;
if (args.approve) {
  state = await approveRepositoryReview({ root, config, statePath, reviewer: args.reviewer, evidence: args.evidence });
} else {
  if (!args.passId) throw new Error("--pass is required unless --approve is used");
  const findings = args.findings ? readJson(path.resolve(root, args.findings), "cannot read findings") : [];
  state = await runRepositoryReview({ root, config, statePath, passId: args.passId, findings });
}

if (args.json) {
  console.log(JSON.stringify({ statePath, state }, null, 2));
} else {
  const latestPass = state.passes.at(-1);
  console.log(`review ${state.reviewId}: ${state.status}`);
  if (latestPass) {
    console.log(`pass ${latestPass.passId}: ${latestPass.status}`);
    for (const check of latestPass.checks) console.log(`${check.status.padEnd(7)} ${check.checkId}`);
    for (const finding of latestPass.findings) console.log(`${finding.status.padEnd(8)} ${finding.file}:${finding.line} ${finding.risk}`);
  }
  console.log(`human approval: ${state.humanApproval.status}`);
  console.log(`receipts: ${state.receipts.length}`);
  console.log(`state: ${statePath}`);
  if (state.error) console.log(`incomplete: ${state.error}`);
}

if (state.status !== "approved" && !args.allowIncomplete) process.exitCode = 2;
