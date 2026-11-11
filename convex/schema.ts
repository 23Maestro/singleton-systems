import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
  studioProjects: defineTable({
    projectId: v.string(), client: v.string(), title: v.string(), status: v.string(),
    packet: v.optional(v.string()), feedback: v.optional(v.string()),
    taskOwner: v.optional(v.string()), taskId: v.optional(v.string()), episodeSlug: v.optional(v.string()),
    storyboardUrl: v.optional(v.string()), sourceChatId: v.optional(v.string()), sourceHostId: v.optional(v.string()),
    createdAt: v.number(), updatedAt: v.number(),
  }).index("by_project", ["projectId"]).index("by_task", ["taskOwner", "taskId"]),
  studioProjectAssets: defineTable({
    projectId: v.string(), sha256: v.string(), contentType: v.string(), storageId: v.id("_storage"),
  }).index("by_project_hash", ["projectId", "sha256"]),
  studioProjectReviews: defineTable({
    projectId: v.string(), revision: v.string(), version: v.number(),
    bodyHash: v.string(), storageId: v.id("_storage"),
  }).index("by_project_revision", ["projectId", "revision"]),
  studioChatSends: defineTable({
    requestId: v.string(), projectId: v.string(), revision: v.string(), version: v.number(),
    threadId: v.string(), hostId: v.string(), storyboardUrl: v.string(),
    status: v.union(v.literal("queued"), v.literal("claimed"), v.literal("delivered")),
    storageId: v.id("_storage"), turnId: v.optional(v.string()), frameLinks: v.optional(v.boolean()),
  }).index("by_request", ["requestId"])
    .index("by_project_review", ["projectId", "revision", "version"])
    .index("by_storage", ["storageId"])
    .index("by_host_status", ["hostId", "status"]),
  videoReviewRenders: defineTable({
    reviewId: v.string(), renderId: v.string(), payload: v.string(), createdAt: v.number(),
  }).index("by_review", ["reviewId"]).index("by_render", ["renderId"]),
  videoReviewNotes: defineTable({
    reviewId: v.string(), renderId: v.string(), noteId: v.string(), payload: v.string(),
    snapshotId: v.id("_storage"), createdAt: v.number(),
  }).index("by_review", ["reviewId"]).index("by_note", ["noteId"]),
  taskRequests: defineTable({
    requestId: v.string(),
    payload: v.string(),
    status: v.union(v.literal("queued"), v.literal("delivering"), v.literal("working"), v.literal("completed"), v.literal("needs_review"), v.literal("failed")),
    createdAt: v.number(),
    updatedAt: v.number(),
    leaseOwner: v.optional(v.string()),
    leaseUntil: v.optional(v.number()),
    transaction: v.optional(v.string()),
    turnId: v.optional(v.string()),
    result: v.optional(v.string()),
    error: v.optional(v.string()),
  }).index("by_request", ["requestId"]).index("by_status_created", ["status", "createdAt"]),
  workouts: defineTable({ date: v.string(), value: v.string() }).index(
    "by_date",
    ["date"],
  ),
  exercises: defineTable({ key: v.string(), value: v.string() }).index(
    "by_key",
    ["key"],
  ),
  media: defineTable({ key: v.string(), value: v.string() }).index("by_key", [
    "key",
  ]),
  profile: defineTable({
    key: v.string(),
    dumbbellMax: v.number(),
    equipment: v.array(v.string()),
    morningDays: v.array(v.string()),
    revision: v.number(),
  }).index("by_key", ["key"]),
});
