import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { STUDIO_REQUEST_BYTES, studioCommand, studioReviewRevision } from "../lib/studio-projects";
import { z } from "zod";

export const studioProjectHttp = httpAction(async (ctx, request) => {
  const token = process.env.VIDEO_REVIEW_BACKEND_TOKEN;
  if (!token || token.length < 32 || request.headers.get("authorization") !== `Bearer ${token}`) return new Response("Unauthorized", { status: 401 });
  const headers = { "Cache-Control": "no-store" };
  try {
    if (request.method === "GET") {
      const params = new URL(request.url).searchParams;
      const id = params.get("projectId");
      const revision = params.get("reviewRevision");
      const sendId = params.get("chatSendId");
      const pendingHost = params.get("pendingChatHost");
      if (pendingHost !== null) {
        return Response.json(await ctx.runQuery(internal.studioProjects.pendingChatSends, {
          hostId: z.string().min(1).max(160).parse(pendingHost),
        }), { headers });
      }
      if (sendId !== null) {
        const send = await ctx.runQuery(internal.studioProjects.getChatSend, { requestId: z.uuid().parse(sendId) });
        if (!send) return Response.json({ error: "Review send not found." }, { status: 404, headers });
        const { requestId, projectId, revision, version, status, turnId, hostId, threadId, storyboardUrl, storageId, frameLinks } = send;
        const blob = await ctx.storage.get(storageId);
        if (!blob) return Response.json({ error: "Review snapshot is missing." }, { status: 409, headers });
        return Response.json({
          requestId, projectId, revision, version, status, turnId, origin: { hostId, threadId },
          storyboardUrl, frameLinks, feedback: JSON.parse(await blob.text()),
        }, { headers });
      }
      if (revision !== null) {
        const projectId = z.uuid().parse(id);
        const saved = await ctx.runQuery(internal.studioProjects.getReview, {
          projectId, revision: studioReviewRevision.parse(revision),
        });
        if (!saved) return Response.json({ version: 0, feedback: { statuses: {}, notes: [] } }, { headers });
        const blob = await ctx.storage.get(saved.storageId);
        if (!blob) return Response.json({ error: "Reload to read the saved review." }, { status: 409, headers });
        return Response.json({ version: saved.version, feedback: JSON.parse(await blob.text()) }, { headers });
      }
      return Response.json(id ? await ctx.runQuery(internal.studioProjects.get, { projectId: z.uuid().parse(id) }) : await ctx.runQuery(internal.studioProjects.list, {}), { headers: { "Cache-Control": "no-store" } });
    }
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength > STUDIO_REQUEST_BYTES) return new Response("Too large", { status: 413 });
    const command = studioCommand.parse(JSON.parse(new TextDecoder().decode(bytes)));
    if (command.action === "save-review") {
      const { projectId, revision, expectedVersion, feedback } = command;
      const body = JSON.stringify(feedback);
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body));
      const bodyHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
      const storageId = await ctx.storage.store(new Blob([body], { type: "application/json" }));
      let receipt;
      try {
        receipt = await ctx.runMutation(internal.studioProjects.saveReview, {
          projectId, revision, expectedVersion, storageId, bodyHash, sceneIds: Object.keys(feedback.statuses),
          noteRefs: feedback.notes.map(({ episodeId, sceneId, versionId, mediaSha256 }) => ({
            episodeId, sceneId, versionId, mediaSha256,
          })),
        });
      } catch {
        const saved = await ctx.runQuery(internal.studioProjects.getReview, { projectId, revision });
        if (saved?.storageId === storageId) return Response.json({ version: saved.version }, { headers });
        await ctx.storage.delete(storageId);
        return Response.json({ error: "Review changed. Reload before saving again." }, { status: 409, headers });
      }
      if (!receipt.stored) await ctx.storage.delete(storageId);
      return Response.json({ version: receipt.version }, { headers });
    }
    return Response.json(await ctx.runMutation(internal.studioProjects.apply, { command: JSON.stringify(command) }), { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Could not update this project." }, { status: 400 }); }
});
