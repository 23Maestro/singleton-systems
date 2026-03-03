"use client";
/* eslint-disable react/no-unescaped-entities */

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

type CaseStudyKind = "youtube" | "sport";

type CaseStudyAccordionsProps = {
  kind: CaseStudyKind;
  mainContent: ReactNode;
};

type ReferenceItem = {
  id: string;
  title: string;
  content: ReactNode;
};

const transition = { duration: 0.3, ease: "easeInOut" as const };

function CodeLine({ children }: { children: ReactNode }) {
  return <div className="whitespace-pre">{children}</div>;
}

const youtubeReferences: ReferenceItem[] = [
  {
    id: "youtube-encoding",
    title: "Encoding Pipeline (FFmpeg)",
    content: (
      <div className="rounded-xl border border-white/10 bg-[linear-gradient(140deg,#152b52_0%,#1a3158_42%,#2a1a57_100%)] p-3 shadow-[0_24px_54px_rgba(5,15,30,0.58)]">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
          <div className="border-b border-white/10 px-4 py-3">
            <div className="mac-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <pre className="overflow-x-auto px-4 pb-4 pt-3 font-mono text-[14px] leading-relaxed sm:text-[16px]">
            <code className="block text-zinc-100">
              <CodeLine><span className="italic text-slate-400"># lesson_sequence.txt</span></CodeLine>
              <CodeLine><span className="text-violet-300">file</span> <span className="text-sky-300">'/input/01_intro_master.mov'</span></CodeLine>
              <CodeLine><span className="text-violet-300">file</span> <span className="text-sky-300">'/input/02_concepts_master.mov'</span></CodeLine>
              <CodeLine><span className="text-violet-300">file</span> <span className="text-sky-300">'/input/03_examples_master.mov'</span></CodeLine>
              <CodeLine><span className="text-violet-300">file</span> <span className="text-sky-300">'/input/04_summary_master.mov'</span></CodeLine>
              <CodeLine>{" "}</CodeLine>
              <CodeLine><span className="italic text-slate-400"># 1) Standardize each source clip</span></CodeLine>
              <CodeLine><span className="text-fuchsia-400">ffmpeg</span> <span className="text-amber-300">-i</span> <span className="text-cyan-300">input.mov</span> \</CodeLine>
              <CodeLine>{"  "}<span className="text-amber-300">-vf</span> <span className="text-sky-300">"scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=24000/1001"</span> \</CodeLine>
              <CodeLine>{"  "}<span className="text-amber-300">-c:v</span> <span className="text-cyan-300">libx264</span> <span className="text-amber-300">-preset</span> <span className="text-zinc-200">medium</span> <span className="text-amber-300">-crf</span> <span className="text-yellow-200">19</span> <span className="text-amber-300">-pix_fmt</span> <span className="text-cyan-300">yuv420p</span> \</CodeLine>
              <CodeLine>{"  "}<span className="text-amber-300">-c:a</span> <span className="text-cyan-300">aac</span> <span className="text-amber-300">-ar</span> <span className="text-yellow-200">48000</span> <span className="text-amber-300">-b:a</span> <span className="text-yellow-200">192k</span> \</CodeLine>
              <CodeLine>{"  "}<span className="text-amber-300">-movflags</span> <span className="text-zinc-200">+faststart</span> \</CodeLine>
              <CodeLine>{"  "}<span className="text-sky-300">normalized/output_standardized.mp4</span></CodeLine>
              <CodeLine>{" "}</CodeLine>
              <CodeLine><span className="italic text-slate-400"># 2) Ordered concat using a sequence file</span></CodeLine>
              <CodeLine><span className="text-fuchsia-400">ffmpeg</span> <span className="text-amber-300">-f</span> <span className="text-cyan-300">concat</span> <span className="text-amber-300">-safe</span> <span className="text-yellow-200">0</span> <span className="text-amber-300">-i</span> <span className="text-cyan-300">lesson_sequence.txt</span> \</CodeLine>
              <CodeLine>{"  "}<span className="text-amber-300">-c</span> <span className="text-zinc-200">copy</span> <span className="text-sky-300">build/lesson_concat.mp4</span></CodeLine>
              <CodeLine>{" "}</CodeLine>
              <CodeLine><span className="italic text-slate-400"># 3) Final master export pass</span></CodeLine>
              <CodeLine><span className="text-fuchsia-400">ffmpeg</span> <span className="text-amber-300">-i</span> <span className="text-sky-300">build/lesson_concat.mp4</span> \</CodeLine>
              <CodeLine>{"  "}<span className="text-amber-300">-c:v</span> <span className="text-cyan-300">libx264</span> <span className="text-amber-300">-preset</span> <span className="text-zinc-200">slow</span> <span className="text-amber-300">-crf</span> <span className="text-yellow-200">18</span> <span className="text-amber-300">-profile:v</span> <span className="text-zinc-200">high</span> <span className="text-amber-300">-level</span> <span className="text-yellow-200">4.1</span> \</CodeLine>
              <CodeLine>{"  "}<span className="text-amber-300">-c:a</span> <span className="text-cyan-300">aac</span> <span className="text-amber-300">-ar</span> <span className="text-yellow-200">48000</span> <span className="text-amber-300">-b:a</span> <span className="text-yellow-200">192k</span> \</CodeLine>
              <CodeLine>{"  "}<span className="text-amber-300">-movflags</span> <span className="text-zinc-200">+faststart</span> \</CodeLine>
              <CodeLine>{"  "}<span className="text-sky-300">masters/LessonSeries_Master_1080p2398.mp4</span></CodeLine>
            </code>
          </pre>
        </div>
      </div>
    ),
  },
  {
    id: "youtube-batch-rename",
    title: "Batch Rename System (AppleScript)",
    content: (
      <div className="rounded-xl border border-white/10 bg-[linear-gradient(140deg,#152b52_0%,#1a3158_42%,#2a1a57_100%)] p-3 shadow-[0_24px_54px_rgba(5,15,30,0.58)]">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
          <div className="border-b border-white/10 px-4 py-3">
            <div className="mac-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <pre className="overflow-x-auto px-4 pb-4 pt-3 font-mono text-[14px] leading-relaxed sm:text-[16px]">
            <code className="block text-zinc-100">
              <CodeLine><span className="text-violet-300">set</span> <span className="text-cyan-300">lessonTitles</span> <span className="text-violet-300">to</span> <span className="text-zinc-200">{"{\"lesson one: intro\", \"lesson two: systems thinking\", \"lesson three: workflow qa\", \"lesson four: final review\"}"}</span></CodeLine>
              <CodeLine>{" "}</CodeLine>
              <CodeLine><span className="text-violet-300">on</span> <span className="text-fuchsia-400">pascalCase</span><span className="text-zinc-200">(rawText)</span></CodeLine>
              <CodeLine>{"  "}<span className="text-violet-300">set</span> <span className="text-cyan-300">parts</span> <span className="text-violet-300">to</span> <span className="text-zinc-200">words of rawText</span></CodeLine>
              <CodeLine>{"  "}<span className="text-violet-300">set</span> <span className="text-cyan-300">outputText</span> <span className="text-violet-300">to</span> <span className="text-rose-300">""</span></CodeLine>
              <CodeLine>{" "}</CodeLine>
              <CodeLine>{"  "}<span className="text-violet-300">repeat with</span> <span className="text-cyan-300">p</span> <span className="text-violet-300">in</span> <span className="text-cyan-300">parts</span></CodeLine>
              <CodeLine>{"    "}<span className="text-violet-300">set</span> <span className="text-cyan-300">token</span> <span className="text-violet-300">to</span> <span className="text-zinc-200">p as text</span></CodeLine>
              <CodeLine>{"    "}<span className="text-violet-300">set</span> <span className="text-cyan-300">token</span> <span className="text-violet-300">to</span> <span className="text-zinc-200">(uppercaseText(text 1 thru 1 of token)) & (lowercaseText(text 2 thru -1 of token))</span></CodeLine>
              <CodeLine>{"    "}<span className="text-violet-300">set</span> <span className="text-cyan-300">outputText</span> <span className="text-violet-300">to</span> <span className="text-cyan-300">outputText</span> <span className="text-zinc-200">& token</span></CodeLine>
              <CodeLine>{"  "}<span className="text-violet-300">end repeat</span></CodeLine>
              <CodeLine>{" "}</CodeLine>
              <CodeLine>{"  "}<span className="text-violet-300">return</span> <span className="text-cyan-300">outputText</span></CodeLine>
              <CodeLine><span className="text-violet-300">end</span> <span className="text-fuchsia-400">pascalCase</span></CodeLine>
              <CodeLine>{" "}</CodeLine>
              <CodeLine><span className="text-violet-300">set</span> <span className="text-cyan-300">indexCounter</span> <span className="text-violet-300">to</span> <span className="text-yellow-200">1</span></CodeLine>
              <CodeLine><span className="text-violet-300">repeat with</span> <span className="text-cyan-300">lessonName</span> <span className="text-violet-300">in</span> <span className="text-cyan-300">lessonTitles</span></CodeLine>
              <CodeLine>{"  "}<span className="text-violet-300">set</span> <span className="text-cyan-300">lessonSlug</span> <span className="text-violet-300">to</span> <span className="text-fuchsia-400">pascalCase</span><span className="text-zinc-200">(lessonName as text)</span></CodeLine>
              <CodeLine>{"  "}<span className="text-violet-300">set</span> <span className="text-cyan-300">finalName</span> <span className="text-violet-300">to</span> <span className="text-zinc-200">(indexCounter as text) & "_" & lessonSlug</span></CodeLine>
              <CodeLine>{"  "}<span className="italic text-slate-400">-- Example output: 1_LessonOneIntro</span></CodeLine>
              <CodeLine>{"  "}<span className="text-violet-300">log</span> <span className="text-cyan-300">finalName</span></CodeLine>
              <CodeLine>{"  "}<span className="text-violet-300">set</span> <span className="text-cyan-300">indexCounter</span> <span className="text-violet-300">to</span> <span className="text-cyan-300">indexCounter</span> <span className="text-zinc-200">+ </span><span className="text-yellow-200">1</span></CodeLine>
              <CodeLine><span className="text-violet-300">end repeat</span></CodeLine>
            </code>
          </pre>
        </div>
      </div>
    ),
  },
];

