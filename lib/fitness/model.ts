import { z } from "zod";

export const equipment = [
  "dumbbells",
  "handle-bands",
  "mini-bands",
  "loop-bands",
  "block",
  "roller",
  "stick",
  "ab-wheel",
  "bodyweight",
] as const;
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (s) =>
      !Number.isNaN(Date.parse(s)) &&
      new Date(s).toISOString().slice(0, 10) === s,
  );
export const exerciseSchema = z
  .object({
    id: z.string().min(1).max(80),
    name: z.string().min(1).max(120),
    split: z.enum(["upper", "lower"]),
    equipment: z.array(z.enum(equipment)),
    pattern: z.string().max(40),
    cues: z.array(z.string().max(300)).max(5),
    visual: z.enum([
      "press",
      "floor-press",
      "row",
      "curl",
      "squat",
      "hinge",
      "lunge",
      "bridge",
      "calf",
      "band",
    ]),
    sets: z.number().int().min(1).max(5),
    reps: z.number().int().min(1).max(40),
    rest: z.number().int().min(15).max(300),
    weight: z.number().min(0).max(20),
  })
  .strict();
export type Exercise = z.infer<typeof exerciseSchema>;
export const setSchema = z.object({
  reps: z.number().int().min(1).max(100),
  weight: z.number().min(0).max(200),
  resistance: z.string().max(40),
  status: z.enum(["pending", "done", "skipped"]),
  at: z.number().nullable(),
});
export const workoutSchema = z.object({
  id: dateSchema,
  split: z.enum(["upper", "lower"]),
  title: z.string(),
  exercises: z
    .array(
      z.object({
        exercise: exerciseSchema,
        sets: z.array(setSchema).min(1).max(5),
      }),
    )
    .min(1)
    .max(10),
  startedAt: z.number().nullable(),
  finishedAt: z.number().nullable(),
  restUntil: z.number().nullable(),
  pausedRest: z.number().nullable(),
  revision: z.number().int(),
});
export type Workout = z.infer<typeof workoutSchema>;
export const mediaSchema = z
  .object({
    id: z.string().max(100),
    title: z.string().max(150),
    area: z.enum(["full-body", "hips", "upper-back", "neck"]),
    source: z.string().url(),
    embed: z.string().url(),
    creator: z.string().max(100),
    reviewed: z.boolean(),
    note: z.string().max(500),
  })
  .strict();
export type Media = z.infer<typeof mediaSchema>;
export const stateSchema = z.object({
  workouts: z.array(workoutSchema),
  library: z.array(exerciseSchema),
  media: z.array(mediaSchema),
  morningDays: z.array(dateSchema),
  dumbbellMax: z.number().min(1).max(200),
  equipment: z.array(z.enum(equipment)),
});
export type FitnessState = z.infer<typeof stateSchema>;
const baseCommand = {
  id: dateSchema,
  revision: z.number().int().nonnegative(),
};
export const commandSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start"), ...baseCommand }),
  z.object({
    action: z.literal("set"),
    ...baseCommand,
    exercise: z.number().int().nonnegative(),
    set: z.number().int().nonnegative(),
    status: z.enum(["done", "pending", "skipped"]),
    reps: z.number().int().min(1).max(100),
    weight: z.number().min(0).max(200),
    resistance: z.string().max(40),
  }),
  z.object({ action: z.literal("finish"), ...baseCommand }),
  z.object({
    action: z.literal("timer"),
    ...baseCommand,
    operation: z.enum(["pause", "resume", "skip", "add"]),
  }),
  z.object({
    action: z.literal("morning"),
    day: dateSchema,
    done: z.boolean(),
  }),
  z.object({
    action: z.literal("equipment"),
    dumbbellMax: z.number().min(1).max(200),
  }),
]);
export type Command = z.infer<typeof commandSchema>;

