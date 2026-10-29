"use client";

import { taskDescription } from "@/lib/command-center-description";
import { HOME_ADMIN_PROJECT, HOME_ADMIN_COLOR, isDashboardProject, dashboardLaneLabel } from "@/lib/command-center-projects";
import DurationWheel from "./DurationWheel";
import DescriptionEditor from "./DescriptionEditor";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { parsePlanInput, planTimeLabel } from "@/lib/command-center-plan-input";
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
import type { Block, WorkItem, Lane, TaskPlan } from "@/lib/command-center";

function PlanIcon({label,next=false}:{label:string;next?:boolean}) {
  return <span className={`cc-plan-icon ${next ? "next" : ""}`} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 3.5h14a2 2 0 0 1 2 2v15H3v-15a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6"/><path d="M3 7h18" stroke="currentColor" strokeWidth="1.6"/><text x="12" y="17.6" textAnchor="middle" fill="currentColor" fontSize="10.5" fontWeight="650">{label}</text></svg>{next && <span>›</span>}</span>;
}
function durationFromText(text: string): number | null {
  const value = text.trim().toLowerCase().replace(/hours?/g, "h").replace(/minutes?/g, "m").replace(/\s+/g, "");
  const match = value.match(/^(?:(\d+(?:\.\d+)?)h)?(?:(\d+)m?)?$/);
  if (!match || (!match[1] && !match[2])) return null;
  const minutes = Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0);
  return Number.isInteger(minutes) && minutes >= 0 && minutes <= 1440 && minutes % 5 === 0 ? minutes : null;
}

export type TaskEdit = {
  lane: Lane;
  children: {id: string; title: string}[];
  projectId: string;
  sectionId: string;
  title: string;
  description: string;
  dueDate: string | null;
  date: string;
  start: string;
  duration: number;
  period: TaskPlan["period"];
};

type Props = {
  work: WorkItem | null;
  block: Block | null;
  plan?: TaskPlan | null;
  today: string;
  busy: boolean;
  error: string;
  laneColors: Record<Lane, string>;
  projects: AsanaProject[];
  captureMode?: boolean;
  onSave: (edit: TaskEdit) => Promise<boolean>;
  onComplete: () => Promise<void>;
  onState: (state: string) => Promise<void>;
  onRemove: () => Promise<void>;
  onSubtask: (title: string) => Promise<boolean>;
  onSubtaskComplete: (childId: string) => Promise<boolean>;
  onClose: () => void;
};

