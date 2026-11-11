import { internalMutation, internalQuery, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { studioCommand, studioReviewPacket } from "../lib/studio-projects";

function projectAsset(ctx: QueryCtx, projectId: string, sha256: string) {
  return ctx.db.query("studioProjectAssets").withIndex("by_project_hash",
    q => q.eq("projectId", projectId).eq("sha256", sha256)).unique();
}

async function checkPacketAssets(ctx: QueryCtx, projectId: string, packet: ReturnType<typeof studioReviewPacket.parse>) {
  const checked = new Set<string>();
  const check = async (path?: string | null, expectedHash?: string) => {
    if (!path?.startsWith("/")) return;
    const query = new URLSearchParams(path.split("?")[1]);
    const sha256 = query.get("sha256")!;
    if (query.get("projectId") !== projectId || (expectedHash && expectedHash !== sha256)) {
      throw new Error("The packet refers to another project or asset hash.");
    }
    if (!checked.has(sha256) && !await projectAsset(ctx, projectId, sha256)) {
      throw new Error("Upload the packet asset before opening the review.");
    }
    checked.add(sha256);
  };
  for (const scene of packet.scenes) {
    await check(scene.thumbnail);
    for (const version of scene.versions) {
      await check(version.url, version.sha256);
      await check(version.poster);
    }
  }
}

export const getAsset = internalQuery({
  args: { projectId: v.string(), sha256: v.string() },
  handler: (ctx, { projectId, sha256 }) => projectAsset(ctx, projectId, sha256),
});

export const saveAsset = internalMutation({
  args: { projectId: v.string(), sha256: v.string(), contentType: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, asset) => {
    const project = await ctx.db.query("studioProjects")
      .withIndex("by_project", q => q.eq("projectId", asset.projectId)).unique();
    if (!project || project.status !== "active") throw new Error("The project is unavailable.");
    if (await projectAsset(ctx, asset.projectId, asset.sha256)) return false;
    await ctx.db.insert("studioProjectAssets", asset);
    return true;
  },
});

export const list = internalQuery({ args: {}, handler: async ctx => {
  const rows = await ctx.db.query("studioProjects").collect();
  return rows.map(({ packet, feedback: _feedback, ...row }) => ({ ...row, hasPacket: Boolean(packet) }));
} });
export const get = internalQuery({ args: { projectId: v.string() }, handler: (ctx, { projectId }) =>
  ctx.db.query("studioProjects").withIndex("by_project", q => q.eq("projectId", projectId)).unique() });
export const apply = internalMutation({ args: { command: v.string() }, handler: async (ctx, { command }) => {
  const value = studioCommand.parse(JSON.parse(command));
  const row = await ctx.db.query("studioProjects").withIndex("by_project", q => q.eq("projectId", value.projectId)).unique();
  if (value.action === "save-review") throw new Error("Use the review save route.");
  if (value.action === "queue-chat-send") {
    const { projectId, revision, version } = value;
    const existing = await ctx.db.query("studioChatSends").withIndex("by_project_review",
      q => q.eq("projectId", projectId).eq("revision", revision).eq("version", version)).unique();
    if (existing) return { requestId: existing.requestId, status: existing.status, turnId: existing.turnId };
    if (!row?.packet || row.status !== "active" || !row.sourceChatId || !row.sourceHostId || !row.storyboardUrl ||
        JSON.parse(row.packet).revision !== revision) throw new Error("This review has no active source chat.");
    const saved = await ctx.db.query("studioProjectReviews").withIndex("by_project_revision",
      q => q.eq("projectId", projectId).eq("revision", revision)).unique();
    if (!saved || saved.version !== version) throw new Error("Reload the saved review before sending.");
    const requestId = crypto.randomUUID();
    await ctx.db.insert("studioChatSends", {
      requestId, projectId, revision, version, threadId: row.sourceChatId,
      hostId: row.sourceHostId, storyboardUrl: row.storyboardUrl, status: "queued", storageId: saved.storageId,
      frameLinks: true,
    });
    return { requestId, status: "queued" };
  }
  if (value.action === "claim-chat-send" || value.action === "confirm-chat-send") {
    const send = await ctx.db.query("studioChatSends").withIndex("by_request",
      q => q.eq("requestId", value.requestId)).unique();
    if (!send || send.projectId !== value.projectId || send.threadId !== row?.sourceChatId ||
        send.hostId !== row?.sourceHostId) throw new Error("The send does not match this project's chat.");
    if (value.action === "claim-chat-send") {
      if (send.status !== "queued" || row?.status !== "active") return { claimed: false };
      await ctx.db.patch(send._id, { status: "claimed" });
      return { claimed: true };
    }
    if (send.status === "queued" || send.threadId !== value.threadId || (send.turnId && send.turnId !== value.turnId)) {
      throw new Error("The receipt does not match this send.");
    }
    if (send.status !== "delivered") await ctx.db.patch(send._id, { status: "delivered", turnId: value.turnId });
    return { requestId: send.requestId, status: "delivered", turnId: value.turnId };
  }
  if (value.action === "start-lineups") {
    const linked = await ctx.db.query("studioProjects")
      .withIndex("by_task", q => q.eq("taskOwner", "asana").eq("taskId", value.asanaTask))
      .unique();
    if (linked && (linked.client !== "Catena Media" || linked.episodeSlug !== value.episodeSlug)) {
      throw new Error("This Asana task is linked to a different Studio project.");
    }
    const handoff = value.handoff;
    if (handoff && linked?.sourceChatId &&
        (linked.sourceChatId !== handoff.origin.threadId || linked.sourceHostId !== handoff.origin.hostId)) {
      throw new Error("The storyboard is already bound to another chat.");
    }
    if (handoff && linked?.status === "closed") throw new Error("The Studio project is closed.");
    const packet = handoff?.packet;
    const incoming = packet ? studioReviewPacket.parse(JSON.parse(packet)) : null;
    if (incoming && incoming.episodeId !== value.episodeSlug) {
      throw new Error("The review packet does not match this episode.");
    }
    if (incoming) await checkPacketAssets(ctx, linked?.projectId ?? value.projectId, incoming);
    const savedRevision = linked?.packet ? JSON.parse(linked.packet).revision : undefined;
    if (incoming && savedRevision === incoming.revision && linked?.packet !== packet) {
      throw new Error("This revision already identifies a different packet.");
    }
    const review = handoff ? {
      storyboardUrl: handoff.storyboardUrl,
      sourceChatId: handoff.origin.threadId,
      sourceHostId: handoff.origin.hostId,
      ...(packet ? { packet } : {}),
    } : {};
    if (!linked) {
      if (row) throw new Error("This project ID is already in use.");
      const now = Date.now();
      await ctx.db.insert("studioProjects", {
        projectId: value.projectId, title: value.title, client: "Catena Media",
        episodeSlug: value.episodeSlug, status: "active", taskOwner: "asana",
        taskId: value.asanaTask, createdAt: now, updatedAt: now, ...review,
      });
    } else if (handoff && (linked.storyboardUrl !== handoff.storyboardUrl || !linked.sourceChatId || (packet && linked.packet !== packet))) {
      await ctx.db.patch(linked._id, { ...review, updatedAt: Date.now() });
    }
    const storyboardUrl = handoff?.storyboardUrl ?? linked?.storyboardUrl;
    const origin = handoff?.origin ?? (linked?.sourceChatId && linked?.sourceHostId
      ? { threadId: linked.sourceChatId, hostId: linked.sourceHostId } : undefined);
    return {
      projectId: linked?.projectId ?? value.projectId, title: linked?.title ?? value.title,
      episodeSlug: value.episodeSlug, client: "Catena Media", status: linked?.status ?? "active",
      task: { owner: "asana", id: value.asanaTask },
      ...(storyboardUrl && origin ? { storyboardUrl, origin } : {}),
      packetRevision: incoming?.revision ?? savedRevision ?? null,
    };
  }
  if (value.action === "create") {
    if (row) throw new Error("Project already exists.");
    const now = Date.now();
    await ctx.db.insert("studioProjects", { projectId: value.projectId, client: value.client, title: value.title, status: "active", ...(value.task ? { taskOwner: value.task.owner, taskId: value.task.id } : {}), createdAt: now, updatedAt: now });
  } else {
    if (!row) throw new Error("Project not found.");
    if (value.action === "delete") {
      const reviews = await ctx.db.query("studioProjectReviews").withIndex("by_project_revision",
        q => q.eq("projectId", value.projectId)).collect();
      const sends = await ctx.db.query("studioChatSends").withIndex("by_project_review",
        q => q.eq("projectId", value.projectId)).collect();
      if (sends.some(send => send.status === "claimed")) throw new Error("Confirm the chat send before deleting this project.");
      const assets = await ctx.db.query("studioProjectAssets").withIndex("by_project_hash",
        q => q.eq("projectId", value.projectId)).collect();
      const entries = [...reviews, ...sends, ...assets];
      const stored = new Set(entries.map(entry => entry.storageId));
      for (const storageId of stored) await ctx.storage.delete(storageId);
      for (const entry of entries) await ctx.db.delete(entry._id);
      await ctx.db.delete(row._id);
    }
    else if (value.action === "close-linked") {
      if (row.taskOwner !== value.task.owner || row.taskId !== value.task.id) {
        throw new Error("The closeout task does not match this project.");
      }
      if (row.status !== "closed") await ctx.db.patch(row._id, { status: "closed", updatedAt: Date.now() });
    }
    else if (value.action === "close" || value.action === "reopen") await ctx.db.patch(row._id, { status: value.action === "close" ? "closed" : "active", updatedAt: Date.now() });
    else if (value.action === "packet") {
      if (row.episodeSlug || row.status === "closed") throw new Error("Use the episode handoff to change this packet.");
      const incoming = studioReviewPacket.parse(JSON.parse(value.packet));
      await checkPacketAssets(ctx, row.projectId, incoming);
      if (row.packet && JSON.parse(row.packet).revision === incoming.revision && row.packet !== value.packet) {
        throw new Error("This revision already identifies a different packet.");
      }
      await ctx.db.patch(row._id, { packet: value.packet, updatedAt: Date.now() });
    }
    else await ctx.db.patch(row._id, { feedback: value.feedback, updatedAt: Date.now() });
  }
  return { projectId: value.projectId, action: value.action };
} });


export const getReview = internalQuery({
  args: { projectId: v.string(), revision: v.string() },
  handler: (ctx, { projectId, revision }) => ctx.db.query("studioProjectReviews")
    .withIndex("by_project_revision", q => q.eq("projectId", projectId).eq("revision", revision)).unique(),
});

export const getChatSend = internalQuery({
  args: { requestId: v.string() },
  handler: (ctx, { requestId }) => ctx.db.query("studioChatSends")
    .withIndex("by_request", q => q.eq("requestId", requestId)).unique(),
});

export const pendingChatSends = internalQuery({
  args: { hostId: v.string() },
  handler: async (ctx, { hostId }) => {
    const queued = await ctx.db.query("studioChatSends").withIndex("by_host_status",
      q => q.eq("hostId", hostId).eq("status", "queued")).take(25);
    const claimed = await ctx.db.query("studioChatSends").withIndex("by_host_status",
      q => q.eq("hostId", hostId).eq("status", "claimed")).take(25);
    return [...claimed, ...queued].map(send => send.requestId);
  },
});

export const saveReview = internalMutation({
  args: {
    projectId: v.string(), revision: v.string(), expectedVersion: v.number(),
    storageId: v.id("_storage"), bodyHash: v.string(),
    sceneIds: v.array(v.string()),
    noteRefs: v.array(v.object({
      episodeId: v.string(), sceneId: v.string(), versionId: v.string(), mediaSha256: v.string(),
    })),
  },
  handler: async (ctx, input) => {
    const { projectId, revision, storageId, bodyHash } = input;
    const project = await ctx.db.query("studioProjects")
      .withIndex("by_project", q => q.eq("projectId", projectId)).unique();
    if (!project?.packet || project.status !== "active") throw new Error("The project is not open for review.");
    const packet = studioReviewPacket.parse(JSON.parse(project.packet));
    if (packet.revision !== revision) throw new Error("This packet has been replaced.");
    const scenes = new Map(packet.scenes.map(scene => [scene.id, scene]));
    if (input.sceneIds.some(id => !scenes.has(id)) || input.noteRefs.some(note =>
      note.episodeId !== packet.episodeId || !scenes.get(note.sceneId)?.versions.some(version =>
        version.id === note.versionId && version.sha256 === note.mediaSha256))) {
      throw new Error("A review note refers to a different scene or media version.");
    }
    const prior = await ctx.db.query("studioProjectReviews")
      .withIndex("by_project_revision", q => q.eq("projectId", projectId).eq("revision", revision)).unique();
    if (prior?.bodyHash === bodyHash) return { version: prior.version, stored: false };
    if ((prior?.version ?? 0) !== input.expectedVersion) throw new Error("Another review was saved first.");
    const version = input.expectedVersion + 1;
    if (prior) {
      await ctx.db.patch(prior._id, { version, bodyHash, storageId });
      const send = await ctx.db.query("studioChatSends").withIndex("by_storage",
        q => q.eq("storageId", prior.storageId)).first();
      if (!send) await ctx.storage.delete(prior.storageId);
    } else {
      await ctx.db.insert("studioProjectReviews", { projectId, revision, version, bodyHash, storageId });
    }
    return { version, stored: true };
  },
});
