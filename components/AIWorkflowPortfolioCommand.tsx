"use client";

import { useMemo, useState } from "react";

type TabId = "system" | "evidence" | "fit" | "resume" | "sources";
type WorkflowMode = "video" | "sales";

type WorkflowItem = {
  icon: string;
  name: string;
  meta: string;
  status: string;
  source: string;
  line: string;
  workflow: string;
  school: string;
  action: string;
  proof: string;
  asset: string;
  output: string;
  actions: string[];
  actionView: {
    title: string;
    eyebrow: string;
    primary: string;
    fields: [string, string][];
    note: string;
  };
};

const tabs: { id: TabId; label: string }[] = [
  { id: "system", label: "System" },
  { id: "evidence", label: "Evidence" },
  { id: "fit", label: "AI Specialist Match" },
  { id: "resume", label: "Resume" },
  { id: "sources", label: "Proof Map" },
];

const workflowData: Record<WorkflowMode, WorkflowItem[]> = {
  video: [
    {
      icon: "V",
      name: "Miles Hart",
      meta: "2026 / Football / WR | CB",
      status: "In Queue",
      source: "HUDL",
      line: "Football | 2026 | WR | CB | Northview HS | Atlanta, GA | Aug 19, 2025 | In Queue | HUDL",
      workflow: "Video Progress",
      school: "Northview HS, GA",
      action: "View details, then confirm the title and progress status before editing.",
      proof: "src/video-progress.tsx",
      asset: "Miles Hart Class of 2026 Senior Season",
      output: "Copy YouTube Title / Copy Approved Video Title / Copy Dropbox Folder",
      actions: ["Video Updates", "Update Status", "Update Stage", "Copy YouTube Title"],
      actionView: {
        title: "Video Updates",
        eyebrow: "Step 3 - ready update",
        primary: "Submit video update",
        fields: [
          ["Student Athlete", "Miles Hart"],
          ["YouTube Link", "https://youtu.be/video-ready"],
          ["Video Type", "Full Season Highlight"],
          ["Season/Team", "2025 Varsity Football"],
          ["Approved Video Title", "MILES HART Class of 2026 - WR | CB"],
        ],
        note: "The command turns the reviewed athlete row into the video update the production team needs.",
      },
    },
    {
      icon: "Y",
      name: "Jordan Vale",
      meta: "2027 / Basketball / PG",
      status: "Awaiting Client",
      source: "External Links",
      line: "Basketball | 2027 | PG | Lakewood Prep | St. Petersburg, FL | Sep 11, 2025 | Awaiting Client | External Links",
      workflow: "Video Updates",
      school: "Lakewood Prep, FL",
      action: "Open Video Updates and fill YouTube link, video type, and season/team.",
      proof: "src/features/athlete-workflows/video-updates-view.tsx",
      asset: "Jordan Vale 2027 Point Guard Highlights",
      output: "Update NPID Video Profile",
      actions: ["Video Updates", "Focus YouTube Link", "Edit SA Videos", "View PlayerID"],
      actionView: {
        title: "Edit SA Videos",
        eyebrow: "Step 3 - ready update",
        primary: "Update video link",
        fields: [
          ["Student Athlete", "Jordan Vale"],
          ["YouTube Link", "https://youtu.be/revision-ready"],
          ["Video Type", "Partial Season Highlight"],
          ["Season/Team", "2026 Travel Basketball"],
          ["Source", "youtube"],
        ],
        note: "The command fills the video profile from the same athlete row, so the operator is not hunting through the dashboard.",
      },
    },
    {
      icon: "D",
      name: "Camden Brooks",
      meta: "2028 / Football / QB-D | DE",
      status: "On Hold",
      source: "Dropbox",
      line: "Football | 2028 | QB-D | DE | Cedar Ridge HS | Austin, TX | Oct 9, 2025 | On Hold | Dropbox",
      workflow: "Dropbox Folder Reminder",
      school: "Cedar Ridge HS, TX",
      action: "Copy the folder name, send the reminder, and keep the task in the right stage.",
      proof: "src/video-progress.tsx",
      asset: "CamdenBrooks_2028_Football_TX",
      output: "Dropbox Folder Reminders",
      actions: ["Dropbox Folder Reminders", "Copy Dropbox Folder", "Update Stage", "View PlayerID"],
      actionView: {
        title: "Dropbox Folder Reminder",
        eyebrow: "Step 3 - reminder ready",
        primary: "Queue reminder",
        fields: [
          ["Student Athlete", "Camden Brooks"],
          ["Dropbox Folder", "CamdenBrooks_2028_Football_TX"],
          ["Video Stage", "On Hold"],
          ["Video Status", "Dropbox"],
          ["Reminder Type", "dropbox-folder"],
        ],
        note: "The command turns the folder status into the next reminder without making the operator rebuild the context.",
      },
    },
    {
      icon: "C",
      name: "Eli Rivers",
      meta: "2026 / Baseball / RHP | SS",
      status: "Done",
      source: "HUDL",
      line: "Baseball | 2026 | RHP | SS | Eastline HS | Raleigh, NC | Nov 19, 2025 | Done | HUDL",
      workflow: "Completion Review",
      school: "Eastline HS, NC",
      action: "Set completion date after title, status, and PlayerID review are clean.",
      proof: "src/video-progress.tsx",
      asset: "ELI RIVERS Class of 2026 - RHP | SS",
      output: "Set Completion Date",
      actions: ["Set Completion Date", "View PlayerID", "Copy Approved Video Title", "Reload Tasks"],
      actionView: {
        title: "Set Completion Date",
        eyebrow: "Step 3 - close out",
        primary: "Save completion date",
        fields: [
          ["Student Athlete", "Eli Rivers"],
          ["Video Stage", "Done"],
          ["Video Status", "HUDL"],
          ["Completion Date", "Nov 19, 2025"],
          ["Approved Video Title", "ELI RIVERS Class of 2026 - RHP | SS"],
        ],
        note: "The command closes the loop only after the title, status, and delivery state are ready.",
      },
    },
  ],
  sales: [
    {
      icon: "M",
      name: "Malik Stone",
      meta: "2026 / Football / OLB | WR",
      status: "Set Meetings",
      source: "Confirmation 1",
      line: "Football | 2026 | OLB | WR | Westfield HS | Columbus, OH | Set Meetings | Head Scout Patrick",
      workflow: "Set Meetings",
      school: "Westfield HS, OH",
      action: "Send Confirmation, then copy the booked meeting for readback.",
      proof: "src/head-scout-schedules.tsx",
      asset: "Parent confirmation text for Head Scout Patrick",
      output: "Send Confirmation / Copy Booked Meeting",
      actions: ["Send Confirmation", "Meeting Details", "Copy Booked Meeting", "Open Athlete Task Tab"],
      actionView: {
        title: "Send Confirmation",
        eyebrow: "Step 3 - message ready",
        primary: "Copy message",
        fields: [
          ["Student Athlete", "Malik Stone"],
          ["Recipient", "Parent A"],
          ["Head Scout", "Head Scout Patrick"],
          ["Meeting", "Thu 6:00 PM ET"],
          ["Message", "Confirming the call with Head Scout Patrick for Malik."],
        ],
        note: "The command turns the booked meeting into a clean confirmation message and keeps the meeting details beside it.",
      },
    },
    {
      icon: "I",
      name: "Isaiah Quinn",
      meta: "2027 / Football / S | OLB",
      status: "Scout Prep",
      source: "Parent Intro",
      line: "Football | 2027 | S | OLB | Ridgeview HS | Denver, CO | Scout Prep | Parent Intro",
      workflow: "Scout Prep Call Path",
      school: "Ridgeview HS, CO",
      action: "Review contact context and keep the call script ready before outreach.",
      proof: "src/features/scout-prep/content.ts",
      asset: "Hey Parent A, this is Scouting Coordinator at Prospect ID.",
      output: "Parent script with athlete context and next-step prompt",
      actions: ["Review athlete data", "Open contact context", "Copy Parent 1 Phone", "Update task stage"],
      actionView: {
        title: "Parent Intro",
        eyebrow: "Step 3 - call ready",
        primary: "Copy call opener",
        fields: [
          ["Student Athlete", "Isaiah Quinn"],
          ["Parent", "Parent A"],
          ["Stage", "Parent Intro"],
          ["Opener", "Hey Parent A, this is Scouting Coordinator at Prospect ID."],
          ["Next Step", "Confirm interest and route the task stage."],
        ],
        note: "The command pulls the athlete, parent, and next step into one call surface so the operator is not clicking around.",
      },
    },
    {
      icon: "S",
      name: "Noah Bennett",
      meta: "2028 / Basketball / SG",
      status: "Scout Openings",
      source: "Open Slots",
      line: "Basketball | 2028 | SG | Southgate Prep | Phoenix, AZ | Scout Openings | 4 open",
      workflow: "Scout Openings",
      school: "Southgate Prep, AZ",
      action: "View open slots, select two times, and sync them into the call script.",
      proof: "src/head-scout-schedules.tsx",
      asset: "Head Scout Taylor / Thu 6:00 PM / Sat 11:30 AM",
      output: "Sync to Notion / Copy Slot",
      actions: ["View Open Slots", "Select Slot", "Sync to Notion", "Next Week"],
      actionView: {
        title: "View Open Slots",
        eyebrow: "Step 3 - slots ready",
        primary: "Sync selected slots",
        fields: [
          ["Head Scout", "Head Scout Taylor"],
          ["Slot 1", "Thu 6:00 PM MT"],
          ["Slot 2", "Sat 11:30 AM MT"],
          ["Athlete timezone", "Mountain"],
          ["Sync Target", "Call script toggle"],
        ],
        note: "The command turns open scout availability into two clear options the operator can offer on the call.",
      },
    },
    {
      icon: "P",
      name: "Theo Parker",
      meta: "2026 / Baseball / C | 3B",
      status: "Pending Clients",
      source: "Review queue",
      line: "Baseball | 2026 | C | 3B | Harbor Christian | Charleston, SC | Pending Clients | Review queue",
      workflow: "Pending Clients",
      school: "Harbor Christian, SC",
      action: "Review pending client evidence, then route to confirmation or post-call update.",
      proof: "src/head-scout-schedules.tsx",
      asset: "Needs confirmation text and meeting readback",
      output: "Pending Clients / Post-Call Update",
      actions: ["Pending Clients", "Reschedule Pending", "Meeting Set - Rescheduled", "Refresh Live"],
      actionView: {
        title: "Post-Call Update",
        eyebrow: "Step 3 - route ready",
        primary: "Open update form",
        fields: [
          ["Student Athlete", "Theo Parker"],
          ["Queue", "Pending Clients"],
          ["Review", "Meeting evidence and current task"],
          ["Route", "Reschedule Pending or Meeting Set - Rescheduled"],
          ["Readback", "Refresh Live after save"],
        ],
        note: "The command keeps the evidence in front of the operator before they choose the final client follow-up path.",
      },
    },
  ],
};

