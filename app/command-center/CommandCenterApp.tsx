"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowClockwise,
  ArrowSquareOut,
  CalendarBlank,
  Check,
  Clock,
  EnvelopeSimple,
  ListChecks,
  Plus,
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
} from "@/lib/command-center";

type Snapshot = {
  contacts: Contact[];
  interactions: Interaction[];
  blocks: Block[];
  drafts: Draft[];
  work: WorkItem[];
  failures: string[];
};
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
type Surface = "queue" | "planner" | "updates" | "clients";
const lanes: Lane[] = ["AI Consultant", "Content Editor", "Development"];
const laneColors: Record<Lane, string> = {
  "AI Consultant": "#7c5cff",
  "Content Editor": "#e58a32",
  Development: "#27a88a",
};
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
      const start = new Date(block.starts_at!);
      const end = new Date(block.ends_at!);
      return {
        block,
        startMinute: start.getHours() * 60 + start.getMinutes(),
        endMinute: end.getHours() * 60 + end.getMinutes(),
      };
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
  const [surface, setSurface] = useState<Surface>("queue");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState<Record<Lane, boolean>>({
    "AI Consultant": true,
    "Content Editor": true,
    Development: false,
  });
  const [selectedWork, setSelectedWork] = useState<string | null>(null);
  const [shortcutMode, setShortcutMode] = useState<
    "closed" | "open" | "closing"
  >("closed");
  const [taskEditor, setTaskEditor] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [taskLane, setTaskLane] = useState<Lane>("AI Consultant");
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [contactEditor, setContactEditor] = useState<number | "new" | null>(
    null,
  );
  const [contactForm, setContactForm] = useState<ContactForm>(emptyContact);
  const [interactionText, setInteractionText] = useState("");
  const [interactionChannel, setInteractionChannel] = useState("call");
  const [draftMenu, setDraftMenu] = useState(false);
  const [draftEditor, setDraftEditor] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftLane, setDraftLane] = useState<Lane>("AI Consultant");
  const [mail, setMail] = useState<MailView | null>(null);
  const [dayCount, setDayCount] = useState<1 | 3 | 5>(3);
  const [dayOffset, setDayOffset] = useState(0);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [blockWork, setBlockWork] = useState<WorkItem | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [blockDate, setBlockDate] = useState(dateKey(new Date()));
  const [blockStart, setBlockStart] = useState("09:00");
  const [blockEnd, setBlockEnd] = useState("10:00");

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
            ["Todo", "In Progress", "Today", "Queued", "In Motion"].includes(
              item.status,
            ),
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
      setBlockWork(null);
      setDraftMenu(false);
      setTaskEditor(false);
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
      surface === "queue" &&
      shortcutItem
    ) {
      event.preventDefault();
      setShortcutMode("open");
      return;
    }
    if (event.key === "q") setSurface("queue");
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
  useEffect(() => {
    if (surface !== "planner") return;
    const frame = requestAnimationFrame(() => {
      if (calendarRef.current) calendarRef.current.scrollTop = 62 + 70 + 7 * 56;
    });
    return () => cancelAnimationFrame(frame);
  }, [surface, dayCount, dayOffset]);

  async function command(payload: Record<string, unknown>) {
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
      await load();
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
  const laneForBlock = (block: Block): Lane =>
    workForBlock(block)?.lane ??
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
  const ready = work.filter(
    (item) =>
      !item.blocked &&
      ["Todo", "In Progress", "Today", "Queued", "In Motion"].includes(
        item.status,
      ) &&
      filters[item.lane],
  );
  const selected =
    ready.find((item) => item.id === selectedWork) ?? ready[0] ?? null;
  const updates = work.filter(
    (item) => item.blocked || ["In Review", "Waiting"].includes(item.status),
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
        date.setDate(date.getDate() + dayOffset + index);
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
  async function chooseToday(item: WorkItem) {
    if (
      blocks.some(
        (block) =>
          block.owner === item.owner &&
          block.owner_id === item.id &&
          block.selected_date === today,
      )
    )
      return;
    await command({
      action: "blockSave",
      owner: item.owner,
      ownerId: item.id,
      selectedDate: today,
      startsAt: null,
      endsAt: null,
    });
  }
  function closeShortcut() {
    if (shortcutMode === "closed") return;
    setShortcutMode("closing");
    window.setTimeout(() => setShortcutMode("closed"), 190);
  }
  async function setWorkState(item: WorkItem, state: string) {
    return command(
      item.owner === "linear"
        ? { action: "linearStatus", issueId: item.id, state }
        : { action: "notionStatus", pageId: item.id, state },
    );
  }
  async function applyShortcut(key: string) {
    if (!selected || shortcutMode !== "open") return;
    closeShortcut();
    if (key === "1") await chooseToday(selected);
    if (key === "2") openBlock(selected);
    if (key === "3")
      await setWorkState(
        selected,
        selected.owner === "linear" ? "In Progress" : "In Motion",
      );
    if (key === "4")
      await setWorkState(
        selected,
        selected.owner === "linear" ? "In Review" : "Waiting",
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
          entry.selected_date === today &&
          !entry.starts_at,
      );
    setBlockWork(item);
    setEditingBlockId(placement?.id ?? null);
    setBlockDate(placement?.selected_date ?? today);
    setBlockStart(
      placement?.starts_at
        ? new Date(placement.starts_at).toTimeString().slice(0, 5)
        : "09:00",
    );
    setBlockEnd(
      placement?.ends_at
        ? new Date(placement.ends_at).toTimeString().slice(0, 5)
        : "10:00",
    );
  }
  async function placeBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!blockWork) return;
    const result = await command({
      action: "blockSave",
      id: editingBlockId ?? undefined,
      owner: blockWork.owner,
      ownerId: blockWork.id,
      selectedDate: blockDate,
      startsAt: localDateTime(blockDate, blockStart),
      endsAt: localDateTime(blockDate, blockEnd),
    });
    if (result) {
      setBlockWork(null);
      setEditingBlockId(null);
    }
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
  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await command({
      action: "linearCreate",
      title: taskTitle,
      dueDate: taskDue || null,
      lane: taskLane,
    });
    if (result?.result?.id) {
      setSelectedWork(result.result.id);
      setTaskEditor(false);
      setTaskTitle("");
      setTaskDue("");
    }
  }

  return (
    <main className="cc">
      <aside className="cc-nav" aria-label="Command Center navigation">
        <div className="cc-mark" title="Singleton Systems">
          S
        </div>
        {(
          [
            ["queue", ListChecks, "Queue", "Q"],
            ["planner", CalendarBlank, "Planner", "P"],
            ["updates", Clock, "Updates", "U"],
            ["clients", UsersThree, "Clients", "C"],
          ] as const
        ).map(([id, Icon, label, key]) => (
          <button
            key={id}
            className={surface === id ? "active" : ""}
            onClick={() => setSurface(id)}
            title={`${label} (${key})`}
            aria-label={label}
          >
            <Icon size={20} weight={surface === id ? "fill" : "regular"} />
            <span>{label}</span>
          </button>
        ))}
      </aside>
      <section className="cc-main">
        <header className="cc-header">
          <div>
            <span className="cc-overline">SINGLETON SYSTEMS</span>
            <h1>
              {surface === "clients"
                ? "Clients"
                : surface === "planner"
                  ? "Planner"
                  : surface === "updates"
                    ? "Updates"
                    : "Queue"}
            </h1>
          </div>
          <button
            className="cc-icon"
            title="Refresh"
            aria-label="Refresh"
            onClick={() => load().catch((cause) => setError(String(cause)))}
          >
            <ArrowClockwise size={18} />
          </button>
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
        {snapshot && surface === "queue" && (
          <>
            <div className="cc-toolbar">
              {lanes.map((laneName) => (
                <button
                  key={laneName}
                  className={`cc-toggle ${filters[laneName] ? "on" : ""}`}
                  style={
                    { "--lane": laneColors[laneName] } as React.CSSProperties
                  }
                  onClick={() =>
                    setFilters((old) => ({
                      ...old,
                      [laneName]: !old[laneName],
                    }))
                  }
                >
                  <i className="cc-lane-dot" /> {laneName}
                </button>
              ))}
              <span className="cc-spacer" />
              <button
                className="cc-primary"
                onClick={() => setTaskEditor(true)}
              >
                <Plus size={16} /> New task
              </button>
            </div>
            <div className="cc-split">
              <div className="cc-list">
                {ready.length === 0 && (
                  <p className="cc-empty">No ready work in these lanes.</p>
                )}
                {ready.map((item) => (
                  <div
                    key={`${item.owner}:${item.id}`}
                    className={`cc-row ${selected?.id === item.id ? "selected" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedWork(item.id);
                      setShortcutMode("closed");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedWork(item.id);
                      }
                    }}
                  >
                    <i
                      className="cc-lane-bar"
                      style={
                        {
                          "--lane": laneColors[item.lane],
                        } as React.CSSProperties
                      }
                    />
                    <span>{item.title}</span>
                    {selected?.id === item.id && shortcutMode !== "closed" ? (
                      <div
                        className={`cc-shortcut-chips ${shortcutMode === "closing" ? "closing" : ""}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {[
                          ["1", "Today", laneColors[item.lane]],
                          ["2", "Block", "#2383e2"],
                          ["3", "Start", "#149b67"],
                          [
                            "4",
                            item.owner === "linear" ? "Review" : "Wait",
                            "#d99129",
                          ],
                          ["5", "Done", "#5c6f82"],
                        ].map(([key, label, tone], index) => (
                          <button
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
                          </button>
                        ))}
                      </div>
                    ) : (
                      <time>{shortDate(item.dueDate)}</time>
                    )}
                  </div>
                ))}
                {dueContacts.filter((item) => filters[item.lane]).length >
                  0 && <div className="cc-list-section">Follow-ups due</div>}
                {dueContacts
                  .filter((item) => filters[item.lane])
                  .map((item) => (
                    <button
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
                    </button>
                  ))}
              </div>
              <div className="cc-detail">
                {selected ? (
                  <>
                    <span className="cc-overline">
                      {selected.lane} · {selected.status} ·{" "}
                      {selected.projectName ?? selected.owner}
                    </span>
                    <h2>{selected.title}</h2>
                    <p>Due {shortDate(selected.dueDate)}</p>
                    <div className="cc-actions">
                      <button
                        onClick={() => chooseToday(selected)}
                        disabled={busy}
                      >
                        <Plus size={16} /> Today
                      </button>
                      <button onClick={() => openBlock(selected)}>
                        <CalendarBlank size={16} /> Block time
                      </button>
                      <a href={selected.url} target="_blank" rel="noreferrer">
                        Open {selected.owner === "linear" ? "Linear" : "Notion"}{" "}
                        <ArrowSquareOut size={14} />
                      </a>
                    </div>
                    <div className="cc-divider" />
                    <label className="cc-inline-select">
                      Lane{" "}
                      <select
                        value={selected.lane}
                        disabled={busy}
                        onChange={(event) =>
                          command({
                            action: "laneSave",
                            owner: selected.owner,
                            ownerId: selected.id,
                            lane: event.target.value,
                          })
                        }
                      >
                        {lanes.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </label>
                    <span className="cc-overline">Work state</span>
                    <div className="cc-actions">
                      {(selected.owner === "linear"
                        ? ["Todo", "In Progress", "In Review", "Done"]
                        : ["Queued", "Today", "In Motion", "Waiting", "Done"]
                      ).map((state) => (
                        <button
                          key={state}
                          disabled={busy || selected.status === state}
                          onClick={() =>
                            command(
                              selected.owner === "linear"
                                ? {
                                    action: "linearStatus",
                                    issueId: selected.id,
                                    state,
                                  }
                                : {
                                    action: "notionStatus",
                                    pageId: selected.id,
                                    state,
                                  },
                            )
                          }
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="cc-empty">Select work to see its actions.</p>
                )}
              </div>
            </div>
          </>
        )}
        {snapshot && surface === "planner" && (
          <>
            <div className="cc-toolbar">
              <button onClick={() => setDayOffset((old) => old - dayCount)}>
                ←
              </button>
              <button onClick={() => setDayOffset(0)}>Today</button>
              <button onClick={() => setDayOffset((old) => old + dayCount)}>
                →
              </button>
              <span className="cc-spacer" />
              {([1, 3, 5] as const).map((count) => (
                <button
                  key={count}
                  className={dayCount === count ? "cc-toggle on" : "cc-toggle"}
                  onClick={() => setDayCount(count)}
                >
                  {count} day
                </button>
              ))}
            </div>
            <div
              className="cc-calendar"
              ref={calendarRef}
              style={{ "--day-count": dayCount } as React.CSSProperties}
            >
              <div className="cc-calendar-head">
                <div className="cc-time-corner" />
                {days.map((date) => (
                  <div className="cc-day-head" key={dateKey(date)}>
                    <strong>
                      {date.toLocaleDateString(undefined, { weekday: "short" })}
                    </strong>
                    <span>
                      {date.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="cc-untimed-row">
                <div className="cc-untimed-label">Untimed</div>
                {days.map((date) => {
                  const key = dateKey(date);
                  const untimed = blocks.filter(
                    (block) => block.selected_date === key && !block.starts_at,
                  );
                  return (
                    <div className="cc-untimed" key={key}>
                      {untimed.map((block) => (
                        <button
                          className="cc-untimed-item"
                          key={block.id}
                          style={
                            {
                              "--lane": laneColors[laneForBlock(block)],
                            } as React.CSSProperties
                          }
                          onClick={() => {
                            const item = workForBlock(block);
                            if (item) openBlock(item, block);
                          }}
                        >
                          {titleForBlock(block)}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
              <div className="cc-calendar-body">
                <div className="cc-times">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <span key={hour} style={{ top: `${hour * 56}px` }}>
                      {hour === 0
                        ? "12am"
                        : hour < 12
                          ? `${hour}am`
                          : hour === 12
                            ? "12pm"
                            : `${hour - 12}pm`}
                    </span>
                  ))}
                </div>
                {days.map((date) => {
                  const key = dateKey(date);
                  const placements = placeOverlaps(
                    blocks.filter(
                      (block) => block.selected_date === key && block.starts_at,
                    ),
                  );
                  return (
                    <div className="cc-day-column" key={key}>
                      {Array.from({ length: 24 }, (_, hour) => (
                        <i
                          className="cc-hour-line"
                          style={{ top: `${hour * 56}px` }}
                          key={hour}
                        />
                      ))}
                      {placements.map((placement) => {
                        const item = workForBlock(placement.block);
                        const top = (placement.startMinute / 60) * 56;
                        const height = Math.max(
                          28,
                          Math.min(
                            ((placement.endMinute - placement.startMinute) /
                              60) *
                              56,
                            1344 - top,
                          ),
                        );
                        const left =
                          (placement.lane / placement.laneCount) * 100;
                        const width = 100 / placement.laneCount;
                        const lane = laneForBlock(placement.block);
                        return (
                          <button
                            className="cc-timed-block"
                            key={placement.block.id}
                            style={
                              {
                                "--lane": laneColors[lane],
                                top: `${top}px`,
                                height: `${height}px`,
                                left: `calc(${left}% + 4px)`,
                                width: `calc(${width}% - 8px)`,
                              } as React.CSSProperties
                            }
                            onClick={() => {
                              if (item) openBlock(item, placement.block);
                            }}
                            title={`${titleForBlock(placement.block)} · edit block`}
                          >
                            <strong>
                              {placement.stack
                                ? `${placement.stack.length} overlapping blocks`
                                : titleForBlock(placement.block)}
                            </strong>
                            <span>
                              {placement.stack
                                ? placement.stack.map(titleForBlock).join(" · ")
                                : `${new Date(placement.block.starts_at!).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}–${new Date(placement.block.ends_at!).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
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
              <button
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
              </button>
            ))}
          </div>
        )}
        {snapshot && surface === "clients" && (
          <>
            <div className="cc-toolbar">
              <span>{contacts.length} records</span>
              <span className="cc-spacer" />
              <button className="cc-primary" onClick={() => editContact()}>
                <Plus size={16} /> New lead
              </button>
            </div>
            <div className="cc-split cc-clients">
              <div className="cc-list">
                {contacts.length === 0 && (
                  <p className="cc-empty">
                    No clients yet. Add the first real lead.
                  </p>
                )}
                {contacts.map((item) => (
                  <button
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
                  </button>
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
                      <button
                        className="cc-secondary"
                        onClick={() => editContact(client)}
                      >
                        Edit
                      </button>
                    </div>
                    <div className="cc-actions">
                      <button
                        onClick={() => setDraftMenu((old) => !old)}
                        disabled={!client.email}
                      >
                        <EnvelopeSimple size={16} /> Outreach
                      </button>
                      <button onClick={() => setDraftEditor(true)}>
                        <Plus size={16} /> Save draft
                      </button>
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
                      <button disabled={busy}>Log</button>
                    </form>
                  </>
                ) : (
                  <p className="cc-empty">Select a lead or client.</p>
                )}
              </div>
            </div>
          </>
        )}
      </section>
      {taskEditor && (
        <div
          className="cc-modal-backdrop"
          onMouseDown={() => setTaskEditor(false)}
        >
          <section
            className="cc-modal cc-small-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cc-task-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="cc-modal-head">
              <h2 id="cc-task-title">New task</h2>
              <button onClick={() => setTaskEditor(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveTask}>
              <label>
                Task name
                <input
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  autoFocus
                  required
                />
              </label>
              <label>
                Due date
                <input
                  type="date"
                  value={taskDue}
                  onChange={(event) => setTaskDue(event.target.value)}
                />
              </label>
              <fieldset className="cc-lane-field">
                <legend>Lane</legend>
                <div className="cc-lane-values">
                  {lanes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={taskLane === item ? "selected" : ""}
                      style={
                        { "--lane": laneColors[item] } as React.CSSProperties
                      }
                      onClick={() => setTaskLane(item)}
                    >
                      <i />
                      {item}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="cc-modal-actions">
                <button type="button" onClick={() => setTaskEditor(false)}>
                  Cancel
                </button>
                <button className="cc-primary" disabled={busy}>
                  <Check size={16} /> Add task
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {contactEditor !== null && (
        <div
          className="cc-modal-backdrop"
          onMouseDown={() => setContactEditor(null)}
        >
          <section
            className="cc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cc-contact-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="cc-modal-head">
              <h2 id="cc-contact-title">
                {contactEditor === "new" ? "New lead" : "Edit contact"}
              </h2>
              <button onClick={() => setContactEditor(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveContact}>
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
                      <button
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
                      </button>
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
              <div className="cc-modal-actions">
                <button type="button" onClick={() => setContactEditor(null)}>
                  Cancel
                </button>
                <button className="cc-primary" disabled={busy}>
                  <Check size={16} /> Save
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {blockWork && (
        <div
          className="cc-modal-backdrop"
          onMouseDown={() => setBlockWork(null)}
        >
          <section
            className="cc-modal cc-small-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cc-block-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="cc-modal-head">
              <h2 id="cc-block-title">Block time</h2>
              <button onClick={() => setBlockWork(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <p>{blockWork.title}</p>
            <form onSubmit={placeBlock}>
              <label>
                Date
                <input
                  type="date"
                  value={blockDate}
                  onChange={(event) => setBlockDate(event.target.value)}
                  required
                />
              </label>
              <div className="cc-form-grid">
                <label>
                  Start
                  <input
                    type="time"
                    value={blockStart}
                    onChange={(event) => setBlockStart(event.target.value)}
                    required
                  />
                </label>
                <label>
                  End
                  <input
                    type="time"
                    value={blockEnd}
                    onChange={(event) => setBlockEnd(event.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="cc-modal-actions">
                <button type="button" onClick={() => setBlockWork(null)}>
                  Cancel
                </button>
                {editingBlockId && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      const result = await command({
                        action: "blockDelete",
                        id: editingBlockId,
                      });
                      if (result) {
                        setBlockWork(null);
                        setEditingBlockId(null);
                      }
                    }}
                  >
                    Remove
                  </button>
                )}
                <button className="cc-primary" disabled={busy}>
                  {editingBlockId ? "Save block" : "Place block"}
                </button>
              </div>
            </form>
          </section>
        </div>
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
              <button onClick={() => setDraftEditor(false)} aria-label="Close">
                <X size={18} />
              </button>
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
                <button type="button" onClick={() => setDraftEditor(false)}>
                  Cancel
                </button>
                <button className="cc-primary" disabled={busy}>
                  Save draft
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
