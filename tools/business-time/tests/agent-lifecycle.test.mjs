import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test from "node:test";

const run = promisify(execFile);
const executable = fileURLToPath(new URL("../native-agent/.build/Business Time Agent.app/Contents/MacOS/BusinessTimeAgent", import.meta.url));

test("the independent agent reports its own app identity without enabling collection or login launch", async () => {
  const { stdout, stderr } = await run(executable, ["diagnostics"], { timeout: 5000 });
  assert.equal(stderr, "");
  const result = JSON.parse(stdout);
  assert.equal(result.apiVersion, 1);
  assert.equal(result.bundleIdentifier, "com.singleton-systems.business-time.agent");
  assert.equal(result.trackingEnabled, false);
  assert.equal(result.loginLaunchEnabled, false);
  assert.ok(["notRegistered", "requiresApproval", "notFound"].includes(result.loginStatus));
  assert.equal(typeof result.accessibilityTrusted, "boolean");
});
