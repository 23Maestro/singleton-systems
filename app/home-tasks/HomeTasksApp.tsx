"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Armchair,
  ArrowsClockwise,
  Bathtub,
  BuildingOffice,
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

const roomStyles: Record<Room, { color: string; bg: string; signal: string; icon: "toolbox" | "bath" | "garage" | "kitchen" | "laundry" | "sofa" | "office" }> = {
  Auto: { color: "#2F80ED", bg: "rgba(47,128,237,.16)", signal: "#2F80ED", icon: "toolbox" },
  Bathroom: { color: "#00A7A7", bg: "rgba(0,167,167,.16)", signal: "#00A7A7", icon: "bath" },
  Garage: { color: "#8A63D2", bg: "rgba(138,99,210,.16)", signal: "#8A63D2", icon: "garage" },
  Kitchen: { color: "#F2A93B", bg: "rgba(242,169,59,.18)", signal: "#F2A93B", icon: "kitchen" },
  Laundry: { color: "#27AE60", bg: "rgba(39,174,96,.16)", signal: "#27AE60", icon: "laundry" },
  "Living Room": { color: "#D9474F", bg: "rgba(217,71,79,.16)", signal: "#D9474F", icon: "sofa" },
  Office: { color: "#ffffff", bg: "#425466", signal: "#9AA8B6", icon: "office" },
};

