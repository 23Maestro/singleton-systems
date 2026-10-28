import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { createInterface } from "node:readline";
import fs from "node:fs";
import path from "node:path";
import { repoSkillRows } from "./lib/repo-skill-registry.mjs";

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, "config/cerebral-registry.json"), "utf8"));
const rows = repoSkillRows(root, registry.skills);
const server = spawn(process.execPath, [path.join(root, "tests/fixtures/cerebral-registry-http.mjs")], { stdio: ["pipe", "pipe", "inherit"] });
const lines = createInterface({ input: server.stdout });
const address = once(lines, "line");
server.stdin.end(JSON.stringify({ routes: registry.routes, skills: rows, capabilities: registry.capabilities }));
const [url] = await address;
try {
  for (const prompt of ["Prepare the next Lineups episode", "Prepare the Max Intent Solutions client video storyboard", "Prepare another client video storyboard"]) {
    const result = spawnSync(process.env.PYTHON || "python3", [path.join(root, ".codex/hooks/cerebral_singleton_guard.py")], {
      cwd: root,
      input: JSON.stringify({ hook_event_name: "UserPromptSubmit", cwd: root, prompt }),
      encoding: "utf8",
      env: { ...process.env, SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: "test-registry", SUPABASE_ANON_KEY: "" },
      timeout: 10000,
    });
    assert.equal(result.status, 0, result.stderr);
    const packet = JSON.parse(result.stdout).hookSpecificOutput.additionalContext;
    if (prompt.includes("Lineups")) {
      assert.match(packet, /\[tools\] s-systems:lineups-editor \+ s-systems:eagle/);
      const skill = rows.find(row => row.skill_key === "lineups-editor");
      assert.ok(skill);
      assert.ok(fs.existsSync(path.join(root, skill.canonical_path, "SKILL.md")));
    } else {
      assert.match(packet, /\[tools\] s-systems:client-video-storyboard \+ s-systems:eagle/);
      assert.doesNotMatch(packet, /s-systems:lineups-editor|\[profile\] Catena Media Lineups|\[menu\] Use the seven approved lanes/);
    }
  }
  console.log("Lineups and other-client routing passes through the HTTP registry.");
} finally {
  lines.close();
  const stopped = once(server, "exit");
  server.kill("SIGTERM");
  await stopped;
}
