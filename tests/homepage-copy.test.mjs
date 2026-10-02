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
  assert.ok(section.includes("Alex Hollis"), "Alex Hollis credited");
  assert.ok(section.includes("CEO, NurseHub"), "NurseHub role shown");
  assert.ok(section.includes("Upwork Client"), "Upwork Client label in Title Case");
  assert.ok(!section.includes("Upwork client"), "no lowercase Upwork client label");
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
      const quote = page.locator("#reviews [data-review-card] blockquote").first();
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

test("portfolio carousel names each video on its selector and explains the one showing", async () => {
  const page = visibleCopyOnly(await html("/"));
  const selectors = page.match(/<div[^>]*aria-label="Choose a project"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? "";
  for (const name of ["1-Click Follow-Up", "$300 Job. 2 Hours.", "AI Preps the Project", "140+ Videos. 6 Weeks."]) {
    assert.match(selectors, new RegExp(`<button[^>]*>[^<]*${name.replace(/[.$+]/g, "\\$&")}[^<]*</button>`), `no named selector for ${name}`);
  }
  assert.ok(
    page.includes("Their scheduling site was 15 years old. Every follow up took a pile of clicks."),
    "missing caption under the first video",
  );
});

test("search engines can tie the site to Jerami's and the brand's social profiles", async () => {
  const page = await html("/");
  for (const url of [
    "https://www.linkedin.com/in/jeramisingleton",
    "https://x.com/23Maestro_",
    "https://www.instagram.com/singleton.systems/",
    "https://www.tiktok.com/@singleton_systems",
  ]) assert.ok(page.includes(JSON.stringify(url)), `missing sameAs ${url}`);
});

test("homepage hero offers the free first problem and books a call", async () => {
  const page = visibleCopyOnly(await html("/"));
  const start = page.indexOf("data-hero");
  const hero = page.slice(start, page.indexOf("</section>", start));
  assert.ok(hero.includes("First simple problem solved free"), "hero kicker should name the free first problem");
  assert.match(hero, /<a[^>]*href="https:\/\/cal\.com\/[^"]+"[^>]*>Book a free call<\/a>/, "hero button should book a call on Cal.com");
  assert.ok(!hero.includes("Start with one thing"), "old kicker still in hero");
});

test("profile card and Person data show broadcast production since 2014 without naming a station", async () => {
  const page = await html("/");
  const text = textOf(visibleCopyOnly(page));
  assert.ok(text.includes("Broadcast Production since 2014"), "profile card missing broadcast years");
  assert.ok(!text.includes("WFLA"), "profile card should not name a station");
  assert.ok(page.includes('"name":"Broadcast Production Specialist"'), "Person data missing broadcast occupation");
});

test("no reading text renders under 16px on phone or desktop", async () => {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  try {
    for (const path of ["/", "/tampa-ai-consultant"]) {
      for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
        const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
        await page.goto(new URL(path, BASE_URL).href, { waitUntil: "load" });
        const small = await page.evaluate(() => {
          const found = [];
          for (const el of document.querySelectorAll("body *")) {
            // Product mockups in What I Fix are illustrations, not reading text.
            if (el.closest("[data-illustration], [aria-hidden='true'], script, style")) continue;
            const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
            if (!hasText || el.getClientRects().length === 0) continue;
            const size = parseFloat(getComputedStyle(el).fontSize);
            if (size < 16) found.push(`${size}px "${el.textContent.trim().slice(0, 40)}"`);
          }
          return found;
        });
        assert.deepEqual(small, [], `${path} at ${viewport.width}px has text under 16px`);
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
});

test("choosing each portfolio video announces its caption", async () => {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  const captions = {
    "1-Click Follow-Up": "I got it down to one tap from my phone.",
    "$300 Job. 2 Hours.": "a week ahead of schedule",
    "AI Preps the Project": "Most of the edit builds itself now.",
    "140+ Videos. 6 Weeks.": "I made 140+ videos in 6 weeks",
  };
  try {
    const page = await browser.newPage({ reducedMotion: "reduce" });
    await page.goto(new URL("/", BASE_URL).href, { waitUntil: "load" });
    const live = page.locator("#portfolio [aria-live]");
    for (const [name, caption] of Object.entries(captions)) {
      await page.locator('#portfolio [aria-label="Choose a project"]').getByRole("button", { name, exact: true }).click();
      assert.ok((await live.textContent()).includes(caption), `${name} caption not announced`);
    }
  } finally {
    await browser.close();
  }
});

test("each profile card line fits on one row on phone and desktop", async () => {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  try {
    for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
      const page = await browser.newPage({ viewport });
      await page.goto(new URL("/", BASE_URL).href, { waitUntil: "load" });
      const lines = page.locator("[data-profile-card] p span");
      assert.ok((await lines.count()) >= 4, "profile card lines not found");
      const wrapped = await lines.evaluateAll((spans) =>
        spans.filter((s) => s.getClientRects().length > 1).map((s) => s.textContent),
      );
      assert.deepEqual(wrapped, [], `profile card lines wrap at ${viewport.width}px`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
});

test("header uses one menu button at every width", async () => {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  try {
    for (const path of ["/", "/tampa-ai-consultant"]) {
      for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
        const page = await browser.newPage({ viewport });
        await page.goto(new URL(path, BASE_URL).href, { waitUntil: "load" });
        const header = page.locator("header").first();
        const button = header.getByLabel("Open navigation");
        assert.ok(await button.isVisible(), `${path} at ${viewport.width}px: no menu button`);
        const visibleLinks = await header.locator("nav a:visible").count();
        assert.equal(visibleLinks, 0, `${path} at ${viewport.width}px: nav links show before the menu opens`);
        await button.click();
        for (const label of ["Start", "Links", "Solutions", "How It Starts", "What I Fix", "Pricing", "Tampa", "Book"]) {
          assert.ok(await header.getByRole("link", { name: label, exact: true }).isVisible(), `${path} at ${viewport.width}px: ${label} missing from open menu`);
        }
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
});

test("hero owns its own framed section on both pages", async () => {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  try {
    for (const path of ["/", "/tampa-ai-consultant"]) {
      for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
        const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
        await page.goto(new URL(path, BASE_URL).href, { waitUntil: "load" });
        const where = `${path} at ${viewport.width}px`;
        const hero = page.locator("[data-hero]");
        assert.equal(await hero.count(), 1, `${where}: no hero section`);
        const facts = await hero.evaluate((el) => {
          const h1 = el.querySelector("h1");
          const pill = el.querySelector("[data-hero-pill]");
          const body = el.querySelector("[data-hero-body]");
          return {
            hasCard: !!el.querySelector("[data-profile-card]"),
            hasCarousel: !!el.querySelector("#portfolio"),
            pillText: pill?.textContent.trim() ?? "",
            pillBeforeH1: !!pill && !!h1 && !!(pill.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING),
            h1Size: h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0,
            bodyWidth: body ? body.getBoundingClientRect().width : 0,
            heroHeight: el.getBoundingClientRect().height,
            chip: el.querySelector("[data-hero-chip]")?.textContent.trim() ?? "",
          };
        });
        assert.ok(!facts.hasCard, `${where}: profile card still inside the hero`);
        assert.ok(!facts.hasCarousel, `${where}: carousel still inside the hero`);
        assert.equal(facts.pillText, "First simple problem solved free", `${where}: pill text`);
        assert.ok(facts.pillBeforeH1, `${where}: pill should sit above the headline`);
        assert.match(facts.chip, /Jerami Singleton · Tampa/, `${where}: photo chip`);
        if (viewport.width === 1440) {
          assert.ok(facts.h1Size >= 64, `${where}: headline ${facts.h1Size}px, want 64+`);
          assert.ok(facts.bodyWidth >= 500, `${where}: paragraph ${facts.bodyWidth}px wide, want 500+`);
          assert.ok(facts.heroHeight >= viewport.height * 0.7, `${where}: hero ${facts.heroHeight}px tall, want most of the screen`);
        }
        const card = page.locator("[data-profile-card]");
        assert.equal(await card.count(), 1, `${where}: profile card missing`);
        const cardAfterHero = await page.evaluate(() => {
          const hero = document.querySelector("[data-hero]");
          const card = document.querySelector("[data-profile-card]");
          return !!(hero.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING);
        });
        assert.ok(cardAfterHero, `${where}: profile card should follow the hero`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        assert.ok(overflow <= 0, `${where}: page scrolls sideways by ${overflow}px`);
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
});

test("menu closes after jumping to a section", async () => {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  try {
    for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
      const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
      await page.goto(new URL("/", BASE_URL).href, { waitUntil: "load" });
      const header = page.locator("header").first();
      await header.getByLabel("Open navigation").click();
      await header.getByRole("link", { name: "Pricing", exact: true }).click();
      await page.waitForTimeout(200);
      assert.equal(await header.locator("nav a:visible").count(), 0, `menu still open at ${viewport.width}px after a jump link`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
});
