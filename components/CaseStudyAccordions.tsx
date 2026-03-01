"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";

type CaseStudyKind = "youtube" | "sport";

type CaseStudyAccordionsProps = {
  kind: CaseStudyKind;
};

type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

const transition = { duration: 0.3, ease: "easeInOut" as const };

const youtubeAccordions: AccordionItem[] = [
  {
    id: "youtube-encoding",
    title: "Encoding Pipeline (FFmpeg)",
    content: (
      <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 sm:p-3">
        <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-zinc-300 sm:text-[13px]">
{`# lesson_sequence.txt
file '/input/01_intro_master.mov'
file '/input/02_concepts_master.mov'
file '/input/03_examples_master.mov'
file '/input/04_summary_master.mov'

# 1) Standardize each source clip
ffmpeg -i input.mov \\
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=24000/1001" \\
  -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p \\
  -c:a aac -ar 48000 -b:a 192k \\
  -movflags +faststart \\
  normalized/output_standardized.mp4

# 2) Ordered concat using a sequence file
ffmpeg -f concat -safe 0 -i lesson_sequence.txt \\
  -c copy build/lesson_concat.mp4

# 3) Final master export pass
ffmpeg -i build/lesson_concat.mp4 \\
  -c:v libx264 -preset slow -crf 18 -profile:v high -level 4.1 \\
  -c:a aac -ar 48000 -b:a 192k \\
  -movflags +faststart \\
  masters/LessonSeries_Master_1080p2398.mp4`}
        </pre>
      </div>
    ),
  },
  {
    id: "youtube-batch-rename",
    title: "Batch Rename System (AppleScript)",
    content: (
      <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 sm:p-3">
        <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-zinc-300 sm:text-[13px]">
{`set lessonTitles to {"lesson one: intro", "lesson two: systems thinking", "lesson three: workflow qa", "lesson four: final review"}

on pascalCase(rawText)
  set parts to words of rawText
  set outputText to ""

  repeat with p in parts
    set token to p as text
    set token to (uppercaseText(text 1 thru 1 of token)) & (lowercaseText(text 2 thru -1 of token))
    set outputText to outputText & token
  end repeat

  return outputText
end pascalCase

on uppercaseText(t)
  return do shell script "printf %s " & quoted form of t & " | tr '[:lower:]' '[:upper:]'"
end uppercaseText

on lowercaseText(t)
  return do shell script "printf %s " & quoted form of t & " | tr '[:upper:]' '[:lower:]'"
end lowercaseText

set indexCounter to 1
repeat with lessonName in lessonTitles
  set lessonSlug to pascalCase(lessonName as text)
  set finalName to (indexCounter as text) & "_" & lessonSlug
  -- Example output: 1_LessonOneIntro
  log finalName
  set indexCounter to indexCounter + 1
end repeat`}
        </pre>
      </div>
    ),
  },
];