export default function TaskEditor({
  work,
  block,
  plan,
  today,
  busy,
  error,
  laneColors,
  projects,
  captureMode = false,
  onSave,
  onComplete,
  onState,
  onRemove,
  onSubtask,
  onSubtaskComplete,
  onClose,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const panelTrigger = useRef<HTMLElement | null>(null);
  const [title, setTitle] = useState(work?.title ?? "");
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [description, setDescription] = useState(taskDescription(work?.description ?? ""));
  const [dueDate, setDueDate] = useState(work?.dueDate?.slice(0, 10) ?? "");
  const [date, setDate] = useState(block?.selected_date ?? plan?.planned_date ?? "");
  const initialPeriod = block ? "day" : plan?.period ?? "inbox";
  const [period, setPeriod] = useState<TaskPlan["period"]>(initialPeriod);
  const [start, setStart] = useState(
    block?.starts_at
      ? new Date(block.starts_at).toTimeString().slice(0, 5)
      : "",
  );
  const initialDuration =
    block?.starts_at && block.ends_at
      ? (Date.parse(block.ends_at) - Date.parse(block.starts_at)) / 60000
      : plan?.duration_minutes ?? 0;
  const [duration, setDuration] = useState(initialDuration);
  const [durationQuery, setDurationQuery] = useState("");
  const [planQuery, setPlanQuery] = useState("");
  const [planQueryError, setPlanQueryError] = useState("");
  const parsedPlan = useMemo(() => parsePlanInput(planQuery, today), [planQuery, today]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [pickerParent, setPickerParent] = useState(false);
  const planChildName = useRef("Plan duration");
  const queryDuration = durationFromText(durationQuery);
  const [panel, setPanel] = useState<
    "date" | "time" | "duration" | "deadline" | "state" | "menu" | null
  >(null);
  const [expanded, setExpanded] = useState(false);
  const [addingLink, setAddingLink] = useState(false);
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [draftChildren, setDraftChildren] = useState<{id: string; title: string}[]>([]);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [validation, setValidation] = useState("");
  const completing = useRef(new Set<string>());
  const [completingIds, setCompletingIds] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState("");
  const locked = busy || saving;
  const [projectId, setProjectId] = useState(work?.projectId ?? (captureMode ? "dashboard" : "linear"));
  const [sectionId, setSectionId] = useState(work?.sectionId ?? "");
  const [chosenLane, setChosenLane] = useState<Lane>(work?.lane ?? "Unassigned");
  const project = projects.find((p) => p.id === projectId);
  const editable = !work || work.owner !== "notion";
  const lane = work?.owner === "dashboard" || (!work && isDashboardProject(projectId)) ? chosenLane : work?.lane ?? project?.lane ?? "Development";
  const laneColor = projectId === HOME_ADMIN_PROJECT.id ? HOME_ADMIN_COLOR : laneColors[lane];
  const changed =
    draftChildren.length > 0 ||
    chosenLane !== (work?.lane ?? "Unassigned") ||
    (work?.owner === "dashboard" && projectId !== (work.projectId ?? "dashboard")) ||
    title.trim() !== (work?.title ?? "") ||
    description.trim() !== (work?.description ?? "") ||
    dueDate !== (work?.dueDate?.slice(0, 10) ?? "") ||
    date !== (block?.selected_date ?? plan?.planned_date ?? "") ||
    period !== initialPeriod ||
    start !==
      (block?.starts_at
        ? new Date(block.starts_at).toTimeString().slice(0, 5)
        : "") ||
    duration !== initialDuration;
  const durationLabel =
    duration >= 60
      ? `${Math.floor(duration / 60)}h${duration % 60 ? ` ${duration % 60}m` : ""}`
      : duration ? `${duration}m` : "Duration";
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
    setCalendarOpen(false);
    setPickerParent(false);
    if (panel !== next) panelTrigger.current = document.activeElement as HTMLElement | null;
    if (next === "duration") setDurationQuery("");
    if (next === "date") { setPlanQuery(""); setPlanQueryError(""); }
    setPanel(panel === next ? null : next);
  }
  function closePanel() {
    setCalendarOpen(false);
    if (pickerParent) {
      setPickerParent(false); setPanel("date");
      requestAnimationFrame(() => dialog.current?.querySelector<HTMLElement>(`[aria-label="${planChildName.current}"]`)?.focus());
      return;
    }
    setPanel(null);
    requestAnimationFrame(() => panelTrigger.current?.focus());
  }
  function openPlanChild(next: "time" | "duration") {
    planChildName.current = next === "time" ? "Plan time" : "Plan duration";
    setPickerParent(true); setDurationQuery(""); setPanel(next);
  }
  function applyTypedPlan() {
    if (!parsedPlan) { setPlanQueryError("Choose one day and time, or a planning period."); return; }
    setDate(parsedPlan.date); setStart(parsedPlan.start); setPeriod(parsedPlan.period);
    setPlanQuery(""); setPlanQueryError("");
  }
  useEffect(() => {
    if (panel === "date") dialog.current?.querySelector<HTMLElement>('[aria-label="Close plan"]')?.focus();
    if (panel === "duration" && window.matchMedia("(min-width: 681px)").matches) dialog.current?.querySelector<HTMLElement>('[aria-label="Search duration"]')?.focus();
  }, [panel]);
  useEffect(() => {
    if (panel !== "duration") return;
    function outside(event: PointerEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.cc-duration-picker, [aria-label="Duration"]')) setPanel(null);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [panel]);
  useEffect(() => {
    if(!calendarOpen)return;
    function outside(event:PointerEvent){if(!(event.target as HTMLElement).closest('.cc-plan-calendar, [aria-label="Choose date"]'))setCalendarOpen(false);}
    document.addEventListener("pointerdown",outside);
    return ()=>document.removeEventListener("pointerdown",outside);
  },[calendarOpen]);
  function chooseQueryDuration() {
    if (queryDuration === null) { setValidation("Use minutes or hours in 5-minute steps."); return; }
    setDuration(queryDuration);
    setValidation("");
    closePanel();
  }
  async function addSubtask() {
    if (locked || !subtaskTitle.trim()) return;
    if (!work || work.owner === "dashboard") {
      setDraftChildren((items) => [...items,{id:crypto.randomUUID(),title:subtaskTitle.trim()}]);
      setSubtaskTitle(""); setAddingSubtask(false); return;
    }
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
  async function completeSubtask(child: { id: string; title: string }) {
    if (completing.current.has(child.id)) return;
    completing.current.add(child.id);
    setCompletingIds((ids) => [...ids, child.id]);
    setConfirmed("");
    setValidation("");
    try {
      if (await onSubtaskComplete(child.id))
        setConfirmed(`Completed ${child.title}`);
      else setValidation(`Could not complete ${child.title}. Try again.`);
    } catch (cause) {
      setValidation(
        cause instanceof Error ? cause.message : "Could not complete the subtask.",
      );
    } finally {
      completing.current.delete(child.id);
      setCompletingIds((ids) => ids.filter((id) => id !== child.id));
    }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    if (!title.trim()) {
      setValidation("Add a task name.");
      return;
    }
    if (start && (!date || period !== "day")) {
      setValidation("Choose a planned day before adding a time.");
      return;
    }
    if (!work && !isDashboardProject(projectId) && draftChildren.length) {
      setValidation("Save these subtasks in Inbox first, or remove them before choosing another destination.");
      return;
    }
    if (description.length > 10000 && editable) {
      setValidation("Keep the description under 10,000 characters.");
      return;
    }
    const [hour, minute] = start.split(":").map(Number);
    if (!Number.isFinite(duration) || duration < 0 || duration > 1440 || duration % 5 !== 0 || (start && duration === 0)) {
      setValidation("Choose a duration in 5-minute steps.");
      return;
    }
    if (start && hour * 60 + minute + duration > 1440) {
      setValidation("Choose a time and duration that finish within one day.");
      return;
    }
    setValidation("");
    setSaving(true);
    try {
      await onSave({
        children: draftChildren,
        lane: chosenLane,
        projectId,
        sectionId,
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
        date,
        start,
        duration,
        period,
      });
    } catch (cause) {
      setValidation(
        cause instanceof Error ? cause.message : "Could not save the task.",
      );
    } finally {
      setSaving(false);
    }
  }

  function planDay(offset: number, time = "") {
    setPeriod("day");
    const day = new Date(`${today}T12:00:00`);
    day.setDate(day.getDate() + offset);
    setDate(`${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`);
    if (time) setStart(time);
    setPanel(null);
  }
  function horizonDate(kind: "week" | "month", offset: number) {
    const day = new Date(`${today}T12:00:00`);
    if (kind === "week") day.setDate(day.getDate() - (day.getDay() + 6) % 7 + offset * 7);
    else { day.setDate(1); day.setMonth(day.getMonth() + offset); }
    return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
  }
  function planHorizon(kind: "week" | "month", offset: number) {
    setPeriod(kind); setDate(horizonDate(kind, offset)); setStart(""); setPanel(null);
  }
  function localKey(day:Date) { return `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`; }
  function dayAt(offset:number){const day=new Date(`${today}T12:00:00`);day.setDate(day.getDate()+offset);return day;}
  const nowTime=new Date();
  const laterMinute=(Math.floor((nowTime.getHours()*60+nowTime.getMinutes())/60)+3)*60;
  const laterClock=laterMinute>=1440 ? "09:00" : `${String(Math.floor(laterMinute/60)).padStart(2,"0")}:00`;
  function weekRange(offset:number){const first=new Date(`${horizonDate("week",offset)}T12:00:00`),last=new Date(first);last.setDate(last.getDate()+6);const month=last.toLocaleDateString(undefined,{month:"short"});return first.getMonth()===last.getMonth() ? `${first.getDate()}–${last.getDate()} ${month}` : `${first.getDate()} ${first.toLocaleDateString(undefined,{month:"short"})}–${last.getDate()} ${month}`;}
  const planChoices = [
    {label:"Today",icon:String(dayAt(0).getDate()),detail:dayAt(0).toLocaleDateString(undefined,{weekday:"short"}),choose:()=>planDay(0)},
    {label:"Later today",icon:String(dayAt(0).getDate()),detail:`${dayAt(laterMinute>=1440?1:0).toLocaleDateString(undefined,{weekday:"short"})} · ${planTimeLabel(laterClock)}`,choose:()=>planDay(laterMinute>=1440?1:0,laterClock)},
    {label:"Tomorrow",icon:String(dayAt(1).getDate()),detail:dayAt(1).toLocaleDateString(undefined,{weekday:"short"}),choose:()=>planDay(1)},
    {label:"This week",icon:"W",detail:weekRange(0),choose:()=>planHorizon("week",0)},
    {label:"Next week",icon:"W",next:true,detail:weekRange(1),choose:()=>planHorizon("week",1)},
    {label:"This month",icon:"M",detail:dayAt(0).toLocaleDateString(undefined,{month:"short"}),choose:()=>planHorizon("month",0)},
    {label:"Next month",icon:"M",next:true,detail:new Date(`${horizonDate("month",1)}T12:00:00`).toLocaleDateString(undefined,{month:"short"}),choose:()=>planHorizon("month",1)},
    {label:"Someday",icon:"?",detail:"No date",choose:()=>{setDate("");setStart("");setPeriod("someday");setPanel(null);}},
  ];
  const dateLabel = period === "someday" ? "Someday"
    : period === "week" || period === "month"
      ? date === horizonDate(period, 0) ? `This ${period}`
        : date === horizonDate(period, 1) ? `Next ${period}`
          : `${period === "week" ? "Week of " : ""}${new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", ...(period === "week" ? { day: "numeric" } : { year: "numeric" }) })}`
      : date ? new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) : "Plan";

  return (
    <dialog
      ref={dialog}
      className={`cc-task-dialog ${expanded ? "expanded" : ""}`}
      aria-label={work ? "Edit task" : "New task"}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const activePicker = descriptionOpen ? ".cc-description-sheet" : panel === "date" ? ".cc-plan-picker" : pickerParent ? panel === "duration" ? ".cc-duration-picker" : ".cc-time-picker" : null;
        const scope = activePicker ? event.currentTarget.querySelector(activePicker) ?? event.currentTarget : event.currentTarget;
        const controls = Array.from(
          scope.querySelectorAll<HTMLElement>(
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
        if (!locked) {
          if (calendarOpen) setCalendarOpen(false);
          else if (panel) closePanel();
          else onClose();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !locked) onClose();
      }}
      style={{ "--lane": laneColor } as React.CSSProperties}
    >
      {descriptionOpen && <DescriptionEditor value={description} onChange={setDescription} readOnly={!editable} onBack={() => setDescriptionOpen(false)} />}
      <div className="cc-editor-tools">
        <span className="cc-editor-kind">Task</span>
        <Button variant="ghost"
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Compact editor" : "Expand editor"}
          aria-pressed={expanded}
        >
          <ArrowsOutSimple size={18} />
        </Button>
        {work && work.owner !== "dashboard" && (
          <a
            href={work.url}
            target="_blank"
            rel="noreferrer"
            aria-label="Open source"
          >
            <ArrowSquareOut size={18} />
          </a>
        )}
        <Button variant="ghost"
          type="button"
          onClick={() => toggle("menu")}
          aria-label="Task menu"
          aria-expanded={panel === "menu"}
        >
          <DotsThree size={22} />
        </Button>
        <Button variant="ghost"
          type="submit"
          form="cc-task-editor-form"
          disabled={locked || !changed}
          aria-label="Save changes"
          title="Save changes"
        >
          <Check size={18} />
        </Button>
        <Button variant="ghost"
          type="button"
          disabled={locked}
          onClick={onClose}
          aria-label="Close editor"
        >
          <X size={18} />
        </Button>
        {panel === "menu" && (
          <div className="cc-editor-popover cc-editor-menu">
            {block && (
              <Button variant="ghost" type="button" disabled={locked} onClick={onRemove}>
                Remove time block
              </Button>
            )}
            {work?.owner === "dashboard" && description.split("\n").flatMap((line,index) => {
              const match=line.match(/^\s*[-*] \[[ xX]\] (.+)$/);
              return match ? [{title:match[1],index}] : [];
            }).map((item) => <Button key={item.index} type="button" variant="ghost" aria-label={`Make ${item.title} a subtask`} disabled={locked || item.title.length>80} onClick={() => {
              setDraftChildren((children) => [...children,{id:crypto.randomUUID(),title:item.title}]);
              setDescription((text) => text.split("\n").filter((_,index) => index!==item.index).join("\n"));
              setPanel(null);
            }}>Make “{item.title}” a subtask</Button>)}
            <Button variant="ghost" type="button" disabled={locked} onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
      <form id="cc-task-editor-form" onSubmit={save}>
        <div className="cc-editor-schedule">
          <div className="cc-editor-control">
            <Button variant="ghost"
              type="button"
              className="cc-editor-chip"
              onClick={() => toggle("date")}
              aria-label="Scheduled date"
              aria-expanded={panel === "date"}
            >
              {dateLabel}
            </Button>
            {(panel === "date" || pickerParent) && (
              <div className="cc-editor-popover cc-plan-picker" inert={pickerParent}>
                <div className="cc-plan-heading"><Button variant="ghost" type="button" aria-label="Close plan" onClick={closePanel}><X size={20} /></Button><h2>Plan</h2><Button variant="ghost" type="button" onClick={() => { if(planQuery.trim()){ if(!parsedPlan){setPlanQueryError("Choose one day and time, or a planning period.");return;} applyTypedPlan(); } closePanel(); }}>Done</Button></div>
                <Input type="search" aria-label="Plan date and time" placeholder="Type date and time or Time Slot" value={planQuery}
                  onChange={(event) => { setPlanQuery(event.target.value); setPlanQueryError(""); }}
                  onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); applyTypedPlan(); } }} />
                {parsedPlan && <Button variant="ghost" type="button" className="cc-plan-suggestion" onClick={applyTypedPlan}>Use {parsedPlan.period === "day" ? new Date(`${parsedPlan.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : planQuery}{parsedPlan.start ? ` at ${planTimeLabel(parsedPlan.start)}` : ""}</Button>}
                {planQueryError && <p role="alert">{planQueryError}</p>}
                <div className="cc-plan-choices">
                  {planChoices.map((choice)=><Button key={choice.label} variant="ghost" type="button" aria-label={choice.label} onClick={choice.choose}><PlanIcon label={choice.icon} next={choice.next}/><span>{choice.label}</span><span className="cc-plan-detail">{choice.detail}</span></Button>)}
                </div>
                <div className="cc-plan-footer">
                  <div><span>Date and time</span><div className="cc-plan-date-control"><Button variant="ghost" type="button" aria-label="Choose date" aria-expanded={calendarOpen} onClick={()=>setCalendarOpen((open)=>!open)}>Day</Button>
                  {calendarOpen && <div className="cc-plan-calendar" role="group" aria-label="Calendar date picker">
                    <Calendar mode="single" weekStartsOn={0} formatters={{formatWeekdayName:(day)=>day.toLocaleDateString(undefined,{weekday:"narrow"})}} defaultMonth={new Date(`${date || today}T12:00:00`)} selected={date ? new Date(`${date}T12:00:00`) : undefined} onSelect={(day)=>{if(day){setDate(localKey(day));setPeriod("day");setCalendarOpen(false);}}}/>

                  </div>}
                  </div><Button variant="ghost" type="button" aria-label="Plan time" onClick={() => { if(!date)setDate(today); setPeriod("day"); openPlanChild("time"); }}>{planTimeLabel(start) || "No time"}</Button></div>
                  <div><span>Duration</span><Button variant="ghost" type="button" aria-label="Plan duration" onClick={() => openPlanChild("duration")}>{duration ? durationLabel : "None"}</Button></div>
                </div>
              </div>
            )}
          </div>
          <div className="cc-editor-control">
            <Button variant="ghost"
              type="button"
              className="cc-editor-chip"
              onClick={() => toggle("time")}
              aria-label="Start time"
              disabled={period === "week" || period === "month"}
              title={period === "week" || period === "month" ? "Choose a day before adding a time" : undefined}
              aria-expanded={panel === "time"}
            >
              {planTimeLabel(start) || "Time"}
            </Button>
            {panel === "time" && (
              <div className="cc-editor-popover cc-time-picker">
                {pickerParent && <Button variant="ghost" type="button" onClick={closePanel} aria-label="Back to Plan">← Plan</Button>}
                <label>
                  Start time
                  <input
                    type="time"
                    value={start}
                    step={60}
                    onChange={(event) => setStart(event.target.value)}
                  />
                </label>
                <Button variant="ghost" type="button" onClick={() => { setStart(""); closePanel(); }}>Remove time</Button>
                <Button variant="ghost" type="button" onClick={closePanel}>Done</Button>
              </div>
            )}
          </div>
          <div className="cc-editor-control">
            <Button variant="ghost"
              type="button"
              className="cc-editor-chip"
              onClick={() => toggle("duration")}
              aria-label="Duration"
              aria-expanded={panel === "duration"}
            >
              {durationLabel}
            </Button>
            {panel === "duration" && (
              <div className="cc-editor-popover cc-duration-picker">
                {pickerParent && <Button variant="ghost" type="button" onClick={closePanel} aria-label="Back to Plan">← Plan</Button>}
                <div className="cc-duration-search">
                  <Input type="search" aria-label="Search duration" placeholder="25m or 1h 30m" value={durationQuery}
                    onChange={(event) => { setDurationQuery(event.target.value); setValidation(""); }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") { event.preventDefault(); chooseQueryDuration(); }
                      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closePanel(); }
                    }} />
                  {queryDuration !== null && <Button variant="ghost" type="button" onClick={chooseQueryDuration}>{queryDuration ? `Set ${queryDuration}m` : "Remove duration"}</Button>}
                </div>
                <div className="cc-duration-wheels">
                  <DurationWheel label="Duration hours" value={Math.floor(duration / 60)} max={duration % 60 ? 23 : 24} unit="h" onChange={(hour) => setDuration(hour * 60 + duration % 60)} />
                  <DurationWheel label="Duration minutes" value={duration % 60} max={duration >= 1440 ? 0 : 55} step={5} unit="m" onChange={(minute) => setDuration(Math.floor(duration / 60) * 60 + minute)} />
                </div>
                <label className="cc-duration-manual">
                  Minutes
                  <input
                    type="number"
                    min={0}
                    max={1440}
                    step={5}
                    value={duration}
                    onChange={(event) =>
                      setDuration(Number(event.target.value))
                    }
                    required
                  />
                </label>
                <div className="cc-duration-options">
                  {[5, 15, 30, 60, 90].map((minutes) => (
                    <Button variant="ghost"
                      key={minutes}
                      type="button"
                      onClick={() => {
                        setDuration(minutes);
                        closePanel();
                      }}
                    >
                      {minutes}m
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className="cc-spacer" />
          {editable && (
            <div className="cc-editor-control">
              <Button variant="ghost"
                type="button"
                className={`cc-editor-deadline ${dueDate ? "set" : ""}`}
                onClick={() => toggle("deadline")}
                aria-label="Due date"
                aria-expanded={panel === "deadline"}
                title={dueDate ? `Due ${dueDate}` : "Due date"}
              >
                <Flag size={20} weight={dueDate ? "fill" : "regular"} />
              </Button>
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
                  <Button variant="ghost"
                    type="button"
                    onClick={() => {
                      setDueDate("");
                      setPanel(null);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="cc-editor-content" onClick={() => setPanel(null)}>
          <div className="cc-editor-title-row">
            {work && (
              <Button variant="ghost"
                type="button"
                className="cc-editor-check"
                disabled={locked}
                onClick={onComplete}
                aria-label="Complete task"
              >
                <Check size={18} />
              </Button>
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
            <button type="button" className="cc-description-trigger" aria-label="Edit description" onClick={() => setDescriptionOpen(true)}>{description ? description.replace(/\*\*|__|`/g, "").replace(/^- \[ \] /gm, "☐ ").replace(/^- \[x\] /gmi, "☑ ") : "Description"}</button>
          </div>
          {work?.children?.length || draftChildren.length || addingSubtask ? (
            <div className="cc-editor-subtasks">
              {work?.children?.map((child) => {
                const done = child.status === "Done";
                const pending = completingIds.includes(child.id);
                const overdue =
                  !done && child.dueDate && child.dueDate.slice(0, 10) < today;
                return (
                  <div
                    key={child.id}
                    className={`cc-subtask ${done ? "done" : ""}`}
                  >
                    <Button variant="ghost"
                      type="button"
                      className="cc-subtask-check"
                      role="checkbox"
                      aria-checked={done}
                      aria-label={`Complete ${child.title}`}
                      disabled={done || pending || locked}
                      onClick={() => void completeSubtask(child)}
                    >
                      {done || pending ? <Check size={13} weight="bold" /> : null}
                    </Button>
                    <span className="cc-subtask-title" title={child.title}>
                      {child.title}
                    </span>
                    {child.dueDate && (
                      <time
                        className={`cc-pill ${overdue ? "overdue" : ""}`}
                        dateTime={child.dueDate}
                      >
                        {new Date(
                          `${child.dueDate.slice(0, 10)}T12:00:00`,
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    )}
                    <a
                      className="cc-subtask-link"
                      href={child.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${child.title} in ${work.owner === "asana" ? "Asana" : "Linear"}`}
                      title="Open source"
                    >
                      <ArrowSquareOut size={15} />
                    </a>
                  </div>
                );
              })}
              {draftChildren.map((child) => <div key={child.id} className="cc-editor-subtask"><input type="checkbox" disabled aria-label={`Complete ${child.title}`} /><span>{child.title}</span><small>Not saved</small><Button type="button" variant="ghost" aria-label={`Remove draft ${child.title}`} onClick={() => setDraftChildren((items) => items.filter((item) => item.id !== child.id))}><X size={14}/></Button></div>)}
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
                  <Button variant="ghost"
                    type="button"
                    disabled={locked || !subtaskTitle.trim()}
                    onClick={() => void addSubtask()}
                  >
                    Add
                  </Button>
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
                <Button variant="ghost"
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
                </Button>
              </div>
            ) : (
              <Button variant="ghost" type="button" onClick={() => setAddingLink(true)}>
                <LinkSimple size={20} /> Add link
              </Button>
            ))}
          {confirmed && !validation && !error && (
            <span className="cc-editor-ok" role="status">
              {confirmed}
            </span>
          )}
          {(validation || error) && (
            <span className="cc-editor-error" role="alert">
              {validation || error}
            </span>
          )}
        </div>
        <footer className="cc-editor-footer">
          {work?.owner === "dashboard" ? (
            <>
              <select aria-label="Task lane" className="cc-editor-chip" value={projectId === HOME_ADMIN_PROJECT.id ? "Home Admin" : chosenLane} onChange={(event) => { if(event.target.value === "Home Admin") {setChosenLane("Unassigned");setProjectId(HOME_ADMIN_PROJECT.id);} else {setChosenLane(event.target.value as Lane);if(projectId === HOME_ADMIN_PROJECT.id)setProjectId("dashboard");} }} disabled={locked}>
                {(["Unassigned", "Content Editor", "AI Consultant", "Development", "Home Admin"] as const).map((value) => <option key={value} value={value}>{dashboardLaneLabel(value)}</option>)}
              </select>
              <select aria-label="Client context" className="cc-editor-chip" value={projectId} onChange={(event) => setProjectId(event.target.value)} disabled={locked}>
                <option value="dashboard">No project</option>
                <option value={HOME_ADMIN_PROJECT.id}>{HOME_ADMIN_PROJECT.name}</option>
                {projects.flatMap((project) => project.sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>))}
              </select>
            </>
          ) : work ? (
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
                <option value="dashboard">Inbox · Unassigned</option>
                <option value={HOME_ADMIN_PROJECT.id}>{HOME_ADMIN_PROJECT.name} · Dashboard</option>
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
            <Sparkle size={17} /> {dashboardLaneLabel(lane)}
          </span>
          {work && (
            <div className="cc-editor-control">
              <Button variant="ghost"
                type="button"
                className="cc-editor-state"
                onClick={() => toggle("state")}
                aria-label="Work state"
                aria-expanded={panel === "state"}
              >
                <Tag size={20} />
              </Button>
              {panel === "state" && (
                <div className="cc-editor-popover cc-editor-state-menu">
                  {states.map((state) => (
                    <Button variant="ghost"
                      key={state}
                      type="button"
                      disabled={locked || state === work.status}
                      onClick={async () => {
                        await onState(state);
                        setPanel(null);
                      }}
                    >
                      {state}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
          <span className="cc-spacer" />
          {(work ? work.owner !== "notion" : isDashboardProject(projectId)) ? (
            <Button variant="ghost"
              type="button"
              className="cc-editor-save"
              disabled={locked}
              onClick={() => setAddingSubtask(true)}
            >
              <Plus size={16} /> Add subtasks
            </Button>
          ) : (
            <Button variant="ghost" type="submit" className="cc-editor-save" disabled={locked}>
              <Check size={16} />
              {saving ? "Saving…" : work ? "Save" : "Create task"}
            </Button>
          )}
        </footer>
      </form>
    </dialog>
  );
}
