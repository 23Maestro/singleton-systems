"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, X } from "@phosphor-icons/react";
import { DEFAULT_MINUTES, SNAP_MINUTES } from "@/lib/command-center-schedule";

type Props = {
  title: string;
  days: string[];
  today: string;
  busy: boolean;
  onPlace: (date: string, minute: number, duration: number) => Promise<void>;
  onClose: () => void;
};

function nextQuarter() {
  const now = new Date();
  const minute =
    Math.ceil((now.getHours() * 60 + now.getMinutes()) / SNAP_MINUTES) *
    SNAP_MINUTES;
  return Math.min(minute, 1440 - DEFAULT_MINUTES);
}
function clock(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}
function label(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
  });
}

export default function SchedulePicker({
  title,
  days,
  today,
  busy,
  onPlace,
  onClose,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [date, setDate] = useState(days.includes(today) ? today : days[0]);
  const [minute, setMinute] = useState(nextQuarter);
  const [duration, setDuration] = useState(DEFAULT_MINUTES);
  const [saving, setSaving] = useState(false);
  const locked = busy || saving;

  useEffect(() => {
    const element = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    element.showModal();
    return () => {
      element.close();
      previous?.focus();
    };
  }, []);

  function step(delta: number) {
    setMinute((current) =>
      Math.min(1440 - duration, Math.max(0, current + delta)),
    );
  }
  async function place() {
    if (locked) return;
    setSaving(true);
    try {
      await onPlace(date, Math.min(minute, 1440 - duration), duration);
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="cc-picker"
      aria-label="Schedule task"
      onCancel={(event) => {
        event.preventDefault();
        if (!locked) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !locked) onClose();
      }}
    >
      <header>
        <strong title={title}>{title}</strong>
        <button
          type="button"
          onClick={onClose}
          disabled={locked}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </header>
      <div className="cc-picker-days" role="group" aria-label="Day">
        {days.map((day) => (
          <button
            key={day}
            type="button"
            aria-pressed={day === date}
            className={day === date ? "on" : ""}
            onClick={() => setDate(day)}
          >
            {label(day)}
          </button>
        ))}
      </div>
      <div className="cc-picker-time" role="group" aria-label="Start time">
        <button
          type="button"
          aria-label="15 minutes earlier"
          onClick={() => step(-SNAP_MINUTES)}
        >
          <Minus size={18} />
        </button>
        <input
          type="time"
          aria-label="Start time"
          step={900}
          value={clock(minute)}
          onChange={(event) => {
            const [h, m] = event.target.value.split(":").map(Number);
            if (!Number.isNaN(h))
              setMinute(
                Math.min(
                  1440 - duration,
                  Math.round((h * 60 + m) / SNAP_MINUTES) * SNAP_MINUTES,
                ),
              );
          }}
        />
        <button
          type="button"
          aria-label="15 minutes later"
          onClick={() => step(SNAP_MINUTES)}
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="cc-picker-durations" role="group" aria-label="Duration">
        {[15, 30, 60, 90, 120].map((minutes) => (
          <button
            key={minutes}
            type="button"
            aria-pressed={minutes === duration}
            className={minutes === duration ? "on" : ""}
            onClick={() => setDuration(minutes)}
          >
            {minutes >= 60 ? `${minutes / 60}h` : `${minutes}m`}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="cc-picker-place"
        disabled={locked}
        onClick={() => void place()}
      >
        {saving ? "Scheduling…" : "Schedule"}
      </button>
    </dialog>
  );
}
