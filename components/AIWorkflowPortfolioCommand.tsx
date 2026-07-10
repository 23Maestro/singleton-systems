"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AISpecialistBottomSlice,
  AISpecialistTopSlice,
  EvidenceBottomSlice,
  EvidenceTopSlice,
  ResumeBottomSlice,
  SourceMapBottomSlice,
  SourceMapTopSlice,
  SystemTopSlice,
} from "./PortfolioSlices";
import type { HighlightedCodeArtifactMap } from "@/lib/portfolio-code-artifact-types";

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
  processDescription: string;
  resultDescription: string;
};

const tabs: { id: TabId; label: string }[] = [
  { id: "system", label: "System" },
  { id: "evidence", label: "Portfolio" },
  { id: "fit", label: "AI Fit" },
  { id: "resume", label: "Resume" },
  { id: "sources", label: "Build Map" },
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
      processDescription: "Review the athlete's progress in HUDL, verify the title format, and check the stage.",
      resultDescription: "Generates a copy-ready payload for the production team so they don't have to hunt for context.",
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
      processDescription: "Load the raw video link from external sources and update the athlete's profile with the correct video type and season.",
      resultDescription: "The profile gets populated without navigating away from the current queue row.",
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
      processDescription: "Check for missing Dropbox assets and trigger a targeted reminder to the athlete.",
      resultDescription: "The reminder is logged, and the status stays 'On Hold' without losing its place in the queue.",
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
      processDescription: "Verify the final delivery title and confirm all production steps are logged.",
      resultDescription: "Marks the workflow complete and records the exact completion date in the database.",
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
      processDescription: "Take a newly booked meeting and draft a personalized confirmation text for the parent.",
      resultDescription: "Outputs a ready-to-send SMS with all variables (scout, time, athlete) pre-filled accurately.",
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
      processDescription: "Load parent details and athlete history before starting the scout prep call.",
      resultDescription: "Presents the exact call script and next-step actions right beside the context.",
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
      processDescription: "Cross-reference head scout availability against the athlete's timezone.",
      resultDescription: "Produces two clear meeting slots to offer on the call without calendar juggling.",
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
      action: "Review pending client context, then route to confirmation or post-call update.",
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
          ["Review", "Meeting details and current task"],
          ["Route", "Reschedule Pending or Meeting Set - Rescheduled"],
          ["Readback", "Refresh Live after save"],
        ],
        note: "The command keeps the relevant details in front of the operator before they choose the final client follow-up path.",
      },
      processDescription: "Review post-call notes and determine whether to reschedule or confirm meeting success.",
      resultDescription: "Updates the central lifecycle log with the confirmed outcome.",
    },
  ],
};

const evidenceData = [
  {
    key: "commands",
    title: "Commands Are Buttons",
    summary: "Repeated dashboard actions start from Raycast, while domain modules keep the workflow meaning.",
    problem: "Operators had to remember where the right athlete, task, message, and status lived inside the dashboard.",
    solution: "Raycast became the command surface. It starts the workflow, then domain modules decide what the action means.",
    result: "Repeated clicks became a smaller set of reviewable actions: Scout Prep, Set Meetings, Client Messages, and video workflow commands.",
  },
  {
    key: "adapter",
    title: "Legacy Adapter",
    summary: "Browser form behavior becomes stable local API calls with repeatable request shapes.",
    problem: "The source system worked through browser forms and session-bound dashboard behavior.",
    solution: "FastAPI translated that behavior into stable local calls with normalized IDs, payload handling, and readback checks.",
    result: "The workflow could be tested and repeated without rebuilding the same form mutation by hand.",
  },
  {
    key: "supabase",
    title: "Supabase Ownership",
    summary: "appointments, lifecycle_events, and call_log carry the durable workflow facts.",
    problem: "Useful facts were mixed with UI state, support caches, and one-off reporting projections.",
    solution: "appointments, lifecycle_events, and call_log became the durable places for meeting, stage, and reporting truth.",
    result: "Prospect Web and audits could read the same reporting facts instead of trusting whatever a screen happened to show.",
  },
  {
    key: "audit",
    title: "Audit Before Cleanup",
    summary: "Parity checks prove the reporting shape before cleanup changes what counts as truth.",
    problem: "Cleanup could break reporting if old projections were deleted before the new shape was proven.",
    solution: "Parity tests checked the projected call_log shape and read-only behavior before cleanup became real.",
    result: "The repo shows cleanup as a verified migration path, not a blind delete.",
  },
  {
    key: "repo",
    title: "Public Repo",
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
    title: "Debug Template",
    summary: "Legacy repair work is documented as a repeatable verification checklist.",
    problem: "Legacy dashboard repairs can turn into one-off troubleshooting with no repeatable path.",
    solution: "The debug template captured request shape, IDs, browser constraints, and verification steps.",
    result: "Repair work became easier to repeat, review, and present in the portfolio.",
  },
  {
    key: "tests",
    title: "Tests",
    summary: "Source-of-truth checks prevent UI-local fixes from becoming business truth.",
    problem: "UI-local fixes can look correct while corrupting the source-of-truth contract.",
    solution: "Source-of-truth and parity checks lock the expected behavior around lifecycle, call-log, and cleanup paths.",
    result: "Changes are verified before they become business truth.",
  },
];

