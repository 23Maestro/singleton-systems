import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
  videoReviewRenders: defineTable({
    reviewId: v.string(), renderId: v.string(), payload: v.string(), createdAt: v.number(),
  }).index("by_review", ["reviewId"]).index("by_render", ["renderId"]),
  videoReviewNotes: defineTable({
    reviewId: v.string(), renderId: v.string(), noteId: v.string(), payload: v.string(),
    snapshotId: v.id("_storage"), createdAt: v.number(),
  }).index("by_review", ["reviewId"]).index("by_note", ["noteId"]),
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
