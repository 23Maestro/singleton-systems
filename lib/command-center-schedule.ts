// Pure scheduling math for the Command Center calendar. No server imports.
export const SNAP_MINUTES = 15;
export const DEFAULT_MINUTES = 60;
export const DAY_MINUTES = 1440;

export type Placement = {
  selectedDate: string;
  startsAt: string;
  endsAt: string;
};
type TimedBlock = { starts_at: string | null; ends_at: string | null };

export function snapMinutes(minutes: number) {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
}

export function minuteFromOffset(offsetPx: number, hourPx: number) {
  const minutes = snapMinutes((offsetPx / hourPx) * 60);
  return Math.min(DAY_MINUTES, Math.max(0, minutes));
}

function atMinute(date: string, minute: number) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day, 0, minute, 0, 0);
}

function placement(date: string, start: number, duration: number): Placement {
  const clamped = Math.min(Math.max(0, start), DAY_MINUTES - duration);
  const startsAt = atMinute(date, clamped);
  return {
    selectedDate: date,
    startsAt: startsAt.toISOString(),
    endsAt: new Date(startsAt.getTime() + duration * 60000).toISOString(),
  };
}

export function blockSpan(block: TimedBlock) {
  const start = new Date(block.starts_at!);
  const duration = Math.round(
    (Date.parse(block.ends_at!) - start.getTime()) / 60000,
  );
  const startMinute = start.getHours() * 60 + start.getMinutes();
  return { start: startMinute, end: startMinute + duration, duration };
}

export function newPlacement(
  date: string,
  startMinute: number,
  duration = DEFAULT_MINUTES,
) {
  return placement(date, snapMinutes(startMinute), duration);
}

export function movePlacement(
  block: TimedBlock,
  date: string,
  startMinute: number,
) {
  return placement(date, snapMinutes(startMinute), blockSpan(block).duration);
}

export function resizePlacement(block: TimedBlock, endMinute: number) {
  const { start } = blockSpan(block);
  const end = Math.min(
    DAY_MINUTES,
    Math.max(start + SNAP_MINUTES, snapMinutes(endMinute)),
  );
  const date = new Date(block.starts_at!);
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return placement(key, start, end - start);
}
