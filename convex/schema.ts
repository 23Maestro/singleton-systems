import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
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
