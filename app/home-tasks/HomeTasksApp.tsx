"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Armchair,
  ArrowsClockwise,
  Bathtub,
  BuildingOffice,
  Check,
  CookingPot,
  Garage,
  PencilSimple,
  Plus,
  Toolbox,
  WashingMachine,
  X,
} from "@phosphor-icons/react";

const rooms = ["Auto", "Bathroom", "Garage", "Kitchen", "Laundry", "Living Room", "Office"] as const;
const durations = ["5m", "10m", "15m", "30m", "45m", "60m", "90m", "2h", "4h+"] as const;
const plans = ["Pending", "Today"] as const;

type Room = (typeof rooms)[number];
type Duration = (typeof durations)[number];
type Plan = (typeof plans)[number];

type HomeTask = {
  taskId: string;
  room: Room;
  task: string;
  duration: Duration;
  plan: Plan;
  notes: string;
};

type HomeTaskOption = {
  room: Room;
  task: string;
  duration: Duration;
  notes: string;
};

type TaskForm = {
  taskId?: string;
  room: Room;
  task: string;
  duration: Duration;
  plan: Plan;
  notes: string;
  saveAsOption: boolean;
};

const BLUE = "#2383E2";
const YELLOW = "#FFC83D";
const CORAL = "#FF6257";
const GREEN = "#25C266";

const roomStyles: Record<Room, { color: string; bg: string; signal: string; icon: "toolbox" | "bath" | "garage" | "kitchen" | "laundry" | "sofa" | "office" }> = {
  Auto: { color: BLUE, bg: "rgba(35,131,226,.14)", signal: BLUE, icon: "toolbox" },
  Bathroom: { color: BLUE, bg: "rgba(35,131,226,.14)", signal: BLUE, icon: "bath" },
  Garage: { color: "#101820", bg: "rgba(16,24,32,.08)", signal: "#101820", icon: "garage" },
  Kitchen: { color: "#101820", bg: "rgba(255,200,61,.28)", signal: YELLOW, icon: "kitchen" },
  Laundry: { color: GREEN, bg: "rgba(37,194,102,.14)", signal: GREEN, icon: "laundry" },
  "Living Room": { color: CORAL, bg: "rgba(255,98,87,.14)", signal: CORAL, icon: "sofa" },
  Office: { color: "#ffffff", bg: "#101820", signal: "#9AA8B6", icon: "office" },
};

// Short durations read as fine (green), long ones read as urgent (coral); yellow marks the
// mid-range warning band and is a fill-only color, never used as text per the brand rule.
const durationStyles: Record<Duration, { bg: string; color: string; border: string }> = {
  "5m": { bg: GREEN, color: "#06140B", border: "rgba(37,194,102,.3)" },
  "10m": { bg: GREEN, color: "#06140B", border: "rgba(37,194,102,.3)" },
  "15m": { bg: YELLOW, color: "#1E1500", border: "rgba(255,200,61,.34)" },
  "30m": { bg: YELLOW, color: "#1E1500", border: "rgba(255,200,61,.34)" },
  "45m": { bg: YELLOW, color: "#1E1500", border: "rgba(255,200,61,.34)" },
  "60m": { bg: CORAL, color: "#FFFFFF", border: "rgba(255,98,87,.38)" },
  "90m": { bg: CORAL, color: "#FFFFFF", border: "rgba(255,98,87,.38)" },
  "2h": { bg: CORAL, color: "#FFFFFF", border: "rgba(255,98,87,.38)" },
  "4h+": { bg: CORAL, color: "#FFFFFF", border: "rgba(255,98,87,.38)" },
};

const emptyForm: TaskForm = {
  room: "Office",
  task: "",
  duration: "15m",
  plan: "Pending",
  notes: "",
  saveAsOption: false,
};

