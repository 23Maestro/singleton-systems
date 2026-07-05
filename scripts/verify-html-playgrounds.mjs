import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = process.cwd();
const defaultDir = path.join(root, "docs/diagrams/html-playground-samples");
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(defaultDir)
      .filter((name) => name.endsWith(".html"))
      .map((name) => path.join(defaultDir, name));

if (files.length === 0) {
  throw new Error("No playground HTML files provided or found in default sample folder.");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function checkViewport(page, file, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForLoadState("domcontentloaded");

  const readable = await page.locator("[data-playground]").boundingBox();
  assert(readable && readable.width > 250 && readable.height > 250, `${file}: initial viewport is not readable at ${viewport.width}px`);

  const overflowing = await page.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll("body *")) {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;
      const text = (el.textContent || "").trim();
      if (!text) continue;
      if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 4) {
        bad.push({
          tag: el.tagName.toLowerCase(),
          text: text.slice(0, 80),
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight
        });
      }
    }
    return bad.slice(0, 10);
  });
  assert(overflowing.length === 0, `${file}: visible text overflow at ${viewport.width}px ${JSON.stringify(overflowing)}`);
}

async function verifyFile(browser, file) {
  assert(fs.existsSync(file), `${file}: file does not exist`);
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForLoadState("domcontentloaded");

  assert(await page.locator("[data-playground]").count() === 1, `${file}: missing data-playground root`);
  assert(await page.locator("[data-controls-panel]").count() === 1, `${file}: missing controls panel`);
  assert(await page.locator("[data-preview]").count() === 1, `${file}: missing live preview`);
  assert(await page.locator("[data-prompt-output]").count() === 1, `${file}: missing prompt output`);
  assert(await page.locator("[data-copy-prompt]").count() === 1, `${file}: missing copy button`);

  const presetCount = await page.locator("[data-preset]").count();
  assert(presetCount >= 3 && presetCount <= 5, `${file}: expected 3-5 presets, found ${presetCount}`);

  const controlCount = await page.locator("[data-control]").count();
  assert(controlCount > 0, `${file}: expected at least one control`);

  const beforePreview = await page.locator("[data-preview]").innerHTML();
  const beforePrompt = await page.locator("[data-prompt-output]").textContent();
  let controlChangedPreview = false;
  let controlChangedPrompt = false;
  for (let index = 0; index < controlCount; index += 1) {
    const control = page.locator("[data-control]").nth(index);
    const tagName = await control.evaluate((el) => el.tagName.toLowerCase());
    const type = await control.getAttribute("type");
    if (tagName === "select") {
      const current = await control.inputValue();
      const options = await control.locator("option").evaluateAll((options) => options.map((option) => option.value));
      const next = options.find((option) => option !== current) || options[0];
      await control.selectOption(next);
    } else if (type === "checkbox") {
      await control.click();
    } else {
      const current = await control.inputValue();
      const min = await control.getAttribute("min");
      const max = await control.getAttribute("max");
      const next = current === max ? (min || "1") : (max || "3");
      await control.fill(next);
      await control.dispatchEvent("input");
    }
    await page.waitForTimeout(50);
    const afterPreview = await page.locator("[data-preview]").innerHTML();
    const afterPrompt = await page.locator("[data-prompt-output]").textContent();
    controlChangedPreview ||= afterPreview !== beforePreview;
    controlChangedPrompt ||= afterPrompt !== beforePrompt;
    if (controlChangedPreview && controlChangedPrompt) break;
  }

  assert(controlChangedPreview, `${file}: changing controls did not update preview`);
  assert(controlChangedPrompt, `${file}: changing controls did not update prompt output`);

  await page.locator("[data-preset]").last().click();
  await page.waitForTimeout(50);
  assert((await page.locator("[data-prompt-output]").textContent()).trim().length > 20, `${file}: preset left prompt empty`);

  await page.locator("[data-copy-prompt]").click();
  await page.waitForTimeout(50);
  const copied = await page.locator("[data-copy-prompt]").evaluate((button) => button.dataset.copied === "true" || button.textContent.includes("Copied"));
  assert(copied, `${file}: copy button is not wired with copied feedback`);

  assert(consoleErrors.length === 0, `${file}: console errors ${JSON.stringify(consoleErrors)}`);
  await context.close();

  const viewportPage = await browser.newPage();
  await checkViewport(viewportPage, file, { width: 1280, height: 900 });
  await checkViewport(viewportPage, file, { width: 390, height: 844 });
  await viewportPage.close();

  console.log(`verified ${file}`);
}

const browser = await chromium.launch();
try {
  for (const file of files) {
    await verifyFile(browser, file);
  }
} finally {
  await browser.close();
}
