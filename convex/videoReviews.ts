import { internalMutation, internalQuery } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { frameNoteSchema, reviewRenderSchema } from "../lib/video-review";

const render = (ctx: QueryCtx | MutationCtx, renderId: string) => ctx.db.query("videoReviewRenders").withIndex("by_render", q => q.eq("renderId", renderId)).unique();
const note = (ctx: QueryCtx | MutationCtx, noteId: string) => ctx.db.query("videoReviewNotes").withIndex("by_note", q => q.eq("noteId", noteId)).unique();

export const createUploadUrl = internalMutation({ args: {}, handler: ctx => ctx.storage.generateUploadUrl() });
export const storedVideo = internalQuery({ args: { storageId: v.id("_storage") }, handler: async (ctx, args) => {
  const metadata = await ctx.db.system.get("_storage", args.storageId);
  const url = await ctx.storage.getUrl(args.storageId);
  if (!metadata || !url) return null;
  // Older backends return base64; current storage metadata uses hex.
  const sha256 = /^[a-f0-9]{64}$/i.test(metadata.sha256) ? metadata.sha256.toLowerCase()
    : Array.from(atob(metadata.sha256), character => character.charCodeAt(0).toString(16).padStart(2, "0")).join("");
  return { url, sha256, contentType: metadata.contentType, size: metadata.size };
} });

export const register = internalMutation({ args: { payload: v.string() }, handler: async (ctx, args) => {
  const value = reviewRenderSchema.parse(JSON.parse(args.payload));
  const payload = JSON.stringify(value), before = await render(ctx, value.renderId);
  if (before) {
    if (before.payload !== payload) throw new Error("This render already has a different source or origin.");
    return { renderId: value.renderId };
  }
  const first = await ctx.db.query("videoReviewRenders").withIndex("by_review", q => q.eq("reviewId", value.reviewId)).first();
  if (first && JSON.stringify(reviewRenderSchema.parse(JSON.parse(first.payload)).origin) !== JSON.stringify(value.origin)) {
    throw new Error("A review must keep its creation origin across revisions.");
  }
  await ctx.db.insert("videoReviewRenders", { reviewId: value.reviewId, renderId: value.renderId, payload, createdAt: Date.now() });
  return { renderId: value.renderId };
} });

export const readRender = internalQuery({ args: { renderId: v.string() }, handler: async (ctx, args) => {
  const row = await render(ctx, args.renderId);
  return row ? reviewRenderSchema.parse(JSON.parse(row.payload)) : null;
} });

export const readNote = internalQuery({ args: { noteId: v.string() }, handler: (ctx, args) => note(ctx, args.noteId) });

export const saveNote = internalMutation({ args: { reviewId: v.string(), payload: v.string(), snapshotId: v.id("_storage") }, handler: async (ctx, args) => {
  const value = JSON.parse(args.payload);
  const input = frameNoteSchema.parse({ noteId: value.noteId, renderId: value.renderId, body: value.body, presentedTime: value.presentedTime });
  const source = await render(ctx, input.renderId);
  if (!source || source.reviewId !== args.reviewId) throw new Error("The render does not belong to this review.");
  const before = await note(ctx, input.noteId);
  if (before) {
    if (before.payload !== args.payload || before.reviewId !== args.reviewId) throw new Error("This note ID has different saved content.");
    if (before.snapshotId !== args.snapshotId) await ctx.storage.delete(args.snapshotId);
    return { noteId: before.noteId };
  }
  await ctx.db.insert("videoReviewNotes", { reviewId: args.reviewId, renderId: input.renderId, noteId: input.noteId, payload: args.payload, snapshotId: args.snapshotId, createdAt: Date.now() });
  return { noteId: input.noteId };
} });

export const read = internalQuery({ args: { reviewId: v.string() }, handler: async (ctx, args) => {
  const renders = await ctx.db.query("videoReviewRenders").withIndex("by_review", q => q.eq("reviewId", args.reviewId)).collect();
  const notes = await ctx.db.query("videoReviewNotes").withIndex("by_review", q => q.eq("reviewId", args.reviewId)).collect();
  return {
    renders: renders.map(row => reviewRenderSchema.parse(JSON.parse(row.payload))),
    notes: await Promise.all(notes.map(async row => ({ ...JSON.parse(row.payload), snapshotUrl: await ctx.storage.getUrl(row.snapshotId) }))),
  };
} });