const beforeRecruitingRows = [
  {
    dueDate: "2/08/26",
    completionDate: "",
    owner: "Editor 1",
    contact: "Mason Clark",
    gradYear: "2026",
    title: "Video Editing",
    description: "Video Editing",
    overdue: true,
  },
  {
    dueDate: "2/09/26",
    completionDate: "-",
    owner: "Editor 1",
    contact: "Jayden Reed",
    gradYear: "2025",
    title: "Video Editing",
    description: "Video Editing",
    overdue: true,
  },
  {
    dueDate: "2/10/26",
    completionDate: "",
    owner: "Editor 2",
    contact: "Liam Torres",
    gradYear: "2026",
    title: "Video Editing",
    description: "Video Editing",
    overdue: true,
  },
  {
    dueDate: "2/11/26",
    completionDate: "",
    owner: "Editor 2",
    contact: "Noah Brooks",
    gradYear: "2027",
    title: "Video Editing",
    description: "Video Editing",
    overdue: true,
  },
  {
    dueDate: "2/12/26",
    completionDate: "",
    owner: "Editor 3",
    contact: "Caleb Morris",
    gradYear: "2025",
    title: "Video Editing",
    description: "Video Editing",
    overdue: true,
  },
  {
    dueDate: "2/13/26",
    completionDate: "",
    owner: "Editor 3",
    contact: "Ethan Walker",
    gradYear: "2026",
    title: "Video Editing",
    description: "Video Editing",
    overdue: true,
  },
  {
    dueDate: "2/14/26",
    completionDate: "-",
    owner: "Editor 1",
    contact: "Ryan Foster",
    gradYear: "2026",
    title: "Video Editing",
    description: "Video Editing",
    overdue: true,
  },
  {
    dueDate: "2/15/26",
    completionDate: "",
    owner: "Editor 2",
    contact: "Daniel Cruz",
    gradYear: "2027",
    title: "Video Editing",
    description: "Video Editing",
    overdue: false,
  },
  {
    dueDate: "2/18/26",
    completionDate: "",
    owner: "Editor 3",
    contact: "Aiden Scott",
    gradYear: "2025",
    title: "Video Editing",
    description: "Video Editing",
    overdue: false,
  },
  {
    dueDate: "2/20/26",
    completionDate: "",
    owner: "Editor 1",
    contact: "Jordan Hayes",
    gradYear: "2026",
    title: "Video Editing",
    description: "Video Editing",
    overdue: false,
  },
  {
    dueDate: "2/21/26",
    completionDate: "",
    owner: "Editor 2",
    contact: "Tyler Bennett",
    gradYear: "2027",
    title: "Video Editing",
    description: "Video Editing",
    overdue: false,
  },
  {
    dueDate: "2/22/26",
    completionDate: "",
    owner: "Editor 3",
    contact: "Marcus Hill",
    gradYear: "2025",
    title: "Video Editing",
    description: "Video Editing",
    overdue: false,
  },
];

