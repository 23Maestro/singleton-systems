"use client";

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

const youtubeReferences: ReferenceItem[] = [
  {
    id: "youtube-encoding",
    title: "Encoding Pipeline (FFmpeg)",
    content: (
      <div className="rounded-xl border border-zinc-800 bg-[#0A0A0A] p-2.5 opacity-100 shadow-2xl sm:p-3">
        <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-zinc-400 sm:text-[13px]">
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
      <div className="rounded-xl border border-zinc-800 bg-[#0A0A0A] p-2.5 opacity-100 shadow-2xl sm:p-3">
        <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-zinc-400 sm:text-[13px]">
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
    <div className="rounded-xl border border-white/5 bg-zinc-950 p-2.5 shadow-2xl sm:p-3">
      <div className="overflow-x-auto">
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
    <div className="rounded-xl border border-white/5 bg-zinc-950 p-2.5 shadow-2xl sm:p-3">
      <div className="overflow-x-auto">
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
