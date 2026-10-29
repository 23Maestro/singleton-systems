"use client";

import { HOME_ADMIN_PROJECT, HOME_ADMIN_COLOR, isDashboardProject, dashboardLane, dashboardLaneLabel, type DashboardLane } from "@/lib/command-center-projects";
import type { AsanaProject } from "@/lib/command-center-asana";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ArrowClockwise,
  ArrowSquareOut,
  WarningCircle,
  CalendarBlank,
  CalendarPlus,
  Check,
  Clock,
  EnvelopeSimple,
  Tray,
  Moon,
  Plus,
  Sun,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import type {
  Block,
  Contact,
  Draft,
  Interaction,
  Lane,
  WorkItem,
  TaskPlan,
} from "@/lib/command-center";
import { getTheme, getServerTheme, setTheme, subscribeTheme } from "./theme";
import TaskEditor, { type TaskEdit } from "./TaskEditor";
import SchedulePicker from "./SchedulePicker";
import ClientBoard from "./ClientBoard";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  SNAP_MINUTES,
  blockSpan,
  minuteFromOffset,
  movePlacement,
  newPlacement,
  resizePlacement,
  snapMinutes,
  type Placement,
} from "@/lib/command-center-schedule";

type Snapshot = {
  contacts: Contact[];
  interactions: Interaction[];
  blocks: Block[];
  plans?: TaskPlan[];
  drafts: Draft[];
  work: WorkItem[];
  failures: string[];
  asanaProjects: AsanaProject[];
};
const taskViews = [
  ["inbox", "Inbox"], ["today", "Today"], ["week", "Week"],
  ["month", "Month"], ["someday", "Someday"], ["all", "All tasks"],
] as const;
type TaskView = (typeof taskViews)[number][0];
type MailView = {
  configured: boolean;
  messages: {
    id: string;
    snippet: string;
    from: string;
    subject: string;
    date: string;
  }[];
  gmailUrl?: string;
  error?: string;
};
type Surface = "inbox" | "planner" | "updates" | "clients";
const lanes: Lane[] = ["AI Consultant", "Content Editor", "Development"];
const laneColors: Record<DashboardLane, string> = {
  "AI Consultant": "#e25555",
  "Content Editor": "#3488e8",
  Development: "#27a88a",
  Unassigned: "#9b9ba3",
  "Home Admin": HOME_ADMIN_COLOR,
};
const HOUR_PX = 56;
const GRID_TOP = 14;
const GRID_HEIGHT = 24 * HOUR_PX + GRID_TOP * 2;
const dragType = "application/x-command-center-task";
const emptyContact = {
  name: "",
  company: "",
  email: "",
  phone: "",
  lane: "AI Consultant" as Lane,
  status: "lead",
  relationship_context: "",
  notes: "",
  next_action: "",
  next_action_at: "",
  linear_project_id: "",
  invoice_url: "",
  payment_note: "",
  source_url: "",
};
type ContactForm = typeof emptyContact;

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function isoWeek(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
  const yearStart = Date.UTC(target.getUTCFullYear(), 0, 1);
  return Math.ceil(((target.getTime() - yearStart) / 86400000 + 1) / 7);
}
function durationLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h${rest ? ` ${rest}m` : ""}` : `${rest}m`;
}
function dueTone(value: string | null, today: string) {
  if (!value) return "";
  const day = value.slice(0, 10);
  if (day < today) return "late";
  const gap = (Date.parse(`${day}T12:00:00`) - Date.parse(`${today}T12:00:00`)) / 86400000;
  return gap <= 1 ? "soon" : "";
}
function shortDate(value: string | null) {
  if (!value) return "—";
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric" },
  );
}
function localDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}
function gmailCompose(to: string, subject = "", body = "") {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params}`;
}

type TimedPlacement = {
  block: Block;
  lane: number;
  laneCount: number;
  startMinute: number;
  endMinute: number;
  stack?: Block[];
};