const processData = [
  {
    title: "Gather",
    problem: "The workflow starts as scattered dashboard steps, notes, and operator memory.",
    solution: "Collect the current command path, repo context, and source-system behavior before changing anything.",
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
    solution: "Keep human review before mutation, sending, source-of-truth writes, or public-facing work.",
    result: "The workflow stays responsible and business-relevant.",
  },
  {
    title: "Verify",
    problem: "A screen working once is not the same as a system being correct.",
    solution: "Use parity checks, readback, UI tests, or source review before treating the change as real.",
    result: "The final claim is grounded in the work.",
  },
];

const resumeData = [
  ["LEAD CASE STUDY", "Prospect ID", "Built AI-assisted workflows for video tasks and appointment setting, connecting Raycast commands, API calls, task updates, reporting views, and operator support."],
  ["PRODUCTION SYSTEMS", "NurseHub", "Built repeatable course production folders and editing workflows to speed up full-course video assembly for the NurseHub YouTube channel."],
  ["EDUCATION", "Stetson + SPC", "Bachelor of Communications, Stetson University. Additional Computer Programming and Information Technology coursework at St. Petersburg College."],
  ["ROLE MATCH", "AI Specialist", "Hands-on AI workflow builder focused on practical adoption, automation support, documentation, testing, and cleaner business processes."],
] as const;

