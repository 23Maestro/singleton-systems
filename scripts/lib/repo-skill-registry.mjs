import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const skillParents = [".agents/skills", "plugins/s-systems/skills", "skills"];

export function repoSkillRows(root, configuredSkills = []) {
  const configured = new Map(configuredSkills.map((skill) => [skill.skill_key, skill]));
  const rows = [];
  const seen = new Set();

  for (const parent of skillParents) {
    for (const entry of fs.readdirSync(path.join(root, parent), { withFileTypes: true })) {
      const canonicalPath = path.posix.join(parent, entry.name);
      if (!fs.existsSync(path.join(root, canonicalPath, "SKILL.md"))) continue;
      assert.ok(!seen.has(entry.name), `duplicate repository skill key: ${entry.name}`);
      seen.add(entry.name);
      const metadata = configured.get(entry.name);
      rows.push({
        skill_key: entry.name,
        activation: metadata?.activation ?? "core",
        reason: metadata?.reason ?? "Repository skill.",
        canonical_path: canonicalPath,
      });
    }
  }

  for (const skill of configuredSkills) {
    assert.ok(seen.has(skill.skill_key), `configured skill missing from repository: ${skill.skill_key}`);
  }
  return rows.sort((left, right) => left.canonical_path.localeCompare(right.canonical_path));
}