const durationStyles: Record<Duration, { bg: string; color: string; border: string }> = {
  "5m": { bg: "#25C266", color: "#06140B", border: "rgba(37,194,102,.3)" },
  "10m": { bg: "#62D26F", color: "#071407", border: "rgba(98,210,111,.3)" },
  "15m": { bg: "#B7D84B", color: "#171A05", border: "rgba(183,216,75,.32)" },
  "30m": { bg: "#F4C542", color: "#1D1500", border: "rgba(244,197,66,.34)" },
  "45m": { bg: "#F2A93B", color: "#1E1000", border: "rgba(242,169,59,.36)" },
  "60m": { bg: "#F27A2E", color: "#FFFFFF", border: "rgba(242,122,46,.38)" },
  "90m": { bg: "#E85D3F", color: "#FFFFFF", border: "rgba(232,93,63,.4)" },
  "2h": { bg: "#D9474F", color: "#FFFFFF", border: "rgba(217,71,79,.42)" },
  "4h+": { bg: "#9F2F36", color: "#FFFFFF", border: "rgba(159,47,54,.45)" },
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
      <div className="fixed inset-0 overflow-hidden bg-[radial-gradient(circle_at_50%_-140px,rgba(47,128,237,.22),transparent_360px),linear-gradient(145deg,#f8fbff_0%,#eef5ff_48%,#f7f1ec_100%)] dark:bg-[radial-gradient(circle_at_50%_-150px,rgba(47,128,237,.28),transparent_390px),linear-gradient(145deg,#000_0%,#08111d_52%,#030506_100%)]">
        <div className="absolute left-1/2 top-5 h-36 w-[82vw] max-w-lg -translate-x-1/2 rounded-full bg-white/25 blur-3xl dark:bg-white/8" />
        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-[#D9474F]/18 blur-3xl dark:bg-[#D9474F]/16" />
        <div className="absolute right-[-120px] top-56 h-96 w-96 rounded-full bg-[#2F80ED]/20 blur-3xl dark:bg-[#2F80ED]/20" />
        <div className="absolute bottom-[-170px] left-1/3 h-96 w-96 rounded-full bg-[#27AE60]/16 blur-3xl dark:bg-[#27AE60]/18" />
      </div>

      <section className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-3 pb-24 pt-[max(12px,env(safe-area-inset-top))] sm:px-6">
        <header className="sticky top-0 z-10 -mx-3 mb-4 flex items-center justify-between gap-3 border-b border-black/5 bg-white/58 px-3 py-3 shadow-[0_18px_48px_rgba(15,23,42,.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-black/38 dark:shadow-[0_18px_48px_rgba(0,0,0,.35)] sm:mx-0 sm:rounded-[28px] sm:border">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/home-tasks-icon.svg"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-2xl shadow-[0_12px_28px_rgba(16,24,32,.24)] dark:shadow-[0_0_22px_rgba(47,128,237,.22)]"
              priority
            />
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
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-black/5 bg-white/55 shadow-sm backdrop-blur-xl transition active:scale-95 dark:border-white/10 dark:bg-white/10"
              aria-label="Refresh"
            >
              <RefreshIcon />
            </button>
            <button
              type="button"
              onClick={() => {
                addTask();
              }}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#101820] text-white shadow-[0_12px_26px_rgba(16,24,32,.25)] transition active:scale-95 dark:bg-[#f7f8fa] dark:text-[#101820]"
              aria-label="Add task"
            >
              <PlusIcon />
            </button>
          </div>
        </header>

        <section className="mb-4 grid grid-cols-3 gap-2">
          <StatTile label="Today" value={String(todayTasks.length)} tone="#D9474F" />
          <StatTile label="Time" value={formatMinutes(todayMinutes)} tone="#2F80ED" />
          <StatTile label="Rooms" value={`${activeRooms}/${rooms.length}`} tone="#27AE60" />
        </section>

        <div className="mb-4 grid grid-cols-2 rounded-[22px] border border-white/60 bg-white/52 p-1 shadow-[0_18px_44px_rgba(15,23,42,.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/8 dark:shadow-[0_18px_44px_rgba(0,0,0,.28)]">
          {(["Today", "Rooms"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={`h-11 rounded-xl text-sm font-semibold transition ${
                view === item ? "bg-[#111820] text-white shadow-sm dark:bg-[#f7f8fa] dark:text-[#101820]" : "text-[#607080] dark:text-[#b8c4cf]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <RoomRail tasks={tasks} />

        {error ? (
          <div className="mb-4 rounded-[24px] border border-[#D9474F]/20 bg-[#D9474F]/10 p-4 shadow-sm backdrop-blur-xl">
            <p className="mb-3 text-sm font-medium text-[#9f2f36] dark:text-[#ffb6bb]">{error}</p>
            <button
              type="button"
              onClick={() => loadTasks()}
              className="h-10 rounded-2xl bg-[#111820] px-4 text-sm font-semibold text-white dark:bg-white dark:text-[#101820]"
            >
              Retry
            </button>
          </div>
        ) : null}

        {loading ? <LoadingState /> : view === "Today" ? <TaskList tasks={todayTasks} empty="No Today tasks." onToggle={togglePlan} onEdit={editTask} /> : null}

        {!loading && view === "Rooms" ? (
          <div className="space-y-3">
            {rooms.map((room) => {
              const roomTasks = tasks.filter((task) => task.room === room);
              return (
                <RoomSection key={room} room={room} tasks={roomTasks} onToggle={togglePlan} onEdit={editTask} onAdd={addTask} />
              );
            })}
          </div>
        ) : null}
      </section>

      {editing ? (
        <div className="fixed inset-0 z-20 overflow-hidden bg-black/56 backdrop-blur-md">
          <form
            onSubmit={saveTask}
            className="mx-auto h-[var(--home-tasks-vvh,100dvh)] max-h-[var(--home-tasks-vvh,100dvh)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-none border-x border-white/70 bg-white/95 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))] shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-[rgba(16,24,32,0.94)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{form.taskId ? "Edit Task" : "Add Task"}</h2>
              <button type="button" onClick={() => setEditing(false)} className="grid h-10 w-10 place-items-center rounded-2xl bg-black/5 dark:bg-white/10" aria-label="Close">
                <CloseIcon />
              </button>
            </div>

            <label className="mb-3 block">
              <span className="mb-1 block text-base font-medium text-[#394856] dark:text-white">Task</span>
              <input
                value={form.task}
                onChange={(event) => setForm({ ...form, task: event.target.value })}
                className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-[#101820] outline-none transition [color-scheme:light] placeholder:text-[#7b8792] focus:border-[#2F80ED] dark:border-white/10 dark:bg-[#0d1624] dark:text-[#f7f8fa] dark:[color-scheme:dark] dark:placeholder:text-[#758391]"
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
                    className={`h-11 rounded-2xl border text-sm font-semibold transition ${
                      form.plan === plan
                        ? "border-[#D9474F] bg-[#D9474F] text-white"
                        : "border-black/10 bg-[#d7dde3] text-[#24313d] dark:border-white/10 dark:bg-[#303946] dark:text-white"
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
                className="min-h-20 w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-[#101820] outline-none transition [color-scheme:light] placeholder:text-[#7b8792] focus:border-[#2F80ED] dark:border-white/10 dark:bg-[#0d1624] dark:text-[#f7f8fa] dark:[color-scheme:dark] dark:placeholder:text-[#758391]"
              />
            </label>

            {!form.taskId ? (
              <label className="mb-4 flex items-center gap-3 rounded-2xl border border-black/10 bg-white/82 px-3 py-3 text-base font-medium text-[#394856] shadow-sm dark:border-white/10 dark:bg-[#1f2934] dark:text-white">
                <input
                  type="checkbox"
                  checked={form.saveAsOption}
                  onChange={(event) => setForm({ ...form, saveAsOption: event.target.checked })}
                  className="h-5 w-5 accent-[#2F80ED]"
                />
                Save as room option
              </label>
            ) : null}

            <button
              disabled={saving || !form.task.trim()}
              className="h-12 w-full rounded-2xl bg-[#111820] text-sm font-semibold text-white shadow-lg transition active:scale-[.99] disabled:bg-[#9aa1a8] disabled:text-white dark:bg-[#f7f8fa] dark:text-[#101820] dark:disabled:bg-[#303946] dark:disabled:text-white"
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
    <div className="rounded-[22px] border border-white/60 bg-white/56 p-3 shadow-[0_16px_38px_rgba(15,23,42,.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/8 dark:shadow-[0_16px_38px_rgba(0,0,0,.22)]">
      <div className="mb-2 h-1.5 w-8 rounded-full" style={{ backgroundColor: tone }} />
      <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#607080] dark:text-[#aeb8c2]">{label}</p>
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
            className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/60 bg-white/52 px-3 py-2 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/8"
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: style.bg, color: style.color }}>
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
            className="shrink-0 rounded-2xl border border-black/10 bg-white/72 px-3 py-2 text-sm font-semibold text-[#1d2a35] shadow-sm dark:border-white/10 dark:bg-[#0d1624] dark:text-[#f7f8fa]"
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
  onAdd,
}: {
  room: Room;
  tasks: HomeTask[];
  onToggle: (task: HomeTask) => void;
  onEdit: (task: HomeTask) => void;
  onAdd: (room: Room) => void;
}) {
  const style = roomStyles[room];
  return (
    <section className="rounded-[26px] border border-white/60 bg-white/52 p-3 shadow-[0_18px_44px_rgba(15,23,42,.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/8 dark:shadow-[0_18px_44px_rgba(0,0,0,.24)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl" style={{ background: style.bg, color: style.color }}>
            <RoomIcon name={style.icon} />
          </span>
          <h2 className="truncate text-lg font-semibold">{room}</h2>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: style.bg, color: style.color }}>
          {tasks.length}
        </span>
      </div>
      <TaskList tasks={tasks} empty="No tasks." onToggle={onToggle} onEdit={onEdit} />
      <button
        type="button"
        onClick={() => onAdd(room)}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/62 text-sm font-semibold text-[#24313d] shadow-sm backdrop-blur-xl transition active:scale-[.99] dark:border-white/10 dark:bg-[#0d1624] dark:text-[#f7f8fa]"
      >
        <PlusIcon />
        Add {room}
      </button>
    </section>
  );
}

function TaskList({ tasks, empty, onToggle, onEdit }: { tasks: HomeTask[]; empty: string; onToggle: (task: HomeTask) => void; onEdit: (task: HomeTask) => void }) {
  if (!tasks.length) {
    return <div className="rounded-[24px] border border-black/8 bg-white/70 p-5 text-center text-sm font-medium text-[#394856] backdrop-blur-xl dark:border-white/10 dark:bg-[#1f2934] dark:text-white">{empty}</div>;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const style = roomStyles[task.room];
        return (
          <article key={task.taskId} className="rounded-[22px] border border-white/55 bg-white/72 p-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
            <div className="flex items-start gap-2.5">
              <span
                className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border border-white/70 shadow-[0_0_0_4px_rgba(255,255,255,.5)] dark:border-white/25 dark:shadow-[0_0_0_4px_rgba(255,255,255,.06)]"
                style={{ backgroundColor: style.signal, boxShadow: `0 0 0 4px ${style.bg}, 0 0 18px ${style.signal}55` }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="break-words text-base font-semibold leading-snug">{task.task}</h3>
                  <button type="button" onClick={() => onEdit(task)} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black/5 dark:bg-white/10" aria-label="Edit task">
                    <EditIcon />
                  </button>
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
                      task.plan === "Today" ? "bg-[#D9474F] text-white" : "bg-black/5 text-[#607080] dark:bg-white/10 dark:text-[#b8c4cf]"
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
        className="h-12 w-full appearance-none rounded-2xl border border-black/10 bg-white px-3 text-[#101820] outline-none transition [color-scheme:light] focus:border-[#2F80ED] dark:border-white/10 dark:bg-[#0d1624] dark:text-[#f7f8fa] dark:[color-scheme:dark]"
      >
        {values.map((item) => (
          <option key={item} className="bg-white text-[#101820] dark:bg-[#0d1624] dark:text-[#f7f8fa]">
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
      className="rounded-full border px-3 py-1 text-xs font-bold shadow-sm"
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
        <div key={item} className="h-24 animate-pulse rounded-[24px] border border-white/60 bg-white/55 backdrop-blur-xl dark:border-white/10 dark:bg-white/8" />
      ))}
    </div>
  );
}

function RoomIcon({ name }: { name: (typeof roomStyles)[Room]["icon"] }) {
  const props = { size: 22, weight: "duotone" as const };
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