const proofRouteData = [
  {
    key: "readme",
    title: "Command UI",
    source: "README",
    linkLabel: "Open README",
    inspect: "Raycast commands that start video tasks, appointment work, client messages, and scouting workflows from one command surface.",
    result: "Shows that commands were built as a practical control surface, not just described in prose.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/README.md",
  },
  {
    key: "map",
    title: "System Map",
    source: "ARCHITECTURE",
    linkLabel: "Open Architecture",
    inspect: "How meetings, tasks, client communication, athlete stages, outcomes, contacts, and video work connect across the workflow.",
    result: "Shows where workflow meaning lives before code or cleanup changes are made.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/docs/architecture/scouting-coordinator-system-map.md",
  },
  {
    key: "supabase",
    title: "Source Rules",
    source: "SUPABASE CONTRACT",
    linkLabel: "Open Supabase contract",
    inspect: "Rules for keeping meeting data, status updates, call activity, and message support aligned across the team.",
    result: "Shows how durable reporting truth was separated from support state.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/docs/architecture/scout-prep-supabase-source-of-truth.md",
  },
  {
    key: "adapter",
    title: "Website Bridge",
    source: "API TEMPLATE",
    linkLabel: "Open API template",
    inspect: "API call patterns that update the existing site directly, instead of repeating searches, page clicks, and manual status changes.",
    result: "Shows the old dashboard workflow becoming repeatable adapter work.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/docs/api-specs/legacy-assignment-debug-template.md",
  },
  {
    key: "audit",
    title: "Audit Checks",
    source: "PARITY TEST",
    linkLabel: "Open Parity test",
    inspect: "Checks that confirm reporting data is shaped correctly before cleanup, sync, or workflow changes.",
    result: "Shows cleanup protected by verification instead of broad deletion.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/scripts/audit-call-tracker-live-parity.test.mjs",
  },
  {
    key: "web",
    title: "Always-On Web Tools",
    source: "PROSPECT WEB",
    linkLabel: "Open Prospect Web",
    inspect: "Mobile web views that let me keep working on the go: send confirmation texts, offer reschedule slots, update sales stages, and keep the team aligned.",
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
  const panelBackground = `linear-gradient(135deg, ${accent}12 0%, #ffffff 42%, #f8fafc 100%)`;

  return (
    <section
      className="group relative flex flex-col overflow-hidden rounded-[16px] border border-[#dde3ec] p-5 shadow-[0_12px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#c8d3e2] hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]"
      style={{ background: panelBackground }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-xl" style={{ backgroundColor: accent }} />
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 text-[11px] font-black text-white shadow-sm" style={{ backgroundColor: accent }}>
            {icon}
          </span>
          <p className="m-0 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>
            {kicker}
          </p>
        </div>
        <span className="portfolio-card-status rounded-full border border-[#d8e0ea] bg-white/80 px-2 py-0.5 text-[10px] font-black text-[#1f2937] shadow-sm">{pill}</span>
      </div>

      <h3 className="m-0 text-[19px] font-black leading-tight text-[#111318]">{title}</h3>
      <p className="mt-1.5 text-[14px] font-semibold leading-5 text-[#5f6b7f]">{body}</p>

      <ul className="mt-4 list-disc space-y-1.5 border-t border-[#dfe6ef] pl-5 pt-3 text-[12px] font-bold leading-5 text-[#2f3746]">
        {facts.map((fact) => (
          <li key={fact}>
            {fact}
          </li>
        ))}
      </ul>
    </section>
  );
}

type DividerIcon = "arrow-down" | "database" | "spark" | "badge" | "map";

function DividerGlyph({ icon }: { icon: DividerIcon }) {
  if (icon === "database") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-[2.4]">
        <ellipse cx="12" cy="5" rx="7" ry="3" />
        <path d="M5 5v6c0 1.66 3.13 3 7 3s7-1.34 7-3V5" />
        <path d="M5 11v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
      </svg>
    );
  }

  if (icon === "spark") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-[2.4]">
        <path d="m12 3 1.6 5.1L19 10l-5.4 1.9L12 17l-1.6-5.1L5 10l5.4-1.9L12 3Z" />
        <path d="M19 15v4" />
        <path d="M17 17h4" />
      </svg>
    );
  }

  if (icon === "badge") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-[2.4]">
        <path d="M12 3 20 7v6c0 4.5-3.2 7-8 8-4.8-1-8-3.5-8-8V7l8-4Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </svg>
    );
  }

  if (icon === "map") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-[2.4]">
        <path d="m8 5-5 2v13l5-2 8 2 5-2V5l-5 2-8-2Z" />
        <path d="M8 5v13" />
        <path d="M16 7v13" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-[2.4]">
      <path d="M12 4v14" />
      <path d="m6 12 6 6 6-6" />
    </svg>
  );
}

function Divider({ label, icon }: { label: string; icon: DividerIcon }) {
  return (
    <div className="portfolio-divider relative my-4 rounded-[14px] border border-white/70 bg-white/58 px-3 py-3 shadow-[0_12px_34px_rgba(15,23,42,0.04)] backdrop-blur-md supports-[backdrop-filter]:bg-white/45">
      <span className="pointer-events-none absolute left-3 right-3 top-0 h-px bg-gradient-to-r from-transparent via-[#dbe3ef]/80 to-transparent" aria-hidden="true" />
      <div className="flex items-center justify-between gap-2 font-mono text-[11px] font-black uppercase tracking-[0.08em] text-[#667085] sm:text-[12px] sm:tracking-[0.14em]">
        <a
          className="portfolio-divider-repo-link inline-flex min-h-7 min-w-0 items-center gap-1.5 whitespace-nowrap font-black italic text-[#2383e2] hover:underline sm:gap-2"
          href="https://github.com/23Maestro/prospect-pipeline"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-current">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.16c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13v3.17c0 .31.21.67.79.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
          </svg>
          <span>Open GitHub Repo</span>
        </a>
        <span className="portfolio-divider-label inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-right font-black text-[#2383e2] sm:gap-2">
          <span>{label}</span>
          <DividerGlyph icon={icon} />
        </span>
      </div>
    </div>
  );
}

function TabShell({ title, lead, children }: { title: string; lead: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-[1320px]">
      <div className="mb-6 grid max-w-[920px] gap-1.5 min-h-[72px]">
        <h2 className="m-0 text-[24px] font-black leading-tight text-[#111318] md:text-[30px]">{title}</h2>
        <p className="portfolio-tab-lead m-0 text-[16px] leading-7 text-[#475467]">{lead}</p>
      </div>
      {children}
    </article>
  );
}

