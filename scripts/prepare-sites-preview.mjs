import assert from "node:assert/strict";
import { cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Package only public marketing routes. Production owns server forms and data.
const root = fileURLToPath(new URL("../", import.meta.url));
const config = JSON.parse(readFileSync(path.join(root, "config/website-preview.json"), "utf8"));
const checkout = path.resolve(root, config.checkout);
assert.ok(checkout.startsWith(path.join(root, ".scratch/review-artifacts/sites/")));
const manifestPath = path.join(checkout, ".openai/hosting.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
assert.equal(manifest.project_id, config.project_id, "Reuse the registered Site identity");

// Keep links to production-only pages outside Next's preview router.
function productionLinks(source) {
  return source.replaceAll("/ai-workflow-session", `${config.production_origin}/ai-workflow-session`)
    .replaceAll('href="/links"', `href="${config.production_origin}/links"`)
    .replaceAll('\\"href\\":\\"/links\\"', `\\"href\\":\\"${config.production_origin}/links\\"`)
    .replaceAll('"href":"/links"', `"href":"${config.production_origin}/links"`);
}

const pages = {};
const publicAssets = new Set();
const imagePaths = new Set();
for (const route of config.routes) {
  assert.ok(["/", "/AI-consultant", "/tampa-ai-consultant", "/video-inquiry"].includes(route));
  const sourceName = route === "/" ? "index" : route.slice(1);
  const html = productionLinks(readFileSync(path.join(root, `.next/server/app/${sourceName}.html`), "utf8"));
  const rsc = productionLinks(readFileSync(path.join(root, `.next/server/app/${sourceName}.rsc`), "utf8"));
  assert.ok(html.includes("<main"), `${route} needs a completed Next build`);
  pages[route] = { html, rsc };
  for (const match of html.matchAll(/(?:src|href|poster)="(\/[^"]+)"/g)) {
    const url = new URL(match[1].replaceAll("&amp;", "&"), config.production_origin);
    if (url.pathname === "/_next/image") imagePaths.add(url.searchParams.get("url"));
    else if (!url.pathname.startsWith("/_next/") && /\.[a-z0-9]+$/i.test(url.pathname)) publicAssets.add(url.pathname);
  }
}

const assets = {};
const mime = { ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".json": "application/json", ".mp4": "video/mp4", ".jpg": "image/jpeg" };
function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(filename);
    else {
      const relative = path.relative(path.join(root, ".next/static"), filename).split(path.sep).join("/");
      assets[`/_next/static/${relative}`] = { type: mime[path.extname(filename)] ?? "application/octet-stream", bytes: readFileSync(filename).toString("base64") };
    }
  }
}
collect(path.join(root, ".next/static"));

// New proof media is not on production yet. Ship only this intentional asset set.
for (const name of ["catena-figma-reel.mp4", "catena-figma-reel-poster.jpg", "lineups-reel-poster.jpg", "wemby-test-edit-poster.jpg"]) {
  const filename = path.join(root, "public/portfolio/video-offer", name);
  const bytes = readFileSync(filename);
  assert.ok(bytes.length <= 25 * 1024 * 1024, "Website media must stay within the delivery asset limit");
  assets[`/portfolio/video-offer/${name}`] = { type: mime[path.extname(name)], bytes: bytes.toString("base64") };
}

