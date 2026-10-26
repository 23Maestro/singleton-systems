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

const { chromium } = require("@playwright/test");
const previewRoot = "https://singleton-website-preview.super-cedar-2285.chatgpt.site";
const workerPath = resolve(root, ".scratch/review-artifacts/sites/singleton-website-preview/dist/server/index.js");

test("a phone or desktop visitor selects each video offer and gets an honest submission result", async (t) => {
  const worker = (await import(pathToFileURL(workerPath).href)).default;
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const env = { ...process.env };
  process.env.NOTION_API_KEY = "fixture-only";
  process.env.NOTION_AI_INTAKE_DATA_SOURCE_ID = "fixture-data-source";
  t.after(() => { process.env = env; });
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.equal(String(url), "https://api.notion.com/v1/pages");
    return Response.json({ id: "11111111-2222-3333-4444-555555555555" });
  });
  for (const width of [375, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    let realDelivery = false;
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await context.route(previewRoot + "/**", async (route) => {
      const request = route.request();
      const req = new Request(request.url(), { method: request.method(), headers: request.headers(), ...(request.postDataBuffer() ? { body: request.postDataBuffer() } : {}) });
      const response = realDelivery && new URL(request.url()).pathname === "/api/video-intake" ? await POST(req) : await worker.fetch(req);
      await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) });
    });
    await page.goto(previewRoot, { waitUntil: "load" });
    for (const label of ["Lineups Figma Graphics", "Jaguars Finished Edit"]) {
      const video = page.getByLabel(label, { exact: true });
      await video.waitFor({ timeout: 3000 });
      assert.equal(await video.getAttribute("controls"), "", "visitors control playback");
      assert.equal(await video.getAttribute("autoplay"), null, "proof does not start moving before a visitor plays it");
      await video.evaluate((element) => element.play());
      await page.waitForFunction((name) => {
        const element = document.querySelector(`video[aria-label="${name}"]`);
        return element && element.currentTime > 0 && element.readyState >= 3;
      }, label);
      await video.evaluate((element) => { element.currentTime = 10; });
      await page.waitForFunction((name) => {
        const element = document.querySelector(`video[aria-label="${name}"]`);
        return element.currentTime >= 10 && !element.seeking && element.readyState >= 3;
      }, label);
      await video.evaluate((element) => element.pause());
    }
    const portfolio = page.locator("#portfolio");
    assert.equal(await portfolio.locator("[data-video-sample]:visible").count(), 8);
    assert.equal(await portfolio.locator("iframe").count(), 0, "players load only after a click");
    await portfolio.getByRole("button", { name: "Play NurseHub Course Lesson", exact: true }).click();
    assert.match(await portfolio.locator("iframe").first().getAttribute("src"), /youtube-nocookie.com\/embed\/txnYIYJMs88\?autoplay=1/);
    await portfolio.getByRole("button", { name: "Play Academic Page Walkthrough", exact: true }).click();
    assert.match(await portfolio.locator('iframe[title="Academic Page Walkthrough"]').getAttribute("src"), /start=131/);
    assert.match(await portfolio.locator('[data-video-sample="OiHYbc1MyqE"] a').getAttribute("href"), /&t=131s$/);
    await portfolio.locator("summary").click();
    assert.equal(await portfolio.locator("[data-video-sample]:visible").count(), 14);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `expanded portfolio fits ${width}px`);
    for (const offer of ["free-test-edit", "four-video-bundle", "eight-video-bundle"]) {
      await page.goto(previewRoot, { waitUntil: "load" });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `root fits ${width}px`);
      await page.locator(`#offers a[href="/video-inquiry?offer=${offer}"]`).click();
      await page.waitForURL(`**/video-inquiry?offer=${offer}`);
      await page.locator("select[name=offer]").waitFor();
      assert.equal(await page.locator("select[name=offer]").inputValue(), offer);
      await page.getByText("Review preview. Submissions open after the production launch.").waitFor();
      await page.getByLabel("Recording link or series brief").fill("Weekly educational series: https://example.com/episode");
      await page.getByLabel("Name", { exact: true }).fill("Casey");
      await page.getByLabel("Email", { exact: true }).fill("casey@example.com");
      await page.getByRole("button", { name: "Send my video inquiry" }).click();
      await page.locator("form [role=alert]").waitFor();
      assert.match(await page.locator("form [role=alert]").innerText(), /has not been sent/);
      assert.equal(await page.locator("input[name=email]").inputValue(), "casey@example.com", "a preview must retain the draft");
      realDelivery = true;
      await page.getByRole("button", { name: "Send my video inquiry" }).click();
      await page.getByRole("heading", { name: "Your Video Inquiry Is In" }).waitFor();
      assert.match(await page.getByRole("status").innerText(), /Video .* — \$/);
      realDelivery = false;
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `inquiry fits ${width}px`);
    }
    assert.deepEqual(errors, [], "no client exceptions during offer selection or submission");
    await context.close();
  }
});
