import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  isAllowedOrigin,
  isSafeItemId,
  matchesMetadata,
  metadataHaystack,
  normalize,
} from "../server.mjs";
import {
  isAllowedOpenverseImageUrl,
  isOpenverseId,
  normalizeOpenverseCandidate,
  openverseSearchUrl,
  searchOpenverse,
} from "../providers/openverse.mjs";

const item = {
  eagleId: "MSI0PT87ED4O2",
  currentName: "23_PatrickMahomes_ChargersGame1",
  proposedPersonName: "Patrick Mahomes",
  team: "Kansas City Chiefs",
  role: "player",
  position: "QB",
  imageContext: "game action",
  aliases: ["Mahomes", "Chiefs quarterback"],
};

test("normalizes names and positions", () => {
  assert.equal(normalize("  Patrick_Mahomes — QB  "), "patrick mahomes qb");
  assert.match(metadataHaystack(item), /kansas city chiefs/);
});

test("matches every query token against sidecar metadata", () => {
  assert.equal(matchesMetadata(item, "Mahomes QB"), true);
  assert.equal(matchesMetadata(item, "Chiefs coach"), false);
});

test("accepts only Eagle-shaped IDs", () => {
  assert.equal(isSafeItemId("MSI0PT87ED4O2"), true);
  assert.equal(isSafeItemId("../../metadata.json"), false);
});

test("restricts browser origins to Figma and null sandbox origins", () => {
  assert.equal(isAllowedOrigin("https://www.figma.com"), true);
  assert.equal(isAllowedOrigin("null"), true);
  assert.equal(isAllowedOrigin("https://example.com"), false);
});

test("bridge source contains no Eagle mutation endpoint", async () => {
  const source = await readFile(new URL("../server.mjs", import.meta.url), "utf8");
  const forbidden = [
    "/api/item/add",
    "/api/item/update",
    "/api/item/moveToTrash",
    "/api/item/moveToFolder",
    "/api/folder/add",
    "/api/folder/update",
  ];

  for (const endpoint of forbidden) {
    assert.equal(source.includes(endpoint), false, `${endpoint} must remain absent`);
  }

  assert.match(source, /request\.method !== "GET"/);
});

test("builds an anonymous commercial-use Openverse search", () => {
  const url = openverseSearchUrl({ query: "Dak Prescott", team: "Dallas Cowboys", limit: 100 });
  assert.equal(url.origin, "https://api.openverse.org");
  assert.equal(url.searchParams.get("q"), "Dak Prescott Dallas Cowboys");
  assert.equal(url.searchParams.get("page_size"), "20");
  assert.equal(url.searchParams.get("license_type"), "commercial,modification");
});

test("normalizes licensed Openverse candidates for review", () => {
  const candidate = normalizeOpenverseCandidate({
    id: "41b54988-3eb3-4be7-b0d0-8fd56f492268",
    title: "Dak Prescott WAS @ DAL 2021 (cropped)",
    creator: "All-Pro Reels",
    license: "by-sa",
    license_version: "2.0",
    license_url: "https://creativecommons.org/licenses/by-sa/2.0/",
    foreign_landing_url: "https://commons.wikimedia.org/example",
    url: "https://upload.wikimedia.org/example.jpg",
    width: 1200,
    height: 1775,
    source: "wikimedia",
  }, { query: "Dak Prescott", team: "Dallas Cowboys" });
  assert.equal(candidate.provider, "Openverse");
  assert.equal(candidate.license, "BY-SA");
  assert.equal(candidate.importStatus, "disabled-pending-approval");
  assert.match(candidate.previewUrl, /41b54988/);
});

test("searches Openverse through an injectable HTTP client", async () => {
  const fetchImpl = async () => new Response(JSON.stringify({
    result_count: 1,
    results: [{
      id: "41b54988-3eb3-4be7-b0d0-8fd56f492268",
      title: "Dak Prescott",
      creator: "Photographer",
      license: "by",
      license_version: "4.0",
      license_url: "https://creativecommons.org/licenses/by/4.0/",
      foreign_landing_url: "https://commons.wikimedia.org/example",
      url: "https://upload.wikimedia.org/example.jpg",
      width: 1600,
      height: 2400,
      source: "wikimedia",
    }],
  }), { status: 200, headers: { "content-type": "application/json" } });
  const result = await searchOpenverse({ query: "Dak Prescott" }, { fetchImpl });
  assert.equal(result.total, 1);
  assert.equal(result.candidates[0].requestedPerson, "Dak Prescott");
  assert.equal(result.importEnabled, false);
});

test("accepts only Openverse UUIDs", () => {
  assert.equal(isOpenverseId("41b54988-3eb3-4be7-b0d0-8fd56f492268"), true);
  assert.equal(isOpenverseId("../../metadata.json"), false);
});

test("restricts Openverse preview fallback hosts", () => {
  assert.equal(isAllowedOpenverseImageUrl("https://upload.wikimedia.org/example.jpg"), true);
  assert.equal(isAllowedOpenverseImageUrl("https://live.staticflickr.com/example.jpg"), true);
  assert.equal(isAllowedOpenverseImageUrl("http://127.0.0.1:41595/api/v2/item/get"), false);
  assert.equal(isAllowedOpenverseImageUrl("https://example.com/image.jpg"), false);
});
