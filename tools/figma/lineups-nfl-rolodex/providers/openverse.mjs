const DEFAULT_BASE = "https://api.openverse.org/v1";
const MAX_RESULTS = 20;
const MAX_PREVIEW_BYTES = 12 * 1024 * 1024;
const ALLOWED_IMAGE_HOSTS = new Set([
  "api.openverse.org",
  "upload.wikimedia.org",
  "live.staticflickr.com",
]);

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function isOpenverseId(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isAllowedOpenverseImageUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (
      ALLOWED_IMAGE_HOSTS.has(url.hostname) || url.hostname.endsWith(".staticflickr.com")
    );
  } catch {
    return false;
  }
}

export function openverseSearchUrl({ query, team = "", role = "", limit = 12 }, base = DEFAULT_BASE) {
  const cleanQuery = String(query ?? "").trim();
  if (!cleanQuery) throw new Error("Enter a player or coach name.");
  const pageSize = Math.max(1, Math.min(MAX_RESULTS, Number(limit) || 12));
  const terms = [cleanQuery, team, role].map((value) => String(value ?? "").trim()).filter(Boolean);
  const url = new URL(`${base}/images/`);
  url.searchParams.set("q", terms.join(" "));
  url.searchParams.set("page_size", String(pageSize));
  url.searchParams.set("license_type", "commercial,modification");
  return url;
}

function confidenceFor(result, { query, team = "" }) {
  const title = normalize(result.title);
  const person = normalize(query);
  const teamName = normalize(team);
  let score = 0.35;
  if (title === person) score += 0.45;
  else if (title.includes(person)) score += 0.35;
  else if (person.split(" ").filter(Boolean).every((token) => title.includes(token))) score += 0.25;
  if (teamName && title.includes(teamName)) score += 0.1;
  if (result.source === "wikimedia") score += 0.05;
  if (Number(result.width) >= 1000 && Number(result.height) >= 1000) score += 0.05;
  return Math.min(1, Number(score.toFixed(2)));
}

function attributionFor(result) {
  const title = result.title || "Untitled image";
  const creator = result.creator || "Unknown creator";
  const license = [String(result.license || "unknown").toUpperCase(), result.license_version]
    .filter(Boolean)
    .join(" ");
  return `${title} — ${creator} — ${license}`;
}

export function normalizeOpenverseCandidate(result, context) {
  const warnings = [];
  if (!result.creator) warnings.push("Creator is missing.");
  if (!result.license_url) warnings.push("License URL is missing.");
  if (!result.foreign_landing_url) warnings.push("Source page is missing.");
  if (!result.width || !result.height) warnings.push("Image dimensions are missing.");

  return {
    id: `openverse:${result.id}`,
    externalId: result.id,
    provider: "Openverse",
    requestedPerson: String(context.query).trim(),
    title: result.title || "Untitled image",
    creator: result.creator || "Unknown creator",
    license: String(result.license || "unknown").toUpperCase(),
    licenseVersion: result.license_version || null,
    licenseUrl: result.license_url || null,
    attribution: attributionFor(result),
    source: result.source || result.provider || "unknown",
    sourcePageUrl: result.foreign_landing_url || result.detail_url || null,
    originalImageUrl: result.url || null,
    width: Number(result.width) || null,
    height: Number(result.height) || null,
    fileType: result.filetype || null,
    confidence: confidenceFor(result, context),
    warnings,
    needsReview: true,
    importStatus: "disabled-pending-approval",
    previewUrl: `/api/acquisition/openverse/${result.id}/preview`,
  };
}

async function openverseJson(url, fetchImpl) {
  const response = await fetchImpl(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Singleton-Systems-Lineups-Rolodex/0.1",
    },
  });
  const payload = await response.json();
  if (!response.ok) {
    const detail = payload?.detail || payload?.message || `Openverse returned ${response.status}`;
    throw new Error(detail);
  }
  return payload;
}

export async function searchOpenverse(options, { fetchImpl = fetch, base = DEFAULT_BASE } = {}) {
  const url = openverseSearchUrl(options, base);
  const payload = await openverseJson(url, fetchImpl);
  const candidates = (payload.results || [])
    .map((result) => normalizeOpenverseCandidate(result, options))
    .filter((candidate) => candidate.sourcePageUrl && candidate.originalImageUrl)
    .sort((left, right) => right.confidence - left.confidence || left.title.localeCompare(right.title));
  return {
    provider: "Openverse",
    total: Number(payload.result_count) || candidates.length,
    candidates,
    terms: url.searchParams.get("q"),
    importEnabled: false,
  };
}

export async function openversePreview(
  externalId,
  { fetchImpl = fetch, base = DEFAULT_BASE } = {},
) {
  if (!isOpenverseId(externalId)) throw new Error("Invalid Openverse image ID.");
  const detail = await openverseJson(new URL(`${base}/images/${externalId}/`), fetchImpl);
  const sources = [detail.thumbnail, detail.url].filter(isAllowedOpenverseImageUrl);
  if (!sources.length) throw new Error("Openverse returned no permitted preview host.");
  let response = null;
  for (const source of sources) {
    const candidate = await fetchImpl(source, {
      // Openverse's thumbnail endpoint returns 406 for the generic image/* media range.
      headers: { Accept: "*/*", "User-Agent": "Singleton-Systems-Lineups-Rolodex/0.1" },
    });
    if (candidate.ok) {
      response = candidate;
      break;
    }
  }
  if (!response) throw new Error("Openverse and the permitted source host did not return a preview.");
  const contentType = response.headers.get("content-type") || "application/octet-stream";
  if (!contentType.startsWith("image/")) throw new Error("Openverse preview was not an image.");
  const contentLength = Number(response.headers.get("content-length")) || 0;
  if (contentLength > MAX_PREVIEW_BYTES) throw new Error("Openverse preview is too large.");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > MAX_PREVIEW_BYTES) throw new Error("Openverse preview size is invalid.");
  return { bytes, contentType };
}
