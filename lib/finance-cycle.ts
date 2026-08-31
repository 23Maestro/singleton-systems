export type FinanceCycle = {
  start: string;
  end: string;
  label: string;
};

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Bi-weekly cycle fixed to the calendar: 1st-15th, then 16th-end of month. */
export function getCycleForDate(date: Date): FinanceCycle {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const lastDay = daysInMonth(year, month);
  const monthLabel = MONTH_LABELS[month];

  if (day <= 15) {
    return {
      start: toISODate(year, month, 1),
      end: toISODate(year, month, 15),
      label: `${monthLabel} 1-15`,
    };
  }
  return {
    start: toISODate(year, month, 16),
    end: toISODate(year, month, lastDay),
    label: `${monthLabel} 16-${lastDay}`,
  };
}

export function cycleProgress(cycle: FinanceCycle, today: Date): number {
  const start = new Date(`${cycle.start}T00:00:00`);
  const end = new Date(`${cycle.end}T00:00:00`);
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  const elapsed = Math.round((current.getTime() - start.getTime()) / 86400000) + 1;
  const clamped = Math.min(totalDays, Math.max(1, elapsed));
  return Math.round((clamped / totalDays) * 100);
}

export function daysLeftInCycle(cycle: FinanceCycle, today: Date): number {
  const end = new Date(`${cycle.end}T00:00:00`);
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((end.getTime() - current.getTime()) / 86400000);
  return Math.max(0, diff);
}