const beforeRecruitingRows = [
  {
    dueDate: "2/08/26",
    completionDate: "",
    owner: "Editor",
    contact: "Mason Clark",
    gradYear: "2026",
    title: "Video Editing",
    description: "Video Editing",
    overdue: true,
  },
  {
    dueDate: "2/09/26",
    completionDate: "-",
    owner: "Editor",
    contact: "Jayden Reed",
    gradYear: "2025",
    title: "Video Editing",
    description: "Video Editing",
    overdue: true,
  },
  {
    dueDate: "2/10/26",
    completionDate: "",
    owner: "Editor",
    contact: "Liam Torres",
    gradYear: "2026",
    title: "Video Editing",
    description: "Video Editing",
    overdue: true,
  },
  {
    dueDate: "2/11/26",
    completionDate: "",
    owner: "Editor",
    contact: "Noah Brooks",
    gradYear: "2027",
    title: "Video Editing",
    description: "Video Editing",
    overdue: true,
  },
  {
    dueDate: "2/12/26",
    completionDate: "",
    owner: "Editor",
    contact: "Caleb Morris",
    gradYear: "2025",
    title: "Video Editing",
    description: "Video Editing",
    overdue: true,
  },
  {
    dueDate: "2/13/26",
    completionDate: "",
    owner: "Editor",
    contact: "Ethan Walker",
    gradYear: "2026",
    title: "Video Editing",
    description: "Video Editing",
    overdue: true,
  },
  {
    dueDate: "2/14/26",
    completionDate: "-",
    owner: "Editor",
    contact: "Ryan Foster",
    gradYear: "2026",
    title: "Video Editing",
    description: "Video Editing",
    overdue: true,
  },
  {
    dueDate: "2/15/26",
    completionDate: "",
    owner: "Editor",
    contact: "Daniel Cruz",
    gradYear: "2027",
    title: "Video Editing",
    description: "Video Editing",
    overdue: false,
  },
  {
    dueDate: "2/18/26",
    completionDate: "",
    owner: "Editor",
    contact: "Aiden Scott",
    gradYear: "2025",
    title: "Video Editing",
    description: "Video Editing",
    overdue: false,
  },
  {
    dueDate: "2/20/26",
    completionDate: "",
    owner: "Editor",
    contact: "Jordan Hayes",
    gradYear: "2026",
    title: "Video Editing",
    description: "Video Editing",
    overdue: false,
  },
  {
    dueDate: "2/21/26",
    completionDate: "",
    owner: "Editor",
    contact: "Tyler Bennett",
    gradYear: "2027",
    title: "Video Editing",
    description: "Video Editing",
    overdue: false,
  },
  {
    dueDate: "2/22/26",
    completionDate: "",
    owner: "Editor",
    contact: "Marcus Hill",
    gradYear: "2025",
    title: "Video Editing",
    description: "Video Editing",
    overdue: false,
  },
];

