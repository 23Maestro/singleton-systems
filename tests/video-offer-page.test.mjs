// Approved public seam: the rendered marketing page from a production build.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("a recording team can compare a free sample and two fixed video bundles", () => {
  const html = readFileSync(".next/server/app/index.html", "utf8");
  const page = html.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  assert.match(page, /Your Next Episode, Already on Brand/);
  for (const term of ["Free Test Edit", "$1,306", "$2,396", "4 long-form videos + 2 shorts", "8 long-form videos + 4 shorts", "20 finished minutes", "60 minutes of organized footage", "60 seconds", "30–45 seconds", "1080p", "caption file", "two revision rounds", "Frame.io", "50% deposit", "after approval, before final delivery", "$653", "$1,198", "$305", "$278", "$43", "per bundle"]) {
    assert.ok(page.includes(term), `buyers need the agreed scope: ${term}`);
  }
  for (const offer of ["free-test-edit", "four-video-bundle", "eight-video-bundle"]) {
    assert.ok(html.includes(`href="/video-inquiry?offer=${offer}"`), `${offer} should open a video inquiry`);
  }
  assert.ok(html.includes('href="/AI-consultant"'), "AI consulting remains reachable");
  for (const id of ["start", "portfolio", "tried", "real-problem", "how-it-starts", "what-i-fix", "reviews", "offers", "book"]) {
    assert.ok(html.includes(`id="${id}"`), `preserve the full design section: ${id}`);
  }
  assert.doesNotMatch(page, /First simple problem solved free|One More Workflow|wish AI|First AI fix/);
  assert.doesNotMatch(page, /\$500|\$750|\$2,000|credited toward|per month|\/month/);
});

test("search and sharing describe video editing while AI consulting keeps its own identity", () => {
  const page = readFileSync(".next/server/app/index.html", "utf8");
  assert.ok(page.includes("<title>Video Editing Services | Jerami Singleton</title>"), "video editing is the main site's identity");
  assert.ok(page.includes('<link rel="canonical" href="https://singleton-systems.com"'), "root keeps its production canonical");
  assert.match(page, /name="description" content="Video editing/);
  const schema = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const service = schema.find((entry) => entry["@type"] === "Service");
  assert.equal(service.name, "Video Editing Bundles");
  assert.equal(service.offers.length, 3);
  assert.deepEqual(service.offers.map((offer) => offer.price), [0, 1306, 2396]);
  assert.equal(service.offers.some((offer) => offer.priceSpecification), false);
  const ai = readFileSync(".next/server/app/AI-consultant.html", "utf8");
  assert.ok(ai.includes("<title>Jerami Singleton | AI Workflow Consultant</title>"));
  assert.ok(ai.includes('<link rel="canonical" href="https://singleton-systems.com/AI-consultant"'));
  const tampa = readFileSync(".next/server/app/tampa-ai-consultant.html", "utf8");
  assert.match(tampa, /name="twitter:title" content="AI Consultant in Tampa for Small Businesses/);
  assert.doesNotMatch(tampa, /name="twitter:title" content="Video Editing/);
  const sitemap = readFileSync(".next/server/app/sitemap.xml.body", "utf8");
  assert.ok(sitemap.includes("<loc>https://singleton-systems.com</loc>"));
  assert.ok(sitemap.includes("<loc>https://singleton-systems.com/AI-consultant</loc>"));
});

test("editing proof leads with sports and athlete highlights while preserving the existing samples", () => {
  const html = readFileSync(".next/server/app/index.html", "utf8").replace(/<script\b[\s\S]*?<\/script>/gi, "");
  const portfolio = html.match(/<section id="portfolio"[\s\S]*?<\/section>/)?.[0];
  assert.ok(portfolio, "editing samples have a portfolio section");
  const source = JSON.parse(readFileSync("docs/offer/2026-10-10-carrd-video-sources.json", "utf8"));
  for (const sample of source.records.filter((row) => row.role !== "client_testimonial")) {
    const url = `${sample.watch_url}${sample.start_seconds ? `&amp;t=${sample.start_seconds}s` : ""}`;
    assert.ok(portfolio.includes(`href="${url}"`), `direct playback for ${sample.title}`);
  }
  assert.equal((portfolio.split("<details")[0].match(/data-video-sample=/g) ?? []).length, 8);
  assert.equal((portfolio.match(/data-video-sample=/g) ?? []).length, 15);
  assert.doesNotMatch(portfolio, /HTtsQg2Mow4|<iframe/);
  const firstSamples = [...portfolio.matchAll(/data-video-sample="([^"]+)"/g)].slice(0, 3).map((match) => match[1]);
  assert.deepEqual(firstSamples, ["oI07KwkIIuQ", "TwVFo-mhHXs", "txnYIYJMs88"]);
  for (const id of ["oI07KwkIIuQ", "TwVFo-mhHXs", "NsK_vIA9m30"]) {
    assert.ok(portfolio.includes(`href="https://www.youtube.com/watch?v=${id}"`), "sports samples open their verified YouTube uploads");
  }
  assert.doesNotMatch(portfolio, /drive\.google\.com|Watch on Google Drive/);
  assert.match(portfolio, /Test edit · Basketball/);
  assert.match(portfolio, /Athlete Highlight Reels/);
  assert.match(portfolio, /Demo reel · Athlete highlights/);
  assert.match(html, /<section id="reviews"[\s\S]*?HTtsQg2Mow4[\s\S]*?<\/section>/);
  const graphicsProof = html.match(/<section id="real-problem"[\s\S]*?<\/section>/)?.[0];
  assert.ok(graphicsProof, "the recurring-style proof stays on the page");
  assert.match(graphicsProof, /Lineups Figma Graphics/);
  assert.equal((graphicsProof.match(/<video\b/g) ?? []).length, 1);
  assert.doesNotMatch(html, /Jaguars Finished Edit|jaguars-graphics\.mp4/);
});