export function localDay(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function monday(day: string) {
  const d = new Date(day + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
export function addDays(day: string, amount: number) {
  const d = new Date(day + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + amount);
  return d.toISOString().slice(0, 10);
}
export function counts(w: Workout) {
  const sets = w.exercises.flatMap((e) => e.sets);
  return {
    done: sets.filter((s) => s.status === "done").length,
    total: sets.length,
    pending: sets.filter((s) => s.status === "pending").length,
  };
}
export function createWorkout(
  day: string,
  split: Workout["split"],
  library: Exercise[],
  history: Workout[],
  max = 20,
): Workout {
  const variant =
    history.filter((w) => w.split === split && w.finishedAt).length % 2;
  const selected = library.filter((e) => e.split === split);
  // Keep compound movements stable. Alternate one accessory for variety.
  const choices = [
    ...selected.slice(0, 4),
    selected[4 + variant] ?? selected[4],
  ].filter(Boolean);
  return {
    id: day,
    split,
    title: split === "upper" ? "Upper body" : "Lower body",
    startedAt: null,
    finishedAt: null,
    restUntil: null,
    pausedRest: null,
    revision: 0,
    exercises: choices.map((exercise) => {
      const last = [...history]
        .filter((w) => w.finishedAt)
        .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
        .flatMap((w) => w.exercises)
        .find((e) => e.exercise.id === exercise.id);
      const done = last?.sets.filter((s) => s.status === "done");
      const previous = done?.at(-1);
      // Carry actual logged reps/load forward; do not infer readiness or add weight automatically.
      return {
        exercise,
        sets: Array.from({ length: exercise.sets }, () => ({
          reps: previous?.reps ?? exercise.reps,
          weight: Math.min(previous?.weight ?? exercise.weight, max),
          resistance: previous?.resistance ?? "Light",
          status: "pending" as const,
          at: null,
        })),
      };
    }),
  };
}
export function nextSplit(workouts: Workout[]): Workout["split"] {
  const last = [...workouts]
    .filter((w) => w.finishedAt && counts(w).done > 0)
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))[0];
  return last?.split === "upper" ? "lower" : "upper";
}
export function prepareWeek(state: FitnessState, week: string): Workout[] {
  if (monday(week) !== week) throw new Error("Use a Monday date for the week.");
  let split = nextSplit(state.workouts);
  const active = state.workouts.find((w) => w.startedAt && !w.finishedAt);
  if (active) split = active.split === "upper" ? "lower" : "upper";
  const history = state.workouts.filter((w) => w.finishedAt || w.startedAt);
  return [0, 1, 3, 5].map((offset) => {
    const day = addDays(week, offset);
    const existing = state.workouts.find((w) => w.id === day);
    // Sunday reruns preserve the entire already-prepared week.
    if (existing) {
      split = existing.split === "upper" ? "lower" : "upper";
      return existing;
    }
    const workout = createWorkout(
      day,
      split,
      state.library.filter((e) =>
        e.equipment.every((x) => state.equipment.includes(x)),
      ),
      history,
      state.dumbbellMax,
    );
    split = split === "upper" ? "lower" : "upper";
    return workout;
  });
}
export function applyWorkoutCommand(
  input: Workout,
  command: Exclude<Command, { action: "morning" | "equipment" }>,
  now = Date.now(),
): Workout {
  if (input.revision !== command.revision)
    throw new Error(
      "This workout changed on another device. Refreshed; try again.",
    );
  const w = structuredClone(input);
  if (w.finishedAt) throw new Error("This session is already finished.");
  if (command.action === "start") w.startedAt ??= now;
  else if (command.action === "set") {
    if (!w.startedAt) throw new Error("Start this session first.");
    const row = w.exercises[command.exercise];
    const set = row?.sets[command.set];
    if (!set) throw new Error("Set not found.");
    Object.assign(set, {
      status: command.status,
      reps: command.reps,
      weight: command.weight,
      resistance: command.resistance,
      at: command.status === "pending" ? null : now,
    });
    w.restUntil =
      command.status === "done" && counts(w).pending > 0
        ? now + row.exercise.rest * 1000
        : null;
    w.pausedRest = null;
  } else if (command.action === "finish") {
    if (!w.startedAt || counts(w).pending)
      throw new Error("Complete or skip the remaining sets first.");
    w.finishedAt = now;
    w.restUntil = null;
    w.pausedRest = null;
  } else {
    if (command.operation === "pause") {
      w.pausedRest = Math.max(0, (w.restUntil ?? now) - now);
      w.restUntil = null;
    }
    if (command.operation === "resume") {
      w.restUntil = now + (w.pausedRest ?? 0);
      w.pausedRest = null;
    }
    if (command.operation === "skip") {
      w.restUntil = null;
      w.pausedRest = null;
    }
    if (command.operation === "add") {
      if (w.pausedRest !== null) w.pausedRest += 30000;
      else w.restUntil = Math.max(now, w.restUntil ?? now) + 30000;
    }
  }
  w.revision++;
  return w;
}