const evidenceData = [
  {
    key: "commands",
    title: "Commands are buttons",
    summary: "Repeated dashboard actions start from Raycast, while domain modules keep the workflow meaning.",
    problem: "Operators had to remember where the right athlete, task, message, and status lived inside the dashboard.",
    solution: "Raycast became the command surface. It starts the workflow, then domain modules decide what the action means.",
    result: "Repeated clicks became a smaller set of reviewable actions: Scout Prep, Set Meetings, Client Messages, and video workflow commands.",
  },
  {
    key: "adapter",
    title: "Legacy adapter",
    summary: "Browser form behavior becomes stable local API calls with repeatable request shapes.",
    problem: "The source system worked through browser forms and session-bound dashboard behavior.",
    solution: "FastAPI translated that behavior into stable local calls with normalized IDs, payload handling, and readback checks.",
    result: "The workflow could be tested and repeated without rebuilding the same form mutation by hand.",
  },
  {
    key: "supabase",
    title: "Supabase ownership",
    summary: "appointments, lifecycle_events, and call_log carry the durable workflow facts.",
    problem: "Useful facts were mixed with UI state, support caches, and one-off reporting projections.",
    solution: "appointments, lifecycle_events, and call_log became the durable places for meeting, stage, and reporting truth.",
    result: "Prospect Web and audits could read the same reporting facts instead of trusting whatever a screen happened to show.",
  },
  {
    key: "audit",
    title: "Audit before cleanup",
    summary: "Parity checks prove the reporting shape before cleanup changes what counts as truth.",
    problem: "Cleanup could break reporting if old projections were deleted before the new shape was proven.",
    solution: "Parity tests checked the projected call_log shape and read-only behavior before cleanup became real.",
    result: "The repo shows cleanup as a verified migration path, not a blind delete.",
  },
  {
    key: "repo",
    title: "Public repo",
    summary: "400+ commits show one sustained workflow system, not a throwaway sample.",
    problem: "A resume line alone cannot prove sustained system thinking.",
    solution: "The public repo shows one workflow system built through 400+ commits, docs, tests, and app surfaces.",
    result: "Reviewers can inspect the work instead of taking the claim on faith.",
  },
  {
    key: "web",
    title: "Prospect Web",
    summary: "Mobile and reporting surfaces let cleaned data support review outside Raycast.",
    problem: "Raycast handled operator action, but reporting and mobile review needed a separate readable surface.",
    solution: "Prospect Web added mobile command views, call tracking, visual maps, and reporting screens on top of cleaned data.",
    result: "The workflow became reviewable outside the desktop command window.",
  },
  {
    key: "debug",
    title: "Debug template",
    summary: "Legacy repair work is documented as a repeatable verification checklist.",
    problem: "Legacy dashboard repairs can turn into one-off troubleshooting with no repeatable path.",
    solution: "The debug template captured request shape, IDs, browser constraints, and verification steps.",
    result: "Repair work became easier to repeat, review, and sanitize for public proof.",
  },
  {
    key: "tests",
    title: "Tests",
    summary: "Source-of-truth checks prevent UI-local fixes from becoming business truth.",
    problem: "UI-local fixes can look correct while corrupting the source-of-truth contract.",
    solution: "Source-of-truth and parity checks lock the expected behavior around lifecycle, call-log, and cleanup paths.",
    result: "Changes have proof before they become business truth.",
  },
];