export default function HomeTasksApp() {
  const [tasks, setTasks] = useState<HomeTask[]>([]);
  const [taskOptions, setTaskOptions] = useState<HomeTaskOption[]>([]);
  const [view, setView] = useState<"Today" | "Rooms">("Today");
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch("/api/home-tasks", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load tasks.");
        setTasks(data.tasks);
        setTaskOptions(data.options || []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load tasks."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!editing) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const updateViewportHeight = () => {
      document.documentElement.style.setProperty("--home-tasks-vvh", `${window.visualViewport?.height || window.innerHeight}px`);
    };

    updateViewportHeight();
    window.visualViewport?.addEventListener("resize", updateViewportHeight);
    window.visualViewport?.addEventListener("scroll", updateViewportHeight);
    return () => {
      window.visualViewport?.removeEventListener("resize", updateViewportHeight);
      window.visualViewport?.removeEventListener("scroll", updateViewportHeight);
      document.documentElement.style.removeProperty("--home-tasks-vvh");
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [editing]);

  const todayTasks = useMemo(() => tasks.filter((task) => task.plan === "Today"), [tasks]);
  const pendingCount = tasks.filter((task) => task.plan === "Pending").length;
  const todayMinutes = todayTasks.reduce((total, task) => total + durationToMinutes(task.duration), 0);
  const activeRooms = rooms.filter((room) => tasks.some((task) => task.room === room)).length;

  async function request(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");
    const response = await fetch(path, { ...init, headers, cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed.");
    return data;
  }

  async function loadTasks() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/home-tasks", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load tasks.");
      setTasks(data.tasks);
      setTaskOptions(data.options || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load tasks.");
    } finally {
      setLoading(false);
    }
  }

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.task.trim()) return;
    setSaving(true);
    setError("");
    try {
      const method = form.taskId ? "PATCH" : "POST";
      const data = await request("/api/home-tasks", {
        method,
        body: JSON.stringify(form),
      });
      setTasks((current) => {
        if (!form.taskId) return [...current, data.task];
        return current.map((task) => (task.taskId === data.task.taskId ? data.task : task));
      });
      if (form.saveAsOption && !form.taskId) {
        setTaskOptions((current) => addLocalOption(current, data.task));
      }
      setForm(emptyForm);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save task.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePlan(task: HomeTask) {
    const nextPlan = task.plan === "Today" ? "Pending" : "Today";
    setTasks((current) => current.map((item) => (item.taskId === task.taskId ? { ...item, plan: nextPlan } : item)));
    try {
      await request("/api/home-tasks", {
        method: "PATCH",
        body: JSON.stringify({ taskId: task.taskId, plan: nextPlan }),
      });
    } catch (err) {
      setTasks((current) => current.map((item) => (item.taskId === task.taskId ? task : item)));
      setError(err instanceof Error ? err.message : "Could not update task.");
    }
  }

  async function completeTask(task: HomeTask) {
    setCompletingTaskId(task.taskId);
    setError("");
    setTasks((current) => current.filter((item) => item.taskId !== task.taskId));
    try {
      await request("/api/home-tasks", {
        method: "DELETE",
        body: JSON.stringify({ taskId: task.taskId }),
      });
    } catch (err) {
      setTasks((current) => [...current, task]);
      setError(err instanceof Error ? err.message : "Could not complete task.");
    } finally {
      setCompletingTaskId("");
    }
  }

  function editTask(task: HomeTask) {
    setForm({ ...task, saveAsOption: false });
    setEditing(true);
  }

  function addTask(room: Room = "Office") {
    setForm({ ...emptyForm, room });
    setEditing(true);
  }

  function useTaskOption(option: HomeTaskOption) {
    setForm({
      ...form,
      room: option.room,
      task: option.task,
      duration: option.duration,
      notes: option.notes,
    });
  }

  return (
    <main className="min-h-dvh bg-[#eef3f7] text-[#101820] [color-scheme:light_dark] dark:bg-black dark:text-[#f7f8fa]">
      <section className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-3 pb-24 pt-[max(12px,env(safe-area-inset-top))] sm:px-6">
        <header className="sticky top-0 z-10 -mx-3 mb-4 flex items-center justify-between gap-3 border-b border-black/10 bg-white px-3 py-3 dark:border-white/10 dark:bg-black sm:mx-0">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/home-tasks-icon.svg" alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-2xl" priority />
            <div className="min-w-0">
              <h1 className="truncate text-[22px] font-semibold tracking-normal">Home Tasks</h1>
              <p className="text-sm text-[#607080] dark:text-[#aeb8c2]">
                {todayTasks.length} today / {pendingCount} pending
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loadTasks()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-[1.5px] border-black/80 transition active:scale-95 dark:border-white/80"
              aria-label="Refresh"
            >
              <RefreshIcon />
            </button>
            <button
              type="button"
              onClick={() => {
                addTask();
              }}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#101820] text-white transition active:scale-95 dark:bg-[#f7f8fa] dark:text-[#101820]"
              aria-label="Add task"
            >
              <PlusIcon />
            </button>
          </div>
        </header>

        <section className="mb-4 grid grid-cols-3 gap-2">
          <StatTile label="Today" value={String(todayTasks.length)} tone={CORAL} />
          <StatTile label="Time" value={formatMinutes(todayMinutes)} tone={BLUE} />
          <StatTile label="Rooms" value={`${activeRooms}/${rooms.length}`} tone={GREEN} />
        </section>

        <div className="mb-4 grid grid-cols-2 rounded-xl border border-black/10 p-1 dark:border-white/10">
          {(["Today", "Rooms"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={`h-11 rounded-lg text-sm font-semibold transition ${
                view === item ? "bg-[#111820] text-white dark:bg-[#f7f8fa] dark:text-[#101820]" : "text-[#607080] dark:text-[#b8c4cf]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <RoomRail tasks={tasks} />

        {error ? (
          <div className="mb-4 rounded-xl border border-brand-coral/30 bg-brand-coral/10 p-4">
            <p className="mb-3 text-sm font-medium text-brand-text-coral">{error}</p>
            <button
              type="button"
              onClick={() => loadTasks()}
              className="h-10 rounded-full bg-[#111820] px-4 text-sm font-semibold text-white dark:bg-white dark:text-[#101820]"
            >
              Retry
            </button>
          </div>
        ) : null}

        {loading ? <LoadingState /> : view === "Today" ? <TaskList tasks={todayTasks} empty="No Today tasks." onToggle={togglePlan} onEdit={editTask} onComplete={completeTask} completingTaskId={completingTaskId} /> : null}

        {!loading && view === "Rooms" ? (
          <div className="space-y-3">
            {rooms.map((room) => {
              const roomTasks = tasks.filter((task) => task.room === room);
              return (
                <RoomSection key={room} room={room} tasks={roomTasks} onToggle={togglePlan} onEdit={editTask} onComplete={completeTask} completingTaskId={completingTaskId} onAdd={addTask} />
              );
            })}
          </div>
        ) : null}
      </section>

      {editing ? (
        <div className="fixed inset-0 z-20 overflow-hidden bg-black/56">
          <form
            onSubmit={saveTask}
            className="mx-auto h-[var(--home-tasks-vvh,100dvh)] max-h-[var(--home-tasks-vvh,100dvh)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-none border-x border-black/10 bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))] dark:border-white/15 dark:bg-black"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{form.taskId ? "Edit Task" : "Add Task"}</h2>
              <button type="button" onClick={() => setEditing(false)} className="grid h-10 w-10 place-items-center rounded-full border-[1.5px] border-black/80 dark:border-white/80" aria-label="Close">
                <CloseIcon />
              </button>
            </div>

            <label className="mb-3 block">
              <span className="mb-1 block text-base font-medium text-[#394856] dark:text-white">Task</span>
              <input
                value={form.task}
                onChange={(event) => setForm({ ...form, task: event.target.value })}
                className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-[#101820] outline-none transition [color-scheme:light] placeholder:text-[#7b8792] dark:border-white/10 dark:bg-black dark:text-[#f7f8fa] dark:[color-scheme:dark] dark:placeholder:text-[#758391]"
                autoFocus
              />
            </label>

            <TaskOptionChips
              options={taskOptions.filter((option) => option.room === form.room)}
              onSelect={useTaskOption}
            />

            <div className="mb-3 grid grid-cols-2 gap-3">
              <SelectField label="Room" value={form.room} values={rooms} onChange={(room) => setForm({ ...form, room: room as Room })} />
              <SelectField label="Duration" value={form.duration} values={durations} onChange={(duration) => setForm({ ...form, duration: duration as Duration })} />
            </div>

            <div className="mb-3">
              <span className="mb-2 block text-base font-medium text-[#394856] dark:text-white">Plan</span>
              <div className="grid grid-cols-2 gap-2">
                {plans.map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setForm({ ...form, plan })}
                    className={`h-11 rounded-full text-sm font-semibold transition ${
                      form.plan === plan
                        ? "bg-brand-coral text-white"
                        : "border-[1.5px] border-black/80 text-[#101820] dark:border-white/80 dark:text-white"
                    }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </div>

            <label className="mb-4 block">
              <span className="mb-1 block text-base font-medium text-[#394856] dark:text-white">Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                className="min-h-20 w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-[#101820] outline-none transition [color-scheme:light] placeholder:text-[#7b8792] dark:border-white/10 dark:bg-black dark:text-[#f7f8fa] dark:[color-scheme:dark] dark:placeholder:text-[#758391]"
              />
            </label>

            {!form.taskId ? (
              <label className="mb-4 flex items-center gap-3 rounded-xl border border-black/10 bg-white px-3 py-3 text-base font-medium text-[#394856] dark:border-white/10 dark:bg-black dark:text-white">
                <input
                  type="checkbox"
                  checked={form.saveAsOption}
                  onChange={(event) => setForm({ ...form, saveAsOption: event.target.checked })}
                  className="h-5 w-5 accent-brand-blue"
                />
                Save as room option
              </label>
            ) : null}

            <button
              disabled={saving || !form.task.trim()}
              className="h-12 w-full rounded-full bg-[#111820] text-sm font-semibold text-white transition active:scale-[.99] disabled:bg-[#9aa1a8] disabled:text-white dark:bg-[#f7f8fa] dark:text-[#101820] dark:disabled:bg-[#303946] dark:disabled:text-white"
            >
              {saving ? "Saving" : "Save"}
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}

function StatTile({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-black">
      <div className="mb-2 h-1.5 w-8 rounded-full" style={{ backgroundColor: tone }} />
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[.08em] text-[#607080] dark:text-[#aeb8c2]">{label}</p>
      <p className="mt-1 text-xl font-semibold leading-none">{value}</p>
    </div>
  );
}

function RoomRail({ tasks }: { tasks: HomeTask[] }) {
  return (
    <div className="mb-4 -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
      {rooms.map((room) => {
        const style = roomStyles[room];
        const count = tasks.filter((task) => task.room === room).length;
        return (
          <div
            key={room}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-black"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: style.bg, color: style.color }}>
              <RoomIcon name={style.icon} />
            </span>
            <span className="text-sm font-semibold">{room}</span>
            <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: style.bg, color: style.color }}>
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TaskOptionChips({ options, onSelect }: { options: HomeTaskOption[]; onSelect: (option: HomeTaskOption) => void }) {
  if (!options.length) return null;
  return (
    <div className="mb-3">
      <span className="mb-2 block text-base font-medium text-[#394856] dark:text-white">Saved</span>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {options.map((option) => (
          <button
            key={`${option.room}-${option.task}`}
            type="button"
            onClick={() => onSelect(option)}
            className="shrink-0 rounded-full border-[1.5px] border-black/80 px-3 py-2 text-sm font-semibold text-[#101820] dark:border-white/80 dark:text-white"
          >
            {option.task}
          </button>
        ))}
      </div>
    </div>
  );
}

function RoomSection({
  room,
  tasks,
  onToggle,
  onEdit,
  onComplete,
  completingTaskId,
  onAdd,
}: {
  room: Room;
  tasks: HomeTask[];
  onToggle: (task: HomeTask) => void;
  onEdit: (task: HomeTask) => void;
  onComplete: (task: HomeTask) => void;
  completingTaskId: string;
  onAdd: (room: Room) => void;
}) {
  const style = roomStyles[room];
  return (
    <section className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-black">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: style.bg, color: style.color }}>
            <RoomIcon name={style.icon} />
          </span>
          <h2 className="truncate text-lg font-semibold">{room}</h2>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: style.bg, color: style.color }}>
          {tasks.length}
        </span>
      </div>
      <TaskList tasks={tasks} empty="No tasks." onToggle={onToggle} onEdit={onEdit} onComplete={onComplete} completingTaskId={completingTaskId} />
      <button
        type="button"
        onClick={() => onAdd(room)}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-black/80 text-sm font-semibold text-[#101820] transition active:scale-[.99] dark:border-white/80 dark:text-white"
      >
        <PlusIcon />
        Add {room}
      </button>
    </section>
  );
}

function TaskList({
  tasks,
  empty,
  onToggle,
  onEdit,
  onComplete,
  completingTaskId,
}: {
  tasks: HomeTask[];
  empty: string;
  onToggle: (task: HomeTask) => void;
  onEdit: (task: HomeTask) => void;
  onComplete: (task: HomeTask) => void;
  completingTaskId: string;
}) {
  if (!tasks.length) {
    return <div className="rounded-xl border border-black/10 bg-white p-5 text-center text-sm font-medium text-[#394856] dark:border-white/10 dark:bg-black dark:text-white">{empty}</div>;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const style = roomStyles[task.room];
        return (
          <article key={task.taskId} className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-black">
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: style.signal }} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="break-words text-base font-semibold leading-snug">{task.task}</h3>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onComplete(task)}
                      disabled={completingTaskId === task.taskId}
                      className="grid h-9 w-9 place-items-center rounded-full bg-brand-green text-[#06140B] transition active:scale-95 disabled:opacity-60"
                      aria-label={`Complete ${task.task}`}
                      title="Complete"
                    >
                      <CheckIcon />
                    </button>
                    <button type="button" onClick={() => onEdit(task)} className="grid h-9 w-9 place-items-center rounded-full border-[1.5px] border-black/80 dark:border-white/80" aria-label="Edit task">
                      <EditIcon />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: style.bg, color: style.color }}>
                    {task.room}
                  </span>
                  <DurationPill duration={task.duration} />
                  <button
                    type="button"
                    onClick={() => onToggle(task)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      task.plan === "Today" ? "bg-brand-coral text-white" : "bg-black/5 text-[#607080] dark:bg-white/10 dark:text-[#b8c4cf]"
                    }`}
                  >
                    {task.plan}
                  </button>
                </div>
                {task.notes ? <p className="mt-2 break-words text-sm text-[#607080] dark:text-[#aeb8c2]">{task.notes}</p> : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function SelectField({ label, value, values, onChange }: { label: string; value: string; values: readonly string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-base font-medium text-[#394856] dark:text-white">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none rounded-xl border border-black/10 bg-white px-3 text-[#101820] outline-none transition [color-scheme:light] dark:border-white/10 dark:bg-black dark:text-[#f7f8fa] dark:[color-scheme:dark]"
      >
        {values.map((item) => (
          <option key={item} className="bg-white text-[#101820] dark:bg-black dark:text-[#f7f8fa]">
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}

function DurationPill({ duration }: { duration: Duration }) {
  const style = durationStyles[duration];
  return (
    <span
      className="rounded-full border px-3 py-1 text-xs font-bold"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        color: style.color,
      }}
    >
      {duration}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-24 animate-pulse rounded-xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5" />
      ))}
    </div>
  );
}

function RoomIcon({ name }: { name: (typeof roomStyles)[Room]["icon"] }) {
  const props = { size: 22, weight: "bold" as const };
  if (name === "toolbox") return <Toolbox {...props} />;
  if (name === "bath") return <Bathtub {...props} />;
  if (name === "garage") return <Garage {...props} />;
  if (name === "kitchen") return <CookingPot {...props} />;
  if (name === "laundry") return <WashingMachine {...props} />;
  if (name === "sofa") return <Armchair {...props} />;
  return <BuildingOffice {...props} />;
}

function PlusIcon() {
  return <Plus size={22} weight="bold" />;
}

function CheckIcon() {
  return <Check size={18} weight="bold" />;
}

function EditIcon() {
  return <PencilSimple size={18} weight="bold" />;
}

function CloseIcon() {
  return <X size={20} weight="bold" />;
}

function RefreshIcon() {
  return <ArrowsClockwise size={20} weight="bold" />;
}

function durationToMinutes(duration: Duration) {
  if (duration.endsWith("m")) return Number(duration.replace("m", ""));
  if (duration === "2h") return 120;
  return 240;
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function addLocalOption(options: HomeTaskOption[], task: HomeTask) {
  const exists = options.some(
    (option) => option.room === task.room && option.task.trim().toLowerCase() === task.task.trim().toLowerCase()
  );
  if (exists) return options;
  return [...options, { room: task.room, task: task.task, duration: task.duration, notes: task.notes }];
}
