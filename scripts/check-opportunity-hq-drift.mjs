import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, "config/cerebral-registry.json"), "utf8"));
const pluginRoot = process.env.SYSTEMS_PLUGIN_ROOT || registry.plugin.source_path;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const skill = (name) => read(path.join(pluginRoot, "skills", name, "SKILL.md"));
const lanes = "Cash Jobs | Career Jobs | Freelance | Offer | Portfolio";

assert.match(read("docs/harness/README.md"), new RegExp(`\\[lane\\] ${lanes}`));
assert.match(skill("cerebral-router"), /career workflow state -> Opportunity HQ/);
assert.match(skill("cerebral-router"), /The dashboard reads owner state and opens owner links\./);
assert.match(skill("opportunity-hq-updater"), new RegExp(`lane: ${lanes}`));
assert.match(skill("opportunity-hq-updater"), /Portfolio -> proof tasks and assets/);

console.log(`Opportunity HQ contract check passed: ${lanes}`);