const afterRecruitingRows = [
  {
    name: "Mason Clark",
    gradYear: "2027",
    stage: "In Queue",
    status: "HUDL",
    videoEditor: "Editor 1",
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
    videoEditor: "Editor 1",
    assignedDate: "Feb 12, 2026",
    videoStartDate: "Feb 12, 2026",
    dueDate: "-",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Liam Torres",
    gradYear: "2029",
    stage: "Awaiting Client",
    status: "HUDL",
    videoEditor: "Editor 2",
    assignedDate: "Feb 11, 2026",
    videoStartDate: "-",
    dueDate: "-",
    paymentStatus: "Unpaid",
    overdue: false,
  },
  {
    name: "Noah Brooks",
    gradYear: "2027",
    stage: "Done",
    status: "HUDL",
    videoEditor: "Editor 2",
    assignedDate: "Feb 09, 2026",
    videoStartDate: "Feb 09, 2026",
    dueDate: "-",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Caleb Morris",
    gradYear: "2026",
    stage: "Done",
    status: "Dropbox",
    videoEditor: "Editor 3",
    assignedDate: "Feb 09, 2026",
    videoStartDate: "Feb 09, 2026",
    dueDate: "-",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Ethan Walker",
    gradYear: "2027",
    stage: "Done",
    status: "HUDL",
    videoEditor: "Editor 3",
    assignedDate: "Feb 09, 2026",
    videoStartDate: "Feb 09, 2026",
    dueDate: "-",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Ryan Foster",
    gradYear: "2026",
    stage: "Done",
    status: "HUDL",
    videoEditor: "Editor 1",
    assignedDate: "Feb 08, 2026",
    videoStartDate: "Feb 08, 2026",
    dueDate: "-",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Daniel Cruz",
    gradYear: "2026",
    stage: "Done",
    status: "Dropbox",
    videoEditor: "Editor 2",
    assignedDate: "Feb 07, 2026",
    videoStartDate: "Feb 07, 2026",
    dueDate: "Feb 15, 2026",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Aiden Scott",
    gradYear: "2027",
    stage: "Done",
    status: "Revisions",
    videoEditor: "Editor 3",
    assignedDate: "Feb 07, 2026",
    videoStartDate: "Feb 07, 2026",
    dueDate: "-",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Jordan Hayes",
    gradYear: "2026",
    stage: "Done",
    status: "HUDL",
    videoEditor: "Editor 1",
    assignedDate: "Feb 04, 2026",
    videoStartDate: "Feb 04, 2026",
    dueDate: "-",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Tyler Bennett",
    gradYear: "2026",
    stage: "Done",
    status: "External Links",
    videoEditor: "Editor 2",
    assignedDate: "Feb 04, 2026",
    videoStartDate: "Feb 04, 2026",
    dueDate: "-",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Marcus Hill",
    gradYear: "2025",
    stage: "Done",
    status: "Dropbox",
    videoEditor: "Editor 3",
    assignedDate: "Feb 02, 2026",
    videoStartDate: "Feb 02, 2026",
    dueDate: "-",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Ethan Price",
    gradYear: "2026",
    stage: "Done",
    status: "Dropbox",
    videoEditor: "Editor 1",
    assignedDate: "Feb 01, 2026",
    videoStartDate: "Feb 01, 2026",
    dueDate: "-",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Levi Worthing",
    gradYear: "2026",
    stage: "Done",
    status: "HUDL",
    videoEditor: "Editor 2",
    assignedDate: "Jan 31, 2026",
    videoStartDate: "Jan 31, 2026",
    dueDate: "-",
    paymentStatus: "Paid",
    overdue: false,
  },
  {
    name: "Dante Collins",
    gradYear: "2027",
    stage: "Done",
    status: "HUDL",
    videoEditor: "Editor 3",
    assignedDate: "Jan 30, 2026",
    videoStartDate: "Jan 30, 2026",
    dueDate: "-",
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

function getDateDueDisplay(row: (typeof afterRecruitingRows)[number]) {
  if (row.dueDate === "-") {
    return "-";
  }

  if (row.dueDate) {
    return row.dueDate;
  }

  const assigned = parseDateLabel(row.assignedDate);
  if (!assigned) {
    return "-";
  }

  return formatDateLabel(addDays(assigned, 7));
}

function stageChipClass(stage: string) {
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
    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 sm:p-3">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs sm:text-[13px]">
          <thead className="text-zinc-400">
            <tr className="border-b border-white/10">
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
                <td className="px-2 py-1.5">Editor</td>
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
    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 sm:p-3">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs sm:text-[13px]">
          <thead className="text-zinc-400">
            <tr className="border-b border-white/10">
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

function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      animate={{ rotate: open ? 180 : 0 }}
      transition={transition}
      className="h-4 w-4 text-zinc-400"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

function getItems(kind: CaseStudyKind): AccordionItem[] {
  if (kind === "youtube") {
    return youtubeAccordions;
  }

  return [
    {
      id: "sport-before-deadlines",
      title: "Before: Auto-triggered deadlines",
      content: <SportBeforeTable />,
    },
    {
      id: "sport-after-deadlines",
      title: "After: Deadlines start only when work is ready",
      content: <SportAfterTable />,
    },
  ];
}

export default function CaseStudyAccordions({ kind }: CaseStudyAccordionsProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const items = getItems(kind);

  return (
    <div className="mt-5 space-y-3 sm:mt-6">
      {items.map((item) => {
        const isOpen = openId === item.id;

        return (
          <motion.div layout key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <button
              type="button"
              onClick={() => setOpenId((current) => (current === item.id ? null : item.id))}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-medium text-zinc-200 sm:text-[15px]">{item.title}</span>
              <Chevron open={isOpen} />
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key={`${item.id}-body`}
                  layout
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={transition}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.24, ease: "easeInOut", delay: 0.06 }}
                    className="px-3 pb-2.5 sm:px-4 sm:pb-3"
                  >
                    {item.content}
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
