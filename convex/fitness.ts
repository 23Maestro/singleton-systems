import { internalMutation, internalQuery } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { catalog, initialMedia } from "../lib/fitness/catalog";
import {
  applyWorkoutCommand,
  commandSchema,
  counts,
  createWorkout,
  equipment,
  localDay,
  mediaSchema,
  nextSplit,
  stateSchema,
  workoutSchema,
} from "../lib/fitness/model";

async function snapshot(ctx: QueryCtx) {
  const profile = await ctx.db
    .query("profile")
    .withIndex("by_key", (q) => q.eq("key", "jerami"))
    .unique();
  if (!profile) throw new Error("Fitness has not been initialized.");
  const [workouts, library, media] = await Promise.all([
    ctx.db.query("workouts").withIndex("by_date").order("desc").take(500),
    ctx.db.query("exercises").take(200),
    ctx.db.query("media").take(200),
  ]);
  return {
    ...stateSchema.parse({
      workouts: workouts
        .map((r) => JSON.parse(r.value))
        .sort((a, b) => a.id.localeCompare(b.id)),
      library: library.map((r) => JSON.parse(r.value)),
      media: media.map((r) => JSON.parse(r.value)),
      morningDays: profile.morningDays,
      dumbbellMax: profile.dumbbellMax,
      equipment: profile.equipment,
    }),
    revision: profile.revision,
  };
}
export const read = internalQuery({ args: {}, handler: snapshot });
export const bootstrap = internalMutation({
  args: {},
  handler: async (ctx) => {
    if (
      !(await ctx.db
        .query("profile")
        .withIndex("by_key", (q) => q.eq("key", "jerami"))
        .unique())
    )
      await ctx.db.insert("profile", {
        key: "jerami",
        dumbbellMax: 20,
        equipment: [...equipment],
        morningDays: [],
        revision: 0,
      });
    for (const e of catalog)
      if (
        !(await ctx.db
          .query("exercises")
          .withIndex("by_key", (q) => q.eq("key", e.id))
          .unique())
      )
        await ctx.db.insert("exercises", {
          key: e.id,
          value: JSON.stringify(e),
        });
    for (const m of initialMedia)
      if (
        !(await ctx.db
          .query("media")
          .withIndex("by_key", (q) => q.eq("key", m.id))
          .unique())
      )
        await ctx.db.insert("media", { key: m.id, value: JSON.stringify(m) });
    return { initialized: true };
  },
});

// Codex prepares the plan locally; this function validates and saves it atomically.
export const publish = internalMutation({
  args: { payload: v.string(), revision: v.number() },
  handler: async (ctx, args) => {
    const state = await snapshot(ctx);
    if (state.revision !== args.revision)
      throw new Error(
        "Logs changed since planning. Read fresh logs and prepare again.",
      );
    const data = JSON.parse(args.payload) as {
      workouts: unknown[];
      media?: unknown[];
    };
    if (!Array.isArray(data.workouts) || data.workouts.length !== 4)
      throw new Error("Publish exactly four scheduled sessions.");
    const workouts = data.workouts.map((w) => workoutSchema.parse(w));
    if (new Set(workouts.map((w) => w.id)).size !== 4)
      throw new Error("Duplicate session dates.");
    const dates = workouts
      .map((w) => new Date(w.id + "T12:00:00Z").getUTCDay())
      .join(",");
    if (dates !== "1,2,4,6")
      throw new Error("Expected Monday, Tuesday, Thursday, Saturday.");
    const first = workouts[0].id;
    if (
      workouts.some(
        (w) =>
          w.id < first || Date.parse(w.id) - Date.parse(first) > 6 * 86400000,
      )
    )
      throw new Error("Sessions must be in one week.");
    let inserted = 0;
    for (const w of workouts) {
      const existing = await ctx.db
        .query("workouts")
        .withIndex("by_date", (q) => q.eq("date", w.id))
        .unique();
      if (existing) continue;
      if (
        w.startedAt ||
        w.finishedAt ||
        w.exercises.some((e) => e.sets.some((s) => s.status !== "pending"))
      )
        throw new Error("New plans cannot contain completion history.");
      if (
        w.exercises.some(
          (e) =>
            !state.library.some((x) => x.id === e.exercise.id) ||
            !e.exercise.equipment.every((x) => state.equipment.includes(x)),
        )
      )
        throw new Error("Exercise is not in the available library.");
      await ctx.db.insert("workouts", { date: w.id, value: JSON.stringify(w) });
      inserted++;
    }
    for (const raw of data.media ?? []) {
      const m = mediaSchema.parse(raw);
      if (!/^https:\/\/(www\.)?instagram\.com\/reel\/[\w-]+\/$/.test(m.source))
        throw new Error("Only original Instagram reel sources are accepted.");
      if (m.embed !== m.source + "embed/")
        throw new Error("Embed must match the original reel.");
      if (
        !(await ctx.db
          .query("media")
          .withIndex("by_key", (q) => q.eq("key", m.id))
          .unique())
      )
        await ctx.db.insert("media", { key: m.id, value: JSON.stringify(m) });
    }
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_key", (q) => q.eq("key", "jerami"))
      .unique();
    if (profile && (inserted || data.media?.length))
      await ctx.db.patch(profile._id, { revision: profile.revision + 1 });
    return { inserted, week: first };
  },
});