function placeOverlaps(blocks: Block[]): TimedPlacement[] {
  const intervals = blocks
    .filter((block) => block.starts_at && block.ends_at)
    .map((block) => {
      const span = blockSpan(block);
      return { block, startMinute: span.start, endMinute: span.end };
    })
    .sort((a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute);
  const groups: (typeof intervals)[] = [];
  for (const interval of intervals) {
    const group = groups.at(-1);
    const groupEnd = group
      ? Math.max(...group.map((item) => item.endMinute))
      : -1;
    if (!group || interval.startMinute >= groupEnd) groups.push([interval]);
    else group.push(interval);
  }
  return groups.flatMap((group) => {
    if (group.length >= 5) {
      return [
        {
          ...group[0],
          lane: 0,
          laneCount: 1,
          stack: group.map((item) => item.block),
          endMinute: Math.max(
            group[0].startMinute + 45,
            ...group.map((item) => item.endMinute),
          ),
        },
      ];
    }
    const laneEnds: number[] = [];
    const placed = group.map((interval) => {
      let lane = laneEnds.findIndex((end) => end <= interval.startMinute);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = interval.endMinute;
      return { ...interval, lane, laneCount: 0 };
    });
    return placed.map((item) => ({ ...item, laneCount: laneEnds.length }));
  });
}

export default function CommandCenterApp() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);
  const [surface, setSurface] = useState<Surface>("planner");
  const [taskView, setTaskView] = useState<TaskView>("all");
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [clientDirectory, setClientDirectory] = useState(false);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{message: string; undo?: () => Promise<boolean>} | null>(null);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(null), 12000); return () => clearTimeout(timer); }, [notice]);
  const [captureText, setCaptureText] = useState("");
  const captureId = useRef<string | null>(null);
  const taskCreateId = useRef<string | null>(null);
  const captureLock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState<Record<DashboardLane, boolean>>({
    "AI Consultant": true,
    "Content Editor": true,
    Development: false,
    Unassigned: true,
    "Home Admin": true,
  });
  const [selectedWork, setSelectedWork] = useState<string | null>(null);
  const [shortcutMode, setShortcutMode] = useState<
    "closed" | "open" | "closing"
  >("closed");
  const [taskEditor, setTaskEditor] = useState<{
    work: WorkItem | null;
    block: Block | null;
    session: number;
  } | null>(null);
  const editorSequence = useRef(0);
  const calendarReady = snapshot !== null;
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [contactEditor, setContactEditor] = useState<number | "new" | null>(
    null,
  );
  const [contactForm, setContactForm] = useState<ContactForm>(emptyContact);
  const contactDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (contactEditor === null) return;
    const dialog = contactDialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    dialog.querySelector<HTMLInputElement>("input")?.focus();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, [contactEditor]);
  const [interactionText, setInteractionText] = useState("");
  const [interactionChannel, setInteractionChannel] = useState("call");
  const [draftMenu, setDraftMenu] = useState(false);
  const [draftEditor, setDraftEditor] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftLane, setDraftLane] = useState<Lane>("AI Consultant");
  const [mail, setMail] = useState<MailView | null>(null);
  const [dayCount, setDayCount] = useState<1 | 3 | 5 | 7>(7);
  const [dayOffset, setDayOffset] = useState(0);
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarScroll = useRef(0);
  const retainCalendar = useCallback((node: HTMLDivElement | null) => {
    if (!node && calendarRef.current) calendarScroll.current = calendarRef.current.scrollTop;
    calendarRef.current = node;
  }, []);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [dropPreview, setDropPreview] = useState<{
    date: string;
    minute: number;
  } | null>(null);
  const [preview, setPreview] = useState<(Placement & { id: string }) | null>(
    null,
  );
  const previewRef = useRef<(Placement & { id: string }) | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [picker, setPicker] = useState<WorkItem | null>(null);
  const saving = useRef(new Set<string>());
  const queued = useRef(new Map<string, Placement>());
  const keyTimer = useRef<number | undefined>(undefined);
  const dropping = useRef(false);
  const gesture = useRef<{
    block: Block;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const justDragged = useRef(false);
  const wantNow = useRef(true);
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async () => {
    const response = await fetch("/api/command-center", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error || "Could not load Command Center.");
    const next = result as Snapshot;
    setSnapshot(next);
    setError("");
    setSelectedWork(
      (current) =>
        current ??
        next.work.find(
          (item) =>
            !item.blocked &&
            item.lane !== "Development" &&
            [
              "Todo",
              "To Do",
              "In Progress",
              "Today",
              "Queued",
              "In Motion",
            ].includes(item.status),
        )?.id ??
        null,
    );
  }, []);

  useEffect(() => {
    load().catch((cause) =>
      setError(cause instanceof Error ? cause.message : "Could not load."),
    );
  }, [load]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const width = window.innerWidth;
    setDayCount(width < 680 ? 1 : width < 1100 ? 3 : 7);
    setRailCollapsed(width < 680);
    try {
      const saved = JSON.parse(localStorage.getItem("singleton-command-center-view-v1") ?? "null");
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        if (["inbox", "planner", "updates", "clients"].includes(saved.surface)) setSurface(saved.surface);
        if ([1, 3, 5, 7].includes(saved.dayCount)) setDayCount(saved.dayCount);
        if (typeof saved.railCollapsed === "boolean") setRailCollapsed(saved.railCollapsed);
        if (typeof saved.clientDirectory === "boolean") setClientDirectory(saved.clientDirectory);
        if (taskViews.some(([id]) => id === saved.taskView)) setTaskView(saved.taskView);
      }
    } catch { /* View controls still work when storage is unavailable. */ }
    setPreferencesReady(true);
  }, []);
  useEffect(() => {
    if (!preferencesReady) return;
    try {
      localStorage.setItem("singleton-command-center-view-v1", JSON.stringify({ surface, dayCount, railCollapsed, clientDirectory, taskView }));
    } catch { /* Keep this session's choices when storage is unavailable. */ }
  }, [preferencesReady, surface, dayCount, railCollapsed, clientDirectory, taskView]);
  useEffect(() => {
    if (selectedContact === null && snapshot?.contacts.length)
      setSelectedContact(snapshot.contacts[0].id);
  }, [selectedContact, snapshot]);
  useEffect(() => {
    if (selectedContact === null) {
      setMail(null);
      return;
    }
    let active = true;
    setMail(null);
    fetch(`/api/command-center/mail/${selectedContact}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Gmail read failed.");
        return data as MailView;
      })
      .then((data) => {
        if (active) setMail(data);
      })
      .catch((cause) => {
        if (active)
          setMail({
            configured: true,
            messages: [],
            error:
              cause instanceof Error ? cause.message : "Gmail read failed.",
          });
      });
    return () => {
      active = false;
    };
  }, [selectedContact]);
  const handleShortcut = useEffectEvent((event: KeyboardEvent) => {
    if (taskEditor || contactEditor !== null) return;
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey
    )
      return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeShortcut();
      setContactEditor(null);
      setDraftMenu(false);
      setTaskEditor(null);
      return;
    }
    if (shortcutMode === "open") {
      if (["1", "2", "3", "4", "5"].includes(event.key)) {
        event.preventDefault();
        void applyShortcut(event.key);
      }
      return;
    }
    const shortcutItem = snapshot?.work.find(
      (item) => item.id === selectedWork,
    );
    if (
      event.key.toLowerCase() === "p" &&
      surface === "planner" &&
      event.target instanceof HTMLElement &&
      event.target.closest(".cc-row") &&
      shortcutItem
    ) {
      event.preventDefault();
      setShortcutMode("open");
      return;
    }
    if (event.key.toLowerCase() === "t" && surface === "planner") {
      event.preventDefault();
      goToNow();
      return;
    }
    if (event.key === "q") setSurface("planner");
    if (event.key === "p") setSurface("planner");
    if (event.key === "u") setSurface("updates");
    if (event.key === "c") setSurface("clients");
  });
  useEffect(() => {
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);
  useEffect(() => {
    setShortcutMode("closed");
  }, [selectedWork, surface]);
  useLayoutEffect(() => {
    if (surface !== "planner" || !calendarRef.current) return;
    if (wantNow.current) {
      wantNow.current = false;
      const current = new Date();
      calendarRef.current.scrollTop = Math.max(
        0,
        GRID_TOP + ((current.getHours() * 60 + current.getMinutes()) / 60) * HOUR_PX - 140,
      );
    } else calendarRef.current.scrollTop = calendarScroll.current;
  }, [surface, dayCount, dayOffset, calendarReady]);

  async function command(payload: Record<string, unknown>, reload = true) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/command-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Action failed.");
      if (reload)
        await load().catch(() =>
          setError("Saved. Refresh failed; try Refresh."),
        );
      return result;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Action failed.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  const today = dateKey(new Date());
  const work = snapshot?.work ?? [];
  const blocks = snapshot?.blocks ?? [];
  const contacts = snapshot?.contacts ?? [];
  const shownBlocks = blocks.map((block) =>
    preview && preview.id === block.id
      ? {
          ...block,
          selected_date: preview.selectedDate,
          starts_at: preview.startsAt,
          ends_at: preview.endsAt,
        }
      : block,
  );
  const workForBlock = (block: Block) =>
    work.find(
      (item) => item.owner === block.owner && item.id === block.owner_id,
    );
  const titleForBlock = (block: Block) =>
    workForBlock(block)?.title ??
    contacts.find(
      (item) => block.owner === "crm" && String(item.id) === block.owner_id,
    )?.next_action ??
    "Unavailable source";
  const laneForBlock = (block: Block): DashboardLane =>
    (workForBlock(block) ? dashboardLane(workForBlock(block)!) : undefined) ??
    contacts.find(
      (item) => block.owner === "crm" && String(item.id) === block.owner_id,
    )?.lane ??
    "Development";
  const client = contacts.find((item) => item.id === selectedContact) ?? null;
  const clientInteractions = (snapshot?.interactions ?? []).filter(
    (item) => item.contact_id === selectedContact,
  );
  const clientDeliverables = work.filter(
    (item) =>
      client?.linear_project_id &&
      item.owner === "linear" &&
      item.projectId === client.linear_project_id,
  );
  const projects = Array.from(
    new Map<string, string>(
      work
        .filter((item) => item.projectId && item.projectName)
        .map((item) => [item.projectId!, item.projectName!]),
    ).entries(),
  );
  const weekStart = new Date(`${today}T12:00:00`);
  weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
  const monthStart = `${today.slice(0, 7)}-01`;
  const monthEnd = dateKey(new Date(Number(today.slice(0, 4)), Number(today.slice(5, 7)), 0, 12));
  const inRange = (date: string | null, start: string, end: string) => !!date && date >= start && date <= end;
  const ready = work.filter((item) => {
    if (!filters[dashboardLane(item)] || ["done", "completed", "cancelled", "canceled"].includes(item.status.toLowerCase())) return false;
    if (taskView === "all") return true;
    const plan = snapshot?.plans?.find((entry) => entry.owner === item.owner && entry.owner_id === item.id);
    const placements = blocks.filter((entry) => entry.owner === item.owner && entry.owner_id === item.id);
    if (taskView === "inbox") return (!plan || plan.period === "inbox") && !placements.length;
    if (taskView === "someday") return plan?.period === "someday";
    if (taskView === "today") return (plan?.period === "day" && !!plan.planned_date && plan.planned_date <= today) || placements.some((entry) => entry.selected_date <= today);
    if (taskView === "week") return (plan?.period === "week" && plan.planned_date === dateKey(weekStart)) ||
      (plan?.period === "day" && inRange(plan.planned_date, dateKey(weekStart), dateKey(weekEnd))) ||
      placements.some((entry) => inRange(entry.selected_date, dateKey(weekStart), dateKey(weekEnd)));
    if (plan?.period === "month" && plan.planned_date === monthStart) return true;
    if (plan?.period === "week" && plan.planned_date) {
      const end = new Date(`${plan.planned_date}T12:00:00`); end.setDate(end.getDate() + 6);
      if (plan.planned_date <= monthEnd && dateKey(end) >= monthStart) return true;
    }
    return (plan?.period === "day" && inRange(plan.planned_date, monthStart, monthEnd)) || placements.some((entry) => inRange(entry.selected_date, monthStart, monthEnd));
  });
  const selected =
    ready.find((item) => item.id === selectedWork) ?? ready[0] ?? null;
  const updates = work.filter(
    (item) =>
      item.blocked || ["In Review", "Review", "Waiting"].includes(item.status),
  );
  const dueContacts = contacts.filter(
    (item) =>
      item.next_action &&
      item.next_action_at &&
      item.next_action_at.slice(0, 10) <= today,
  );
  const days = useMemo(
    () =>
      Array.from({ length: dayCount }, (_, index) => {
        const date = new Date();
        date.setHours(12, 0, 0, 0);
        const weekStart = dayCount === 7 ? (date.getDay() + 6) % 7 : 0;
        date.setDate(date.getDate() - weekStart + dayOffset + index);
        return date;
      }),
    [dayCount, dayOffset],
  );

  function editContact(contact?: Contact) {
    setContactEditor(contact?.id ?? "new");
    setContactForm(
      contact
        ? {
            name: contact.name,
            company: contact.company ?? "",
            email: contact.email ?? "",
            phone: contact.phone ?? "",
            lane: contact.lane,
            status: contact.status,
            relationship_context: contact.relationship_context ?? "",
            notes: contact.notes ?? "",
            next_action: contact.next_action ?? "",
            next_action_at: contact.next_action_at?.slice(0, 16) ?? "",
            linear_project_id: contact.linear_project_id ?? "",
            invoice_url: contact.invoice_url ?? "",
            payment_note: contact.payment_note ?? "",
            source_url: contact.source_url ?? "",
          }
        : emptyContact,
    );
  }
  async function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = {
      ...contactForm,
      company: contactForm.company || null,
      email: contactForm.email || null,
      phone: contactForm.phone || null,
      relationship_context: contactForm.relationship_context || null,
      notes: contactForm.notes || null,
      next_action: contactForm.next_action || null,
      next_action_at: contactForm.next_action_at
        ? new Date(contactForm.next_action_at).toISOString()
        : null,
      linear_project_id: contactForm.linear_project_id || null,
      invoice_url: contactForm.invoice_url || null,
      payment_note: contactForm.payment_note || null,
      source_url: contactForm.source_url || null,
    };
    const result = await command(
      contactEditor === "new"
        ? { action: "contactCreate", contact: value }
        : { action: "contactUpdate", id: contactEditor, contact: value },
    );
    if (result) {
      setContactEditor(null);
      const row = result.result?.[0];
      if (row?.id) setSelectedContact(row.id);
    }
  }
  async function saveInteraction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    const result = await command({
      action: "interactionCreate",
      contactId: client.id,
      channel: interactionChannel,
      summary: interactionText,
      occurredAt: new Date().toISOString(),
      externalUrl: null,
    });
    if (result) setInteractionText("");
  }
  async function scheduleTask(
    item: WorkItem,
    date: string,
    minute: number,
    duration = 60,
  ) {
    if (dropping.current) return false;
    dropping.current = true;
    try {
      const placed = newPlacement(date, minute, duration);
      const saved = await command({
        action: "blockSave",
        owner: item.owner,
        ownerId: item.id,
        selectedDate: placed.selectedDate,
        startsAt: placed.startsAt,
        endsAt: placed.endsAt,
      });
      return Boolean(saved);
    } finally {
      dropping.current = false;
    }
  }
  async function chooseToday(item: WorkItem) {
    const now = new Date();
    const minute =
      Math.ceil((now.getHours() * 60 + now.getMinutes()) / SNAP_MINUTES) *
      SNAP_MINUTES;
    await scheduleTask(item, today, minute);
  }
  async function persistPlacement(block: Block, next: Placement) {
    if (saving.current.has(block.id)) {
      queued.current.set(block.id, next);
      return;
    }
    saving.current.add(block.id);
    setPendingIds((ids) => [...ids, block.id]);
    const apply = (to: Pick<Block, "selected_date" | "starts_at" | "ends_at">) =>
      setSnapshot((current) =>
        current
          ? {
              ...current,
              blocks: current.blocks.map((entry) =>
                entry.id === block.id ? { ...entry, ...to } : entry,
              ),
            }
          : current,
      );
    apply({
      selected_date: next.selectedDate,
      starts_at: next.startsAt,
      ends_at: next.endsAt,
    });
    previewRef.current = null;
    setPreview(null);
    const result = await command(
      {
        action: "blockSave",
        id: block.id,
        owner: block.owner,
        ownerId: block.owner_id,
        selectedDate: next.selectedDate,
        startsAt: next.startsAt,
        endsAt: next.endsAt,
      },
      false,
    );
    saving.current.delete(block.id);
    setPendingIds((ids) => ids.filter((id) => id !== block.id));
    if (!result) {
      queued.current.delete(block.id);
      apply(block);
      return;
    }
    const follow = queued.current.get(block.id);
    if (follow) {
      queued.current.delete(block.id);
      await persistPlacement(
        {
          ...block,
          selected_date: next.selectedDate,
          starts_at: next.startsAt,
          ends_at: next.endsAt,
        },
        follow,
      );
    }
  }
  function showPreview(block: Block, next: Placement | null) {
    const value = next ? { id: block.id, ...next } : null;
    previewRef.current = value;
    setPreview(value);
  }
  function dayFromX(x: number) {
    for (const date of days) {
      const key = dateKey(date);
      const rect = columnRefs.current[key]?.getBoundingClientRect();
      if (rect && x >= rect.left && x < rect.right) return key;
    }
    return null;
  }
  function flushKeyboardPlacement() {
    if (keyTimer.current === undefined) return;
    window.clearTimeout(keyTimer.current);
    keyTimer.current = undefined;
    const final = previewRef.current;
    const block = final && blocks.find((entry) => entry.id === final.id);
    if (final && block) void persistPlacement(block, final);
  }
  function beginGesture(
    event: React.PointerEvent<HTMLElement>,
    block: Block,
    mode: "move" | "resize",
  ) {
    if (
      event.pointerType === "touch" ||
      event.button !== 0 ||
      saving.current.has(block.id)
    )
      return;
    flushKeyboardPlacement();
    if (saving.current.has(block.id)) return;
    if (mode === "resize") event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      block,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  }
  function moveGesture(event: React.PointerEvent<HTMLElement>) {
    const g = gesture.current;
    if (!g) return;
    const dx = event.clientX - g.startX;
    const dy = event.clientY - g.startY;
    if (!g.moved && Math.hypot(dx, dy) < 4) return;
    g.moved = true;
    const delta = snapMinutes((dy / HOUR_PX) * 60);
    const span = blockSpan(g.block);
    if (g.mode === "move") {
      const day = dayFromX(event.clientX) ?? g.block.selected_date;
      showPreview(g.block, movePlacement(g.block, day, span.start + delta));
    } else {
      showPreview(g.block, {
        ...resizePlacement(g.block, span.end + delta),
        selectedDate: g.block.selected_date,
      });
    }
  }
  function cancelGesture(event: React.PointerEvent<HTMLElement>) {
    gesture.current = null;
    previewRef.current = null;
    setPreview(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function endGesture(event: React.PointerEvent<HTMLElement>) {
    const g = gesture.current;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (!g?.moved) return;
    justDragged.current = true;
    window.setTimeout(() => {
      justDragged.current = false;
    }, 0);
    const next = previewRef.current;
    if (next && next.id === g.block.id) void persistPlacement(g.block, next);
  }
  function keyAdjust(event: React.KeyboardEvent<HTMLElement>, block: Block) {
    if (event.target !== event.currentTarget) return;
    if (previewRef.current && previewRef.current.id !== block.id)
      flushKeyboardPlacement();
    const base = previewRef.current?.id === block.id ? previewRef.current : null;
    const current = base
      ? { ...block, starts_at: base.startsAt, ends_at: base.endsAt, selected_date: base.selectedDate }
      : block;
    const span = blockSpan(current);
    let next: Placement | null = null;
    const vertical = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
    const horizontal = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
    if (vertical && event.shiftKey)
      next = {
        ...resizePlacement(current, span.end + vertical * SNAP_MINUTES),
        selectedDate: current.selected_date,
      };
    else if (vertical)
      next = movePlacement(current, current.selected_date, span.start + vertical * SNAP_MINUTES);
    else if (horizontal) {
      const index = days.findIndex((date) => dateKey(date) === current.selected_date);
      const target = days[index + horizontal];
      if (index >= 0 && target)
        next = movePlacement(current, dateKey(target), span.start);
    }
    if (!next) return;
    event.preventDefault();
    showPreview(block, next);
    window.clearTimeout(keyTimer.current);
    keyTimer.current = window.setTimeout(() => {
      keyTimer.current = undefined;
      const final = previewRef.current;
      if (final && final.id === block.id) void persistPlacement(block, final);
    }, 450);
  }
  function goToNow() {
    wantNow.current = true;
    setDayOffset(0);
    setNow(new Date());
    window.requestAnimationFrame(() => {
      if (!wantNow.current || !calendarRef.current) return;
      wantNow.current = false;
      const current = new Date();
      calendarRef.current.scrollTop = Math.max(
        0,
        GRID_TOP + ((current.getHours() * 60 + current.getMinutes()) / 60) * HOUR_PX - 140,
      );
    });
  }
  function closeShortcut() {
    if (shortcutMode === "closed") return;
    setShortcutMode("closing");
    window.setTimeout(() => setShortcutMode("closed"), 190);
  }
  function savedNotice(before: WorkItem, after: WorkItem, task: Record<string, unknown>, message: string) {
    setNotice({message, undo: async () => {
      const result = await command({action: "inboxUpdate", id: before.id, expectedUpdatedAt: after.updatedAt, task});
      if (result) { setNotice({message: "Change undone"}); return true; }
      return false;
    }});
  }
  async function setWorkState(item: WorkItem, state: string) {
    if (item.owner === "dashboard") {
      const result = await command({action: "inboxUpdate", id: item.id, expectedUpdatedAt: item.updatedAt, task: {status: state}});
      if (result) savedNotice(item, result.result, {status: item.status}, state === "Done" ? "Task completed" : "Task updated");
      return result;
    }
    return command(
      item.owner === "linear"
        ? { action: "linearStatus", issueId: item.id, state }
        : item.owner === "asana"
          ? { action: "asanaStatus", taskId: item.id, state }
          : { action: "notionStatus", pageId: item.id, state },
    );
  }
  async function applyShortcut(key: string) {
    if (!selected || shortcutMode !== "open") return;
    closeShortcut();
    if (key === "1") await chooseToday(selected);
    if (key === "2") openBlock(selected);
    if (
      key === "3" &&
      (selected.owner !== "asana" || selected.states?.includes("In Progress"))
    )
      await setWorkState(
        selected,
        selected.owner === "notion" ? "In Motion" : "In Progress",
      );
    if (
      key === "4" &&
      (selected.owner !== "asana" || selected.states?.includes("Review"))
    )
      await setWorkState(
        selected,
        selected.owner === "linear"
          ? "In Review"
          : selected.owner === "asana"
            ? "Review"
            : "Waiting",
      );
    if (key === "5") await setWorkState(selected, "Done");
  }
  function openBlock(item: WorkItem, block?: Block) {
    const placement =
      block ??
      blocks.find(
        (entry) =>
          entry.owner === item.owner &&
          entry.owner_id === item.id &&
          entry.selected_date === today,
      ) ??
      blocks.find(
        (entry) => entry.owner === item.owner && entry.owner_id === item.id && entry.selected_date >= today,
      ) ??
      blocks.find((entry) => entry.owner === item.owner && entry.owner_id === item.id) ??
      null;
    setSelectedWork(item.id);
    setError("");
    setTaskEditor({
      work: item,
      block: placement,
      session: ++editorSequence.current,
    });
  }
  async function captureThought(event: FormEvent) {
    event.preventDefault();
    if (!captureText.trim() || captureLock.current) return;
    captureLock.current = true;
    captureId.current ??= crypto.randomUUID();
    try {
      const saved = await command({action: "inboxCreate", id: captureId.current, title: captureText.trim()});
      if (saved) { setCaptureText(""); captureId.current = null; }
    } finally { captureLock.current = false; }
  }
  function newTask() {
    taskCreateId.current = crypto.randomUUID();
    setError("");
    setTaskEditor({
      work: null,
      block: null,
      session: ++editorSequence.current,
    });
  }
  async function saveTask(edit: TaskEdit): Promise<boolean> {
    if (!taskEditor) return false;
    let item = taskEditor.work;
    const beforeEdit = item;
    if (!item) {
      const asanaProject = snapshot?.asanaProjects?.find(
        (project) => project.id === edit.projectId,
      );
      const created = await command(isDashboardProject(edit.projectId) ? {action: "inboxCreate", id: taskCreateId.current ?? (taskCreateId.current = crypto.randomUUID()), title: edit.title, description: edit.description} : {
        action: asanaProject ? "asanaCreate" : "linearCreate",
        title: edit.title,
        description: edit.description,
        dueDate: edit.dueDate,
        ...(asanaProject
          ? {
              projectId: asanaProject.id,
              sectionId: edit.sectionId || undefined,
            }
          : { lane: "Development" }),
      });
      if (!created?.result?.id) return false;
      item = {
        ...created.result,
        owner: isDashboardProject(edit.projectId) ? "dashboard" : asanaProject ? "asana" : "linear",
        description: edit.description,
        status: created.result.status ?? "Todo",
        lane: isDashboardProject(edit.projectId) ? "Unassigned" : asanaProject?.lane ?? "Development",
        blocked: false,
      } as WorkItem;
      setTaskEditor({ ...taskEditor, work: item });
      setSelectedWork(item.id);
      setFilters((current) => ({ ...current, [item!.lane]: true }));
    } else if (item.owner === "dashboard") {
      const context = snapshot?.asanaProjects.flatMap((project) => project.sections).find((section) => section.id === edit.projectId);
      const task = {title: edit.title, description: edit.description, lane: edit.lane === "Unassigned" ? null : edit.lane, due_date: edit.dueDate, project_id: edit.projectId === "dashboard" ? null : edit.projectId, project_name: edit.projectId === HOME_ADMIN_PROJECT.id ? HOME_ADMIN_PROJECT.name : context?.name ?? null};
      const updated = await command({action: "inboxUpdate", id: item.id, expectedUpdatedAt: item.updatedAt, task, children: edit.children});
      if (!updated) return false;
      item = {...item, ...updated.result};
      setTaskEditor({...taskEditor, work: item});
    } else if (item.owner === "linear" || item.owner === "asana") {
      const task: Record<string, unknown> = {};
      if (edit.title !== item.title) task.title = edit.title;
      if (edit.description !== (item.description ?? ""))
        task.description = edit.description;
      if (edit.dueDate !== (item.dueDate?.slice(0, 10) ?? null))
        task.dueDate = edit.dueDate;
      if (Object.keys(task).length) {
        const updated = await command({
          action: item.owner === "asana" ? "asanaUpdate" : "linearUpdate",
          ...(item.owner === "asana"
            ? { taskId: item.id }
            : { issueId: item.id }),
          task,
        });
        if (!updated) return false;
        item = { ...item, ...updated.result };
        setTaskEditor({ ...taskEditor, work: item });
      }
    }
    if (!item) return false;
    if (!beforeEdit && item.owner === "dashboard" && (edit.children.length || edit.projectId === HOME_ADMIN_PROJECT.id)) {
      const updated=await command({action:"inboxUpdate",id:item.id,expectedUpdatedAt:item.updatedAt,task:{title:item.title,...(edit.projectId === HOME_ADMIN_PROJECT.id ? {project_id:HOME_ADMIN_PROJECT.id,project_name:HOME_ADMIN_PROJECT.name} : {})},children:edit.children});
      if(!updated)return false;
      item={...item,...updated.result};
      setTaskEditor({...taskEditor,work:item});
    }
    if (!item) return false;
    const savedItem = item;
    const planSaved = await command({
      action: "taskPlanSave", owner: savedItem.owner, ownerId: savedItem.id,
      period: edit.period, plannedDate: edit.date || null,
      durationMinutes: edit.duration || null,
    });
    if (!planSaved) return false;
    const start = edit.start ? localDateTime(edit.date, edit.start) : null;
    const end = start
      ? new Date(Date.parse(start) + edit.duration * 60000).toISOString()
      : null;
    const placementChanged =
      !taskEditor.block ||
      edit.date !== taskEditor.block.selected_date ||
      start !== taskEditor.block.starts_at ||
      end !== taskEditor.block.ends_at;
    if (edit.period !== "day" && taskEditor.block) {
      const removed = await command({ action: "blockDelete", id: taskEditor.block.id });
      if (!removed) return false;
    } else if (edit.period === "day" && edit.date && placementChanged) {
      const saved = await command({
        action: "blockSave",
        id: taskEditor.block?.id,
        owner: savedItem.owner,
        ownerId: savedItem.id,
        selectedDate: edit.date,
        startsAt: start,
        endsAt: end,
      });
      if (!saved) return false;
    }
    const priorPlan = snapshot?.plans?.find((plan) => plan.owner === savedItem.owner && plan.owner_id === savedItem.id);
    const planChanged = edit.children.length > 0 || edit.period !== (taskEditor.block ? "day" : priorPlan?.period ?? "inbox") || edit.date !== (taskEditor.block?.selected_date ?? priorPlan?.planned_date ?? "") || edit.duration !== (taskEditor.block?.starts_at && taskEditor.block.ends_at ? (Date.parse(taskEditor.block.ends_at)-Date.parse(taskEditor.block.starts_at))/60000 : priorPlan?.duration_minutes ?? 0) || edit.start !== (taskEditor.block?.starts_at ? new Date(taskEditor.block.starts_at).toTimeString().slice(0,5) : "");
    if (!planChanged && beforeEdit?.owner === "dashboard" && savedItem.owner === "dashboard") {
      savedNotice(beforeEdit, savedItem, {title: beforeEdit.title, description: beforeEdit.description ?? "", lane: beforeEdit.lane === "Unassigned" ? null : beforeEdit.lane, due_date: beforeEdit.dueDate, project_id: beforeEdit.projectId ?? null, project_name: beforeEdit.projectName ?? null}, "Task updated");
    } else setNotice({message: "Task saved"});
    setTaskEditor(null);
    taskCreateId.current = null;
    return true;
  }
  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await command({
      action: "draftSave",
      title: draftTitle,
      lane: draftLane,
      subject: draftSubject,
      body: draftBody,
    });
    if (result) {
      setDraftEditor(false);
      setDraftTitle("");
      setDraftSubject("");
      setDraftBody("");
    }
  }

  return (
    <main className="cc" data-theme={theme} data-surface={surface}>
      <nav className="cc-nav" aria-label="Primary navigation">
        <div className="cc-brand"><div className="cc-mark" title="Singleton Systems">S</div><span>Singleton<span>YOUR WORKSPACE</span></span></div>
        <span className="cc-nav-label">WORKSPACE</span>
        {(
          [
            ["inbox", Tray, "Inbox", "I"],
            ["planner", CalendarBlank, "Planner", "P"],
            ["updates", Clock, "Updates", "U"],
            ["clients", UsersThree, "Clients", "C"],
          ] as const
        ).map(([id, Icon, label, key]) => (
          <Button variant="ghost"
            key={id}
            className={surface === id ? "active" : ""}
            onClick={() => setSurface(id)}
            title={`${label} (${key})`}
            aria-label={label}
            aria-current={surface === id ? "page" : undefined}
          >
            <Icon size={20} weight={surface === id ? "fill" : "regular"} />
            <span>{label}</span>
          </Button>
        ))}
        <nav className="cc-task-views" aria-label="Task views">
          {taskViews.filter(([id]) => id !== "inbox").map(([id, label]) => <Button key={id} variant="ghost" aria-current={surface === "planner" && taskView === id ? "page" : undefined} onClick={() => { setTaskView(id); setSurface("planner"); setRailCollapsed(false); }}>{label}</Button>)}
        </nav>
        <div className="cc-nav-footer"><span className="cc-profile">JS</span><span>Jerami Singleton<small>Personal workspace</small></span></div>
      </nav>
      <Button variant="ghost" size="icon" className="cc-mobile-add" aria-label="Add task" onClick={newTask} disabled={!snapshot}>
        <Plus size={26} />
      </Button>
      {notice && <div className="cc-notice" role="status"><Check size={20}/><span>{notice.message}</span>{notice.undo && <Button variant="ghost" disabled={busy} aria-label="Undo" onClick={() => void notice.undo?.()}>↶</Button>}<Button variant="ghost" aria-label="Dismiss notification" onClick={() => setNotice(null)}><X size={16}/></Button></div>}
      <section className="cc-main">
        <header className="cc-header">
          <div>
            <h1>
              {surface === "inbox" ? "Inbox" : surface === "clients"
                ? "Clients"
                : surface === "planner"
                  ? <><span className="cc-desktop-title">Planner</span><span className="cc-mobile-date">{days[Math.floor(days.length / 2)].toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span></>
                  : surface === "updates"
                    ? "Updates"
                    : "Planner"}
            </h1>
          </div>
          <div className="cc-header-actions">
            <Button variant="ghost"
              className="cc-icon"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button variant="ghost"
              className="cc-icon"
              title="Refresh"
              aria-label="Refresh"
              onClick={() => load().catch((cause) => setError(String(cause)))}
            >
              <ArrowClockwise size={18} />
            </Button>
          </div>
        </header>
        {error && (
          <div className="cc-error" role="alert">
            {error}
          </div>
        )}
        {snapshot?.failures
          .filter(
            (failure) => !failure.startsWith("Notion") || surface === "updates",
          )
          .map((failure) => (
            <div className="cc-warning" role="status" key={failure}>
              {failure}
            </div>
          ))}
        {!snapshot && <div className="cc-empty">Loading live work…</div>}
        {snapshot && surface === "inbox" && (
          <section className="cc-inbox" aria-label="Inbox tasks">
            <form onSubmit={captureThought} className="cc-inbox-capture">
              <Plus size={22} />
              <input aria-label="Add to Inbox" placeholder="Add task" value={captureText} maxLength={255} disabled={busy} onChange={(event) => { setCaptureText(event.target.value); captureId.current = null; }} />
              {captureText.trim() && <Button type="submit" variant="ghost" disabled={busy} aria-label="Capture thought"><Check size={20} /></Button>}
            </form>
            {work.filter((item) => item.owner === "dashboard" && item.lane === "Unassigned" && !["Done", "Completed"].includes(item.status) && (!snapshot.plans?.some((plan) => plan.owner === item.owner && plan.owner_id === item.id && plan.period !== "inbox")) && !blocks.some((block) => block.owner === item.owner && block.owner_id === item.id)).map((item) => (
              <div key={`${item.owner}:${item.id}`} className="cc-inbox-row">
                <Button variant="ghost" size="icon" aria-label={`Complete ${item.title}`} disabled={busy} onClick={() => setWorkState(item, "Done")} className="cc-inbox-check" />
                <button type="button" aria-label={`Open ${item.title}`} onClick={() => openBlock(item)}>{item.title}</button>
              </div>
            ))}
          </section>
        )}
        {snapshot && surface === "planner" && (
          <>
            <div className="cc-toolbar">
              <Button variant="ghost" onClick={() => setRailCollapsed((old) => !old)} aria-label={railCollapsed ? "Show task queue" : "Hide task queue"} aria-expanded={!railCollapsed} aria-controls="cc-task-queue">{railCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}<span>Tasks</span></Button>
              <Button variant="ghost" aria-label="Previous calendar period" onClick={() => setDayOffset((old) => old - dayCount)}>
                ←
              </Button>
              <Button variant="ghost" onClick={goToNow} title="Today (T)">Today</Button>
              <Button variant="ghost" aria-label="Next calendar period" onClick={() => setDayOffset((old) => old + dayCount)}>
                →
              </Button>
              <strong className="cc-range">
                {days[Math.floor(days.length / 2)].toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
                {dayCount === 7 && <small>W{isoWeek(days[0])}</small>}
              </strong>
              <span className="cc-spacer" />
              <label className="cc-calendar-view">
                <span className="sr-only">Calendar view</span>
                <select value={dayCount} onChange={(event) => setDayCount(Number(event.target.value) as 1 | 3 | 5 | 7)}>
                  <option value={1}>Day</option>
                  <option value={3}>3 days</option>
                  <option value={5}>Work week</option>
                  <option value={7}>Week</option>
                </select>
              </label>
            </div>
            <div className="cc-planner-workspace">
              <div id="cc-task-queue" className="cc-list cc-planner-rail" hidden={railCollapsed}>
                <div className="cc-rail-head">
                  <div className="cc-queue-title"><h2>Task queue</h2><span>{ready.length}</span></div>
                  <Button variant="ghost" className="cc-secondary" onClick={newTask}>
                    <Plus size={16} /> New task
                  </Button>
                </div>
                <label className="cc-task-view-select"><span className="sr-only">Task view</span><select value={taskView} onChange={(event) => setTaskView(event.target.value as TaskView)}>{taskViews.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
                <div className="cc-rail-filters">
                  {([...lanes, "Home Admin"] as DashboardLane[]).map((laneName) => (
                    <Button variant="ghost"
                      key={dashboardLaneLabel(laneName)}
                      className={`cc-toggle ${filters[laneName] ? "on" : ""}`}
                      style={
                        {
                          "--lane": laneColors[laneName],
                        } as React.CSSProperties
                      }
                      aria-pressed={filters[laneName]}
                      onClick={() =>
                        setFilters((old) => ({
                          ...old,
                          [laneName]: !old[laneName],
                        }))
                      }
                    >
                      <i className="cc-lane-dot" />
                      {dashboardLaneLabel(laneName)}
                    </Button>
                  ))}
                </div>
                {ready.length === 0 && (
                  <p className="cc-empty">No tasks in this view.</p>
                )}
                {ready.length > 0 && (
                  <div className="cc-list-section cc-rail-section">
                    {taskViews.find(([id]) => id === taskView)?.[1]} <span className="cc-count">{ready.length}</span>
                  </div>
                )}
                {ready.map((item) => (
                  <div
                    key={`${item.owner}:${item.id}`}
                    className={`cc-row ${selected?.id === item.id ? "selected" : ""}`}
                    role="group"
                    aria-label={`Task ${item.title}`}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData(
                        dragType,
                        `${item.owner}|${item.id}`,
                      );
                      event.dataTransfer.effectAllowed = "copy";
                      setSelectedWork(item.id);
                    }}
                    onDragEnd={() => setDropPreview(null)}
                    onClick={() => {
                      setSelectedWork(item.id);
                      setShortcutMode("closed");
                    }}
                    onFocus={() => setSelectedWork(item.id)}
                    onDoubleClick={(event) => {
                      if (!(event.target as HTMLElement).closest("button"))
                        openBlock(item);
                    }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openBlock(item);
                      }
                    }}
                  >
                    <i
                      className="cc-lane-bar"
                      style={
                        {
                          "--lane": laneColors[dashboardLane(item)],
                        } as React.CSSProperties
                      }
                    />
                    <Button variant="ghost" className="cc-task-name" title={item.title} aria-label={`Open ${item.title}`}
                      onClick={() => openBlock(item)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openBlock(item);
                        }
                      }}>
                      {item.title}
                    </Button>
                    {selected?.id === item.id && shortcutMode !== "closed" ? (
                      <div
                        className={`cc-shortcut-chips ${shortcutMode === "closing" ? "closing" : ""}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {[
                          ["1", "Today", laneColors[dashboardLane(item)]],
                          ["2", "Block", "#2383e2"],
                          ["3", "Start", "#149b67"],
                          [
                            "4",
                            item.owner === "notion" ? "Wait" : "Review",
                            "#d99129",
                          ],
                          ["5", "Done", "#5c6f82"],
                        ]
                          .filter(
                            ([key]) =>
                              item.owner !== "asana" ||
                              (key !== "3" && key !== "4") ||
                              item.states?.includes(
                                key === "3" ? "In Progress" : "Review",
                              ),
                          )
                          .map(([key, label, tone], index) => (
                            <Button variant="ghost"
                              key={key}
                              type="button"
                              style={
                                {
                                  "--chip": tone,
                                  "--delay": `${index * 42}ms`,
                                } as React.CSSProperties
                              }
                              onClick={() => void applyShortcut(key)}
                              title={`${key}: ${label}`}
                            >
                              <kbd>{key}</kbd>
                              {label}
                            </Button>
                          ))}
                      </div>
                    ) : (
                      <>
                        {item.dueDate ? (
                          <time
                            className={`cc-due ${dueTone(item.dueDate, today)}`}
                          >
                            {dueTone(item.dueDate, today) && (
                              <WarningCircle size={13} />
                            )}
                            {shortDate(item.dueDate)}
                          </time>
                        ) : null}
                        <Button variant="ghost"
                          type="button"
                          className="cc-row-schedule"
                          aria-label={`Schedule ${item.title}`}
                          title="Schedule"
                          onClick={(event) => {
                            event.stopPropagation();
                            setPicker(item);
                          }}
                        >
                          <CalendarPlus size={18} />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
                {dueContacts.filter((item) => filters[item.lane]).length >
                  0 && <div className="cc-list-section">Follow-ups due</div>}
                {dueContacts
                  .filter((item) => filters[item.lane])
                  .map((item) => (
                    <Button variant="ghost"
                      key={`contact:${item.id}`}
                      className="cc-row"
                      onClick={() => {
                        setSelectedContact(item.id);
                        setSurface("clients");
                      }}
                    >
                      <span>
                        {item.name} · {item.next_action}
                      </span>
                      <time>{shortDate(item.next_action_at)}</time>
                    </Button>
                  ))}
              </div>
              <div
                className="cc-calendar"
                ref={retainCalendar}
                onScroll={(event) => { calendarScroll.current = event.currentTarget.scrollTop; }}
                style={{ "--day-count": dayCount } as React.CSSProperties}
              >
                <div className="cc-calendar-head">
                  <div className="cc-time-corner">{new Intl.DateTimeFormat(undefined, { timeZoneName: "short" }).formatToParts(now).find((part) => part.type === "timeZoneName")?.value}</div>
                  {days.map((date) => (
                    <div className="cc-day-head" key={dateKey(date)} aria-current={dateKey(date) === today ? "date" : undefined}>
                      <span>
                        {date.toLocaleDateString(undefined, {
                          weekday: "short",
                        })}
                      </span>
                      <strong>{date.getDate()}</strong>
                    </div>
                  ))}
                </div>
                <div className="cc-calendar-body" style={{ height: GRID_HEIGHT }}>
                  <div className="cc-times">
                    {days.some((date) => dateKey(date) === today) && (
                      <span
                        className="cc-now-label"
                        style={{
                          top: `${GRID_TOP + ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_PX}px`,
                        }}
                      >
                        {now.toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                    {Array.from({ length: 24 }, (_, hour) => (
                      <span
                        key={hour}
                        style={{ top: `${GRID_TOP + hour * HOUR_PX}px` }}
                      >
                        {hour === 0
                          ? "12 AM"
                          : hour < 12
                            ? `${hour} AM`
                            : hour === 12
                              ? "12 PM"
                              : `${hour - 12} PM`}
                      </span>
                    ))}
                  </div>
                  {days.map((date) => {
                    const key = dateKey(date);
                    const placements = placeOverlaps(
                      shownBlocks.filter(
                        (block) =>
                          block.selected_date === key && block.starts_at,
                      ),
                    );
                    return (
                      <div
                        className={`cc-day-column ${key === today ? "today" : ""}`}
                        key={key}
                        data-date={key}
                        ref={(element) => {
                          columnRefs.current[key] = element;
                        }}
                        onDragOver={(event) => {
                          if (!event.dataTransfer.types.includes(dragType))
                            return;
                          event.preventDefault();
                          event.dataTransfer.dropEffect = "copy";
                          const rect = event.currentTarget.getBoundingClientRect();
                          setDropPreview({
                            date: key,
                            minute: Math.min(
                              1380,
                              minuteFromOffset(
                                event.clientY - rect.top - GRID_TOP,
                                HOUR_PX,
                              ),
                            ),
                          });
                        }}
                        onDragLeave={(event) => {
                          if (!event.currentTarget.contains(event.relatedTarget as Node))
                            setDropPreview(null);
                        }}
                        onDrop={(event) => {
                          const [owner, id] = event.dataTransfer
                            .getData(dragType)
                            .split("|");
                          const item = work.find(
                            (entry) => entry.owner === owner && entry.id === id,
                          );
                          const target = dropPreview;
                          setDropPreview(null);
                          if (!item || !target) return;
                          event.preventDefault();
                          void scheduleTask(item, target.date, target.minute);
                        }}
                      >
                        {Array.from({ length: 24 }, (_, hour) => (
                          <i
                            className="cc-hour-line"
                            style={{ top: `${GRID_TOP + hour * HOUR_PX}px` }}
                            key={hour}
                          />
                        ))}
                        {key === today && (
                          <i
                            className="cc-now"
                            style={{
                              top: `${GRID_TOP + ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_PX}px`,
                            }}
                          />
                        )}
                        {dropPreview?.date === key && (
                          <div
                            className="cc-drop-ghost"
                            style={{
                              top: `${GRID_TOP + (dropPreview.minute / 60) * HOUR_PX}px`,
                              height: `${HOUR_PX}px`,
                            }}
                          >
                            {new Date(2000, 0, 1, 0, dropPreview.minute).toLocaleTimeString(
                              undefined,
                              { hour: "numeric", minute: "2-digit" },
                            )}
                          </div>
                        )}
                        {placements.map((placement) => {
                          const item = workForBlock(placement.block);
                          const top =
                            GRID_TOP + (placement.startMinute / 60) * HOUR_PX;
                          const height = Math.max(
                            24,
                            ((placement.endMinute - placement.startMinute) / 60) *
                              HOUR_PX,
                          );
                          const left =
                            (placement.lane / placement.laneCount) * 100;
                          const width = 100 / placement.laneCount;
                          const lane = laneForBlock(placement.block);
                          const stacked = Boolean(placement.stack);
                          const original = blocks.find(
                            (entry) => entry.id === placement.block.id,
                          )!;
                          const pending = pendingIds.includes(placement.block.id);
                          const range = `${new Date(placement.block.starts_at!).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}–${new Date(placement.block.ends_at!).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
                          return (
                            <div
                              className={`cc-timed-block ${preview?.id === placement.block.id ? "dragging" : ""} ${pending ? "pending" : ""} ${item && item.id === selectedWork ? "selected" : ""} ${height < 40 ? "short" : ""}`}
                              role="button"
                              tabIndex={0}
                              key={placement.block.id}
                              data-block-id={placement.block.id}
                              aria-label={`${titleForBlock(placement.block)}, ${range}. Arrow keys move, Shift plus arrows resize, Enter edits.`}
                              style={
                                {
                                  "--lane": laneColors[lane],
                                  top: `${top}px`,
                                  height: `${height}px`,
                                  left: `calc(${left}% + 3px)`,
                                  width: `calc(${width}% - 6px)`,
                                } as React.CSSProperties
                              }
                              onPointerDown={(event) =>
                                !stacked && beginGesture(event, original, "move")
                              }
                              onPointerMove={moveGesture}
                              onPointerUp={endGesture}
                              onPointerCancel={cancelGesture}
                              onClick={() => {
                                if (justDragged.current) return;
                                if (item) setSelectedWork(item.id);
                                if (
                                  item &&
                                  window.matchMedia("(pointer: coarse)").matches
                                )
                                  openBlock(item, original);
                              }}
                              onDoubleClick={() => {
                                if (item) openBlock(item, original);
                              }}
                              onKeyDown={(event) => {
                                if (event.target !== event.currentTarget) return;
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  if (item) openBlock(item, original);
                                  return;
                                }
                                if (!stacked) keyAdjust(event, original);
                              }}
                              title={`${titleForBlock(placement.block)} · double-click to edit`}
                            >
                              <strong>
                                {stacked
                                  ? `${placement.stack!.length} overlapping blocks`
                                  : titleForBlock(placement.block)}
                              </strong>
                              <span>
                                {stacked
                                  ? placement
                                      .stack!.map(titleForBlock)
                                      .join(" · ")
                                  : durationLabel(
                                      placement.endMinute - placement.startMinute,
                                    )}
                              </span>
                              {!stacked && height >= 64 && (
                                <span className="cc-block-range">{range}</span>
                              )}
                              {!stacked && (
                                <i
                                  className="cc-resize"
                                  aria-hidden="true"
                                  onPointerDown={(event) =>
                                    beginGesture(event, original, "resize")
                                  }
                                  onPointerMove={moveGesture}
                                  onPointerUp={endGesture}
                                  onPointerCancel={cancelGesture}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
        {snapshot && surface === "updates" && (
          <div className="cc-updates">
            <h2>Review and waiting</h2>
            {updates.length === 0 && (
              <p className="cc-empty">No review or blocked work.</p>
            )}
            {updates.map((item) => (
              <div className="cc-update" key={item.id}>
                <span>{item.title}</span>
                <small>{item.blocked ? "Blocked" : "In Review"}</small>
                <a href={item.url} target="_blank" rel="noreferrer">
                  Open <ArrowSquareOut size={13} />
                </a>
              </div>
            ))}
            <h2>Follow-ups due</h2>
            {dueContacts.length === 0 && (
              <p className="cc-empty">No follow-ups due.</p>
            )}
            {dueContacts.map((item) => (
              <Button variant="ghost"
                className="cc-update"
                key={item.id}
                onClick={() => {
                  setSurface("clients");
                  setSelectedContact(item.id);
                }}
              >
                <span>
                  {item.name} · {item.next_action}
                </span>
                <small>{shortDate(item.next_action_at)}</small>
              </Button>
            ))}
          </div>
        )}
        {snapshot && surface === "clients" && (
          <>
            <div className="cc-toolbar">
              <Button variant={clientDirectory ? "outline" : "secondary"} onClick={() => setClientDirectory(false)} aria-pressed={!clientDirectory}>Work board</Button>
              <Button variant={clientDirectory ? "secondary" : "ghost"} onClick={() => setClientDirectory(true)} aria-pressed={clientDirectory}>Contacts <span className="cc-tab-count">{contacts.length}</span></Button>
              <span className="cc-spacer" />
              <Button variant="ghost" className="cc-primary" onClick={() => editContact()}>
                <Plus size={16} /> New contact
              </Button>
            </div>
            {!clientDirectory && <ClientBoard work={work} projects={snapshot.asanaProjects} onOpenTask={(item) => openBlock(item)} />}
            {clientDirectory && <div className="cc-split cc-clients">
              <div className="cc-list">
                {contacts.length === 0 && (
                  <p className="cc-empty">
                    No clients yet. Add the first real lead.
                  </p>
                )}
                {contacts.map((item) => (
                  <Button variant="ghost"
                    key={item.id}
                    className={`cc-client-row ${selectedContact === item.id ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedContact(item.id);
                      setDraftMenu(false);
                    }}
                  >
                    <span className="cc-avatar">
                      {item.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="cc-client-copy">
                      <strong>{item.name}</strong>
                      <small>{item.company || item.status}</small>
                    </span>
                    <span className="cc-client-due">
                      {shortDate(item.next_action_at)}
                    </span>
                  </Button>
                ))}
              </div>
              <div className="cc-detail">
                {client ? (
                  <>
                    <div className="cc-contact-head">
                      <div>
                        <span className="cc-overline">
                          {client.lane} · {client.status}
                        </span>
                        <h2>{client.name}</h2>
                        <p>{client.company}</p>
                      </div>
                      <Button variant="ghost"
                        className="cc-secondary"
                        onClick={() => editContact(client)}
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="cc-actions">
                      <Button variant="ghost"
                        onClick={() => setDraftMenu((old) => !old)}
                        disabled={!client.email}
                      >
                        <EnvelopeSimple size={16} /> Outreach
                      </Button>
                      <Button variant="ghost" onClick={() => setDraftEditor(true)}>
                        <Plus size={16} /> Save draft
                      </Button>
                    </div>
                    {draftMenu && (
                      <div className="cc-drafts">
                        <a
                          href={gmailCompose(client.email || "")}
                          target="_blank"
                          rel="noreferrer"
                        >
                          New message <ArrowSquareOut size={14} />
                        </a>
                        {snapshot.drafts
                          .filter((draft) => draft.lane === client.lane)
                          .map((draft) => (
                            <a
                              key={draft.id}
                              href={gmailCompose(
                                client.email || "",
                                draft.subject,
                                draft.body,
                              )}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {draft.title} <ArrowSquareOut size={14} />
                            </a>
                          ))}
                      </div>
                    )}
                    <div className="cc-fact">
                      <span>Next action</span>
                      <strong>{client.next_action || "None set"}</strong>
                      <small>{shortDate(client.next_action_at)}</small>
                    </div>
                    <div className="cc-fact">
                      <span>Context</span>
                      <p>{client.relationship_context || "—"}</p>
                      {client.source_url && (
                        <a
                          className="cc-source-link"
                          href={client.source_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Source <ArrowSquareOut size={13} />
                        </a>
                      )}
                    </div>
                    {client.notes && (
                      <details className="cc-notes">
                        <summary>Notes</summary>
                        <p>{client.notes}</p>
                      </details>
                    )}
                    <div className="cc-fact">
                      <span>Invoice / payment</span>
                      {client.invoice_url ? (
                        <a
                          className="cc-source-link"
                          href={client.invoice_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open invoice <ArrowSquareOut size={13} />
                        </a>
                      ) : (
                        <strong>—</strong>
                      )}
                      {client.payment_note && <p>{client.payment_note}</p>}
                    </div>
                    <div className="cc-divider" />
                    <div className="cc-section-heading">
                      <h3>Deliverables</h3>
                      <span>{clientDeliverables.length}</span>
                    </div>
                    {clientDeliverables.map((item) => (
                      <a
                        className="cc-deliverable"
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>{item.title}</span>
                        <small>
                          {item.status} · {shortDate(item.dueDate)}
                        </small>
                      </a>
                    ))}
                    {clientDeliverables.length === 0 && (
                      <p className="cc-empty">No active Linear work linked.</p>
                    )}
                    <div className="cc-divider" />
                    <div className="cc-section-heading">
                      <h3>Recent email</h3>
                      {mail?.gmailUrl && (
                        <a
                          className="cc-source-link"
                          href={mail.gmailUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open thread <ArrowSquareOut size={13} />
                        </a>
                      )}
                    </div>
                    {!mail && <p className="cc-empty">Loading email…</p>}
                    {mail && !mail.configured && (
                      <p className="cc-empty">Gmail connection needed.</p>
                    )}
                    {mail?.error && <p className="cc-warning">{mail.error}</p>}
                    {mail &&
                      mail.configured &&
                      mail.messages.length === 0 &&
                      !mail.error && (
                        <p className="cc-empty">No email found.</p>
                      )}
                    {mail?.messages.map((message) => (
                      <article className="cc-interaction" key={message.id}>
                        <small>
                          {message.from} · {message.date}
                        </small>
                        <strong>{message.subject}</strong>
                        <p>{message.snippet}</p>
                      </article>
                    ))}
                    <div className="cc-divider" />
                    <div className="cc-section-heading">
                      <h3>Interactions</h3>
                      <span>{clientInteractions.length}</span>
                    </div>
                    {clientInteractions.map((item) => (
                      <article className="cc-interaction" key={item.id}>
                        <small>
                          {item.channel} ·{" "}
                          {new Date(item.occurred_at).toLocaleDateString()}
                        </small>
                        <p>{item.summary}</p>
                        {item.external_url && (
                          <a
                            href={item.external_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open source
                          </a>
                        )}
                      </article>
                    ))}
                    {clientInteractions.length === 0 && (
                      <p className="cc-empty">No interactions recorded.</p>
                    )}
                    <form className="cc-log" onSubmit={saveInteraction}>
                      <select
                        value={interactionChannel}
                        onChange={(event) =>
                          setInteractionChannel(event.target.value)
                        }
                      >
                        <option>call</option>
                        <option>email</option>
                        <option>message</option>
                        <option>meeting</option>
                        <option>other</option>
                      </select>
                      <input
                        value={interactionText}
                        onChange={(event) =>
                          setInteractionText(event.target.value)
                        }
                        placeholder="Add interaction note"
                        required
                      />
                      <Button variant="ghost" disabled={busy}>Log</Button>
                    </form>
                  </>
                ) : (
                  <p className="cc-empty">Select a lead or client.</p>
                )}
              </div>
            </div>}
          </>
        )}
      </section>
      {picker && (
        <SchedulePicker
          key={`${picker.owner}:${picker.id}`}
          title={picker.title}
          days={days.map(dateKey)}
          today={today}
          busy={busy}
          onPlace={async (date, minute, duration) => {
            if (await scheduleTask(picker, date, minute, duration))
              setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      )}
      {taskEditor && (
        <TaskEditor
          key={taskEditor.session}
          work={taskEditor.work}
          block={taskEditor.block}
          plan={snapshot?.plans?.find((plan) => plan.owner === taskEditor.work?.owner && plan.owner_id === taskEditor.work?.id)}
          today={today}
          busy={busy}
          error={error}
          laneColors={laneColors}
          projects={snapshot?.asanaProjects ?? []}
          captureMode={surface === "inbox"}
          onSave={saveTask}
          onSubtask={async (title) => {
            if (!taskEditor.work || taskEditor.work.owner === "notion")
              return false;
            const result = await command({
              action:
                taskEditor.work.owner === "asana"
                  ? "asanaSubtask"
                  : "linearSubtask",
              parentId: taskEditor.work.id,
              title,
            });
            if (!result?.result?.id) return false;
            setTaskEditor((current) =>
              current?.work && current.session === taskEditor.session
                ? {
                    ...current,
                    work: {
                      ...current.work,
                      children: [
                        ...(current.work.children ?? []),
                        {
                          id: result.result.id,
                          title: result.result.title,
                          url: result.result.url,
                          status: result.result.status ?? "Todo",
                          dueDate: result.result.dueDate ?? null,
                        },
                      ],
                    },
                  }
                : current,
            );
            return true;
          }}
          onSubtaskComplete={async (childId) => {
            const parent = taskEditor.work;
            if (!parent || parent.owner === "notion") return false;
            const child = parent.children?.find((item) => item.id === childId);
            const result = await command(parent.owner === "dashboard" ? {action:"inboxUpdate",id:childId,expectedUpdatedAt:child?.updatedAt,task:{status:"Done"}} : {
              action:
                parent.owner === "asana"
                  ? "asanaSubtaskComplete"
                  : "linearSubtaskComplete",
              parentId: parent.id,
              childId,
            });
            if (result?.result?.status !== "Done") return false;
            setTaskEditor((current) =>
              current?.work && current.session === taskEditor.session
                ? {
                    ...current,
                    work: {
                      ...current.work,
                      children: current.work.children?.map((child) =>
                        child.id === childId
                          ? { ...child, ...result.result }
                          : child,
                      ),
                    },
                  }
                : current,
            );
            return true;
          }}
          onComplete={async () => {
            if (
              taskEditor.work &&
              (await setWorkState(taskEditor.work, "Done"))
            )
              setTaskEditor(null);
          }}
          onState={async (state) => {
            if (taskEditor.work) {
              const result = await setWorkState(taskEditor.work, state);
              if (result) {
                if (state === "Done") setTaskEditor(null);
                else
                  setTaskEditor({
                    ...taskEditor,
                    work: { ...taskEditor.work, status: state },
                  });
              }
            }
          }}
          onRemove={async () => {
            if (taskEditor.block) {
              const result = await command({
                action: "blockDelete",
                id: taskEditor.block.id,
              });
              if (result) setTaskEditor(null);
            }
          }}
          onClose={() => setTaskEditor(null)}
        />
      )}
      {contactEditor !== null && (
        <dialog
          ref={contactDialog}
          className="cc-contact-dialog"
          aria-labelledby="cc-contact-title"
          onCancel={(event) => {
            event.preventDefault();
            setContactEditor(null);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const first = event.currentTarget.querySelector<HTMLButtonElement>('button[aria-label="Close"]');
            const last = event.currentTarget.querySelector<HTMLButtonElement>('button[type="submit"]');
            if (!event.shiftKey && event.target === last && first) {
              event.preventDefault();
              first.focus();
            } else if (event.shiftKey && event.target === first && last && !last.disabled) {
              event.preventDefault();
              last.focus();
            }
          }}
          onMouseDown={() => setContactEditor(null)}
        >
          <section
            className="cc-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="cc-modal-head">
              <h2 id="cc-contact-title">
                {contactEditor === "new" ? "New contact" : "Edit contact"}
              </h2>
              <Button variant="ghost" onClick={() => setContactEditor(null)} aria-label="Close">
                <X size={18} />
              </Button>
            </div>
            <form onSubmit={saveContact}>
              {error && <p role="alert">{error}</p>}
              <div className="cc-form-grid">
                <label>
                  Name
                  <input
                    value={contactForm.name}
                    onChange={(event) =>
                      setContactForm({
                        ...contactForm,
                        name: event.target.value,
                      })
                    }
                    required
                  />
                </label>
                <label>
                  Company
                  <input
                    value={contactForm.company}
                    onChange={(event) =>
                      setContactForm({
                        ...contactForm,
                        company: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(event) =>
                      setContactForm({
                        ...contactForm,
                        email: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <details className="cc-contact-details" key={contactEditor}>
                <summary>More details</summary>
                <div className="cc-form-grid">
                <label>
                  Phone
                  <input
                    value={contactForm.phone}
                    onChange={(event) =>
                      setContactForm({
                        ...contactForm,
                        phone: event.target.value,
                      })
                    }
                  />
                </label>
                <fieldset className="cc-lane-field wide">
                  <legend>Lane</legend>
                  <div className="cc-lane-values">
                    {lanes.map((item) => (
                      <Button variant="ghost"
                        key={item}
                        type="button"
                        className={contactForm.lane === item ? "selected" : ""}
                        style={
                          { "--lane": laneColors[item] } as React.CSSProperties
                        }
                        onClick={() =>
                          setContactForm({ ...contactForm, lane: item })
                        }
                      >
                        <i />
                        {item}
                      </Button>
                    ))}
                  </div>
                </fieldset>
                <label>
                  Status
                  <select
                    value={contactForm.status}
                    onChange={(event) =>
                      setContactForm({
                        ...contactForm,
                        status: event.target.value,
                      })
                    }
                  >
                    {[
                      "lead",
                      "conversation",
                      "proposal",
                      "active",
                      "paused",
                      "closed",
                    ].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="wide">
                  Next action
                  <input
                    value={contactForm.next_action}
                    onChange={(event) =>
                      setContactForm({
                        ...contactForm,
                        next_action: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Next touch
                  <input
                    type="datetime-local"
                    value={contactForm.next_action_at}
                    onChange={(event) =>
                      setContactForm({
                        ...contactForm,
                        next_action_at: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="wide">
                  Linear project
                  <select
                    value={contactForm.linear_project_id}
                    onChange={(event) =>
                      setContactForm({
                        ...contactForm,
                        linear_project_id: event.target.value,
                      })
                    }
                  >
                    <option value="">None</option>
                    {projects.map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="wide">
                  Invoice link
                  <input
                    type="url"
                    value={contactForm.invoice_url}
                    onChange={(event) =>
                      setContactForm({
                        ...contactForm,
                        invoice_url: event.target.value,
                      })
                    }
                    placeholder="https://"
                  />
                </label>
                <label className="wide">
                  Payment note
                  <input
                    value={contactForm.payment_note}
                    onChange={(event) =>
                      setContactForm({
                        ...contactForm,
                        payment_note: event.target.value,
                      })
                    }
                    placeholder="Invoice sent, deposit pending…"
                  />
                </label>
                <label className="wide">
                  Source link
                  <input
                    type="url"
                    value={contactForm.source_url}
                    onChange={(event) =>
                      setContactForm({
                        ...contactForm,
                        source_url: event.target.value,
                      })
                    }
                    placeholder="https://"
                  />
                </label>
                <label className="wide">
                  Context
                  <textarea
                    value={contactForm.relationship_context}
                    onChange={(event) =>
                      setContactForm({
                        ...contactForm,
                        relationship_context: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="wide">
                  Notes
                  <textarea
                    value={contactForm.notes}
                    onChange={(event) =>
                      setContactForm({
                        ...contactForm,
                        notes: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
              </details>
              <div className="cc-modal-actions">
                <Button variant="ghost" type="button" onClick={() => setContactEditor(null)}>
                  Cancel
                </Button>
                <Button variant="ghost" type="submit" className="cc-primary" disabled={busy}>
                  <Check size={16} /> Save
                </Button>
              </div>
            </form>
          </section>
        </dialog>
      )}
      {draftEditor && (
        <div
          className="cc-modal-backdrop"
          onMouseDown={() => setDraftEditor(false)}
        >
          <section
            className="cc-modal cc-small-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cc-draft-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="cc-modal-head">
              <h2 id="cc-draft-title">Save draft</h2>
              <Button variant="ghost" onClick={() => setDraftEditor(false)} aria-label="Close">
                <X size={18} />
              </Button>
            </div>
            <form onSubmit={saveDraft}>
              <label>
                Name
                <input
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  required
                />
              </label>
              <label>
                Lane
                <select
                  value={draftLane}
                  onChange={(event) => setDraftLane(event.target.value as Lane)}
                >
                  {lanes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Subject
                <input
                  value={draftSubject}
                  onChange={(event) => setDraftSubject(event.target.value)}
                />
              </label>
              <label>
                Message
                <textarea
                  rows={6}
                  value={draftBody}
                  onChange={(event) => setDraftBody(event.target.value)}
                />
              </label>
              <div className="cc-modal-actions">
                <Button variant="ghost" type="button" onClick={() => setDraftEditor(false)}>
                  Cancel
                </Button>
                <Button variant="ghost" className="cc-primary" disabled={busy}>
                  Save draft
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
