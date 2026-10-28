import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { frameNoteSchema, reviewId, reviewRenderInputSchema, reviewRenderSchema } from "../lib/video-review";
import type { Id } from "./_generated/dataModel";

const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
export const videoReviewHttp = httpAction(async (ctx, request) => {
  const token = process.env.VIDEO_REVIEW_BACKEND_TOKEN;
  if (!token || token.length < 32) return Response.json({ error: "Review storage is not configured." }, { status: 503, headers });
  if (request.headers.get("authorization") !== `Bearer ${token}`) return new Response("Unauthorized", { status: 401, headers });
  try {
    const url = new URL(request.url);
    if (url.pathname === "/video-review-uploads") {
      return Response.json({ uploadUrl: await ctx.runMutation(internal.videoReviews.createUploadUrl, {}) }, { headers });
    }
    if (request.method === "GET") {
      const id = reviewId.parse(url.searchParams.get("reviewId"));
      return Response.json(await ctx.runQuery(internal.videoReviews.read, { reviewId: id }), { headers });
    }
    if (request.headers.get("content-type")?.startsWith("application/json")) {
      const raw = await request.text();
      if (raw.length > 12000) throw new Error("Render record too large.");
      const input = reviewRenderInputSchema.parse(JSON.parse(raw));
      let value;
      if ("storageId" in input.media) {
        const file = await ctx.runQuery(internal.videoReviews.storedVideo, { storageId: input.media.storageId as Id<"_storage"> });
        if (!file || file.contentType !== "video/mp4" || file.size === 0) throw new Error("Upload an MP4 review copy first.");
        const { storageId: _storageId, ...dimensions } = input.media;
        value = reviewRenderSchema.parse({ ...input, media: { ...dimensions, url: file.url, sha256: file.sha256 } });
      } else value = reviewRenderSchema.parse(input);
      return Response.json(await ctx.runMutation(internal.videoReviews.register, { payload: JSON.stringify(value) }), { headers });
    }
    const id = reviewId.parse(url.searchParams.get("reviewId"));
    const form = await request.formData(), snapshot = form.get("snapshot");
    const input = frameNoteSchema.parse(JSON.parse(String(form.get("note"))));
    if (!(snapshot instanceof Blob) || snapshot.type !== "image/png" || snapshot.size > 3 * 1024 * 1024) throw new Error("Use a PNG frame under 3 MiB.");
    const source = await ctx.runQuery(internal.videoReviews.readRender, { renderId: input.renderId });
    if (!source || source.reviewId !== id || input.presentedTime > source.media.duration) throw new Error("The frame does not match this render.");
    const bytes = await snapshot.arrayBuffer(), png = new Uint8Array(bytes), view = new DataView(bytes);
    if (png.length < 24 || ![137,80,78,71,13,10,26,10].every((value, i) => png[i] === value) || view.getUint32(16) !== source.media.width || view.getUint32(20) !== source.media.height) throw new Error("The snapshot dimensions do not match this render.");
    const snapshotSha256 = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map(n => n.toString(16).padStart(2, "0")).join("");
    const payload = JSON.stringify({ ...input, reviewId: id, mediaSha256: source.media.sha256, snapshotSha256, width: source.media.width, height: source.media.height, region: null });
    const before = await ctx.runQuery(internal.videoReviews.readNote, { noteId: input.noteId });
    if (before) {
      if (before.payload !== payload || before.reviewId !== id) throw new Error("This note ID has different saved content.");
      return Response.json({ noteId: before.noteId }, { headers });
    }
    const snapshotId = await ctx.storage.store(new Blob([bytes], { type: "image/png" }));
    try {
      return Response.json(await ctx.runMutation(internal.videoReviews.saveNote, { reviewId: id, payload, snapshotId }), { headers });
    } catch (error) {
      await ctx.storage.delete(snapshotId);
      throw error;
    }
  } catch {
    return Response.json({ error: "Could not save this review. Your draft is still here. Reload saved notes before retrying." }, { status: 409, headers });
  }
});