export const update = internalMutation({
  args: { command: v.string() },
  handler: async (ctx, args) => {
    const command = commandSchema.parse(JSON.parse(args.command));
    const state = await snapshot(ctx);
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_key", (q) => q.eq("key", "jerami"))
      .unique();
    if (!profile) throw new Error("Profile missing.");
    if (command.action === "morning") {
      if (command.day !== localDay())
        throw new Error("Morning check-in must be for today.");
      const days = new Set(profile.morningDays);
      if (command.done) days.add(command.day);
      else days.delete(command.day);
      await ctx.db.patch(profile._id, {
        morningDays: [...days].sort(),
        revision: profile.revision + 1,
      });
    } else if (command.action === "equipment") {
      await ctx.db.patch(profile._id, {
        dumbbellMax: command.dumbbellMax,
        revision: profile.revision + 1,
      });
    } else {
      const row = await ctx.db
        .query("workouts")
        .withIndex("by_date", (q) => q.eq("date", command.id))
        .unique();
      if (!row) throw new Error("Workout not found.");
      let workout = workoutSchema.parse(JSON.parse(row.value));
      if (command.action === "start" && !workout.startedAt) {
        if (
          state.workouts.some(
            (w) => w.id !== workout.id && w.startedAt && !w.finishedAt,
          )
        )
          throw new Error("Resume your active session first.");
        const split = nextSplit(state.workouts);
        if (workout.split !== split)
          workout = {
            ...createWorkout(
              workout.id,
              split,
              state.library,
              state.workouts,
              state.dumbbellMax,
            ),
            revision: workout.revision,
          };
      }
      if (command.action === "set" && command.weight > state.dumbbellMax)
        throw new Error("Weight exceeds your equipment setting.");
      workout = applyWorkoutCommand(workout, command);
      await ctx.db.patch(row._id, { value: JSON.stringify(workout) });
      await ctx.db.patch(profile._id, { revision: profile.revision + 1 });
      if (command.action === "finish") {
        const history = [
          ...state.workouts.filter((w) => w.id !== workout.id),
          workout,
        ];
        let split = nextSplit(history);
        const upcoming = state.workouts
          .filter((w) => !w.startedAt && w.id >= localDay())
          .sort((a, b) => a.id.localeCompare(b.id));
        for (const w of upcoming) {
          if (w.id === workout.id) continue;
          if (w.split !== split) {
            const r = await ctx.db
              .query("workouts")
              .withIndex("by_date", (q) => q.eq("date", w.id))
              .unique();
            if (r)
              await ctx.db.patch(r._id, {
                value: JSON.stringify({
                  ...createWorkout(
                    w.id,
                    split,
                    state.library,
                    history,
                    state.dumbbellMax,
                  ),
                  revision: w.revision + 1,
                }),
              });
          }
          split = split === "upper" ? "lower" : "upper";
        }
      }
    }
    return await snapshot(ctx);
  },
});

export const summary = internalQuery({
  args: {},
  handler: async (ctx) => {
    const state = await snapshot(ctx);
    return {
      ...state,
      completedSets: state.workouts.reduce((n, w) => n + counts(w).done, 0),
    };
  },
});