type AfterRecruitingRow = {
  name: string;
  gradYear: string;
  stage: string;
  status: string;
  videoEditor: string;
  assignedDate: string;
  videoStartDate?: string;
  dueDate?: string;
  paymentStatus: "Paid" | "Unpaid";
  overdue: boolean;
};

const afterRecruitingRows: AfterRecruitingRow[] = [
  {
    name: "Mason Clark",
    gradYear: "2027",
    stage: "In Queue",
    status: "HUDL",
    videoEditor: "Editor",
    assignedDate: "Feb 16, 2026",
    videoStartDate: "Feb 16, 2026",
    dueDate: "Feb 23, 2026",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Jayden Reed",
    gradYear: "2026",
    stage: "Done",
    status: "External Links",
    videoEditor: "Editor",
    assignedDate: "Feb 12, 2026",
    videoStartDate: "Feb 13, 2026",
    dueDate: "Feb 20, 2026",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Liam Torres",
    gradYear: "2029",
    stage: "Awaiting Client",
    status: "HUDL",
    videoEditor: "Editor",
    assignedDate: "Feb 11, 2026",
    videoStartDate: "Feb 13, 2026",
    dueDate: "Feb 20, 2026",
    paymentStatus: "Unpaid",
    overdue: false,
  },
  {
    name: "Noah Brooks",
    gradYear: "2027",
    stage: "Done",
    status: "HUDL",
    videoEditor: "Editor",
    assignedDate: "Feb 09, 2026",
    videoStartDate: "Feb 10, 2026",
    dueDate: "Feb 17, 2026",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Caleb Morris",
    gradYear: "2026",
    stage: "Done",
    status: "Dropbox",
    videoEditor: "Editor",
    assignedDate: "Feb 09, 2026",
    videoStartDate: "Feb 11, 2026",
    dueDate: "Feb 18, 2026",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Ethan Walker",
    gradYear: "2027",
    stage: "Done",
    status: "HUDL",
    videoEditor: "Editor",
    assignedDate: "Feb 09, 2026",
    videoStartDate: "Feb 09, 2026",
    dueDate: "Feb 16, 2026",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Ryan Foster",
    gradYear: "2026",
    stage: "Done",
    status: "HUDL",
    videoEditor: "Editor",
    assignedDate: "Feb 08, 2026",
    videoStartDate: "Feb 10, 2026",
    dueDate: "Feb 17, 2026",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Daniel Cruz",
    gradYear: "2026",
    stage: "Done",
    status: "Dropbox",
    videoEditor: "Editor",
    assignedDate: "Feb 07, 2026",
    videoStartDate: "Feb 08, 2026",
    dueDate: "Feb 15, 2026",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Aiden Scott",
    gradYear: "2027",
    stage: "Done",
    status: "Revisions",
    videoEditor: "Editor",
    assignedDate: "Feb 07, 2026",
    videoStartDate: "Feb 09, 2026",
    dueDate: "Feb 16, 2026",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Jordan Hayes",
    gradYear: "2026",
    stage: "Done",
    status: "HUDL",
    videoEditor: "Editor",
    assignedDate: "Feb 04, 2026",
    videoStartDate: "Feb 04, 2026",
    dueDate: "Feb 11, 2026",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Tyler Bennett",
    gradYear: "2026",
    stage: "Done",
    status: "External Links",
    videoEditor: "Editor",
    assignedDate: "Feb 04, 2026",
    videoStartDate: "Feb 06, 2026",
    dueDate: "Feb 13, 2026",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Marcus Hill",
    gradYear: "2025",
    stage: "Done",
    status: "Dropbox",
    videoEditor: "Editor",
    assignedDate: "Feb 02, 2026",
    videoStartDate: "Feb 03, 2026",
    dueDate: "Feb 10, 2026",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Ethan Price",
    gradYear: "2026",
    stage: "Done",
    status: "Dropbox",
    videoEditor: "Editor",
    assignedDate: "Feb 01, 2026",
    videoStartDate: "Feb 02, 2026",
    dueDate: "Feb 09, 2026",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Levi Worthing",
    gradYear: "2026",
    stage: "Done",
    status: "HUDL",
    videoEditor: "Editor",
    assignedDate: "Jan 31, 2026",
    videoStartDate: "Feb 01, 2026",
    dueDate: "Feb 08, 2026",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Dante Collins",
    gradYear: "2027",
    stage: "Done",
    status: "HUDL",
    videoEditor: "Editor",
    assignedDate: "Jan 30, 2026",
    videoStartDate: "Feb 01, 2026",
    dueDate: "Feb 08, 2026",
    paymentStatus: "Paid",
    overdue: false,
  },
];