const worker = `// Built marketing preview. No credentials, server APIs, or personal pages.
const pages = ${JSON.stringify(pages)};
const assets = ${JSON.stringify(assets)};
const publicAssets = new Set(${JSON.stringify([...publicAssets])});
const imagePaths = new Set(${JSON.stringify([...imagePaths])});
const production = ${JSON.stringify(config.production_origin)};
export default {
  async fetch(request) {
    if (request.method === "POST" && new URL(request.url).pathname === "/api/video-intake") return Response.json({ preview: true }, { status: 409 });
    if (!["GET", "HEAD"].includes(request.method)) return new Response("Preview is read-only", { status: 405 });
    const url = new URL(request.url);
    const pathname = url.pathname === "/" ? "/" : url.pathname.replace(/\\/$/, "");
    const headers = { "X-Robots-Tag": "noindex, nofollow" };
    if (pathname === "/robots.txt") return new Response("User-agent: *\\nDisallow: /\\n", { headers: { ...headers, "Content-Type": "text/plain" } });
    if (pathname === "/ai-workflow-session" || pathname === "/links") return Response.redirect(new URL(url.pathname + url.search, production).href, 302);
    if (assets[pathname]) {
      const asset = assets[pathname];
      const bytes = Uint8Array.from(atob(asset.bytes), c => c.charCodeAt(0));
      const assetHeaders = { ...headers, "Content-Type": asset.type, "Content-Length": String(bytes.length), "Cache-Control": pathname.startsWith("/_next/") ? "public, max-age=31536000, immutable" : "no-cache" };
      if (asset.type === "video/mp4") assetHeaders["Accept-Ranges"] = "bytes";
      const range = request.method === "GET" && asset.type === "video/mp4" && request.headers.get("range");
      if (range) {
        const match = /^bytes=(\\d*)-(\\d*)$/.exec(range);
        let start = match && match[1] ? Number(match[1]) : 0;
        let end = match && match[2] ? Number(match[2]) : bytes.length - 1;
        if (match && !match[1] && match[2]) { start = Math.max(0, bytes.length - Number(match[2])); end = bytes.length - 1; }
        if (!match || (!match[1] && !match[2]) || start > end || start >= bytes.length) return new Response(null, { status: 416, headers: { ...headers, "Content-Range": "bytes */" + bytes.length } });
        end = Math.min(end, bytes.length - 1);
        return new Response(bytes.slice(start, end + 1), { status: 206, headers: { ...assetHeaders, "Content-Length": String(end - start + 1), "Content-Range": "bytes " + start + "-" + end + "/" + bytes.length } });
      }
      return new Response(request.method === "HEAD" ? null : bytes, { headers: assetHeaders });
    }
    if (publicAssets.has(pathname) || (pathname === "/_next/image" && imagePaths.has(url.searchParams.get("url")))) return Response.redirect(new URL(url.pathname + url.search, production).href, 302);
    if (!pages[pathname]) return new Response("Not found", { status: 404, headers });
    const isRsc = request.headers.get("rsc") === "1";
    return new Response(request.method === "HEAD" ? null : pages[pathname][isRsc ? "rsc" : "html"], { headers: { ...headers, "Content-Type": isRsc ? "text/x-component; charset=utf-8" : "text/html; charset=utf-8", "Cache-Control": "no-store", "Vary": "RSC" } });
  }
};
`;

mkdirSync(path.join(checkout, "worker"), { recursive: true });
writeFileSync(path.join(checkout, "worker/index.js"), worker);
writeFileSync(path.join(checkout, "package.json"), `${JSON.stringify({ private: true, type: "module", scripts: { build: "bash scripts/build.sh && node scripts/validate-artifact.mjs" } }, null, 2)}\n`);
const starterScripts = "/Users/singleton23/.codex/plugins/cache/openai-curated-remote/sites/1.1.2/skills/sites/templates/worker-esm-starter/scripts";
cpSync(starterScripts, path.join(checkout, "scripts"), { recursive: true });
delete manifest.static;
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(path.join(checkout, "README.md"), "# Singleton Systems website preview\n\nA private Sites preview of the built public marketing pages.\n\nThe source website stays in the Singleton Systems repository. Regenerate this\ncheckout with `node scripts/prepare-sites-preview.mjs` from that repository\nafter a successful Next build. This checkout contains no environment files or\nserver credentials. AI inquiry links open the production form. Video inquiries are review-only until the Vercel launch.\n");
console.log(JSON.stringify({ checkout, project_id: config.project_id, routes: Object.keys(pages), assetCount: Object.keys(assets).length, workerBytes: Buffer.byteLength(worker) }));
