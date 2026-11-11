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

test("an AI offer inquiry saves a linked Supabase record without Notion", async (t) => {
  const originalEnv = { ...process.env };
  process.env.SUPABASE_URL = "https://receipt.fixture.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "fixture-only";
  delete process.env.NOTION_API_KEY;
  t.after(() => { process.env = originalEnv; });
  let saved;
  t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(String(url), "https://receipt.fixture.invalid/rest/v1/rpc/record_client_inquiry");
    saved = JSON.parse(init.body);
    return Response.json([{ inquiry_id: "11111111-2222-4333-8444-555555555555", contact_id: 42 }]);
  });
  const form = new FormData();
  for (const [key, value] of Object.entries({ name: "Casey", email: "casey@example.com", aiWish: "Make weekly client follow-up easier.", helpfulContext: "", offer: "build-it-for-me", company: "" })) form.set(key,value);
  const response = await POST(new Request("https://singleton-systems.com/api/ai-intake", { method: "POST", body: form }));
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.delivery.owner,"Supabase");
  assert.equal(body.delivery.state,"delivered");
  assert.equal(body.delivery.recordId,"11111111-2222-4333-8444-555555555555");
  assert.equal(saved.p_form,"ai");
  assert.equal(saved.p_offer,"build-it-for-me");
  assert.equal(saved.p_details.aiWish,"Make weekly client follow-up easier.");
});

for (const failure of [null, 'upload', 'receipt']) {
  test(`voice memo delivery ${failure ? `keeps an honest receipt after ${failure} failure` : 'saves private audio before success'}`, async (t) => {
    const originalEnv = { ...process.env };
    process.env.SUPABASE_URL = 'https://receipt.fixture.invalid';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'fixture-only';
    t.after(() => { process.env = originalEnv; });
    const id='11111111-2222-4333-8444-555555555555';
    const updates=[];
    t.mock.method(globalThis,'fetch',async (url,init) => {
      const path=new URL(url).pathname;
      if(path==='/rest/v1/rpc/record_client_inquiry') {
        const input=JSON.parse(init.body);
        assert.equal(input.p_request_id,id);
        assert.equal(input.p_details.hasAudio,true);
        assert.match(input.p_details.audioSha256,/^[a-f0-9]{64}$/);
        return Response.json([{inquiry_id:id,contact_id:42}]);
      }
      if(path===`/storage/v1/object/ai-intake-voice-memos/${id}/memo.webm`) {
        assert.equal(init.headers['x-upsert'],'true');
        return Response.json({}, {status:failure==='upload'?503:200});
      }
      if(path==='/rest/v1/client_inquiries') {
        const update=JSON.parse(init.body); updates.push(update);
        if(failure==='receipt' && update.delivery_state==='delivered') return Response.json([]);
        return Response.json([{id,...update}]);
      }
      throw Error(`Unexpected request: ${url}`);
    });
    const form=new FormData();
    for(const [key,value] of Object.entries({requestId:id,name:'Casey',email:'casey@example.com',aiWish:'',helpfulContext:'Weekly follow ups',offer:'build-it-for-me',company:''})) form.set(key,value);
    form.set('audio',new File(['audio-fixture'],'memo.webm',{type:'audio/webm'}));
    const response=await POST(new Request('https://singleton-systems.com/api/ai-intake',{method:'POST',body:form}));
    const body=await response.json();
    assert.equal(response.status,failure?202:201);
    assert.equal(body.delivery.state,failure?'failed':'delivered');
    assert.equal(body.delivery.receipt.recordId,id);
    assert.equal(updates.at(-1).delivery_state,failure?'failed':'delivered');
  });
}

test('a missing database receipt never reports AI delivery',async t=>{
  const env={...process.env};
  process.env.SUPABASE_URL='https://receipt.fixture.invalid'; process.env.SUPABASE_SERVICE_ROLE_KEY='fixture-only';
  t.after(()=>{process.env=env;});
  t.mock.method(globalThis,'fetch',async()=>Response.json([]));
  t.mock.method(console,'error',()=>{});
  const form=new FormData();
  for(const [key,value] of Object.entries({name:'Casey',email:'casey@example.com',aiWish:'Weekly follow ups',offer:'build-it-for-me'}))form.set(key,value);
  const response=await POST(new Request('https://singleton-systems.com/api/ai-intake',{method:'POST',body:form}));
  assert.equal(response.status,500);
  assert.equal((await response.json()).delivery,undefined);
});
