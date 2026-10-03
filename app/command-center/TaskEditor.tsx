"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowSquareOut,
  ArrowsOutSimple,
  Check,
  DotsThree,
  Flag,
  Folder,
  LinkSimple,
  Plus,
  Sparkle,
  Tag,
  TextAlignLeft,
  X,
} from "@phosphor-icons/react";
import type { AsanaProject } from "@/lib/command-center-asana";
import type { Block, WorkItem, Lane } from "@/lib/command-center";

export type TaskEdit = {
  projectId: string;
  sectionId: string;
  title: string;
  description: string;
  dueDate: string | null;
  date: string;
  start: string;
  duration: number;
};

type Props = {
  work: WorkItem | null;
  block: Block | null;
  today: string;
  busy: boolean;
  error: string;
  laneColors: Record<Lane, string>;
  projects: AsanaProject[];
  onSave: (edit: TaskEdit) => Promise<boolean>;
  onComplete: () => Promise<void>;
  onState: (state: string) => Promise<void>;
  onRemove: () => Promise<void>;
  onSubtask: (title: string) => Promise<boolean>;
  onClose: () => void;
};

export default function TaskEditor({
  work,
  block,
  today,
  busy,
  error,
  laneColors,
  projects,
  onSave,
  onComplete,
  onState,
  onRemove,
  onSubtask,
  onClose,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState(work?.title ?? "");
  const [description, setDescription] = useState(work?.description ?? "");
  const [dueDate, setDueDate] = useState(work?.dueDate?.slice(0, 10) ?? "");
  const [date, setDate] = useState(block?.selected_date ?? today);
  const [start, setStart] = useState(
    block?.starts_at
      ? new Date(block.starts_at).toTimeString().slice(0, 5)
      : "",
  );
  const [duration, setDuration] = useState(
    block?.starts_at && block.ends_at
      ? (Date.parse(block.ends_at) - Date.parse(block.starts_at)) / 60000
      : 60,
  );
  const [panel, setPanel] = useState<
    "date" | "time" | "duration" | "deadline" | "state" | "menu" | null
  >(null);
  const [expanded, setExpanded] = useState(false);
  const [addingLink, setAddingLink] = useState(false);
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [validation, setValidation] = useState("");
  const locked = busy || saving;
  const [projectId, setProjectId] = useState(work?.projectId ?? "linear");
  const [sectionId, setSectionId] = useState(work?.sectionId ?? "");
  const project = projects.find((p) => p.id === projectId);
  const editable = !work || work.owner !== "notion";
  const lane = work?.lane ?? project?.lane ?? "Development";
  const laneColor = laneColors[lane];
  const changed =
    title.trim() !== (work?.title ?? "") ||
    description.trim() !== (work?.description ?? "") ||
    dueDate !== (work?.dueDate?.slice(0, 10) ?? "") ||
    date !== (block?.selected_date ?? today) ||
    start !==
      (block?.starts_at
        ? new Date(block.starts_at).toTimeString().slice(0, 5)
        : "") ||
    duration !==
      (block?.starts_at && block.ends_at
        ? (Date.parse(block.ends_at) - Date.parse(block.starts_at)) / 60000
        : 60);
  const durationLabel =
    duration >= 60
      ? `${Math.floor(duration / 60)}h${duration % 60 ? ` ${duration % 60}m` : ""}`
      : `${duration}m`;
  const states =
    work?.states ??
    (work?.owner === "notion"
      ? ["Today", "Queued", "In Motion", "Waiting", "Done"]
      : ["Todo", "In Progress", "In Review", "Done"]);

  useEffect(() => {
    const element = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    element.showModal();
    element.querySelector<HTMLInputElement>(".cc-editor-title")?.focus();
    return () => {
      element.close();
      previous?.focus();
    };
  }, []);

  function toggle(next: typeof panel) {
    setPanel(panel === next ? null : next);
  }
  async function addSubtask() {
    if (locked || !subtaskTitle.trim()) return;
    setSaving(true);
    try {
      if (await onSubtask(subtaskTitle.trim())) {
        setSubtaskTitle("");
        setAddingSubtask(false);
      }
    } catch (cause) {
      setValidation(
        cause instanceof Error ? cause.message : "Could not add the subtask.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    if (!title.trim()) {
      setValidation("Add a task name.");
      return;
    }
    if (!date) {
      setValidation("Choose a date.");
      return;
    }
    if (description.length > 10000 && editable) {
      setValidation("Keep the description under 10,000 characters.");
      return;
    }
    const [hour, minute] = start.split(":").map(Number);
    if (
      start &&
      (minute % 15 !== 0 ||
        duration < 15 ||
        duration % 15 !== 0 ||
        hour * 60 + minute + duration > 1440)
    ) {
      setValidation("Use 15-minute intervals within one day.");
      return;
    }
    setValidation("");
    setSaving(true);
    try {
      await onSave({
        projectId,
        sectionId,
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
        date,
        start,
        duration,
      });
    } catch (cause) {
      setValidation(
        cause instanceof Error ? cause.message : "Could not save the task.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className={`cc-task-dialog ${expanded ? "expanded" : ""}`}
      aria-label={work ? "Edit task" : "New task"}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            "button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled)",
          ),
        ).filter((element) => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls.at(-1);
        if (
          (!event.shiftKey && document.activeElement === last) ||
          (event.shiftKey && document.activeElement === first)
        ) {
          event.preventDefault();
          (event.shiftKey ? last : first)?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        if (!locked) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !locked) onClose();
      }}
      style={{ "--lane": laneColor } as React.CSSProperties}
    >
      <div className="cc-editor-tools">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Compact editor" : "Expand editor"}
          aria-pressed={expanded}
        >
          <ArrowsOutSimple size={18} />
        </button>
        {work && (
          <a
            href={work.url}
            target="_blank"
            rel="noreferrer"
            aria-label="Open source"
          >
            <ArrowSquareOut size={18} />
          </a>
        )}
        <button
          type="button"
          onClick={() => toggle("menu")}
          aria-label="Task menu"
          aria-expanded={panel === "menu"}
        >
          <DotsThree size={22} />
        </button>
        <button
          type="submit"
          form="cc-task-editor-form"
          disabled={locked || !changed}
          aria-label="Save changes"
          title="Save changes"
        >
          <Check size={18} />
        </button>
        <button
          type="button"
          disabled={locked}
          onClick={onClose}
          aria-label="Close editor"
        >
          <X size={18} />
        </button>
        {panel === "menu" && (
          <div className="cc-editor-popover cc-editor-menu">
            {block && (
              <button type="button" disabled={locked} onClick={onRemove}>
                Remove time block
              </button>
            )}
            <button type="button" disabled={locked} onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
      <form id="cc-task-editor-form" onSubmit={save}>
        <div className="cc-editor-schedule">
          <div className="cc-editor-control">
            <button
              type="button"
              className="cc-editor-chip"
              onClick={() => toggle("date")}
              aria-label="Scheduled date"
              aria-expanded={panel === "date"}
            >
              {new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </button>
            {panel === "date" && (
              <div className="cc-editor-popover">
                <label>
                  Date
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    required
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setDate(today);
                    setPanel(null);
                  }}
                >
                  Today
                </button>
              </div>
            )}
          </div>
          <div className="cc-editor-control">
            <button
              type="button"
              className="cc-editor-chip"
              onClick={() => toggle("time")}
              aria-label="Start time"
              aria-expanded={panel === "time"}
            >
              {start || "Time"}
            </button>
            {panel === "time" && (
              <div className="cc-editor-popover">
                <label>
                  Start time
                  <input
                    type="time"
                    value={start}
                    step={900}
                    onChange={(event) => setStart(event.target.value)}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStart("");
                    setPanel(null);
                  }}
                >
                  Untimed
                </button>
              </div>
            )}
          </div>
          <div className="cc-editor-control">
            <button
              type="button"
              className="cc-editor-chip"
              onClick={() => toggle("duration")}
              aria-label="Duration"
              aria-expanded={panel === "duration"}
            >
              {durationLabel}
            </button>
            {panel === "duration" && (
              <div className="cc-editor-popover">
                <label>
                  Minutes
                  <input
                    type="number"
                    min={15}
                    max={1440}
                    step={15}
                    value={duration}
                    onChange={(event) =>
                      setDuration(Number(event.target.value))
                    }
                    required
                  />
                </label>
                <div className="cc-duration-options">
                  {[15, 30, 60, 90].map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => {
                        setDuration(minutes);
                        setPanel(null);
                      }}
                    >
                      {minutes}m
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className="cc-spacer" />
          {editable && (
            <div className="cc-editor-control">
              <button
                type="button"
                className={`cc-editor-deadline ${dueDate ? "set" : ""}`}
                onClick={() => toggle("deadline")}
                aria-label="Due date"
                aria-expanded={panel === "deadline"}
                title={dueDate ? `Due ${dueDate}` : "Due date"}
              >
                <Flag size={20} weight={dueDate ? "fill" : "regular"} />
              </button>
              {panel === "deadline" && (
                <div className="cc-editor-popover cc-editor-popover-right">
                  <label>
                    Due date
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(event) => setDueDate(event.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setDueDate("");
                      setPanel(null);
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="cc-editor-content" onClick={() => setPanel(null)}>
          <div className="cc-editor-title-row">
            {work && (
              <button
                type="button"
                className="cc-editor-check"
                disabled={locked}
                onClick={onComplete}
                aria-label="Complete task"
              >
                <Check size={18} />
              </button>
            )}
            <input
              className="cc-editor-title"
              aria-label="Task name"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task name"
              maxLength={work ? 255 : 80}
              required
              autoFocus
              readOnly={!editable}
              title={!editable ? "Edit in Notion" : undefined}
            />
          </div>
          <div className="cc-editor-description-row">
            <TextAlignLeft size={20} />
            <textarea
              aria-label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
              maxLength={10000}
              readOnly={!editable}
            />
          </div>
          {work?.children?.length || addingSubtask ? (
            <div className="cc-editor-subtasks">
              {work?.children?.map((child) => (
                <a
                  key={child.id}
                  href={child.url}
                  target="_blank"
                  rel="noreferrer"
                  className={child.status === "Done" ? "done" : ""}
                >
                  <span>
                    {child.status === "Done" ? <Check size={13} /> : null}
                  </span>
                  {child.title}
                  <ArrowSquareOut size={13} />
                </a>
              ))}
              {addingSubtask && (
                <div className="cc-editor-subtask-input">
                  <input
                    aria-label="Subtask name"
                    placeholder="Subtask name"
                    maxLength={80}
                    value={subtaskTitle}
                    onChange={(event) => setSubtaskTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void addSubtask();
                      }
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    disabled={locked || !subtaskTitle.trim()}
                    onClick={() => void addSubtask()}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
        <div className="cc-editor-link-row">
          {editable &&
            (addingLink ? (
              <div className="cc-editor-link-input">
                <input
                  type="url"
                  aria-label="Link URL"
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  placeholder="https://"
                />
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const url = new URL(link);
                      if (!["https:", "http:"].includes(url.protocol)) return;
                      setDescription(
                        (current) =>
                          `${current}${current ? "\n" : ""}${url.href}`,
                      );
                      setAddingLink(false);
                      setLink("");
                    } catch {
                      setValidation("Enter a valid link.");
                    }
                  }}
                >
                  Add
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setAddingLink(true)}>
                <LinkSimple size={20} /> Add link
              </button>
            ))}
          {(validation || error) && (
            <span className="cc-editor-error" role="alert">
              {validation || error}
            </span>
          )}
        </div>
        <footer className="cc-editor-footer">
          {work ? (
            <a
              className="cc-editor-chip"
              href={work.url}
              target="_blank"
              rel="noreferrer"
            >
              <Folder size={18} />{" "}
              {work.owner === "linear"
                ? "Linear"
                : work.owner === "asana"
                  ? "Asana"
                  : "Notion"}
            </a>
          ) : (
            <>
              <select
                aria-label="Task project"
                className="cc-editor-chip"
                value={projectId}
                disabled={locked}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setSectionId("");
                }}
              >
                <option value="linear">Development · Linear</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · Asana
                  </option>
                ))}
              </select>
              {project && (
                <select
                  aria-label="Task section"
                  className="cc-editor-chip"
                  value={sectionId}
                  disabled={locked}
                  onChange={(e) => setSectionId(e.target.value)}
                >
                  <option value="">
                    {project.name === "Content Editor"
                      ? "Choose client"
                      : "To Do"}
                  </option>
                  {project.sections
                    .filter((s) => s.name !== "Done")
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              )}
            </>
          )}
          <span className="cc-editor-chip cc-editor-lane">
            <Sparkle size={17} /> {lane}
          </span>
          {work && (
            <div className="cc-editor-control">
              <button
                type="button"
                className="cc-editor-state"
                onClick={() => toggle("state")}
                aria-label="Work state"
                aria-expanded={panel === "state"}
              >
                <Tag size={20} />
              </button>
              {panel === "state" && (
                <div className="cc-editor-popover cc-editor-state-menu">
                  {states.map((state) => (
                    <button
                      key={state}
                      type="button"
                      disabled={locked || state === work.status}
                      onClick={async () => {
                        await onState(state);
                        setPanel(null);
                      }}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <span className="cc-spacer" />
          {work && work.owner !== "notion" ? (
            <button
              type="button"
              className="cc-editor-save"
              disabled={locked}
              onClick={() => setAddingSubtask(true)}
            >
              <Plus size={16} /> Add subtasks
            </button>
          ) : (
            <button type="submit" className="cc-editor-save" disabled={locked}>
              <Check size={16} />
              {saving ? "Saving…" : work ? "Save" : "Create task"}
            </button>
          )}
        </footer>
      </form>
    </dialog>
  );
}
