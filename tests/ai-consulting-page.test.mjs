// Approved seams: rendered routes/navigation, inquiry requests/receipts, metadata/sitemap.
// Run against the app: BASE_URL=http://127.0.0.1:3999 node --test tests/ai-consulting-page.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3999";
const preserved = JSON.parse(readFileSync(new URL("./fixtures/ai-consulting-homepage-2026-10-09.json", import.meta.url), "utf8"));

async function html(path) {
  const response = await fetch(new URL(path, baseUrl));
  assert.equal(response.status, 200, `${path} should be available`);
  return response.text();
}

function pageContent(page) {
  const main = page.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "";
  return main
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<header\b[\s\S]*?<\/header>/gi, "")
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, "");
}

test("AI consulting page preserves every homepage section and offer", async () => {
  const content = pageContent(await html("/AI-consultant"));
  const text = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  assert.equal(text, preserved.text, "the complete pre-pivot reading copy should survive");
  assert.deepEqual(
    [...content.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1]),
    preserved.sections,
    "all sections should remain in their original order",
  );
  assert.deepEqual(
    [...content.matchAll(/<(?:video|source)\b[^>]*\b(?:src|poster)="([^"]+)"/g)].map((match) => match[1]),
    preserved.media,
    "existing portfolio media should remain available",
  );
});

test("AI navigation and inquiry return links stay on the AI consulting site", async () => {
  for (const path of ["/AI-consultant", "/tampa-ai-consultant"]) {
    const page = await html(path);
    const header = page.match(/<header\b[\s\S]*?<\/header>/)?.[0] ?? "";
    for (const section of ["start", "portfolio", "how-it-starts", "what-i-fix", "offers", "book"]) {
      assert.ok(header.includes(`href="/AI-consultant#${section}"`), `${path} should keep ${section} in AI consulting`);
    }
  }
  const inquiry = await html("/ai-workflow-session?offer=build-it-for-me");
  assert.match(inquiry, /<a[^>]*href="\/AI-consultant"/, "the inquiry should return to AI consulting");
  assert.match(inquiry, /<option value="build-it-for-me" selected=""/, "the selected AI offer should survive navigation");
});

test("AI consulting has a self-referencing canonical and sitemap entry", async () => {
  const page = await html("/AI-consultant");
  const url = "https://singleton-systems.com/AI-consultant";
  assert.ok(page.includes(`<link rel="canonical" href="${url}"`), "canonical should identify the preserved page");
  assert.ok(page.includes(`<meta property="og:url" content="${url}"`), "sharing should open AI consulting");
  assert.ok(page.includes("<title>Jerami Singleton | AI Workflow Consultant</title>"), "AI identity should survive the homepage pivot");
  const jsonLd = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? "null");
  const service = jsonLd.find((entity) => entity["@type"] === "Service");
  assert.equal(service.url, url, "the AI service should have its own URL");
  assert.equal(service["@id"], `${url}#service`, "the AI service should not share the video service identity");
  const webpage = jsonLd.find((entity) => entity["@type"] === "WebPage");
  assert.equal(webpage.url, url, "structured data should describe this AI page");
  const sitemap = await html("/sitemap.xml");
  assert.ok(sitemap.includes(`<loc>${url}</loc>`), "AI consulting should be discoverable in the sitemap");
});
