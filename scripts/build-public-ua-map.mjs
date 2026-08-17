import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const source = path.join(root, ".ua/knowledge-graph.json");
const output = path.join(root, "public/visual-maps/singleton-system");
const base = "/visual-maps/singleton-system/";

function stop(message) {
  console.error(message);
  process.exit(1);
}

const uaCandidates = [
  process.env.UNDERSTAND_ANYTHING_ROOT,
  path.join(os.homedir(), ".claude/plugins/marketplaces/understand-anything/understand-anything-plugin"),
  path.join(os.homedir(), ".understand-anything-plugin"),
].filter(Boolean);

const uaRoot = uaCandidates.find((candidate) =>
  fs.existsSync(path.join(candidate, "packages/dashboard/vite.config.demo.ts")) &&
  fs.existsSync(path.join(candidate, "packages/core/dist/index.js")),
);

if (!uaRoot) stop("Official Understand Anything dashboard was not found. No replacement surface was used.");
if (!fs.existsSync(source)) stop(`UA graph was not found: ${source}`);

const original = JSON.parse(fs.readFileSync(source, "utf8"));
const nodes = original.nodes
  .filter((node) => !node.id.startsWith("file:"))
  .map(({ filePath, lineRange, languageNotes, ...node }) => node);
const nodeIds = new Set(nodes.map((node) => node.id));
const edges = original.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
const layers = original.layers
  .map((layer) => ({ ...layer, nodeIds: layer.nodeIds.filter((id) => nodeIds.has(id)) }))
  .filter((layer) => layer.nodeIds.length > 0);
const tour = original.tour
  .map((step) => ({ ...step, nodeIds: step.nodeIds.filter((id) => nodeIds.has(id)) }))
  .filter((step) => step.nodeIds.length > 0);

const publicGraph = {
  ...original,
  project: {
    ...original.project,
    name: "Singleton Systems",
    description: "How requests move through routing, verified tools, work lanes, and delivery checks.",
    languages: [],
    frameworks: [],
    gitCommitHash: "",
  },
  nodes,
  edges,
  layers,
  tour,
};

const core = await import(pathToFileURL(path.join(uaRoot, "packages/core/dist/index.js")).href);
const validated = core.validateGraph(publicGraph);
if (!validated.success || !validated.data) {
  stop(`Official UA validation failed: ${validated.fatal || JSON.stringify(validated.issues)}`);
}

const dashboardRoot = path.join(uaRoot, "packages/dashboard");
const build = spawnSync(
  "pnpm",
  ["exec", "vite", "build", "--config", "vite.config.demo.ts", "--base", base, "--outDir", output, "--emptyOutDir"],
  { cwd: dashboardRoot, encoding: "utf8", stdio: "inherit" },
);
if (build.status !== 0) stop(`Official UA dashboard build failed with exit ${build.status}.`);

fs.writeFileSync(path.join(output, "knowledge-graph.json"), `${JSON.stringify(validated.data, null, 2)}\n`);
fs.writeFileSync(path.join(output, "robots.txt"), "User-agent: *\nAllow: /\n");

console.log(`Public UA map built: ${nodes.length} nodes, ${edges.length} edges, ${layers.length} layers, ${tour.length} tour steps.`);
