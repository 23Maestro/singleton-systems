import { parse } from "chrono-node/en";
import type { TaskPlan } from "./command-center";

const dateKey = (day: Date) => `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;

export function parsePlanInput(text: string, today: string): { date: string; start: string; period: TaskPlan["period"] } | null {
  const value = text.trim().toLowerCase();
  if (!value) return null;
  if (value === "someday" || value === "inbox") return { date: "", start: "", period: value };
  const horizon = value.match(/^(this|next) (week|month)$/);
  if (horizon) {
    const day = new Date(`${today}T12:00:00`);
    const offset = horizon[1] === "next" ? 1 : 0;
    if (horizon[2] === "week") day.setDate(day.getDate() - (day.getDay() + 6) % 7 + offset * 7);
    else { day.setDate(1); day.setMonth(day.getMonth() + offset); }
    return { date: dateKey(day), start: "", period: horizon[2] as "week" | "month" };
  }
  const result = parse(text, new Date(), { forwardDate: true })[0];
  if (!result || result.end) return null;
  const day = result.start.date();
  if (!Number.isFinite(day.getTime())) return null;
  return {
    date: dateKey(day), period: "day",
    start: result.start.isCertain("hour") ? `${String(day.getHours()).padStart(2, "0")}:${String(day.getMinutes()).padStart(2, "0")}` : "",
  };
}

export function planTimeLabel(time: string): string {
  return time ? new Date(`2000-01-01T${time}`).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "";
}
