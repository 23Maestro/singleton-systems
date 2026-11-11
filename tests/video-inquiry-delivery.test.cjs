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
const { POST: recruitingPost } = require("../app/api/recruiting-intake/route.ts");
hook.deregister();

test("a free test edit inquiry saves its offer and brief in Supabase", async (t) => {
  const env = { ...process.env };
  process.env.SUPABASE_URL = "https://receipt.fixture.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "fixture-only";
  delete process.env.NOTION_API_KEY;
  t.after(() => { process.env = env; });
  let saved;
  t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(String(url), "https://receipt.fixture.invalid/rest/v1/rpc/record_client_inquiry");
    saved = JSON.parse(init.body);
    return Response.json([{ inquiry_id: "11111111-2222-4333-8444-555555555555", contact_id: 42 }]);
  });
  const form = new FormData();
  for (const [key, value] of Object.entries({ name: "Casey", email: "casey@example.com", footage: "Weekly educational series. Recording: https://example.com/episode", offer: "free-test-edit", company: "" })) form.set(key, value);
  const response = await POST(new Request("https://singleton-systems.com/api/video-intake", { method: "POST", body: form }));
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.offer.value, "free-test-edit");
  assert.equal(body.delivery.state, "delivered");
  assert.equal(body.delivery.owner, "Supabase");
  assert.equal(body.delivery.recordId, "11111111-2222-4333-8444-555555555555");
  assert.equal(saved.p_form, "video");
  assert.equal(saved.p_offer, "free-test-edit");
  assert.equal(saved.p_details.footage, "Weekly educational series. Recording: https://example.com/episode");
});

test("a delivery failure never reports a sent video inquiry", async (t) => {
  const env = { ...process.env };
  process.env.SUPABASE_URL = "https://receipt.fixture.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "fixture-only";
  delete process.env.NOTION_API_KEY;
  t.after(() => { process.env = env; });
  t.mock.method(globalThis, "fetch", async () => Response.json({ message: "Unavailable" }, { status: 503 }));
  const form = new FormData();
  for (const [key,value] of Object.entries({name:"Casey",email:"casey@example.com",footage:"Weekly series",offer:"free-test-edit",company:""})) form.set(key,value);
  const response = await POST(new Request("https://singleton-systems.com/api/video-intake",{method:"POST",body:form}));
  assert.equal(response.status, 502);
  assert.equal((await response.json()).ok, undefined);
});

function recruitingRequest(overrides = {}) {
  const form = new FormData();
  const input = { name: "Casey", contact: "casey@example.com", sport: "Football", purpose: "Recruiting", footage: "Clips already picked", deadline: "", company: "", ...overrides };
  for (const [key, value] of Object.entries(input)) form.set(key, value);
  return new Request("https://singleton-systems.com/api/recruiting-intake", { method: "POST", body: form });
}

test("highlight requests preserve either email or phone contact in the inquiry queue", async (t) => {
  const env = { ...process.env };
  process.env.SUPABASE_URL = "https://receipt.fixture.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "fixture-only";
  delete process.env.NOTION_API_KEY;
  t.after(() => { process.env = env; });
  let ownerPage;
  t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(String(url), "https://receipt.fixture.invalid/rest/v1/rpc/record_client_inquiry");
    ownerPage = JSON.parse(init.body);
    return Response.json([{ inquiry_id: "11111111-2222-4333-8444-555555555555", contact_id: 42 }]);
  });
  for (const contact of ["casey@example.com", "+1 (813) 555-0123"]) {
    const response = await recruitingPost(recruitingRequest({ contact }));
    assert.equal(response.status, 201);
    assert.equal((await response.json()).delivery.state, "delivered");
    assert.equal(ownerPage.p_form, "recruiting");
    assert.equal(ownerPage.p_email ?? ownerPage.p_phone, contact);
    assert.equal(ownerPage.p_name, "Casey");
    assert.equal(ownerPage.p_details.sport, "Football");
    assert.equal(ownerPage.p_details.deadline, null);
  }
});

test("highlight requests reject invalid fields before contacting the queue", async (t) => {
  t.mock.method(globalThis, "fetch", async () => assert.fail("Invalid input must not reach Supabase"));
  for (const invalid of [{ name: " " }, { contact: "123" }, { contact: "bad-email" }, { purpose: "Anything" }, { footage: "Anything" }, { deadline: "2026-02-30" }, { company: "spam" }]) {
    const response = await recruitingPost(recruitingRequest(invalid));
    assert.equal(response.status, 400);
  }
});

test("a failed highlight delivery returns an error without a success receipt", async (t) => {
  const env = { ...process.env };
  process.env.SUPABASE_URL = "https://receipt.fixture.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "fixture-only";
  delete process.env.NOTION_API_KEY;
  t.after(() => { process.env = env; });
  t.mock.method(globalThis, "fetch", async () => Response.json({ message: "Unavailable" }, { status: 503 }));
  const response = await recruitingPost(recruitingRequest());
  assert.equal(response.status, 502);
  assert.equal((await response.json()).delivery, undefined);
});