const processData = [
  {
    title: "Gather",
    problem: "The workflow starts as scattered dashboard steps, notes, and operator memory.",
    solution: "Collect the current command path, repo evidence, and source-system behavior before changing anything.",
    result: "The AI work starts from the real workflow, not from a generic automation idea.",
  },
  {
    title: "Classify",
    problem: "Everything looks connected until ownership is named.",
    solution: "Separate command UI, lifecycle truth, support cache, adapter behavior, and reporting facts.",
    result: "Each change has a clear owner and less chance of drifting into the wrong table or helper.",
  },
  {
    title: "Draft",
    problem: "AI output can be fast but vague if it is not tied to the system shape.",
    solution: "Use AI to draft prompts, mappings, message support, and implementation options against the classified workflow.",
    result: "Drafts become useful working material instead of loose copy.",
  },
  {
    title: "Review",
    problem: "A generated answer can sound right while missing operator context.",
    solution: "Keep human review before mutation, sending, source-of-truth writes, or public-facing proof.",
    result: "The workflow stays responsible and business-relevant.",
  },
  {
    title: "Verify",
    problem: "A screen working once is not the same as a system being correct.",
    solution: "Use parity checks, readback, UI tests, or source review before treating the change as real.",
    result: "The final claim has evidence behind it.",
  },
];

const resumeData = [
  ["Lead proof", "Prospect ID", "Built a workflow system connecting Raycast commands, FastAPI middleware, Supabase reporting tables, web views, audit scripts, and AI-assisted operator workflows."],
  ["Throughput proof", "NurseHub", "Restructured 60+ hours of course content, processed 180-200 lesson assets, and used deterministic FFmpeg workflows to increase assembly throughput 2-3x."],
  ["Education", "Stetson + SPC", "Bachelor of Communications, Stetson University; 1.5 years Computer Programming / Information Technology coursework, St. Petersburg College."],
  ["Role match", "AI Specialist", "Hands-on AI workflow specialist focused on legacy systems, data organization, automation support, documentation, and practical implementation."],
] as const;

