import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { linkedQuery, quoteJsonb, resolveSupabaseCli } from "./lib/supabase-linked-cli.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "singleton-supabase-cli-"));
const fakeCli = path.join(root, "supabase");

try {
  assert.equal(resolveSupabaseCli({ SUPABASE_CLI_PATH: fakeCli }), fakeCli);
} catch (error) {
  assert.match(error.message, /was not found/);
}

fs.writeFileSync(
  fakeCli,
  `#!/bin/sh
printf '%s' '{"rows":[{"verified":true}],"warning":"untrusted"}'
`,
  { mode: 0o700 },
);

assert.equal(resolveSupabaseCli({ SUPABASE_CLI_PATH: fakeCli }), fakeCli);
assert.equal(quoteJsonb([{ owner: "Supabase" }], "fixture"), '$singleton_fixture$[{"owner":"Supabase"}]$singleton_fixture$::jsonb');
assert.deepEqual(
  linkedQuery("select true", {
    cliPath: fakeCli,
    root,
    environment: { PATH: process.env.PATH },
  }),
  [{ verified: true }],
);

fs.rmSync(root, { recursive: true, force: true });
console.log("Supabase linked CLI checks passed: explicit path, JSON quoting, and query envelope parsing.");
