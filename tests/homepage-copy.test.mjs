// Seam tests for the buyer-order homepage and outbound copy humanizing.
// Run against a running build: BASE_URL=http://localhost:3999 node --test tests/homepage-copy.test.mjs
// Writing rules source: docs/harness/writing-rules.md (enforced by scripts/check-tells.mjs, the same
// checker the Codex Stop hook runs on outbound writing).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3999";

async function html(path) {
  const res = await fetch(new URL(path, BASE_URL));
  assert.equal(res.status, 200, `${path} returned ${res.status}`);
  return res.text();
}

function visibleCopyOnly(page) {
  // Drop JSON-LD and Next.js payload scripts; check-tells strips remaining markup itself.
  return page.replace(/<script\b[\s\S]*?<\/script>/gi, "");
}

for (const path of ["/", "/tampa-ai-consultant"]) {
  test(`${path} copy passes the repo writing-tells check`, async () => {
    const dir = mkdtempSync(join(tmpdir(), "tells-"));
    const file = join(dir, "page.html");
    writeFileSync(file, visibleCopyOnly(await html(path)));
    const result = spawnSync(process.execPath, ["scripts/check-tells.mjs", file], { encoding: "utf8" });
    assert.equal(result.status, 0, `${path} writing tells:\n${result.stdout}${result.stderr}`);
  });
}

test("homepage tells the buyer story in order: problem, what they tried, real problem, proof, offer, booking", async () => {
  const page = await html("/");
  const order = ["start", "tried", "real-problem", "proof", "reviews", "offers", "book"];
  const positions = order.map((id) => page.indexOf(`id="${id}"`));
  for (const [i, id] of order.entries()) assert.ok(positions[i] >= 0, `missing section #${id}`);
  const sorted = [...positions].sort((a, b) => a - b);
  assert.deepEqual(positions, sorted, `sections out of order: ${order.join(" > ")}`);
});

test("homepage proof shows the Prospect ID output jump", async () => {
  const page = await html("/");
  assert.match(page, /My output went from 30 videos a month to 70, by myself\./);
});

const REVIEWS = [
  "Jerami is a very organized and efficient videographer. He always brought unique ideas and solutions, and his creativity showed me he always had a passion to get better.",
  "Jerami was a joy to work with. He was very communicative on deadlines, his schedule and questions regarding the project.",
  "Jerami was very quick to respond, personable and easy to work with.",
  "Very efficient work, done very well. Couldn't ask for anything more!",
  "Quick Response. Great Work. Very professional.",
];

function textOf(page) {
  return page
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&apos;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

test("homepage reviews show exact client words with who said them", async () => {
  const page = await html("/");
  const start = page.indexOf('id="reviews"');
  assert.ok(start >= 0, "reviews section present");
  const section = textOf(page.slice(start, page.indexOf("</section>", start)));
  for (const review of REVIEWS) assert.ok(section.includes(review), `missing review text: ${review.slice(0, 40)}`);
  assert.ok(section.includes("James Holcomb"), "James Holcomb credited");
  assert.ok(section.includes("NurseHub"), "NurseHub credited");
  assert.equal(section.match(/Upwork client/g)?.length ?? 0, 3, "three Upwork client labels");
  assert.match(page.slice(start), /src="[^"]*upwork-50\.png[^"]*"/, "Upwork logo from the email signature");
});

test("homepage links to the Tampa AI consultant page", async () => {
  const page = await html("/");
  assert.match(page, /href="\/tampa-ai-consultant"/);
});

test("reviews stay readable with JavaScript off and with reduced motion", async () => {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  try {
    for (const options of [{ javaScriptEnabled: false }, { reducedMotion: "reduce" }]) {
      const page = await browser.newPage(options);
      await page.goto(new URL("/", BASE_URL).href, { waitUntil: "load" });
      const quote = page.locator("#reviews blockquote").first();
      await quote.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const opacity = await quote.evaluate((el) => getComputedStyle(el).opacity);
      assert.equal(opacity, "1", `review hidden with ${JSON.stringify(options)}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
});
