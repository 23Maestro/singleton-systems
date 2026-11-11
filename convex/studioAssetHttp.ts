import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { hexDigest, readStudioAssetTicket, studioAssetKey } from "../lib/studio-assets";

function serveAsset(blob: Blob, contentType: string, range: string | null, headers: Record<string, string>) {
  const mediaHeaders = new Headers({ ...headers, "Content-Type": contentType, "Accept-Ranges": "bytes" });
  const parts = range?.match(/^bytes=(\d*)-(\d*)$/);
  if (!parts || (!parts[1] && !parts[2])) return new Response(blob, { headers: mediaHeaders });
  const start = parts[1] ? Number(parts[1]) : Math.max(0, blob.size - Number(parts[2]));
  const end = parts[1] && parts[2] ? Math.min(blob.size - 1, Number(parts[2])) : blob.size - 1;
  if (start >= blob.size || end < start) {
    mediaHeaders.set("Content-Range", `bytes */${blob.size}`);
    return new Response(null, { status: 416, headers: mediaHeaders });
  }
  mediaHeaders.set("Content-Range", `bytes ${start}-${end}/${blob.size}`);
  return new Response(blob.slice(start, end + 1), { status: 206, headers: mediaHeaders });
}

export const studioAssetHttp = httpAction(async (ctx, request) => {
  const token = process.env.VIDEO_REVIEW_BACKEND_TOKEN;
  const authorization = request.headers.get("authorization") ?? "";
  if (!token || token.length < 32) return new Response("Unauthorized", { status: 401 });
  const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  try {
    if (request.method === "GET") {
      if (authorization !== `Bearer ${token}`) return new Response("Unauthorized", { status: 401 });
      const key = studioAssetKey.parse(Object.fromEntries(new URL(request.url).searchParams));
      const row = await ctx.runQuery(internal.studioProjects.getAsset, key);
      const blob = row && await ctx.storage.get(row.storageId);
      return blob && row ? serveAsset(blob, row.contentType, request.headers.get("range"), headers)
        : new Response("Asset not found", { status: 404, headers });
    }
    const upload = authorization.startsWith("Studio ") && await readStudioAssetTicket(authorization.slice(7), token);
    if (!upload) return new Response("Unauthorized", { status: 401 });
    if (request.headers.get("content-length") !== String(upload.bytes) ||
        request.headers.get("content-type") !== upload.contentType) {
      return new Response("Upload metadata does not match", { status: 400, headers });
    }
    const key = { projectId: upload.projectId, sha256: upload.sha256 };
    if (await ctx.runQuery(internal.studioProjects.getAsset, key)) return Response.json(key, { headers });
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength !== upload.bytes || hexDigest(await crypto.subtle.digest("SHA-256", bytes)) !== upload.sha256) {
      return new Response("Upload bytes do not match", { status: 400, headers });
    }
    const storageId = await ctx.storage.store(new Blob([bytes], { type: upload.contentType }));
    try {
      const saved = await ctx.runMutation(internal.studioProjects.saveAsset, { ...key, contentType: upload.contentType, storageId });
      if (!saved) await ctx.storage.delete(storageId);
    } catch {
      const saved = await ctx.runQuery(internal.studioProjects.getAsset, key);
      if (saved?.storageId !== storageId) {
        await ctx.storage.delete(storageId);
        return new Response("Project is unavailable", { status: 409, headers });
      }
    }
    return Response.json(key, { headers });
  } catch {
    return new Response("Invalid Studio asset", { status: 400, headers });
  }
});
