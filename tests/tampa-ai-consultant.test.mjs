// Seam tests for 23M-206: Tampa AI consultant landing page.
// Run against a running build: BASE_URL=http://localhost:3999 node --test tests/tampa-ai-consultant.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3999";
const PAGE_PATH = "/tampa-ai-consultant";
const CANONICAL = "https://singleton-systems.com/tampa-ai-consultant";
const CAL_BOOKING = "https://cal.com/workflow-chat/15min";

async function get(path) {
  const res = await fetch(new URL(path, BASE_URL), { redirect: "manual" });
  return { status: res.status, headers: res.headers, html: await res.text() };
}

function jsonLdBlocks(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  return blocks.flatMap(([, raw]) => {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  });
}

test("Tampa buyer landing on the page sees a Tampa AI consultant page that search engines may index", async () => {
  const { status, headers, html } = await get(PAGE_PATH);
  assert.equal(status, 200);
  assert.equal(headers.get("x-robots-tag"), null, "page must not send X-Robots-Tag");
  assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/);

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  assert.match(title, /AI Consultant/);
  assert.match(title, /Tampa/);

  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map(([, inner]) => inner.replace(/<[^>]+>/g, ""));
  assert.equal(h1s.length, 1, "exactly one H1");
  assert.match(h1s[0], /AI Consultant/);
  assert.match(h1s[0], /Tampa/);

  assert.match(html, new RegExp(`<link rel="canonical" href="${CANONICAL}"/?>`));
});

test("Tampa buyer can book a call from the page", async () => {
  const { html } = await get(PAGE_PATH);
  assert.ok(html.includes(`href="${CAL_BOOKING}"`), "booking link to Cal.com");
});

test("Search engines get FAQ answers for at least five buyer questions", async () => {
  const { html } = await get(PAGE_PATH);
  const faq = jsonLdBlocks(html).find((block) => block["@type"] === "FAQPage");
  assert.ok(faq, "FAQPage JSON-LD present");
  assert.ok(faq.mainEntity.length >= 5, `expected 5+ questions, got ${faq.mainEntity.length}`);
  for (const q of faq.mainEntity) {
    assert.ok(q.name && q.acceptedAnswer?.text, "each question has an answer");
  }
});

test("Sitemap lists the Tampa page", async () => {
  const { html } = await get("/sitemap.xml");
  assert.ok(html.includes(`<loc>${CANONICAL}</loc>`));
});

test("Tampa buyer sees that the first call is free", async () => {
  const { html } = await get(PAGE_PATH);
  assert.match(html, /Book a free 15 minute call/);
});

for (const privatePath of ["/fitness", "/dashboard", "/command-center", "/home-tasks"]) {
  test(`Search engines are told not to index ${privatePath}`, async () => {
    const { headers } = await get(privatePath);
    assert.match(headers.get("x-robots-tag") ?? "", /noindex/);
  });
}

test("Tampa buyer sees the $75 credit applies to any package within 14 days", async () => {
  const { html } = await get(PAGE_PATH);
  assert.match(html, /Choose any package within 14 days and the \$75 comes off the price\./);
});

test("Tampa page uses the same site header, reviews, pricing, and booking sections as the homepage", async () => {
  const { html } = await get(PAGE_PATH);
  assert.match(html, /aria-label="Primary"/, "shared desktop nav");
  assert.match(html, /aria-label="Singleton Systems home"/, "shared logo link");
  for (const id of ["reviews", "offers", "book"]) assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
});

test("Search engines see Keep It Working as a monthly price", async () => {
  const { html } = await get(PAGE_PATH);
  const service = jsonLdBlocks(html).find((block) => block["@type"] === "Service");
  const monthly = service.offers.find((offer) => offer.name === "Keep It Working");
  assert.equal(monthly.priceSpecification?.unitText, "MONTH");
  assert.equal(String(monthly.priceSpecification?.price), "500");
});