type PanelView = "list" | "detail" | "action";
type ProgressGroup = {
  label: string;
  selected: string;
  options: string[];
};

const videoStatusOptions = ["Revisions", "HUDL", "Dropbox", "Not Approved", "External Links"];
const videoStageOptions = ["In Queue", "Awaiting Client", "On Hold", "Done"];
const salesCallStatusOptions = ["Call Attempt 1", "Call Attempt 2", "Call Attempt 3", "Confirmation Call", "Follow Up"];
const salesStageOptions = [
  "New Opportunity",
  "Left Voice Mail 1",
  "Left Voice Mail 2",
  "Never Spoke To",
  "Called - Unable to Leave VM",
  "Spoke to - Not Interested",
  "Spoke to - Athlete, not Parent",
  "Spoke to - Too Young",
  "Spoke to - I Need To Follow Up",
  "Meeting Set",
  "Actual Meeting - Follow Up",
  "Actual Meeting - Close Lost",
  "Actual Meeting - Close Won",
  "Meeting Result - Res. Pending",
  "Meeting Result - Rescheduled",
  "Meeting Result - Canceled",
  "Meeting Result - No Show",
];

function getWindowActions(item: WorkflowItem, mode: WorkflowMode) {
  if (mode === "video") return ["Video Updates", "Update Progress", "Copy YouTube Title"];

  const copyAction = item.actions.find((action) => action.toLowerCase().startsWith("copy")) ?? "Copy Action Value";
  return [item.actionView.title, "Update Task", copyAction];
}

function isCopyAction(action: string) {
  return action.toLowerCase().startsWith("copy");
}

function getCopyValue(item: WorkflowItem, action: string) {
  if (action === "Copy Booked Meeting") return `${item.name} / ${item.asset}`;
  if (action === "Copy Action Value") return item.asset;
  return item.asset;
}

function getCopyToastLabel(action: string) {
  if (action === "Copy YouTube Title") return "Copied YouTube title";
  if (action === "Copy Booked Meeting") return "Copied booked meeting";
  if (action === "Copy Parent 1 Phone") return "Copied parent phone";
  return "Copied command value";
}

function withSelectedOption(options: string[], selected: string) {
  return options.includes(selected) ? options : [selected, ...options];
}

function getProgressGroups(item: WorkflowItem, mode: WorkflowMode): ProgressGroup[] {
  if (mode === "video") {
    return [
      {
        label: "Video status",
        selected: item.source,
        options: withSelectedOption(videoStatusOptions, item.source),
      },
      {
        label: "Video stage",
        selected: item.status,
        options: withSelectedOption(videoStageOptions, item.status),
      },
    ];
  }

  return [
    {
      label: "Official Sales Stage",
      selected: item.status,
      options: withSelectedOption(salesStageOptions, item.status),
    },
    {
      label: "Call status",
      selected: item.source,
      options: withSelectedOption(salesCallStatusOptions, item.source),
    },
  ];
}

function RaycastBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 items-center gap-1.5 rounded-md border border-[#d9e1ec] bg-white/85 px-2 text-[11px] font-bold text-[#536173] shadow-sm transition hover:border-[#c2ccdb] hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#93c5fd]"
      aria-label="Back"
    >
      <span className="grid h-4 min-w-5 place-items-center rounded-[4px] border border-[#d1d5db] bg-[#f8fafc] px-1 font-sans text-[9px] text-[#64748b] shadow-sm">Esc</span>
      <span>Back</span>
    </button>
  );
}

function RaycastPinnedPill({ label }: { label: string }) {
  return (
    <div className="raycast-light-pill pointer-events-none absolute right-3 top-[56px] z-20 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[11px] font-black text-[#1d4ed8] shadow-[0_10px_28px_rgba(29,78,216,0.16)] backdrop-blur-md">
      {label}
    </div>
  );
}

function RaycastToast({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="raycast-light-pill pointer-events-none absolute left-1/2 top-[62px] z-30 flex min-h-11 max-w-[min(84vw,360px)] -translate-x-1/2 animate-[raycastToast_1450ms_ease-in-out_forwards] items-center gap-2.5 rounded-xl border border-white/80 bg-white/82 px-4 text-[13px] font-black text-[#172033] shadow-[0_18px_36px_rgba(15,23,42,0.18)] backdrop-blur-md"
    >
      <span className="h-2 w-2 rounded-full bg-[#17b26a] shadow-[0_0_14px_rgba(34,197,94,0.54)]" aria-hidden="true" />
      {label}
    </div>
  );
}

