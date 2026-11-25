import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const ledger = read("docs/operations/profile-copy.md").replaceAll("\\|", "|");
const site = read("app/site.ts");
const offers = read("lib/video-offers.ts");

const constant = (name) => site.match(new RegExp(`${name} =\\s*"([^"]+)"`))[1];

test("ledger carries the live site title and description", () => {
  for (const name of ["siteTitle", "siteDescription"]) {
    assert.ok(ledger.includes(constant(name)), `${name} changed in app/site.ts; update docs/operations/profile-copy.md`);
  }
});

test("ledger carries every profile link the site publishes", () => {
  for (const [url] of site.matchAll(/https:\/\/www\.(?:linkedin|instagram|tiktok)\.com\/[^"]+|https:\/\/x\.com\/[^"]+/g)) {
    assert.ok(ledger.includes(url), `${url} is missing from docs/operations/profile-copy.md`);
  }
});

test("ledger carries every paid bundle price", () => {
  for (const [, price] of offers.matchAll(/price: (\d+)/g)) {
    if (price === "0") continue;
    const dollars = `$${Number(price).toLocaleString("en-US")}`;
    assert.ok(ledger.includes(dollars), `${dollars} is missing from docs/operations/profile-copy.md`);
  }
});

test("every profile block fits its platform limit", () => {
  const blocks = [...ledger.matchAll(/```text (\S+) max=(\d+)\n([\s\S]*?)\n```/g)];
  assert.ok(blocks.length >= 7);
  for (const [, field, max, copy] of blocks) {
    assert.ok(copy.length <= Number(max), `${field} is ${copy.length} characters; the limit is ${max}`);
  }
});
