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
const { POST } = require("../app/api/video-intake/route.ts");
hook.deregister();

test("a free test edit inquiry returns the selected offer and its durable owner record", async (t) => {
  const env = { ...process.env };
  process.env.NOTION_API_KEY = "fixture-only";
  process.env.NOTION_AI_INTAKE_DATA_SOURCE_ID = "fixture-data-source";
  t.after(() => { process.env = env; });
  let ownerPage;
  t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(String(url), "https://api.notion.com/v1/pages");
    ownerPage = JSON.parse(init.body);
    return Response.json({ id: "11111111-2222-3333-4444-555555555555" });
  });
  const form = new FormData();
  for (const [key, value] of Object.entries({ name: "Casey", email: "casey@example.com", footage: "Weekly educational series. Recording: https://example.com/episode", offer: "free-test-edit", company: "" })) form.set(key, value);
  const response = await POST(new Request("https://singleton-systems.com/api/video-intake", { method: "POST", body: form }));
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.offer.value, "free-test-edit");
  assert.equal(body.offer.label, "Video test edit — $0");
  assert.equal(body.delivery.state, "delivered");
  assert.equal(body.delivery.owner, "Notion");
  assert.equal(body.delivery.recordId, "11111111-2222-3333-4444-555555555555");
  assert.equal(ownerPage.properties.Name.title[0].text.content, "Casey — Video test edit — $0");
  assert.ok(JSON.stringify(ownerPage.children).includes("Weekly educational series"));
});

test("a delivery failure never reports a sent video inquiry", async (t) => {
  const env = { ...process.env };
  process.env.NOTION_API_KEY = "fixture-only";
  process.env.NOTION_AI_INTAKE_DATA_SOURCE_ID = "fixture-data-source";
  t.after(() => { process.env = env; });
  t.mock.method(globalThis, "fetch", async () => Response.json({ message: "Unavailable" }, { status: 503 }));
  const form = new FormData();
  for (const [key,value] of Object.entries({name:"Casey",email:"casey@example.com",footage:"Weekly series",offer:"free-test-edit",company:""})) form.set(key,value);
  const response = await POST(new Request("https://singleton-systems.com/api/video-intake",{method:"POST",body:form}));
  assert.equal(response.status, 502);
  assert.equal((await response.json()).ok, undefined);
});
