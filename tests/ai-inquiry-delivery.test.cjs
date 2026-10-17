// Public Request/Response seam; only Supabase and Notion HTTP are fixtures.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { registerHooks } = require("node:module");
const { resolve } = require("node:path");
const { fileURLToPath, pathToFileURL } = require("node:url");
const ts = require("typescript");

const root = resolve(__dirname, "..");
const hook = registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/")) {
      return { url: pathToFileURL(resolve(root, `${specifier.slice(2)}.ts`)).href, shortCircuit: true };
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith(pathToFileURL(`${root}/`).href) && url.endsWith(".ts")) {
      return {
        format: "commonjs",
        shortCircuit: true,
        source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
        }).outputText,
      };
    }
    return next(url, context);
  },
});
const { POST } = require("../app/api/ai-intake/route.ts");
hook.deregister();

test("an existing AI offer inquiry returns its owner delivery and durable receipt", async (t) => {
  const originalEnv = { ...process.env };
  process.env.SUPABASE_URL = "https://receipt.fixture.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "fixture-only";
  process.env.NOTION_API_KEY = "fixture-only";
  process.env.NOTION_AI_INTAKE_DATA_SOURCE_ID = "fixture-data-source";
  t.after(() => { process.env = originalEnv; });

  let ownerPage;
  t.mock.method(globalThis, "fetch", async (url, init) => {
    if (String(url) === "https://receipt.fixture.invalid/rest/v1/ai_intake_requests" && init.method === "POST") {
      return Response.json([{ ...JSON.parse(init.body), id: "receipt-123" }]);
    }
    if (String(url) === "https://api.notion.com/v1/pages") {
      ownerPage = JSON.parse(init.body);
      return Response.json({ id: "11111111-2222-3333-4444-555555555555" });
    }
    if (String(url) === "https://receipt.fixture.invalid/rest/v1/ai_intake_requests?id=eq.receipt-123" && init.method === "PATCH") {
      return new Response(null, { status: 204 });
    }
    throw new Error(`Unexpected external request: ${url}`);
  });

  const form = new FormData();
  for (const [key, value] of Object.entries({ name: "Casey", email: "casey@example.com", aiWish: "Make weekly client follow-up easier.", helpfulContext: "", offer: "build-it-for-me", company: "" })) {
    form.set(key, value);
  }
  const response = await POST(new Request("http://localhost/api/ai-intake", { method: "POST", body: form }));
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.deepEqual(body.delivery, {
    state: "delivered",
    owner: "Notion",
    recordId: "11111111-2222-3333-4444-555555555555",
    recordUrl: "https://app.notion.com/p/11111111222233334444555555555555",
    error: null,
    receipt: { state: "recorded", owner: "Supabase", recordId: "receipt-123", error: null },
  });
  assert.equal(ownerPage.properties.Offer.select.name, "One More Workflow — $500 one-time");
});
