import assert from "node:assert/strict";
import { existsSync } from "node:fs";

// These pages ship together. A partial worktree must not silently drop a surface.
for (const file of [
  "app/fitness/page.tsx",
  "app/finances/page.tsx",
  "app/finances-form/page.tsx",
  "app/dashboard/page.tsx",
  "app/command-center/page.tsx",
  "app/api/fitness/route.ts",
  "app/api/finances/ledger/route.ts",
  "app/api/command-center/route.ts",
]) {
  assert.ok(existsSync(new URL(`../${file}`, import.meta.url)), `Personal endpoint missing: ${file}`);
}
console.log("Personal endpoints are present in this release.");

// Optional live readback uses no cookies or credentials and never changes data.
const base = process.argv[2];
if (base) {
  for (const route of [
    "/fitness", "/finances", "/finances-form", "/dashboard", "/command-center",
    "/api/fitness", "/api/finances/ledger", "/api/command-center",
    "/api/fitness/session", "/api/finances/session", "/api/command-center/session",
  ]) {
    const response = await fetch(new URL(route, base), { signal: AbortSignal.timeout(45000) });
    assert.equal(response.status, 200, `${route} must open without a cookie`);
    assert.equal(response.headers.get("set-cookie"), null, `${route} must not require a login cookie`);
    if (route.startsWith("/api/")) {
      const data = await response.json();
      assert.ok(data && typeof data === "object", `${route} must return data`);
      if (route.endsWith("/session")) assert.equal(data.access, "open");
    }
    console.log(`PASS ${route}: 200 without cookies`);
  }
}
