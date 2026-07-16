import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Covers the two new Cerebral registry Supabase scripts (seed-cerebral-registry.mjs,
// verify-cerebral-registry-live.mjs) and the package.json wiring added by this PR. The scripts
// themselves talk to a live Supabase project, so these tests only exercise the credential guard
// clauses -- they never perform a real network round trip against a reachable host.

const root = process.cwd();

function withoutSupabaseEnv(overrides = {}) {
  const env = { ...process.env, ...overrides };
  delete env.SUPABASE_URL;
  delete env.SUPABASE_SERVICE_ROLE_KEY;
  delete env.SUPABASE_ANON_KEY;
  return { ...env, ...overrides };
}

function runScript(scriptRelativePath, env) {
  return spawnSync("node", [path.join(root, scriptRelativePath)], { cwd: root, env, encoding: "utf8" });
}

// 1. seed-cerebral-registry.mjs refuses to run without service-role credentials.
{
  const result = runScript("scripts/seed-cerebral-registry.mjs", withoutSupabaseEnv());
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding the Cerebral registry\./);
  assert.equal(result.stdout, "");
}

// 2. seed-cerebral-registry.mjs also refuses with only a URL and no service key.
{
  const result = runScript("scripts/seed-cerebral-registry.mjs", withoutSupabaseEnv({ SUPABASE_URL: "https://example.supabase.co" }));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/);
}

// 3. verify-cerebral-registry-live.mjs refuses to run without any Supabase credentials.
{
  const result = runScript("scripts/verify-cerebral-registry-live.mjs", withoutSupabaseEnv());
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Set SUPABASE_URL plus SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY before live verification\./);
  assert.equal(result.stdout, "");
}

// 4. verify-cerebral-registry-live.mjs accepts an anon key alone (service role key is optional):
//    the credential guard must not fire, so the script fails later while attempting the actual
//    network request against the deliberately-unreachable "bad port" loopback address instead.
{
  const result = runScript(
    "scripts/verify-cerebral-registry-live.mjs",
    withoutSupabaseEnv({ SUPABASE_URL: "http://127.0.0.1:1", SUPABASE_ANON_KEY: "anon-only" }),
  );
  assert.notEqual(result.status, 0, "the unreachable host must still fail the script");
  assert.doesNotMatch(
    result.stderr,
    /Set SUPABASE_URL plus SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY/,
    "an anon key alone must satisfy the credential guard",
  );
}

// 5. package.json chains the new Cerebral checks into the aggregate `npm test` command.
{
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const testScript = pkg.scripts.test;
  for (const command of ["check:drift", "check:cerebral", "check:cerebral:hook-routing", "check:cerebral:registry"]) {
    assert.ok(testScript.includes(`npm run ${command}`), `npm test must run ${command}`);
  }
}

// 6. Each new/changed Cerebral npm script points at a file that actually exists in the repo.
{
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const expected = {
    "check:cerebral": "scripts/check-cerebral-drift.mjs",
    "check:cerebral:hook-routing": "scripts/check-cerebral-hook-routing.mjs",
    "check:cerebral:registry": "scripts/check-cerebral-registry.mjs",
    "seed:cerebral:registry": "scripts/seed-cerebral-registry.mjs",
    "verify:cerebral:registry": "scripts/verify-cerebral-registry-live.mjs",
  };
  for (const [scriptName, filePath] of Object.entries(expected)) {
    assert.ok(pkg.scripts[scriptName], `package.json is missing the ${scriptName} script`);
    assert.ok(pkg.scripts[scriptName].includes(filePath), `${scriptName} must invoke ${filePath}`);
    assert.ok(fs.existsSync(path.join(root, filePath)), `${filePath} referenced by ${scriptName} must exist on disk`);
  }
}

console.log("Cerebral registry script guard check passed.");