const proofRouteData = [
  {
    key: "readme",
    title: "Command UI",
    source: "README",
    inspect: "Raycast commands, workflow entry points, and how operator actions start.",
    result: "Shows that commands were built as a practical control surface, not just described in prose.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/README.md",
  },
  {
    key: "map",
    title: "System map",
    source: "Architecture",
    inspect: "Buckets for meetings, pre-meeting tasks, client communication, lifecycle truth, outcomes, and contacts.",
    result: "Shows where workflow meaning lives before code or cleanup changes are made.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/docs/architecture/scouting-coordinator-system-map.md",
  },
  {
    key: "supabase",
    title: "Source-of-truth",
    source: "Supabase contract",
    inspect: "Allowed writers for appointments, lifecycle_events, call_log, and confirmation support cache.",
    result: "Shows how durable reporting truth was separated from support state.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/docs/architecture/scout-prep-supabase-source-of-truth.md",
  },
  {
    key: "adapter",
    title: "Legacy adapter",
    source: "API template",
    inspect: "Browser-compatible payload shape, legacy IDs, request constraints, and readback.",
    result: "Shows the old dashboard workflow becoming repeatable adapter work.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/docs/api-specs/legacy-assignment-debug-template.md",
  },
  {
    key: "audit",
    title: "Audit proof",
    source: "Parity test",
    inspect: "Read-only assertions that prove call_log/reporting shape before cleanup.",
    result: "Shows cleanup protected by verification instead of broad deletion.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/scripts/audit-call-tracker-live-parity.test.mjs",
  },
  {
    key: "web",
    title: "Web support",
    source: "Prospect Web",
    inspect: "Mobile command surface, call tracker, reporting views, and visual maps.",
    result: "Shows the workflow becoming readable outside Raycast.",
    href: "https://github.com/23Maestro/prospect-pipeline/tree/main/apps/prospect-web",
  },
];

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function Card({
  kicker,
  pill,
  title,
  body,
  accent,
  icon,
  facts,
}: {
  kicker: string;
  pill: string;
  title: string;
  body: string;
  accent: string;
  icon: string;
  facts: string[];
}) {
  const panelBackground = `linear-gradient(135deg, ${accent}18 0%, #ffffff 42%, #f8fafc 100%)`;

  return (
    <section
      className="group relative min-h-[246px] overflow-hidden rounded-[24px] border border-[#dde3ec] p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-[#c8d3e2] hover:shadow-[0_24px_64px_rgba(15,23,42,0.12)]"
      style={{ background: panelBackground }}
    >
      <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full opacity-10 blur-2xl" style={{ backgroundColor: accent }} />
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="m-0 text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: accent }}>
          {kicker}
        </p>
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/80 bg-white/85 text-sm font-black text-[#172033] shadow-[0_12px_28px_rgba(15,23,42,0.10)] transition group-hover:translate-x-0.5">
          →
        </span>
      </div>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-black/10 text-base font-black text-white shadow-[0_12px_26px_rgba(15,23,42,0.14)]" style={{ backgroundColor: accent }}>
          {icon}
        </span>
        <span className="rounded-full border border-[#d8e0ea] bg-white/80 px-3 py-1.5 text-xs font-black text-[#1f2937]">{pill}</span>
      </div>
      <h3 className="m-0 max-w-[82%] text-[23px] font-black leading-tight text-[#111318] md:text-[27px]">{title}</h3>
      <p className="mt-2 text-[15px] font-semibold leading-6 text-[#5f6b7f]">{body}</p>
      <ul className="mt-5 grid gap-2 border-t border-[#dfe6ef] pt-4">
        {facts.map((fact) => (
          <li key={fact} className="rounded-[12px] border border-[#dfe7f1] bg-white/78 px-3 py-2 text-[13px] font-extrabold text-[#2f3746] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            {fact}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="-mx-[14px] my-[22px] flex items-center justify-between gap-3 bg-[#101826] px-[14px] py-3.5 text-sm font-black text-[#eef3fb] md:-mx-[26px] md:px-[26px]">
      <strong>Prospect ID Workflow System</strong>
      <span className="font-bold text-[#b9c4d5]">{label}</span>
    </div>
  );
}

function SectionHead({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="mb-3.5 grid max-w-[920px] gap-1">
      <h2 className="m-0 text-[24px] font-black leading-tight text-[#111318] md:text-[30px]">{title}</h2>
      <p className="m-0 text-sm leading-6 text-[#667085]">{lead}</p>
    </div>
  );
}

function SystemPanel({ copied, onCopy }: { copied: boolean; onCopy: (item: WorkflowItem) => void }) {
  const [mode, setMode] = useState<WorkflowMode>("video");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionOpen, setActionOpen] = useState(false);
  const rows = workflowData[mode];
  const selected = rows[selectedIndex] ?? rows[0];

  function changeMode(nextMode: WorkflowMode) {
    setMode(nextMode);
    setSelectedIndex(0);
    setActionOpen(false);
  }

  return (
    <article>
      <div className="mx-auto max-w-[1260px]">
        <SectionHead
          title="System view"
          lead="The work moved repeated operator steps out of scattered dashboard clicking and into command surfaces, source adapters, and durable reporting tables."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <Card
            kicker="Command surface"
            pill="Action"
            title="Raycast command UI"
            body="Front-end command surface for repeated operator workflows."
            accent="#2383e2"
            icon="◆"
            facts={["Scout Prep", "Set Meetings", "Client Messages", "Video workflow commands"]}
          />
          <Card
            kicker="Workflow support"
            pill="Adapter"
            title="FastAPI legacy adapter"
            body="Local API layer that translated dashboard forms into repeatable request shapes."
            accent="#b86013"
            icon="↔"
            facts={["Shared local session path", "Form payload handling", "Legacy ID normalization", "Live source-system readback"]}
          />
          <Card
            kicker="Reporting layer"
            pill="Proof"
            title="Supabase truth layer"
            body="Durable workflow facts separated from UI state and support caches."
            accent="#25c266"
            icon="✓"
            facts={["appointments", "lifecycle_events", "call_log", "confirmation support cache"]}
          />
        </div>
      </div>

      <Divider label="Interactive workflow surface" />

      <section className="mx-auto w-full max-w-[1080px] overflow-hidden rounded-[22px] border border-[#d7dee9] bg-[#f8fafc] shadow-[0_24px_70px_rgba(23,33,52,0.18)]" aria-label="Raycast-inspired workflow surface">
        <div className="grid min-h-16 grid-cols-1 items-center gap-3 border-b border-[#e1e5eb] bg-[linear-gradient(180deg,#ffffff,#f8fafc)] px-4 py-3 md:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-[#d8e0eb] bg-white px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_22px_rgba(15,23,42,0.05)]">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#172033] text-xs font-black text-white">⌘</span>
              <p className="m-0 min-w-0 flex-1 truncate text-[18px] font-black text-[#697587] md:text-[22px]">{mode === "video" ? "Video queue..." : "Sales queue..."}</p>
              <span className="hidden text-xs font-black text-[#9aa5b5] md:inline">Ask AI</span>
            </div>
            <p className="m-0 mt-1 truncate pl-1 text-xs font-bold text-[#8a95a6]">{selected.line}</p>
          </div>
          <div className="inline-flex gap-2" aria-label="Workflow mode">
            {(["video", "sales"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={mode === item}
                onClick={() => changeMode(item)}
                className={cx(
                  "min-h-10 min-w-[76px] rounded-xl border px-3 text-sm font-black transition shadow-[0_8px_18px_rgba(15,23,42,0.08)]",
                  mode === item
                    ? item === "video"
                      ? "border-[#b62631] bg-[#b62631] text-white"
                      : "border-[#1557b0] bg-[#1557b0] text-white"
                    : "border-[#d8e0eb] bg-white text-[#526073] hover:bg-[#f1f6ff]",
                )}
              >
                {item === "video" ? "Video" : "Sales"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid min-h-[430px] gap-3 p-3.5 lg:grid-cols-[minmax(260px,0.82fr)_minmax(0,1.5fr)]">
          <div className="grid content-start gap-2">
            {rows.map((item, index) => {
              const active = selectedIndex === index;
              return (
                <button
                  key={item.name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelectedIndex(index);
                    setActionOpen(false);
                  }}
                  className={cx(
                    "grid min-h-[64px] w-full grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border px-3 py-2 text-left shadow-[0_1px_0_rgba(17,24,39,0.04)] transition max-sm:grid-cols-[30px_minmax(0,1fr)]",
                    active ? "border-[#b9cdf0] bg-[#eef4ff] shadow-[0_10px_26px_rgba(35,131,226,0.12)]" : "border-transparent bg-white hover:border-[#c6d4eb] hover:bg-[#f4f8ff]",
                  )}
                >
                  <span className={cx("grid h-8 w-8 place-items-center rounded-xl text-xs font-black text-white shadow-[0_8px_16px_rgba(15,23,42,0.14)]", active ? "bg-[#ff6363]" : "bg-[#172033]")}>{item.icon}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-base font-black text-[#1f2937]">{item.name}</span>
                    <span className="mt-0.5 block truncate text-[13px] font-bold text-[#667284]">{item.meta}</span>
                  </span>
                  <span className="text-right text-[13px] font-extrabold text-[#526073] max-sm:col-start-2 max-sm:text-left">{item.status} / {item.source}</span>
                </button>
              );
            })}
          </div>

          <div className="relative grid min-h-[402px] grid-rows-[1fr_auto] rounded-[22px] border border-[#d8e2ef] bg-white p-3 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
            <div>
              <div className="grid gap-2 rounded-[20px] border border-[#d8e2ef] bg-[radial-gradient(circle_at_100%_0%,rgba(255,99,99,0.15),transparent_32%),linear-gradient(135deg,rgba(21,87,176,0.11),rgba(198,43,55,0.06)),#f8fbff] p-4">
                <div className="flex flex-wrap gap-2">
                  {[selected.status, selected.source, mode === "video" ? "Video workflow" : "Sales workflow"].map((item) => (
                    <span key={item} className="rounded-[11px] border border-[#cfd8e7] bg-white px-3 py-2 text-xs font-extrabold text-[#27364d]">{item}</span>
                  ))}
                </div>
                <h3 className="m-0 text-[28px] font-black leading-tight text-[#111318] md:text-[38px]">{selected.name}</h3>
                <p className="m-0 text-base font-extrabold leading-6 text-[#344154]">{selected.line}</p>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {[
                  ["Workflow", selected.workflow, "border-[#b9cdf0] bg-gradient-to-b from-[#eef5ff] to-white"],
                  ["School / market", selected.school, "bg-white"],
                  ["Next action", selected.action, "border-[#e7d6c3] bg-gradient-to-b from-[#fff7ed] to-white"],
                  ["Proof anchor", selected.proof, "border-[#e7d6c3] bg-gradient-to-b from-[#fff7ed] to-white"],
                  ["Ready output", selected.output, "bg-white"],
                  ["Copy-ready field", selected.asset, "bg-white md:col-span-2"],
                ].map(([label, value, classes]) => (
                  <div key={label} className={cx("min-h-16 rounded-[13px] border border-[#d9e3f0] p-3 shadow-[0_10px_20px_rgba(15,23,42,0.04)]", classes)}>
                    <span className="block text-[11px] font-black uppercase text-[#697587]">{label}</span>
                    <strong className="mt-1 block text-sm font-black text-[#172033]">{value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 grid gap-2 rounded-2xl border border-[#d7e1ee] bg-gradient-to-b from-[#f8fafc] to-white p-3 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-[13px] font-black text-[#172033]">Action panel</strong>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-black text-[#5d687a]">
                  <span className="rounded-md border border-[#cfd8e7] bg-white px-2 py-1">Up/Down Select</span>
                  <span className="rounded-md border border-[#cfd8e7] bg-white px-2 py-1">Enter Preview</span>
                  <span className="rounded-md border border-[#cfd8e7] bg-white px-2 py-1">Cmd C Copy</span>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {selected.actions.map((action, index) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => setActionOpen(true)}
                    className={cx(
                      "min-h-9 rounded-[11px] border px-3 py-2 text-left text-xs font-extrabold transition",
                      index === 0 ? "border-[#b7c9ea] bg-[#eaf2ff] text-[#174a91]" : "border-[#cfd8e7] bg-white text-[#27364d] hover:bg-[#f1f6ff]",
                    )}
                  >
                    {index === 0 ? "Enter " : ""}{action}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => onCopy(selected)} className="justify-self-start rounded-[11px] border border-[#c9d7eb] bg-[#172033] px-3 py-2 text-xs font-black text-white">
                {copied ? "Copied proof packet" : "Copy workflow proof"}
              </button>
            </div>

            {actionOpen ? (
              <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-[#cbd8ea] bg-white/95 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.18)] backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="m-0 text-xl font-black text-[#111318]">{selected.actionView.title}</h4>
                    <p className="mt-1 text-sm font-bold leading-5 text-[#667085]">{selected.actionView.note}</p>
                  </div>
                  <button type="button" onClick={() => setActionOpen(false)} className="rounded-lg border border-[#cfd8e7] bg-white px-2 py-1 text-xs font-black text-[#27364d]">Close</button>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {selected.actionView.fields.map(([label, value]) => (
                    <div key={label} className="rounded-[13px] border border-[#dce4ef] bg-gradient-to-b from-white to-[#f8fafc] p-3">
                      <span className="block text-xs font-black uppercase text-[#637086]">{label}</span>
                      <strong className="mt-1 block text-sm font-black text-[#162033]">{value}</strong>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border border-[#cbd8ea] bg-[#f8fbff] px-3 py-1.5 text-xs font-black uppercase text-[#394a63]">{selected.actionView.eyebrow}</span>
                  <button type="button" onClick={() => onCopy(selected)} className="rounded-[11px] border border-[#c9d7eb] bg-gradient-to-r from-[#1557b0] to-[#0f7757] px-3 py-2 text-xs font-black text-white shadow-[0_10px_22px_rgba(21,87,176,0.2)]">
                    {selected.actionView.primary}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </article>
  );
}

function EvidencePanel() {
  const [selectedKey, setSelectedKey] = useState(evidenceData[0].key);
  const selected = evidenceData.find((item) => item.key === selectedKey) ?? evidenceData[0];
  const columns = [evidenceData.slice(0, 4), evidenceData.slice(4)];

  return (
    <article>
      <div className="mx-auto max-w-[1260px]">
        <SectionHead
          title="Evidence from the repo"
          lead="Each proof point ties a manual workflow issue to a clearer command surface, data boundary, or verification step."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {columns.map((column, index) => (
            <div key={index} className="overflow-hidden rounded-[22px] border border-[#e4e5e7] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
              {column.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={item.key === selectedKey}
                  onClick={() => setSelectedKey(item.key)}
                  className={cx(
                    "grid w-full grid-cols-[190px_minmax(0,1fr)] gap-3 border-t border-[#e1e5eb] px-4 py-3.5 text-left text-sm first:border-t-0 max-sm:grid-cols-1",
                    item.key === selectedKey ? "bg-[#f1f6ff]" : "bg-white hover:bg-[#f8fafc]",
                  )}
                >
                  <strong className="font-black text-[#1e2736]">{item.title}</strong>
                  <span className="leading-5 text-[#667085]">{item.summary}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <section className="mt-4 grid gap-3 rounded-[18px] border border-[#d8e2ef] bg-[radial-gradient(circle_at_top_right,rgba(35,131,226,0.10),transparent_32%),#fff] p-4 shadow-[0_18px_38px_rgba(15,23,42,0.07)]" aria-live="polite">
          <h3 className="m-0 text-xl font-black text-[#111318]">{selected.title}</h3>
          <div className="grid gap-2.5 md:grid-cols-3">
            {[
              ["Problem", selected.problem],
              ["Centralized solution", selected.solution],
              ["Result", selected.result],
            ].map(([label, body]) => (
              <div key={label} className="min-h-[108px] rounded-[13px] border border-[#dce4ef] bg-[#f8fafc] p-3">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.08em] text-[#667284]">{label}</span>
                <p className="m-0 text-sm font-bold leading-5 text-[#1f2937]">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Divider label="Reporting truth layer" />

      <section className="mx-auto w-full max-w-[1080px] overflow-hidden rounded-[14px] border border-[#e1e5eb] bg-white shadow-[0_18px_48px_rgba(23,33,52,0.16)]">
        <div className="flex items-baseline justify-between gap-3 border-b border-[#e1e5eb] bg-[#fbfdff] px-4 py-3">
          <strong className="text-[17px] font-black text-[#111318]">Supabase reporting shape</strong>
          <span className="text-[13px] font-bold text-[#667085]">Durable facts stay separate from command state and support caches.</span>
        </div>
        <div className="p-3.5">
          <div className="overflow-hidden rounded-[9px] border border-[#e1e5eb]">
            {[
              ["Table", "Owner", "Write path", "What it proves"],
              ["appointments", "Meeting workflow", "Set Meetings", "Booked meeting lookup and confirmation readback"],
              ["athlete_lifecycle_events", "Stage truth", "Post-call updates", "Lifecycle changes are not hidden in UI state"],
              ["call_log", "Reporting", "Audit checks", "Projected shape checked before cleanup"],
              ["confirmation_cache", "Support cache", "Message support", "Useful for drafting, not durable lifecycle truth"],
            ].map((row, index) => (
              <div key={row[0]} className={cx("grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-3 border-t border-[#e1e5eb] px-3 py-2.5 text-[13px] first:border-t-0 max-md:grid-cols-1", index === 0 ? "bg-[#eef4fc] font-black text-[#20304a]" : "text-[#303746]")}>
                {row.map((cell, cellIndex) => (
                  <span key={cell} className={cellIndex === 0 && index > 0 ? "font-black text-[#172033]" : ""}>{cell}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}

function FitPanel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = processData[selectedIndex];

  return (
    <article>
      <div className="mx-auto max-w-[1260px]">
        <SectionHead
          title="AI Specialist match"
          lead="Mapped to the job duties: gather messy workflow requirements, classify ownership, draft AI-supported paths, review outputs, and verify before adoption."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <Card
            kicker="Data preparation"
            pill="Gather"
            title="Data preparation"
            body="Turned scattered workflow facts into source-of-truth contracts that people and AI tools could both follow."
            accent="#2383e2"
            icon="⌘"
            facts={["Validation gates", "Migration checks", "Reporting cleanup"]}
          />
          <Card
            kicker="Output review"
            pill="Evaluate"
            title="Output evaluation"
            body="Used AI-assisted drafts, then checked outputs against repo evidence, operator needs, and source readback."
            accent="#25c266"
            icon="◷"
            facts={["Draft helpers", "Human review", "Source readback"]}
          />
          <Card
            kicker="Implementation"
            pill="Support"
            title="Implementation support"
            body="Built around the operator workflow so pilots could be tested, explained, and improved without guessing."
            accent="#b86013"
            icon="▦"
            facts={["Workflow mapping", "Command UI testing", "Architecture docs"]}
          />
        </div>
      </div>

      <Divider label="AI support loop" />

      <section className="mx-auto w-full max-w-[1080px] overflow-hidden rounded-[14px] border border-[#e1e5eb] bg-white shadow-[0_18px_48px_rgba(23,33,52,0.16)]">
        <div className="flex items-baseline justify-between gap-3 border-b border-[#e1e5eb] bg-[#fbfdff] px-4 py-3">
          <strong className="text-[17px] font-black text-[#111318]">Review-first implementation loop</strong>
          <span className="text-[13px] font-bold text-[#667085]">Click a step to see the operating rule.</span>
        </div>
        <div className="p-3.5">
          <div className="grid gap-2.5 lg:grid-cols-5">
            {processData.map((step, index) => (
              <button
                key={step.title}
                type="button"
                aria-pressed={selectedIndex === index}
                onClick={() => setSelectedIndex(index)}
                className={cx(
                  "min-h-[126px] rounded-[9px] border p-3 text-left transition",
                  selectedIndex === index ? "border-[#98abd2] bg-[#eef4ff]" : "border-[#e1e5eb] bg-[#f8f9fb] hover:bg-white",
                )}
              >
                <span className="mb-2 inline-grid min-h-[26px] min-w-[26px] place-items-center rounded-full bg-[#2383e2] text-xs font-black text-white">{index + 1}</span>
                <strong className="mb-1 block text-sm font-black text-[#172033]">{step.title}</strong>
                <p className="m-0 text-xs leading-5 text-[#667085]">{step.solution}</p>
              </button>
            ))}
          </div>
          <div className="mt-2.5 rounded-[9px] border border-[#cfd8e7] bg-white p-3">
            <div className="grid gap-2.5 md:grid-cols-3">
              {[
                ["Problem", selected.problem],
                ["AI support", selected.solution],
                ["Result", selected.result],
              ].map(([label, body]) => (
                <div key={label} className="min-h-[94px] rounded-[13px] border border-[#dce4ef] bg-white p-3">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.08em] text-[#667284]">{label}</span>
                  <p className="m-0 text-sm font-bold leading-5 text-[#1f2937]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

function ResumePanel() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <article>
      <div className="mx-auto max-w-[1260px]">
        <SectionHead
          title="Resume support"
          lead="Prospect ID leads the case study. NurseHub supports throughput and repeatable production systems."
        />
        <div className="grid gap-2.5 lg:grid-cols-4">
          {resumeData.map(([kicker, title, body]) => (
            <section key={title} className="relative min-h-full rounded-[22px] border border-[#e4e5e7] bg-white p-[17px] shadow-[0_18px_42px_rgba(15,23,42,0.07)]">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#2383e2]">{kicker}</p>
              <h3 className="m-0 mb-2 max-w-[78%] text-base font-black leading-tight text-[#2383e2]">{title}</h3>
              <p className="m-0 text-[15px] leading-6 text-[#667085]">{body}</p>
            </section>
          ))}
        </div>
      </div>

      <Divider label="Resume evidence stack" />

      <section className="mx-auto w-full max-w-[1080px] overflow-hidden rounded-[14px] border border-[#e1e5eb] bg-white shadow-[0_18px_48px_rgba(23,33,52,0.16)]">
        <div className="flex items-baseline justify-between gap-3 border-b border-[#e1e5eb] bg-[#fbfdff] px-4 py-3">
          <strong className="text-[17px] font-black text-[#111318]">Proof stack</strong>
          <span className="text-[13px] font-bold text-[#667085]">Click a block to focus the resume angle.</span>
        </div>
        <div className="p-3.5">
          <div className="grid gap-2.5 lg:grid-cols-4">
            {resumeData.map(([label, title, body], index) => (
              <button
                key={title}
                type="button"
                aria-pressed={selectedIndex === index}
                onClick={() => setSelectedIndex(index)}
                className={cx(
                  "min-h-[118px] rounded-[10px] border p-3 text-left transition",
                  selectedIndex === index ? "border-[#9fb1d4] bg-[#eef4ff]" : "border-[#c8d1df] bg-[#f8f9fb] hover:bg-white",
                )}
              >
                <span className="mb-1 block text-xs font-black uppercase text-[#2383e2]">{label}</span>
                <strong className="mb-1.5 block text-[15px] font-black text-[#172033]">{title}</strong>
                <em className="block text-xs not-italic font-semibold leading-5 text-[#667085]">{body}</em>
              </button>
            ))}
          </div>
          <div className="mt-2.5 rounded-[9px] border border-[#cfd8e7] bg-white p-3 text-[13px] font-bold leading-6 text-[#243047]">
            {resumeData[selectedIndex][2]}
          </div>
        </div>
      </section>
    </article>
  );
}

function ProofMapPanel() {
  const [selectedKey, setSelectedKey] = useState(proofRouteData[0].key);
  const selected = proofRouteData.find((route) => route.key === selectedKey) ?? proofRouteData[0];

  return (
    <article>
      <div className="mx-auto max-w-[1260px]">
        <SectionHead
          title="Proof map"
          lead="Repo evidence connects each claim to the surface a reviewer can inspect: command UI, architecture, source-of-truth rules, adapter work, audits, and web support."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {proofRouteData.map((route) => (
            <section key={route.key} className="relative rounded-[22px] border border-[#e4e5e7] bg-white p-[17px] shadow-[0_18px_42px_rgba(15,23,42,0.07)]">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#2383e2]">{route.source}</p>
              <h3 className="m-0 mb-2 text-[22px] font-black leading-tight text-[#111318]">{route.title}</h3>
              <p className="m-0 text-[15px] leading-6 text-[#667085]">{route.inspect}</p>
              <a className="mt-2 inline-flex min-h-[30px] items-center text-[13px] font-extrabold text-[#2383e2] hover:underline" href={route.href}>
                Open {route.source}
              </a>
            </section>
          ))}
        </div>
      </div>

      <Divider label="Evidence route" />

      <section className="mx-auto w-full max-w-[1080px] overflow-hidden rounded-[14px] border border-[#e1e5eb] bg-white shadow-[0_18px_48px_rgba(23,33,52,0.16)]">
        <div className="flex items-baseline justify-between gap-3 border-b border-[#e1e5eb] bg-[#fbfdff] px-4 py-3">
          <strong className="text-[17px] font-black text-[#111318]">Review route</strong>
          <span className="text-[13px] font-bold text-[#667085]">Each claim points to one reviewable repo surface.</span>
        </div>
        <div className="grid gap-3.5 p-3.5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="grid content-start gap-2">
            {proofRouteData.map((route) => (
              <button
                key={route.key}
                type="button"
                aria-pressed={route.key === selectedKey}
                onClick={() => setSelectedKey(route.key)}
                className={cx(
                  "grid min-h-[58px] gap-1 rounded-xl border p-3 text-left transition",
                  route.key === selectedKey ? "border-[#aebde0] bg-[#eef4ff]" : "border-[#d9e3f0] bg-white hover:bg-[#f8fafc]",
                )}
              >
                <strong className="text-[13px] font-black text-[#172033]">{route.title}</strong>
                <span className="text-xs font-bold text-[#667085]">{route.source}</span>
              </button>
            ))}
          </div>
          <section className="grid gap-3 rounded-[14px] border border-[#d8e2ef] bg-white p-3.5 shadow-[0_14px_30px_rgba(15,23,42,0.06)]" aria-live="polite">
            <h3 className="m-0 text-[22px] font-black text-[#111318]">{selected.title}</h3>
            <div>
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.08em] text-[#667284]">Claim to check</span>
              <p className="m-0 text-sm font-bold leading-5 text-[#1f2937]">{selected.inspect}</p>
            </div>
            <div>
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.08em] text-[#667284]">Evidence readback</span>
              <p className="m-0 text-sm font-bold leading-5 text-[#1f2937]">{selected.result}</p>
            </div>
            <a href={selected.href} className="inline-flex min-h-[34px] w-fit items-center rounded-full border border-[#c9d7eb] px-3 py-1.5 text-[13px] font-black text-[#2383e2] hover:bg-[#eef4ff]">
              Open {selected.source}
            </a>
          </section>
        </div>
      </section>
    </article>
  );
}

export default function AIWorkflowPortfolioCommand() {
  const [activeTab, setActiveTab] = useState<TabId>("system");
  const [copied, setCopied] = useState(false);
  const activeLabel = useMemo(() => tabs.find((tab) => tab.id === activeTab)?.label ?? "System", [activeTab]);

  async function copyWorkflowProof(item: WorkflowItem) {
    const text = `${item.name}\n${item.line}\n\nWorkflow: ${item.workflow}\nAction: ${item.action}\nProof: ${item.proof}\nOutput: ${item.output}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard can be blocked in local preview contexts; visible feedback still confirms the action intent.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="min-h-dvh bg-[#f4f5f4] p-[10px] text-[#111318] md:p-[18px]">
      <section className="mx-auto w-full max-w-[1420px] overflow-hidden border border-[#e6e6e3] bg-white shadow-[0_18px_46px_rgba(15,23,42,0.10)]" aria-label="Prospect ID workflow system case study">
        <header className="grid items-start gap-5 border-b border-[#e1e5eb] bg-[#fbfdff] px-[22px] py-[18px] md:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="m-0 mb-1 text-xs font-black text-[#2383e2]">AI workflow portfolio</p>
            <h1 className="m-0 text-[30px] font-black leading-tight text-[#111318] md:text-[36px]">AI Workflow Portfolio</h1>
            <p className="mt-2 max-w-[820px] text-[15px] leading-6 text-[#303746]">Command UI, legacy-system adapter work, source-of-truth cleanup, and audit tests for a practical operations workflow.</p>
          </div>
          <div className="flex max-w-[380px] flex-wrap gap-2 md:justify-end" aria-label="Proof summary">
            {["400+ commits", "Raycast", "Supabase", "Audit tests"].map((chip) => (
              <span key={chip} className="min-h-[30px] rounded-full border border-[#cbd5e2] bg-white px-3 py-1.5 text-[13px] font-extrabold text-[#263044]">{chip}</span>
            ))}
          </div>
        </header>

        <nav className="flex flex-wrap gap-1.5 border-b border-[#e1e5eb] bg-[#f8fafc] px-4 py-2.5" aria-label="Case study sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cx(
                "min-h-8 rounded-[7px] border px-3 text-[13px] font-extrabold transition",
                activeTab === tab.id ? "border-[#2383e2] bg-[#2383e2] text-white" : "border-[#c8d1df] bg-white text-[#222938] hover:bg-[#eef4ff]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="px-[14px] py-[14px] md:px-[26px] md:py-[18px]">
          {activeTab === "system" ? <SystemPanel copied={copied} onCopy={copyWorkflowProof} /> : null}
          {activeTab === "evidence" ? <EvidencePanel /> : null}
          {activeTab === "fit" ? <FitPanel /> : null}
          {activeTab === "resume" ? <ResumePanel /> : null}
          {activeTab === "sources" ? <ProofMapPanel /> : null}
        </div>
      </section>
      <div aria-live="polite" className="sr-only">{copied ? `${activeLabel} proof copied` : ""}</div>
    </main>
  );
}
