"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Dumbbell,
  ExternalLink,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Timer,
  X,
} from "lucide-react";
import {
  counts,
  localDay,
  monday,
  addDays,
  type Command,
  type FitnessState,
  type Media,
  type Workout,
} from "@/lib/fitness/model";
import { EquipmentVisual, ExerciseVisual } from "./Visual";
import { exerciseImages } from "@/lib/fitness/images";
import s from "./fitness.module.css";
type Tab = "today" | "week" | "mobility";
const labels: Record<string, string> = {
  dumbbells: "Dumbbells",
  "handle-bands": "Handle bands",
  "mini-bands": "Mini loop bands",
  "loop-bands": "Loop bands",
  block: "Yoga block",
  roller: "Foam roller",
  stick: "Mobility stick · 6 ft+",
  "ab-wheel": "Ab wheel",
  bodyweight: "Bodyweight",
};
const dayLabel = (day: string, short = false) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: short ? "short" : "long",
    timeZone: "UTC",
  }).format(new Date(day + "T12:00:00Z"));
const dateLabel = (day: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(day + "T12:00:00Z"));
export default function FitnessApp() {
  const [state, setState] = useState<FitnessState | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState<Tab>("today"),
    [selected, setSelected] = useState<string | null>(null),
    [week, setWeek] = useState(() => monday(localDay())),
    [settings, setSettings] = useState(false),
    [now, setNow] = useState(() => Date.now()),
    [celebrate, setCelebrate] = useState(false);
  const initialized = useRef(false),
    inFlight = useRef(false),
    reduced = useReducedMotion(),
    gearDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [tab]);
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/fitness", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setState(data);
      setError("");
      if (!initialized.current) {
        const active =
          data.workouts.find((w: Workout) => w.startedAt && !w.finishedAt) ??
          data.workouts.find((w: Workout) => w.id >= localDay());
        if (active) setWeek(monday(active.id));
        initialized.current = true;
      }
      return data as FitnessState;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your log.");
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const refresh = () => {
      if (!document.hidden && !inFlight.current) void load();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const id = setInterval(refresh, 30000);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [load]);
  useEffect(() => {
    if (settings) gearDialog.current?.showModal();
    else gearDialog.current?.close();
  }, [settings]);
  async function send(command: Command) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/fitness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) await load();
        throw new Error(data.error ?? "Could not save this change.");
      }
      setState(data);
      if (command.action === "finish") setSelected(command.id);
      if (
        (command.action === "set" && command.status === "done") ||
        (command.action === "morning" && command.done)
      ) {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 1300);
      }
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save. Try again.");
      return false;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  const today = localDay(new Date(now)),
    active = state?.workouts.find((w) => w.startedAt && !w.finishedAt);
  const workout =
    state?.workouts.find((w) => w.id === selected) ??
    active ??
    state?.workouts.find((w) => w.id >= today && !w.finishedAt) ??
    state?.workouts.at(-1);
  const finished =
    state?.workouts.filter((w) => w.finishedAt && counts(w).done > 0).length ??
    0;
  const earned = state
    ? state.workouts.reduce((n, w) => n + counts(w).done, 0) * 10 +
      state.morningDays.length * 20
    : 0;
  const morning = state?.media.find((m) => m.id === "morning"),
    morningDone = state?.morningDays.includes(today) ?? false;
  const showWorkout = (w: Workout) => {
    setSelected(w.id);
    setTab("today");
  };
  if (!state)
    return (
      <main className={s.app}>
        <div className={s.gate}>
          <div className={s.logo}>
            <FitnessBrand />
          </div>
          <h1>
            Your workouts +<br />
            morning movements.
          </h1>
          <p>{error || "Opening your workout log…"}</p>
          {error && (
            <button onClick={() => void load()} className={s.primary}>
              Try again
            </button>
          )}
        </div>
      </main>
    );
  return (
    <main className={s.app} data-view={tab}>
      {celebrate && (
        <motion.div
          className={s.reward}
          role="status"
          initial={reduced ? false : { y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Check size={18} />
          <span>Saved.</span>
        </motion.div>
      )}
      <div className={s.shell}>
        <header className={s.header}>
          <a href="/fitness" className={s.logo}>
            <FitnessBrand />
          </a>
          <div className={s.headerRight}>
            <span className={s.date}>{dateLabel(today)}</span>
            <button
              className={s.iconButton}
              aria-label="Your equipment"
              onClick={() => setSettings(true)}
            >
              <Settings2 size={21} />
            </button>
          </div>
        </header>
        <nav className={s.nav} aria-label="Fitness">
          <span className={s.navCaption}>YOUR SPACE</span>
          {(
            [
              { id: "today", name: "Session", icon: Dumbbell },
              { id: "week", name: "This week", icon: CalendarDays },
              { id: "mobility", name: "Mobility", icon: Sparkles },
            ] as const
          ).map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => setTab(id)}
            >
              <Icon size={20} />
              <span>{name}</span>
              {tab === id && <span className={s.navDot} />}
            </button>
          ))}
          <div className={s.navFoot}>Just the next set.</div>
        </nav>
        <aside className={s.weekPanel}>
          <div className={s.sectionHeading}>
            <div>
              <span className={s.eyebrow}>THE GAME PLAN</span>
              <h2>Your week</h2>
            </div>
            <CalendarDays size={20} />
          </div>
          <div className={s.weekPager}>
            <button
              className={s.iconButton}
              aria-label="Previous week"
              onClick={() => setWeek(addDays(week, -7))}
            >
              <ArrowLeft size={17} />
            </button>
            <span>
              {dateLabel(week)} – {dateLabel(addDays(week, 6))}
            </span>
            <button
              className={s.iconButton}
              aria-label="Next week"
              onClick={() => setWeek(addDays(week, 7))}
            >
              <ArrowRight size={17} />
            </button>
          </div>
          <div className={s.days}>
            {Array.from({ length: 7 }, (_, i) => addDays(week, i)).map(
              (day) => {
                const w = state.workouts.find((x) => x.id === day),
                  done = w?.finishedAt && counts(w).done > 0;
                return w ? (
                  <button
                    key={day}
                    className={`${s.day} ${workout?.id === day ? s.daySelected : ""}`}
                    onClick={() => showWorkout(w)}
                  >
                    <span className={s.dayDate}>
                      {dayLabel(day, true)}
                      <b>{day.slice(-2)}</b>
                    </span>
                    <span className={s.dayTitle}>
                      {w.title}
                      <small>
                        {done
                          ? `${counts(w).done} sets logged`
                          : w.finishedAt
                            ? "Skipped"
                            : w.startedAt
                              ? "In progress"
                              : day < today
                                ? "Not started"
                                : "45 min · strength"}
                      </small>
                    </span>
                    <span className={done ? s.doneCircle : s.dayCircle}>
                      {done ? <Check size={15} /> : <ChevronRight size={17} />}
                    </span>
                  </button>
                ) : (
                  <div key={day} className={s.restDay}>
                    <span>{dayLabel(day, true)}</span>
                    <span>Recovery & mobility</span>
                  </div>
                );
              },
            )}
          </div>
          <p className={s.weekNote}>
            Upper and lower days follow your completed sessions.
          </p>
          <div className={s.progressSummary}>
            <div>
              <strong>Your progress</strong>
              <span>{earned} points earned</span>
              <small>{finished} sessions finished</small>
            </div>
          </div>
        </aside>
        <section className={s.content}>
          {error && (
            <div className={s.error} role="alert">
              {error}
              <button
                className={s.textButton}
                onClick={() => {
                  setError("");
                  void load();
                }}
              >
                Refresh
              </button>
            </div>
          )}
          {morning && (
            <section id="morning-routine" className={s.morningVideo} aria-labelledby="morning-title">
              <div className={s.morningHeading}>
                <div>
                  <span className={s.eyebrow}>FULL BODY · BEFORE YOUR WORKOUT</span>
                  <h2 id="morning-title">Morning stretch</h2>
                </div>
                <button
                  className={`${s.morningCheck} ${morningDone ? s.checked : ""}`}
                  disabled={busy}
                  aria-label={morningDone ? "Undo morning completion" : "Mark morning complete"}
                  aria-pressed={morningDone}
                  onClick={() => void send({ action: "morning", day: today, done: !morningDone })}
                >
                  <Check size={19} />
                </button>
              </div>
              <VideoPlayer media={morning} />
            </section>
          )}
          {tab === "mobility" ? (
            <>
              <span className={s.eyebrow}>MAKE ROOM TO MOVE</span>
              <h1>Loosen up.</h1>
              <p className={s.intro}>
                Your familiar morning routine, plus a little movement where you
                need it.
              </p>
              <div className={s.regionGrid}>
                {Object.entries(
                  state.media.filter((item) => item.id !== "morning").reduce(
                    (groups, item) => {
                      (groups[item.area] ??= []).push(item);
                      return groups;
                    },
                    {} as Record<string, Media[]>,
                  ),
                ).map(([area, videos]) => (
                  <section key={area} className={s.regionCard} aria-label={area.replaceAll("-", " ")}>
                    <header className={s.regionHeading}>
                      <h2>{area.replaceAll("-", " ")}</h2>
                      <span>{videos.length} {videos.length === 1 ? "video" : "videos"}</span>
                    </header>
                    {videos.map((item) => (
                      <article key={item.id} className={s.regionVideo}>
                        <h3>{item.title}</h3>
                        <VideoPlayer media={item} />
                        {!item.reviewed && <small>Reference only</small>}
                      </article>
                    ))}
                  </section>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={s.titleRow}>
                <div>
                  <span className={s.eyebrow}>
                    {workout?.startedAt && !workout.finishedAt
                      ? "PICK UP WHERE YOU LEFT OFF"
                      : workout?.finishedAt
                        ? "IN THE BOOKS"
                        : "ONE SET AT A TIME"}
                  </span>
                  <h1>{workout?.title ?? "Your next week."}</h1>
                  <p className={s.intro}>
                    {workout
                      ? `${dayLabel(workout.id)} · ${dateLabel(workout.id)} · 45-minute session`
                      : "Your next plan will appear here after Sunday’s review."}
                  </p>
                </div>
                <span className={s.splitBadge}>
                  {workout?.split === "lower" ? "↓" : "↑"}
                </span>
              </div>
              {workout ? (
                <Session
                  key={workout.id}
                  workout={workout}
                  send={send}
                  busy={busy}
                  now={now}
                  max={state.dumbbellMax}
                  activeId={active?.id}
                />
              ) : (
                <div className={s.empty}>
                  <CalendarDays size={32} />
                  <h2>No sessions prepared yet.</h2>
                  <p>Morning movement is ready above.</p>
                </div>
              )}

            </>
          )}
        </section>
        <aside className={s.extra}>
          <span className={s.eyebrow}>A LITTLE EVERY DAY</span>
          <h2>Start with movement.</h2>
          <p>Your morning routine is always here. No new decisions required.</p>
          <a className={s.outlineButton} href="#morning-routine">
            <Play size={17} /> Morning routine
          </a>
          <div className={s.extraLine} />
          <span className={s.eyebrow}>MADE FOR YOUR SPACE</span>
          <div className={s.equipmentPreview}>
            <Dumbbell size={32} />
            <div>
              <strong>{state.dumbbellMax} lb / dumbbell</strong>
              <small>Bands, bodyweight & mobility gear</small>
            </div>
          </div>
          <button className={s.textButton} onClick={() => setSettings(true)}>
            View equipment <ArrowRight size={15} />
          </button>
        </aside>
      </div>
      <dialog
        ref={gearDialog}
        className={s.dialog}
        onCancel={() => setSettings(false)}
      >
        <div className={s.dialogHead}>
          <div>
            <span className={s.eyebrow}>YOUR HOME SETUP</span>
            <h2>Ready to use.</h2>
          </div>
          <button
            className={s.iconButton}
            autoFocus
            aria-label="Close equipment"
            onClick={() => setSettings(false)}
          >
            <X />
          </button>
        </div>
        <div className={s.gearList}>
          {state.equipment.map((gear) => (
            <div key={gear}>
              <EquipmentVisual gear={gear} />
              <span>
                {labels[gear]}
                {gear === "dumbbells" && (
                  <small>
                    {state.dumbbellMax} lb each · {state.dumbbellMax * 2} lb
                    total
                  </small>
                )}
              </span>
              <Check size={18} />
            </div>
          ))}
        </div>
        <form
          className={s.gearForm}
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            if (
              await send({
                action: "equipment",
                dumbbellMax: Number(form.get("max")),
              })
            )
              setSettings(false);
          }}
        >
          <label htmlFor="max">Maximum weight per dumbbell (lb)</label>
          <input
            id="max"
            name="max"
            type="number"
            min="1"
            max="200"
            step="0.5"
            defaultValue={state.dumbbellMax}
            required
          />
          <button className={s.primary} disabled={busy}>
            Save equipment
          </button>
        </form>
      </dialog>
    </main>
  );
}
function Session({
  workout: w,
  send,
  busy,
  now,
  max,
  activeId,
}: {
  workout: Workout;
  send: (c: Command) => Promise<boolean | undefined>;
  busy: boolean;
  now: number;
  max: number;
  activeId?: string;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const c = counts(w),
    nextIndex = w.exercises.findIndex((e) =>
      e.sets.some((x) => x.status === "pending"),
    ),
    index = expanded ?? Math.max(0, nextIndex),
    entry = w.exercises[index];
  const seconds = Math.max(
    0,
    Math.ceil((w.pausedRest ?? (w.restUntil ?? now) - now) / 1000),
  );
  const timerVisible = Boolean(
    w.pausedRest !== null || (w.restUntil && w.restUntil > now),
  );
  const base = { id: w.id, revision: w.revision };
  return (
    <>
      <div className={s.progressHeader}>
        <span>
          {w.finishedAt
            ? "Session saved"
            : w.startedAt
              ? "You’re in motion"
              : "Your session"}
        </span>
        <span>
          <b>{c.done}</b> / {c.total} sets
        </span>
      </div>
      <div
        className={s.progressTrack}
        role="progressbar"
        aria-label="Sets completed"
        aria-valuemin={0}
        aria-valuemax={c.total}
        aria-valuenow={c.done}
      >
        <div style={{ width: `${(c.done / c.total) * 100}%` }} />
      </div>
      {w.finishedAt ? (
        <div className={s.complete}>
          <div>
            <span className={s.eyebrow}>{c.done * 10} POINTS EARNED</span>
            <h2>{c.done ? "Work put in." : "Session closed."}</h2>
            <p>
              {c.done
                ? `${c.done} completed sets. Your next days are ready.`
                : "Your next session keeps the same upper/lower sequence."}
            </p>
          </div>
        </div>
      ) : !w.startedAt ? (
        <div className={s.startCard}>
          <div className={s.startArt}>
            <ExerciseVisual id={w.exercises[0].exercise.id} />
          </div>
          <div>
            <span className={s.eyebrow}>LET’S GET INTO IT</span>
            <h2>
              {w.exercises.length} movements.
              <br />
              One good session.
            </h2>
            <p>
              Start easy. Take a few minutes to warm up.
              <br />
              Choose comfortable loads for today.
            </p>
            <button
              className={s.primary}
              disabled={busy || Boolean(activeId && activeId !== w.id)}
              onClick={() => void send({ action: "start", ...base })}
            >
              {activeId && activeId !== w.id
                ? "Resume your active session first"
                : busy
                  ? "Starting…"
                  : "Start session"}
              <Play size={17} />
            </button>
          </div>
        </div>
      ) : null}
      {w.startedAt && !w.finishedAt && entry && (
        <section className={s.currentExercise}>
          <div className={s.exerciseHero}>
            {exerciseImages[entry.exercise.id] && (
              <div className={s.exerciseArt}>
                <ExerciseVisual id={entry.exercise.id} />
              </div>
            )}
            <div>
              <span className={s.eyebrow}>
                MOVEMENT {index + 1} OF {w.exercises.length}
              </span>
              <h2>{entry.exercise.name}</h2>
              <p>
                {entry.sets.length} sets · {entry.sets[0].reps} reps
                {["db-row", "reverse-lunge", "lateral-walk"].includes(
                  entry.exercise.id,
                )
                  ? " each side"
                  : ""}
              </p>
            </div>
          </div>
          <div className={s.cues}>
            {entry.exercise.cues.map((cue) => (
              <p key={cue}>{cue}</p>
            ))}
          </div>
          <div className={s.setHeading}>
            <span>SET</span>
            <span>REPS</span>
            <span>
              {entry.exercise.equipment.includes("dumbbells")
                ? "LB / DB"
                : entry.exercise.equipment.some((x) => x.includes("bands"))
                  ? "BAND"
                  : "LOAD"}
            </span>
            <span>LOG</span>
          </div>
          {entry.sets.map((set, i) => (
            <SetRow
              key={`${w.id}-${index}-${i}-${set.status}-${set.reps}-${set.weight}`}
              set={set}
              number={i + 1}
              max={max}
              weighted={entry.exercise.equipment.includes("dumbbells")}
              banded={entry.exercise.equipment.some((x) => x.includes("bands"))}
              busy={busy}
              onSave={async (status, reps, weight, resistance) => {
                const ok = await send({
                  action: "set",
                  ...base,
                  exercise: index,
                  set: i,
                  status,
                  reps,
                  weight,
                  resistance,
                });
                if (ok && status !== "pending") setExpanded(null);
              }}
            />
          ))}
          <p className={s.logHint}>Finish all reps, then tap the check.</p>
        </section>
      )}
      {w.startedAt && !w.finishedAt && timerVisible && (
        <div className={s.timer}>
          <div className={s.timerLabel}>
            <Timer size={20} />
            <span>
              REST
              <b>
                {Math.floor(seconds / 60)}:
                {String(seconds % 60).padStart(2, "0")}
              </b>
            </span>
          </div>
          <div className={s.timerControls}>
            <button
              className={s.iconButton}
              disabled={busy}
              aria-label={
                w.pausedRest !== null ? "Resume rest timer" : "Pause rest timer"
              }
              onClick={() =>
                void send({
                  action: "timer",
                  ...base,
                  operation: w.pausedRest !== null ? "resume" : "pause",
                })
              }
            >
              {w.pausedRest !== null ? <Play size={19} /> : <Pause size={19} />}
            </button>
            <button
              className={s.textButton}
              disabled={busy}
              onClick={() =>
                void send({ action: "timer", ...base, operation: "add" })
              }
            >
              <Plus size={15} />
              30s
            </button>
            <button
              className={s.textButton}
              disabled={busy}
              onClick={() =>
                void send({ action: "timer", ...base, operation: "skip" })
              }
            >
              Skip
            </button>
          </div>
        </div>
      )}
      {w.startedAt && !w.finishedAt && c.pending === 0 && (
        <button
          className={`${s.primary} ${s.finishButton}`}
          disabled={busy}
          onClick={() => void send({ action: "finish", ...base })}
        >
          {busy ? "Saving…" : "Finish session"}
          <Check size={20} />
        </button>
      )}
      <div className={s.sectionHeading}>
        <h2>{w.finishedAt ? "Your log" : "The lineup"}</h2>
        <span>{w.exercises.length} movements</span>
      </div>
      <div className={s.lineup}>
        {w.exercises.map((e, i) => {
          const done = e.sets.filter((x) => x.status === "done").length;
          return (
            <button
              key={e.exercise.id}
              className={`${s.lineupRow} ${w.startedAt && !w.finishedAt && i === index ? s.lineupActive : ""}`}
              onClick={() => {
                setExpanded(i);
                document
                  .querySelector(`.${s.currentExercise}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              disabled={!w.startedAt || Boolean(w.finishedAt)}
            >
              {exerciseImages[e.exercise.id] && (
                <span className={s.miniArt}>
                  <ExerciseVisual id={e.exercise.id} compact />
                </span>
              )}
              <span>
                <strong>{e.exercise.name}</strong>
                <small>
                  {w.finishedAt
                    ? e.sets
                        .map(
                          (x, i) =>
                            `${i + 1}: ${x.status === "done" ? `${x.reps} reps${e.exercise.equipment.includes("dumbbells") ? ` · ${x.weight} lb` : ""}` : x.status}`,
                        )
                        .join(" / ")
                    : `${e.sets.length} sets · ${e.sets[0].reps} reps`}
                </small>
              </span>
              {done === e.sets.length ? (
                <span className={s.doneCircle}>
                  <Check size={16} />
                </span>
              ) : (
                <span className={s.lineupCount}>
                  {done}/{e.sets.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
function SetRow({
  set,
  number,
  max,
  weighted,
  banded,
  busy,
  onSave,
}: {
  set: Workout["exercises"][number]["sets"][number];
  number: number;
  max: number;
  weighted: boolean;
  banded: boolean;
  busy: boolean;
  onSave: (
    status: "done" | "pending" | "skipped",
    reps: number,
    weight: number,
    resistance: string,
  ) => void;
}) {
  const [reps, setReps] = useState(String(set.reps)),
    [weight, setWeight] = useState(set.weight ? String(set.weight) : ""),
    [resistance, setResistance] = useState(set.resistance);
  const invalid =
    !Number.isInteger(Number(reps)) ||
    Number(reps) < 1 ||
    Number(reps) > 100 ||
    (weighted && (!weight || Number(weight) < 0 || Number(weight) > max));
  return (
    <div className={`${s.setRow} ${set.status === "done" ? s.setDone : ""}`}>
      <span className={s.setNumber}>{number}</span>
      <input
        aria-label={`Set ${number} reps`}
        type="number"
        min="1"
        max="100"
        inputMode="numeric"
        value={reps}
        disabled={busy || set.status !== "pending"}
        onChange={(e) => setReps(e.target.value)}
      />
      {weighted ? (
        <input
          aria-label={`Set ${number} weight in pounds`}
          placeholder="lb"
          type="number"
          min="0"
          max={max}
          step="0.5"
          inputMode="decimal"
          value={weight}
          disabled={busy || set.status !== "pending"}
          onChange={(e) => setWeight(e.target.value)}
        />
      ) : banded ? (
        <select
          aria-label={`Set ${number} band resistance`}
          value={resistance}
          disabled={busy || set.status !== "pending"}
          onChange={(e) => setResistance(e.target.value)}
        >
          {["X-light", "Light", "Medium", "Heavy", "X-heavy"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      ) : (
        <span className={s.bodyweight}>Body</span>
      )}
      <button
        className={`${s.setCheck} ${set.status === "done" ? s.checked : ""}`}
        aria-label={
          set.status === "pending"
            ? `Complete set ${number}`
            : `Undo set ${number}`
        }
        disabled={busy || (set.status === "pending" && invalid)}
        onClick={() =>
          onSave(
            set.status === "pending" ? "done" : "pending",
            Number(reps),
            Number(weight),
            resistance,
          )
        }
      >
        {set.status === "skipped" ? (
          <RotateCcw size={17} />
        ) : (
          <Check size={21} />
        )}
      </button>
      {set.status === "pending" && (
        <button
          className={s.skipSet}
          disabled={busy}
          onClick={() =>
            onSave("skipped", set.reps, set.weight, set.resistance)
          }
          aria-label={`Skip set ${number}`}
        >
          Skip
        </button>
      )}
      {set.status !== "pending" && (
        <span className={s.setStatus}>
          {set.status === "done"
            ? "Logged · tap to undo"
            : "Skipped · tap to undo"}
        </span>
      )}
    </div>
  );
}

function FitnessBrand() {
  return (
    <>
      <Image
        className={s.wordmark}
        src="/brand/ssystems-logo-wordmark-white-2640x1040.png"
        width={180}
        height={71}
        alt="Singleton Systems"
        priority
      />
      <Dumbbell className={s.brandDumbbell} size={23} aria-hidden="true" />
    </>
  );
}

function VideoPlayer({ media }: { media: Media }) {
  const instagram = new URL(media.embed).hostname.endsWith("instagram.com");
  return (
    <div className={s.videoPlayer}>
      <iframe
        title={media.title}
        src={media.embed}
        className={instagram ? s.instagram : s.youtube}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <details className={s.playbackHelp}>
        <summary>Video not playing?</summary>
        <a href={media.source} target="_blank" rel="noreferrer">
          Open video <ExternalLink size={14} />
        </a>
      </details>
    </div>
  );
}