function parseDateLabel(dateLabel: string) {
  const parsed = new Date(`${dateLabel} UTC`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

function getDateDueDisplay(row: AfterRecruitingRow) {
  if (row.dueDate && row.dueDate !== "-") {
    return row.dueDate;
  }

  if (row.videoStartDate && row.videoStartDate !== "-") {
    const start = parseDateLabel(row.videoStartDate);
    if (start) {
      return formatDateLabel(addDays(start, 7));
    }
  }

  const assigned = parseDateLabel(row.assignedDate);
  if (assigned) {
    return formatDateLabel(addDays(assigned, 7));
  }

  return "-";
}

function stageChipClass(stage: string) {
  if (stage === "In Queue") {
    return "border border-red-400/30 bg-red-400/10 text-red-200";
  }

  if (stage === "Done") {
    return "border border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
  }

  if (stage === "Awaiting Client") {
    return "border border-amber-400/25 bg-amber-400/10 text-amber-200";
  }

  return "border border-blue-400/25 bg-blue-400/10 text-blue-200";
}

function SportBeforeTable() {
  return (
    <div className="rounded-xl border border-white/10 bg-[linear-gradient(140deg,#152b52_0%,#1a3158_42%,#2a1a57_100%)] p-3 shadow-[0_24px_54px_rgba(5,15,30,0.58)]">
      <div className="mx-auto w-[98%] overflow-x-auto rounded-lg border border-white/10 bg-zinc-950">
        <table className="min-w-full text-left text-xs sm:text-[13px]">
          <thead className="text-zinc-400">
            <tr className="border-b border-white/5">
              <th className="px-2 py-1.5 font-medium">Due Date</th>
              <th className="px-2 py-1.5 font-medium">Completion Date</th>
              <th className="px-2 py-1.5 font-medium">Assigned Owner</th>
              <th className="px-2 py-1.5 font-medium">Contact</th>
              <th className="px-2 py-1.5 font-medium">Grad Year</th>
              <th className="px-2 py-1.5 font-medium">Title</th>
              <th className="px-2 py-1.5 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {beforeRecruitingRows.map((row) => (
              <tr key={`${row.contact}-${row.title}`} className="border-b border-white/5 text-zinc-300 transition-colors duration-200 ease-in-out hover:bg-white/[0.06]">
                <td className={`px-2 py-1.5 font-semibold ${row.overdue ? "text-red-300" : "text-zinc-200"}`}>
                  {row.dueDate}{row.overdue ? " overdue" : ""}
                </td>
                <td className="px-2 py-1.5 text-zinc-400">{row.completionDate || "—"}</td>
                <td className="px-2 py-1.5">{row.owner}</td>
                <td className="px-2 py-1.5">{row.contact}</td>
                <td className="px-2 py-1.5 text-zinc-400">{row.gradYear}</td>
                <td className="px-2 py-1.5">{row.title}</td>
                <td className="px-2 py-1.5">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SportAfterTable() {
  return (
    <div className="rounded-xl border border-white/10 bg-[linear-gradient(140deg,#152b52_0%,#1a3158_42%,#2a1a57_100%)] p-3 shadow-[0_24px_54px_rgba(5,15,30,0.58)]">
      <div className="mx-auto w-[98%] overflow-x-auto rounded-lg border border-white/10 bg-zinc-950">
        <table className="min-w-full text-left text-xs sm:text-[13px]">
          <thead className="text-zinc-400">
            <tr className="border-b border-white/5">
              <th className="px-2 py-1.5 font-medium">Name</th>
              <th className="px-2 py-1.5 font-medium">Grad Year</th>
              <th className="px-2 py-1.5 font-medium">Stage</th>
              <th className="px-2 py-1.5 font-medium">Status</th>
              <th className="px-2 py-1.5 font-medium">Video Editor</th>
              <th className="px-2 py-1.5 font-medium">Assigned Date</th>
              <th className="px-2 py-1.5 font-medium">Video Start Date</th>
              <th className="px-2 py-1.5 font-medium">Date Due</th>
              <th className="px-2 py-1.5 font-medium">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {afterRecruitingRows.map((row) => (
              <tr key={`${row.name}-${row.assignedDate}`} className="border-b border-white/5 text-zinc-300 transition-colors duration-200 ease-in-out hover:bg-white/[0.06]">
                <td className="px-2 py-1.5">{row.name}</td>
                <td className="px-2 py-1.5 text-zinc-400">{row.gradYear}</td>
                <td className="px-2 py-1.5">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${stageChipClass(row.stage)}`}>
                    {row.stage}
                  </span>
                </td>
                <td className="px-2 py-1.5">{row.status}</td>
                <td className="px-2 py-1.5">{row.videoEditor}</td>
                <td className="px-2 py-1.5 text-zinc-400">{row.assignedDate}</td>
                <td className="px-2 py-1.5 text-zinc-400">{row.videoStartDate}</td>
                <td className={`px-2 py-1.5 font-semibold ${row.overdue ? "text-red-300" : "text-zinc-200"}`}>
                  {getDateDueDisplay(row)}
                </td>
                <td className="px-2 py-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={row.paymentStatus === "Paid" ? "text-emerald-300" : "text-red-300"}>$</span>
                    {row.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getItems(kind: CaseStudyKind): ReferenceItem[] {
  if (kind === "youtube") {
    return youtubeReferences;
  }

  return [
    {
      id: "sport-before-deadlines",
      title: "Before: Deadlines unknown",
      content: <SportBeforeTable />,
    },
    {
      id: "sport-after-deadlines",
      title: "After: Auto-triggered deadlines",
      content: <SportAfterTable />,
    },
  ];
}

function DeckShell({ title, depth }: { title: string; depth: 1 | 2 }) {
  const shellClass = depth === 1
    ? "inset-x-2 top-2"
    : "inset-x-4 top-4";

  return (
    <div className={`pointer-events-none absolute ${shellClass} h-full rounded-2xl border border-white/5 bg-zinc-950`}>
      <p className="px-3 py-2 text-xs text-zinc-600 sm:px-4">{title}</p>
    </div>
  );
}

export default function CaseStudyAccordions({ kind, mainContent }: CaseStudyAccordionsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);
  const items = getItems(kind);
  const scenes: ReferenceItem[] = [
    { id: `${kind}-primary-workflow`, title: "Workflow Overview", content: mainContent },
    ...items,
  ];

  const activeScene = scenes[activeIndex];
  const nextScene = scenes[(activeIndex + 1) % scenes.length];
  const thirdScene = scenes[(activeIndex + 2) % scenes.length];

  const advanceScene = () => {
    setActiveIndex((index) => (index + 1) % scenes.length);
  };

  const clearLongPress = () => {
    if (!longPressTimerRef.current) {
      return;
    }

    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") {
      return;
    }

    clearLongPress();
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      advanceScene();
    }, 360);
  };

  const handlePointerUp = () => {
    clearLongPress();
  };

  const handleClick = () => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    advanceScene();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    advanceScene();
  };

  return (
    <div className="mt-5 sm:mt-6">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Reference scene ${activeIndex + 1} of ${scenes.length}. Activate to view next scene.`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        <div className="relative">
          <DeckShell depth={2} title={thirdScene.title} />
          <DeckShell depth={1} title={nextScene.title} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeScene.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={transition}
              className="relative z-20"
            >
              {activeScene.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-1 text-xs sm:text-sm" aria-live="polite">
        <p className="text-zinc-500">
          Tap workflow to view reference {activeIndex + 1}/{scenes.length}
        </p>
        <button
          type="button"
          onClick={advanceScene}
          className="rounded-md border border-white/5 bg-zinc-950 px-2 py-1 text-zinc-300 transition-colors duration-200 ease-in-out hover:border-white/15"
        >
          Next
        </button>
      </div>
    </div>
  );
}