function ProgressCommandForm({ groups }: { groups: ProgressGroup[] }) {
  return (
    <div className="grid gap-4">
      {groups.map((group) => (
        <fieldset key={group.label} className="rounded-lg border border-[#e5e7eb] bg-white p-3 shadow-sm">
          <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">{group.label}</legend>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const id = `${group.label}-${option}`.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
              return (
                <label
                  key={option}
                  htmlFor={id}
                  className={cx(
                    "flex min-h-8 cursor-default items-center gap-2 rounded-full border px-2.5 text-[12px] font-bold transition",
                    option === group.selected
                      ? "border-[#1d4ed8] bg-[#eff6ff] text-[#1d4ed8]"
                      : "border-[#d8dee8] bg-[#f8fafc] text-[#475467]"
                  )}
                >
                  <input
                    id={id}
                    name={group.label}
                    type="radio"
                    defaultChecked={option === group.selected}
                    className="h-3.5 w-3.5 accent-[#1d4ed8]"
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function SystemPanel({ onCopy }: { onCopy: (item: WorkflowItem) => void }) {
  const [view, setView] = useState<PanelView>("list");
  const [mode, setMode] = useState<WorkflowMode>("video");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [raycastToast, setRaycastToast] = useState<string | null>(null);

  const rows = workflowData[mode];
  const selected = rows[selectedIndex] ?? rows[0];
  const actions = getWindowActions(selected, mode);
  const currentAction = activeAction ?? actions[0];

  function changeMode(nextMode: WorkflowMode) {
    setMode(nextMode);
    setSelectedIndex(0);
    setActiveAction(null);
    setView("list");
  }

  const goBack = useCallback(() => {
    if (view === "action") {
      setActiveAction(null);
      setView("detail");
    } else if (view === "detail") {
      setActiveAction(null);
      setView("list");
    }
  }, [view]);

  const showCopyToast = useCallback(async (action: string) => {
    const value = getCopyValue(selected, action);
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard can be blocked in local preview contexts; the visible toast still confirms the copy intent.
    }

    setRaycastToast(getCopyToastLabel(action));
    window.setTimeout(() => setRaycastToast(null), 1500);
  }, [selected]);

  const openAction = useCallback((action: string) => {
    if (isCopyAction(action)) {
      void showCopyToast(action);
      return;
    }

    setActiveAction(action);
    setView("action");
  }, [showCopyToast]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tagName = target.tagName.toLowerCase();
        if (tagName === "input" || tagName === "textarea" || target.isContentEditable) return;
      }

      if (event.key === "Escape" && view !== "list") {
        event.preventDefault();
        goBack();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        if (view === "list") setView("detail");
        else if (view === "detail") openAction(actions[0]);
        else onCopy(selected);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actions, goBack, onCopy, openAction, selected, view]);

  return (
    <TabShell
      title="System"
      lead={
        <>
          Over the last 2.5 years, I went from video editing tasks to appointment-setting outreach; it started with using AI to see what stuck, then learning how to <strong className="font-black text-current">automate</strong> and <strong className="font-black text-current">modernize</strong> a legacy system.
        </>
      }
    >
      <div className="mx-auto max-w-[1320px]">
        <SystemTopSlice />
      </div>

      <Divider label="Try Out Raycast" icon="arrow-down" />

      <section className="mx-auto w-full max-w-[800px]" aria-label="Raycast-inspired workflow surface">
        <div className="raycast-command-frame relative flex h-[520px] w-full max-w-full flex-col overflow-hidden rounded-xl border border-[#d7dee9] bg-[#f8fafc] shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
          {/* Top Bar */}
          <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-[#e8ecf2] bg-white px-3">
            <div className="flex min-w-0 items-center gap-2">
              {view === "list" ? null : <RaycastBackButton onClick={goBack} />}
              <div className="min-w-0 truncate text-[15px] font-semibold text-[#374151]">
                {view === "list" ? (mode === "video" ? "Video queue..." : "Sales queue...") : view === "detail" ? selected.name : currentAction}
              </div>
            </div>

            <div className="flex shrink-0 gap-1 rounded-md bg-[#f1f5f9] p-0.5">
              {(["video", "sales"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={mode === item}
                  onClick={() => changeMode(item)}
                  className={cx(
                    "rounded px-2.5 py-1 text-[13px] font-semibold transition-colors",
                    mode === item
                      ? "bg-white text-[#111827] shadow-sm"
                      : "text-[#6b7280] hover:text-[#374151]"
                  )}
                >
                  {item === "video" ? "Video" : "Sales"}
                </button>
              ))}
            </div>
          </div>

          {view !== "list" ? <RaycastPinnedPill label={selected.workflow} /> : null}
          {raycastToast ? <RaycastToast label={raycastToast} /> : null}

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            {view === "list" && (
              <div className="flex flex-col py-2">
                <div className="px-4 pb-1 pt-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">
                    {mode === "video" ? "🎬 Video Queue" : "📞 Sales Queue"}
                  </h3>
                </div>
                <div className="flex flex-col px-2">
                  {rows.map((item, index) => {
                    const active = selectedIndex === index;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setSelectedIndex(index);
                          setActiveAction(null);
                          setView("detail");
                        }}
                        className={cx(
                          "group flex h-[52px] items-center gap-3 rounded-lg px-3 text-left transition-colors",
                          active
                            ? "bg-[#e8eeff] border-l-[3px] border-[#1d4ed8] pl-[9px]"
                            : "border-l-[3px] border-transparent bg-transparent hover:bg-[#f1f5ff]"
                        )}
                      >
                        <span className={cx("grid h-6 w-6 shrink-0 place-items-center rounded bg-[#e5e7eb] text-[11px] font-black shadow-sm", mode === "video" ? "text-[#b62631]" : "text-[#1557b0]")}>
                          {item.icon}
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col justify-center">
                          <span className="truncate text-[14px] font-semibold text-[#1a1f2e]">{item.name}</span>
                          <span className={cx("truncate text-[12px] font-medium", active ? "text-[#374151]" : "text-[#6b7280]")}>{item.meta}</span>
                        </div>
                        <span className={cx("hidden shrink-0 text-[12px] font-medium sm:inline", active ? "text-[#374151]" : "text-[#6b7280]")}>
                          {item.status} / {item.source}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {view === "detail" && (
              <div className="flex flex-col">
                <div className="border-b border-[#e8ecf2] bg-white p-5 sm:pr-40">
                  <h2 className="text-[24px] font-bold text-[#111827]">{selected.name}</h2>
                  <p className="mt-1 text-[14px] font-medium text-[#4b5563]">{selected.line}</p>
                </div>

                <div className="flex flex-col border-b border-[#e8ecf2] bg-[#fcfdfd] px-5 py-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">Process</span>
                      <p className="mt-1 text-[14px] font-medium leading-relaxed text-[#374151]">{selected.processDescription}</p>
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">Result</span>
                      <p className="mt-1 text-[14px] font-medium leading-relaxed text-[#374151]">{selected.resultDescription}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">Actions</h3>
                  <div className="flex flex-col gap-1">
                    {actions.map((action, index) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => openAction(action)}
                        className={cx(
                          "flex h-[40px] items-center justify-between rounded-lg px-3 text-left transition-colors",
                          index === 0 ? "bg-[#eef4ff] text-[#1d4ed8]" : "bg-transparent text-[#374151] hover:bg-[#f3f4f6]"
                        )}
                      >
                        <span className="text-[13px] font-semibold">{action}</span>
                        {index === 0 && (
                          <span className="grid h-5 place-items-center rounded bg-white px-1.5 text-[10px] font-bold text-[#6b7280] shadow-sm border border-[#e5e7eb]">
                            ↵
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {view === "action" && (
              <div className="flex flex-col">
                <div className="border-b border-[#e8ecf2] bg-white p-5 sm:pr-40">
                  <span className="mb-2 inline-block rounded border border-[#e5e7eb] bg-[#f9fafb] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">
                    {currentAction === "Update Progress" || currentAction === "Update Task" ? "Static command form" : selected.actionView.eyebrow}
                  </span>
                  <h2 className="text-[20px] font-bold text-[#111827]">{currentAction}</h2>
                  <p className="mt-2 text-[14px] font-medium leading-relaxed text-[#4b5563]">
                    {currentAction === "Update Progress"
                      ? "Review the selected video status and production stage before saving progress."
                      : currentAction === "Update Task"
                        ? "Route the task to the correct sales stage after the call details are reviewed."
                        : selected.actionView.note}
                  </p>
                </div>

                <div className="flex flex-col bg-[#fcfdfd] p-5">
                  {currentAction === "Update Progress" || currentAction === "Update Task" ? (
                    <ProgressCommandForm groups={getProgressGroups(selected, mode)} />
                  ) : (
                    <div className="grid gap-3">
                      {selected.actionView.fields.map(([label, value]) => (
                        <div key={label} className="flex flex-col gap-1 rounded-lg border border-[#e5e7eb] bg-white p-3 shadow-sm">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">{label}</span>
                          <strong className="text-[14px] text-[#111827]">{value}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onCopy(selected)}
                      className="workflow-primary-action flex h-9 items-center gap-2 rounded-lg bg-gradient-to-b from-[#3b82f6] to-[#2563eb] px-4 text-[13px] font-semibold text-white shadow-sm hover:from-[#2563eb] hover:to-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#93c5fd] focus:ring-offset-2"
                    >
                      {currentAction === "Update Progress" || currentAction === "Update Task" ? "Save reviewed state" : selected.actionView.primary}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-t border-[#e8ecf2] bg-[#f8fafc] px-3">
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#4b5563]">
              <span className="grid h-4 w-4 place-items-center rounded-[4px] bg-[#e5e7eb] text-[9px] font-black text-[#6b7280]">⌘</span>
              <span>{mode === "video" ? "Video Tracker" : "Sales Companion"}</span>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              {view === "list" && (
                <>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#6b7280]">
                    <span>Open</span>
                    <span className="grid h-4 min-w-[16px] place-items-center rounded-[4px] border border-[#d1d5db] bg-white px-1 font-sans text-[9px] shadow-sm">↵</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#6b7280]">
                    <span>Actions</span>
                    <span className="grid h-4 min-w-[16px] place-items-center rounded-[4px] border border-[#d1d5db] bg-white px-1 font-sans text-[9px] shadow-sm">⌘K</span>
                  </div>
                </>
              )}
              {view === "detail" && (
                <>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#6b7280]">
                    <span>{actions[0]}</span>
                    <span className="grid h-4 min-w-[16px] place-items-center rounded-[4px] border border-[#d1d5db] bg-white px-1 font-sans text-[9px] shadow-sm">↵</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#6b7280]">
                    <span>Actions</span>
                    <span className="grid h-4 min-w-[16px] place-items-center rounded-[4px] border border-[#d1d5db] bg-white px-1 font-sans text-[9px] shadow-sm">⌘K</span>
                  </div>
                </>
              )}
              {view === "action" && (
                <>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#6b7280]">
                    <span>{currentAction === "Update Progress" || currentAction === "Update Task" ? "Save reviewed state" : selected.actionView.primary}</span>
                    <span className="grid h-4 min-w-[16px] place-items-center rounded-[4px] border border-[#d1d5db] bg-white px-1 font-sans text-[9px] shadow-sm">↵</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#6b7280]">
                    <span>Actions</span>
                    <span className="grid h-4 min-w-[16px] place-items-center rounded-[4px] border border-[#d1d5db] bg-white px-1 font-sans text-[9px] shadow-sm">⌘K</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </TabShell>
  );
}

function EvidencePanel() {
  const [selectedKey, setSelectedKey] = useState(evidenceData[0].key);
  const selected = evidenceData.find((item) => item.key === selectedKey) ?? evidenceData[0];

  return (
    <TabShell
      title="Portfolio From the Repo"
      lead="Each item shows how a real workflow issue became a cleaner command, data rule, or verification step."
    >
      <EvidenceTopSlice selectedKey={selectedKey} onSelect={setSelectedKey} />

      <Divider label="Supabase Reports" icon="database" />

      <EvidenceBottomSlice />
    </TabShell>
  );
}

function FitPanel() {
  return (
    <TabShell title="AI Specialist Match" lead="Mapped to the role: workflow requirements, data cleanup, prompt support, output review, user testing, documentation, and practical implementation.">
      <AISpecialistTopSlice />

      <Divider label="AI Reviews" icon="spark" />

      <AISpecialistBottomSlice />
    </TabShell>
  );
}

function ResumePanel() {
  return (
    <TabShell title="Resume Support" lead="Prospect ID shows the main AI workflow case study. NurseHub shows production systems, speed, and repeatable media operations.">
        <div className="grid gap-2.5 lg:grid-cols-4">
          {resumeData.map(([kicker, title, body]) => (
            <section key={title} className="portfolio-card-surface relative min-h-full rounded-[22px] border border-[#e4e5e7] bg-white p-[17px] shadow-[0_18px_42px_rgba(15,23,42,0.07)]">
              <p className="portfolio-resume-kicker mb-3 text-[13px] font-black uppercase tracking-[0.16em] text-[#2383e2]">{kicker}</p>
              <h3 className="portfolio-resume-title m-0 mb-2 max-w-[78%] text-[19px] font-black leading-tight text-[#111318]">{title}</h3>
              <p className="portfolio-top-card-body portfolio-resume-body m-0 text-[17px] leading-7 text-[#475467]">{body}</p>
            </section>
          ))}
        </div>

      <Divider label="Resume Details" icon="badge" />

      <ResumeBottomSlice />
    </TabShell>
  );
}

function ProofMapPanel({ codeArtifacts }: { codeArtifacts: HighlightedCodeArtifactMap }) {
  const [selectedKey, setSelectedKey] = useState(proofRouteData[0].key);

  return (
    <TabShell title="Build Map" lead="Each card points to the repo area behind the workflow: commands, architecture, source rules, API calls, server support, checks, and web views.">
      <SourceMapTopSlice selectedId={selectedKey} onSelect={setSelectedKey} />

      <Divider label="Repo Map" icon="map" />

      <SourceMapBottomSlice selectedKey={selectedKey} codeArtifacts={codeArtifacts} />
    </TabShell>
  );
}

export default function AIWorkflowPortfolioCommand({ codeArtifacts }: { codeArtifacts: HighlightedCodeArtifactMap }) {
  const [activeTab, setActiveTab] = useState<TabId>("system");
  const [copied, setCopied] = useState(false);
  const activeLabel = useMemo(() => tabs.find((tab) => tab.id === activeTab)?.label ?? "System", [activeTab]);

  async function copyWorkflowProof(item: WorkflowItem) {
    const text = `${item.name}\n${item.line}\n\nWorkflow: ${item.workflow}\nAction: ${item.action}\nSource: ${item.proof}\nOutput: ${item.output}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard can be blocked in local preview contexts; visible feedback still confirms the action intent.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="theme-aware-portfolio portfolio-route-root min-h-dvh overflow-x-clip bg-white text-[#111318]">
      <section className="mx-auto w-full max-w-[1180px] min-w-0 overflow-x-clip px-4 py-6 md:px-6 md:py-9" aria-label="Prospect ID workflow system case study">
        <header className="mb-5">
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#98a2b3]">Singleton Systems · Jerami Singleton</p>
            <h1 className="m-0 text-[27px] font-black leading-tight text-[#111318] md:text-[31px]">AI Workflow Portfolio</h1>
            <p className="mt-2 max-w-[760px] text-[15px] font-semibold leading-6 text-[#596579]">AI and automation work built around real operations: video tasks, appointment setting, website workflow support, API discovery, and cleaner tracking.</p>
          </div>
        </header>

        <nav className="portfolio-tab-nav mb-5 flex max-w-full flex-wrap gap-1.5" aria-label="Case study sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cx(
                "min-h-8 rounded-[8px] border px-3 text-[12px] font-extrabold transition",
                activeTab === tab.id ? "border-[#111111] bg-[#111111] text-white" : "border-[#d8dee8] bg-white text-[#596579] hover:border-[#aeb9ca] hover:text-[#111827]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div key={activeTab} className="min-w-0 animate-[portfolioTabFade_180ms_ease-out]">
          {activeTab === "system" ? <SystemPanel onCopy={copyWorkflowProof} /> : null}
          {activeTab === "evidence" ? <EvidencePanel /> : null}
          {activeTab === "fit" ? <FitPanel /> : null}
          {activeTab === "resume" ? <ResumePanel /> : null}
          {activeTab === "sources" ? <ProofMapPanel codeArtifacts={codeArtifacts} /> : null}
        </div>
        <style jsx>{`
          @keyframes portfolioTabFade {
            from {
              opacity: 0;
              transform: translateY(4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes raycastToast {
            0% {
              opacity: 0;
              transform: translate3d(-50%, -8px, 0) scale(0.98);
            }
            12%,
            82% {
              opacity: 1;
              transform: translate3d(-50%, 0, 0) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate3d(-50%, -8px, 0) scale(0.98);
            }
          }
        `}</style>
      </section>
      <div aria-live="polite" className="sr-only">{copied ? `${activeLabel} source copied` : ""}</div>
    </main>
  );
}
