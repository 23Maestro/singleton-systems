import Image from "next/image";
import ProofShowcase, { type ProofTab } from "@/components/ProofShowcase";
import RotatingHeroHeadline from "@/components/RotatingHeroHeadline";

const solutions = [
  {
    title: "Intake & Scope",
    copy: "Turn each request into a repeatable project path your team can track.",
    tone: "blue",
  },
  {
    title: "Assets & Folders",
    copy: "Give every project a file structure your team does not have to rethink.",
    tone: "yellow",
  },
  {
    title: "Notes & Reviews",
    copy: "Turn feedback into decisions, tasks, and next steps without chasing threads.",
    tone: "coral",
  },
  {
    title: "Package & Delivery",
    copy: "Package what worked so the next workflow starts cleaner.",
    tone: "green",
  },
] as const;

const helpAreas = [
  {
    title: "Scattered Inputs",
    copy: "Forms, files, notes, messages, and requests live in too many places.",
    accent: "bg-[#2383e2]",
    glow: "shadow-[0_0_28px_rgba(35,131,226,0.35)]",
  },
  {
    title: "Manual Follow-Up",
    copy: "The next step depends on someone remembering who needs what.",
    accent: "bg-[#ffc83d]",
    glow: "shadow-[0_0_28px_rgba(255,200,61,0.3)]",
  },
  {
    title: "Batch Work",
    copy: "Repeated tasks need a cleaner way to review, approve, and ship.",
    accent: "bg-[#ff6257]",
    glow: "shadow-[0_0_28px_rgba(255,98,87,0.32)]",
  },
  {
    title: "AI-Assisted Setup",
    copy: "Prompts, tools, and automations only matter when they fit the real workflow.",
    accent: "bg-[#25c266]",
    glow: "shadow-[0_0_28px_rgba(37,194,102,0.32)]",
  },
] as const;

const nurseHubProofTabs: readonly ProofTab[] = [
  {
    id: "before",
    label: "Before",
    eyebrow: "Unordered Source Folder",
    subtitle: "Course videos received, but order and upload prep are unclear.",
    gemClassName: "bg-[radial-gradient(circle_at_30%_30%,#ffe9a6,#f59e0b_48%,#8f4b00)]",
  },
  {
    id: "build",
    label: "Build Path",
    eyebrow: "Structured Processing Lane",
    subtitle: "AI helped turn the ordered project list into an ffmpeg-ready export path, skipping manual Premiere assembly during the migration.",
    gemClassName: "bg-[radial-gradient(circle_at_30%_30%,#b9efff,#2383e2_48%,#004fa8)]",
  },
  {
    id: "ready",
    label: "Ship Ready",
    eyebrow: "Upload-Ready Library",
    subtitle: "Multiple course libraries assembled, named in order, and ready for YouTube upload.",
    gemClassName: "bg-[radial-gradient(circle_at_30%_30%,#c9ffd9,#25c266_48%,#0f7a3a)]",
  },
] as const;

const methodSteps = [
  "Pick one recurring workflow.",
  "Watch how it’s done now.",
  "List out the messy steps, tools, files, and follow-ups.",
  "Create a simple hub, prompt, checklist, or automated path.",
  "Check what went out and choose the next fix.",
] as const;

function SolutionIcon({ tone }: { tone: (typeof solutions)[number]["tone"] }) {
  const classes = {
    blue: "bg-[#004fa8]",
    yellow: "bg-[#ffc83d]",
    coral: "bg-[#ff6257]",
    green: "bg-[#25c266]",
  }[tone];
  const sizeClass = "h-14 w-14 sm:h-16 sm:w-16";
  const svgSizeClass = "h-11 w-11 sm:h-12 sm:w-12";

  return (
    <span className={`inline-flex ${sizeClass} shrink-0 items-center justify-center rounded-full border-2 border-black ${classes}`}>
      {tone === "blue" ? (
        <svg viewBox="0 0 36 36" className={svgSizeClass} fill="none" aria-hidden="true">
          <rect x="9.2" y="7.2" width="16.2" height="21.4" rx="2.5" fill="#f8fbff" stroke="#050505" strokeWidth="2" />
          <path d="M13.2 13.4h7.8M13.2 17.2h6M13.2 21h8.4" stroke="#050505" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M20.2 9.6h4.7l3.2 3.2v8.4" stroke="#050505" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="25.3" cy="24.1" r="5.7" fill="#dff2ff" stroke="#050505" strokeWidth="1.75" />
          <path d="m22.9 24.2 1.6 1.6 3.4-3.7" stroke="#2383e2" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : tone === "yellow" ? (
        <svg viewBox="0 0 36 36" className={svgSizeClass} fill="none" aria-hidden="true">
          <path d="M7.4 13.1c0-1.55 1.2-2.75 2.75-2.75h5.2c.65 0 1.25.28 1.68.78l1.25 1.43c.42.5 1.03.78 1.68.78h5.9c1.55 0 2.75 1.2 2.75 2.75v8.45c0 1.55-1.2 2.75-2.75 2.75h-15.7c-1.55 0-2.75-1.2-2.75-2.75V13.1Z" fill="#fff7cc" stroke="#050505" strokeWidth="2" strokeLinejoin="round" />
          <path d="M11.8 18.2h10.7M11.8 22h7.8" stroke="#050505" strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="25.2" cy="24.1" r="5.7" fill="#fff4c2" stroke="#050505" strokeWidth="1.75" />
          <path d="m22.8 24.2 1.6 1.6 3.4-3.7" stroke="#d79500" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : tone === "coral" ? (
        <svg viewBox="0 0 36 36" className={svgSizeClass} fill="none" aria-hidden="true">
          <path d="M7.6 10.8c0-1.6 1.25-2.85 2.85-2.85h13.2c1.6 0 2.85 1.25 2.85 2.85v8.05c0 1.6-1.25 2.85-2.85 2.85h-5.8l-5.3 4.5v-4.5h-2.1c-1.6 0-2.85-1.25-2.85-2.85v-8.05Z" fill="#fff7f5" stroke="#050505" strokeWidth="2" strokeLinejoin="round" />
          <path d="m12.8 15.4 2.5 2.5 5.3-5.7" stroke="#ff6257" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="25.4" cy="23.8" r="6.1" fill="#fff7f5" stroke="#050505" strokeWidth="1.8" />
          <path d="M25.4 20.7v3.2l2.1 1.4" stroke="#ff6257" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 36 36" className={svgSizeClass} fill="none" aria-hidden="true">
          <path d="M9.4 14.1 17 9.8l7.6 4.3v9L17 27.5l-7.6-4.4v-9Z" fill="#f4fff7" stroke="#050505" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9.4 14.1 17 18.5l7.6-4.4M17 18.5v9" stroke="#050505" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20.8 8.4h4.4l2.8 2.8v7.2" stroke="#050505" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="25.4" cy="24.3" r="5.9" fill="#ddffe8" stroke="#050505" strokeWidth="1.75" />
          <path d="m22.8 24.4 1.7 1.7 3.6-4" stroke="#25c266" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

function IntakeTabIcon({ tab }: { tab: "Footage" | "Notes" | "Deadline" | "Review" }) {
  if (tab === "Footage") {
    return (
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.35px] border-black bg-[#ff1738] sm:h-5 sm:w-5" aria-hidden="true">
        <svg viewBox="0 0 20 20" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none">
          <rect x="4.2" y="6" width="8.4" height="8" rx="1.4" fill="white" stroke="#050505" strokeWidth="1.15" />
          <path d="m12.6 8.2 3.2-1.7v7l-3.2-1.7V8.2Z" fill="white" stroke="#050505" strokeWidth="1.15" strokeLinejoin="round" />
          <path d="M6.3 8.6v2.8" stroke="#050505" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  if (tab === "Notes") {
    return (
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.35px] border-black bg-[#22c7c8] sm:h-5 sm:w-5" aria-hidden="true">
        <svg viewBox="0 0 20 20" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none">
          <path d="m6 13.8 1.1-3.7 5.7-5.7 2.6 2.6-5.7 5.7L6 13.8Z" fill="#ffc83d" stroke="#050505" strokeWidth="1.15" strokeLinejoin="round" />
          <path d="m12.2 5 2.7 2.7" stroke="#050505" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  if (tab === "Deadline") {
    return (
      <span className="inline-flex h-4 w-5 shrink-0 items-center justify-center sm:h-5 sm:w-6" aria-hidden="true">
        <svg viewBox="0 0 24 20" className="h-4 w-5 sm:h-5 sm:w-6" fill="none">
          <path d="M1.5 6.2h4.2M.8 10h4.9M2.4 13.8h3.3" stroke="#050505" strokeWidth="1.45" strokeLinecap="round" />
          <circle cx="14" cy="10" r="7.1" fill="#ffc83d" stroke="#050505" strokeWidth="1.6" />
          <path d="M14 5.8V10l2.7 2" stroke="#050505" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  return (
    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.35px] border-black bg-[#22c86a] sm:h-5 sm:w-5" aria-hidden="true">
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none">
        <path d="m5 10.1 3 3.1 7-8" stroke="#050505" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function IntakeRowIcon({ title }: { title: "Project Goal" | "Assets Needed" | "Edit Notes" | "Delivery Date" }) {
  if (title === "Project Goal") {
    return (
      <svg viewBox="0 0 18 18" className="mt-0.5 h-4 w-4 shrink-0 text-neutral-600" fill="none" aria-hidden="true">
        <path d="M9 2.2 10.2 4l2.1-.2.4 2.1 1.8 1.1-1.1 1.8.6 2-2 .7-.9 1.9-2.1-.8-2.1.8-.9-1.9-2-.7.6-2L3.5 7l1.8-1.1.4-2.1 2.1.2L9 2.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7.2 13.1 6.1 16l2.9-1.2 2.9 1.2-1.1-2.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7.9" r="1.9" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }

  if (title === "Assets Needed") {
    return (
      <svg viewBox="0 0 18 18" className="mt-0.5 h-4 w-4 shrink-0 text-neutral-600" fill="none" aria-hidden="true">
        <rect x="2.7" y="3.2" width="12.6" height="11.6" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="6.2" cy="6.5" r="1.2" fill="currentColor" />
        <path d="m3.7 13.2 3.4-3.6 2.5 2.2 1.4-1.4 3.3 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (title === "Edit Notes") {
    return (
      <svg viewBox="0 0 18 18" className="mt-0.5 h-4 w-4 shrink-0 text-neutral-600" fill="none" aria-hidden="true">
        <rect x="4" y="2.7" width="10" height="12.6" rx="1.5" fill="currentColor" />
        <path d="M6.7 6.1h4.6M6.7 8.8h4.6M6.7 11.5h3.1" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 18 18" className="mt-0.5 h-4 w-4 shrink-0 text-neutral-600" fill="none" aria-hidden="true">
      <rect x="2.8" y="4.2" width="12.4" height="10.8" rx="1.3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.8 7.3h12.4M6 2.7v3M12 2.7v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.7 10h.01M9 10h.01M12.3 10h.01M5.7 12.5h.01M9 12.5h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function IntakePreview() {
  const tabs = ["Footage", "Notes", "Deadline", "Review"] as const;
  const rows = [
    ["Project Goal", "Final outcome and success criteria"],
    ["Assets Needed", "Raw footage, brand files, examples"],
    ["Edit Notes", "Structure, timestamps, revision context"],
    ["Delivery Date", "Export specs and handoff deadline"],
  ] as const;

  return (
    <div className="-mb-7 -mr-7 mt-8 overflow-hidden rounded-l-[1.35rem] border-y border-l border-neutral-200 bg-[#f7f7f5] px-4 pb-0 pt-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:-mb-8 sm:-mr-8 sm:px-5 lg:min-h-[407px]">
      <div className="flex justify-end pr-1 sm:pr-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-[0_8px_20px_rgba(15,23,42,0.11)]">
          <svg viewBox="0 0 18 18" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6.8" fill="#f7f7f5" stroke="#050505" strokeWidth="1.4" />
            <path d="M9 5.5v7M5.5 9h7" stroke="#050505" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          New Video Project
        </span>
      </div>
      <div className="mt-10 -mb-8 w-[113%] origin-top-left translate-x-1 scale-[0.92] rounded-tl-[1.1rem] border-l border-t border-neutral-200 bg-white shadow-[0_18px_36px_rgba(15,23,42,0.08)] sm:-mb-9 sm:w-[110%] sm:translate-x-2 sm:scale-[0.93]">
        <div className="px-5 pt-5 text-xs font-semibold text-neutral-500">4 inputs found</div>
        <div className="relative mt-4 grid grid-cols-4 border-b-2 border-neutral-200 text-[9px] font-bold text-neutral-800 sm:text-xs">
          <span className="absolute bottom-[-2px] left-0 h-0.5 w-1/4 bg-black" aria-hidden="true" />
          {tabs.map((tab, index) => (
            <div key={tab} className="min-w-0 overflow-hidden px-1 pb-3 sm:px-3">
              <div className={`flex min-w-0 items-center justify-center gap-1 whitespace-nowrap ${index === 0 ? "pl-1.5 sm:pl-2" : ""}`}>
                <IntakeTabIcon tab={tab} />
                <span className="min-w-0">{tab}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4 px-5 py-5">
          {rows.map(([title, copy]) => (
            <div key={title} className="grid grid-cols-[1rem_1fr] gap-3">
              <IntakeRowIcon title={title} />
              <div>
                <p className="text-sm font-bold tracking-[-0.02em] text-neutral-950">{title}</p>
                <p className="mt-0.5 text-xs font-medium leading-relaxed text-neutral-500">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssetsPreview() {
  const tabs = ["Assets", "Progress", "Review", "Final"] as const;
  const rows = [
    ["Video", "Timeline ready to build", "Captured", "bg-[#dbeafe] text-[#075985] border-[#93c5fd]"],
    ["Audio", "V1 cleanup prepped", "Recorded", "bg-[#fee2e2] text-[#9f1239] border-[#fca5a5]"],
    ["Graphics", "Brand pieces aligned", "Designed", "bg-[#ffedd5] text-[#9a3412] border-[#fdba74]"],
    ["B-Roll", "Support clips sorted", "Sorted", "bg-[#ede9fe] text-[#4c1d95] border-[#c4b5fd]"],
  ] as const;

  return (
    <div className="-mb-7 -mr-7 mt-8 overflow-hidden rounded-l-[1.35rem] border-y border-l border-neutral-200 bg-[#efefec] px-4 pb-0 pt-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:-mb-8 sm:-mr-8 sm:px-5 lg:min-h-[407px]">
      <div className="flex justify-end pr-1 sm:pr-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-800 shadow-[0_8px_20px_rgba(15,23,42,0.11)]">
          <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6.7" stroke="#050505" strokeWidth="1.5" />
            <path d="m6.1 9.2 1.9 1.9 4-4.3" stroke="#050505" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Project Organized
        </span>
      </div>
      <div className="mt-10 -mb-8 w-[113%] origin-top-left translate-x-1 scale-[0.92] rounded-tl-[1.1rem] border-l border-t border-neutral-200 bg-white shadow-[0_18px_36px_rgba(15,23,42,0.08)] sm:-mb-9 sm:w-[110%] sm:translate-x-2 sm:scale-[0.93]">
        <div className="relative mt-5 grid grid-cols-4 border-b-2 border-neutral-200 text-[9px] font-bold text-neutral-800 sm:text-xs">
          <span className="absolute bottom-[-2px] left-0 h-0.5 w-1/4 bg-black" aria-hidden="true" />
          {tabs.map((tab, index) => (
            <div key={tab} className="min-w-0 overflow-hidden px-1 pb-3 sm:px-3">
              <div className={`flex min-w-0 items-center justify-center gap-1 whitespace-nowrap ${index === 0 ? "pl-1.5 sm:pl-2" : ""}`}>
                <svg viewBox="0 0 18 18" className="h-3.5 w-3.5 shrink-0 text-neutral-800" fill="none" aria-hidden="true">
                  {index === 0 ? (
                    <path d="M2.8 5.8c0-.9.7-1.6 1.6-1.6h3.4l1.4 1.4h4.4c.9 0 1.6.7 1.6 1.6v5.4c0 .9-.7 1.6-1.6 1.6H4.4c-.9 0-1.6-.7-1.6-1.6V5.8Z" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
                  ) : index === 1 ? (
                    <path d="M9 3.2a5.8 5.8 0 1 1 0 11.6A5.8 5.8 0 0 1 9 3.2Zm0 3v3.4l2.2 1.3" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
                  ) : index === 2 ? (
                    <path d="M4.2 4.2h9.6v6.6H8.2l-3.2 3v-3H4.2V4.2Z" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
                  ) : (
                    <path d="m4 9.1 3.2 3.2L14 5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
                <span className="min-w-0">{tab}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="divide-y divide-neutral-100 px-5 py-3">
          {rows.map(([title, copy, status, statusClassName]) => (
            <div key={title} className="grid grid-cols-[1rem_1fr_auto] items-center gap-3 py-3">
              <svg viewBox="0 0 18 18" className="h-4 w-4 shrink-0 text-neutral-600" fill="none" aria-hidden="true">
                <path d="M2.8 5.8c0-.9.7-1.6 1.6-1.6h3.4l1.4 1.4h4.4c.9 0 1.6.7 1.6 1.6v5.4c0 .9-.7 1.6-1.6 1.6H4.4c-.9 0-1.6-.7-1.6-1.6V5.8Z" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm font-bold tracking-[-0.02em] text-neutral-950">{title}</p>
                <p className="mt-0.5 text-xs font-medium leading-snug text-neutral-500">{copy}</p>
              </div>
              <span className={`rounded-md border px-2 py-1 text-[10px] font-bold leading-none ${statusClassName}`}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotesTabIcon({ tab }: { tab: "Voice Note" | "Timestamps" | "Tasks" | "Approved" }) {
  if (tab === "Voice Note") {
    return (
        <svg viewBox="0 0 18 18" className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" fill="none" aria-hidden="true">
        <path d="M3.5 6.2v5.6M6.1 3.8v10.4M8.8 6.1v5.8M11.5 4.8v8.4M14.2 7v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (tab === "Timestamps") {
    return (
      <svg viewBox="0 0 18 18" className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="6.1" stroke="currentColor" strokeWidth="1.7" />
        <path d="M9 5.6V9l2.2 1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (tab === "Tasks") {
    return (
      <svg viewBox="0 0 18 18" className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" fill="none" aria-hidden="true">
        <rect x="4.1" y="3.4" width="9.8" height="11.2" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
        <path d="m6.5 9 1.4 1.4 3.7-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 18 18" className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" fill="none" aria-hidden="true">
      <path d="M9 2.8 14 5v4.1c0 3-1.8 5.1-5 6.3-3.2-1.2-5-3.3-5-6.3V5l5-2.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m6.6 9 1.5 1.6 3.5-3.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NotesPreview() {
  const tabs = ["Voice Note", "Timestamps", "Tasks", "Approved"] as const;
  const rows = [
    ["02:14 - tighten intro", "Decision", "bg-blue-100 text-blue-700", "clock"],
    ["Swap example clip", "Fix", "bg-red-100 text-red-700", "comment"],
    ["Send revised cut", "Next", "bg-orange-100 text-orange-700", "task"],
    ["Client approved direction", "Approved", "bg-green-100 text-green-700", "people"],
  ] as const;
  const waveform = [40, 80, 48, 72, 36, 64, 86, 44, 70, 52, 90, 46, 78, 58, 68, 38, 74, 50] as const;

  return (
    <div className="-mx-7 -mb-7 mt-8 flex h-[475px] justify-center overflow-hidden rounded-b-[1.75rem] bg-[#f55252] px-3 pt-8 sm:-mx-8 sm:-mb-8 sm:h-[460px] sm:px-4">
      <div className="flex h-[480px] w-full max-w-[420px] flex-col gap-4 rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-[480px]">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-neutral-200 p-2">
            <svg className="h-[18px] w-[18px] text-neutral-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5Z" />
            </svg>
          </div>
          <span className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-bold text-neutral-800">Review Sorted</span>
        </div>

        <p className="text-sm font-medium text-neutral-500">3 updates ready</p>

        <div className="grid grid-cols-4 gap-0.5 border-b border-neutral-100 pb-2 text-[8px] font-semibold leading-none sm:gap-1 sm:text-xs">
          {tabs.map((tab) => (
            <span
              key={tab}
              className={`flex min-w-0 items-center justify-center gap-0.5 whitespace-nowrap sm:gap-1.5 ${
                tab === "Voice Note" ? "relative z-10 -mb-[9px] border-b-2 border-black pb-2 text-black" : "text-neutral-500"
              }`}
            >
              <NotesTabIcon tab={tab} />
              {tab}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
          <button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black" aria-label="Play client voice note">
            <svg className="ml-0.5 h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-bold text-neutral-950">Client voice note</span>
            <div className="flex items-center gap-2">
              <div className="flex h-4 flex-1 items-center gap-[2px] opacity-30" aria-hidden="true">
                {waveform.map((height, index) => (
                  <div key={index} className="w-[3px] rounded-full bg-neutral-600" style={{ height: `${height}%` }} />
                ))}
              </div>
              <span className="text-xs font-medium text-neutral-500">03:42</span>
            </div>
          </div>
        </div>

        <div className="mt-1 overflow-hidden rounded-xl border border-neutral-100">
          {rows.map(([title, status, statusClassName, icon]) => (
            <div key={title} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-neutral-100 px-3 py-2 text-sm last:border-b-0">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] ${
                  icon === "clock"
                    ? "bg-blue-50 text-blue-600"
                    : icon === "comment"
                      ? "bg-red-50 text-red-600"
                      : icon === "task"
                        ? "bg-orange-50 text-orange-600"
                        : "bg-green-50 text-green-600"
                }`}
                aria-hidden="true"
              >
                {icon === "clock" ? (
                  <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none">
                    <path d="M9 3.2a5.8 5.8 0 1 1 0 11.6A5.8 5.8 0 0 1 9 3.2Zm0 3.1V9l2.1 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : icon === "comment" ? (
                  <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none">
                    <path d="M3.7 4.6h10.6v6.5H8.4L5.2 14v-2.9H3.7V4.6Z" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
                  </svg>
                ) : icon === "task" ? (
                  <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none">
                    <path d="M5.2 4.4h7.6v9.2H5.2V4.4Zm2.2 4.5 1.2 1.2 2.3-2.5" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none">
                    <path d="M6.5 8.2a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2Zm5 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM3.3 14c.4-2.2 1.5-3.3 3.2-3.3s2.8 1.1 3.2 3.3m.3-.5c.4-1.5 1.2-2.3 2.5-2.3 1.2 0 2.1.8 2.4 2.3" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span className="min-w-0 flex-1 text-[13px] font-semibold leading-tight text-neutral-800 sm:text-sm">{title}</span>
              <span className={`rounded-md px-3 py-1.5 text-[10px] font-bold leading-none ${statusClassName}`}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PackagePreview() {
  const rows = [
    ["Export specs", "Final", "bg-purple-100 text-purple-700"],
    ["Final links", "Shared", "bg-blue-100 text-blue-700"],
    ["Client notes", "Shared", "bg-orange-100 text-orange-700"],
    ["Project template", "Saved", "bg-green-100 text-green-700"],
  ] as const;

  return (
    <div className="-mx-7 -mb-7 mt-8 flex h-[450px] justify-center overflow-hidden rounded-b-[1.75rem] bg-[#4eba6b] px-3 pt-8 sm:-mx-8 sm:-mb-8 sm:h-[460px] sm:px-4">
      <div className="relative h-full w-full max-w-[420px] sm:max-w-[500px]">
        <div className="absolute left-0 right-10 top-0 h-[430px] overflow-hidden rounded-t-xl border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
              </svg>
              <span className="text-sm font-bold text-neutral-900">Reusable Template</span>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">
              Saved as template <span className="text-green-500">✓</span>
            </span>
          </div>
          <p className="mb-5 pr-4 text-[13px] leading-snug text-neutral-500">Everything that worked, ready for next time.</p>

          <ul className="space-y-4 text-sm font-medium text-neutral-600">
            {[
              ["Workflows", "folder"],
              ["Assets", "list"],
              ["Notes", "chat"],
              ["Team Covered", "team"],
              ["Tools", "tag"],
            ].map(([item, icon]) => (
              <li key={item} className="flex items-center gap-3">
                <svg className="h-4 w-4 shrink-0 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {icon === "folder" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2Z" />
                  ) : icon === "list" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  ) : icon === "chat" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5Z" />
                  ) : icon === "team" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 1 1 0 5.292M15 21H3v-1a6 6 0 0 1 12 0v1Zm0 0h6v-1a6 6 0 0 0-9-5.197M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4Z" />
                  )}
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute left-[7.25rem] right-1 top-[144px] z-10 h-[294px] rounded-t-2xl border border-neutral-100 bg-white p-5 shadow-2xl sm:left-48 sm:right-0 sm:top-[126px] sm:h-[330px]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="rounded-lg border border-green-100 bg-green-50 p-1.5">
                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m20 7-8-4-8 4m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-sm font-bold text-neutral-900">Final Handoff</span>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">
              Ready to Ship <span className="text-green-500">✓</span>
            </span>
          </div>

          <p className="mb-4 border-b border-neutral-50 pb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Delivery package</p>

          <div className="flex flex-col gap-4">
            {rows.map(([title, status, statusClassName]) => (
              <div key={title} className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm">
                <div className="flex min-w-0 items-center gap-3 font-semibold text-neutral-800">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-green-500 text-xs leading-none text-white">✓</div>
                  <span className="min-w-0 text-[13px] leading-tight sm:text-sm">{title}</span>
                </div>
                <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold ${statusClassName}`}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#fbfbfb] text-[#080808]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-7 py-8 sm:px-8 lg:px-10">
        <a href="#" className="block w-24 sm:w-28" aria-label="Singleton Systems home">
          <Image
            src="/singleton-systems-wordmark.svg"
            alt="Singleton Systems"
            width={660}
            height={260}
            priority
            className="h-auto w-full"
          />
        </a>
        <nav aria-label="Primary" className="hidden translate-x-6 items-center gap-8 text-sm font-semibold text-neutral-600 md:flex">
          <a className="transition hover:text-black" href="#about">
            About
          </a>
          <a className="transition hover:text-black" href="#services">
            Services
          </a>
          <a className="transition hover:text-black" href="#results">
            Results
          </a>
          <a className="transition hover:text-black" href="#pricing">
            Pricing
          </a>
        </nav>
        <a
          href="#beta-audit"
          className="hidden rounded-full bg-black px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800 sm:inline-flex"
        >
          Request Audit
        </a>
        <details className="group relative md:hidden">
          <summary
            className="inline-flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full bg-black text-white marker:hidden"
            aria-label="Open navigation"
          >
            <span className="space-y-1.5">
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
            </span>
          </summary>
          <nav
            aria-label="Mobile"
            className="absolute right-0 top-14 z-20 grid min-w-44 gap-3 rounded-3xl border border-neutral-200 bg-white p-5 text-right text-sm font-bold shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
          >
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#results">Results</a>
            <a href="#pricing">Pricing</a>
          </nav>
        </details>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-7 pb-14 pt-16 text-center sm:px-8 sm:pb-18 sm:pt-20 lg:px-10">
        <div className="w-full max-w-2xl">
          <RotatingHeroHeadline />
          <div className="mx-auto mt-6">
            <p className="mx-auto max-w-[17rem] text-balance text-[15px] font-medium leading-relaxed text-neutral-700 sm:max-w-[20rem] sm:text-base lg:max-w-[28rem] lg:text-lg">
              I help operators and small teams turn scattered notes, repeated follow-ups, and messy handoffs into a workflow they can reuse.
            </p>
          </div>
          <div className="mx-auto mt-3">
            <p className="mx-auto flex max-w-[15.5rem] items-center justify-center gap-1.5 text-center text-[9.5px] font-semibold leading-none text-neutral-600 sm:max-w-[18rem] sm:text-[10.5px] lg:max-w-[24rem] lg:text-xs">
              <span
                className="inline-flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full border-[1.5px] border-black bg-[#eef6ff] text-[#2383e2] lg:h-5 lg:w-5"
                aria-hidden="true"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                  <path
                    d="M8 2.5L8.8 5.4L11.5 6.2L8.8 7L8 9.8L7.2 7L4.5 6.2L7.2 5.4L8 2.5Z"
                    fill="currentColor"
                    stroke="#050505"
                    strokeWidth="0.45"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 10.2L4.4 11.4L5.6 11.8L4.4 12.2L4 13.5L3.6 12.2L2.4 11.8L3.6 11.4L4 10.2Z"
                    fill="currentColor"
                    stroke="#050505"
                    strokeWidth="0.35"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 9.2L12.4 10.4L13.6 10.8L12.4 11.2L12 12.5L11.6 11.2L10.4 10.8L11.6 10.4L12 9.2Z"
                    fill="currentColor"
                    stroke="#050505"
                    strokeWidth="0.35"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>Curious about AI? Ask me where it can save real time.</span>
            </p>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#beta-audit"
              className="inline-flex min-h-11 w-auto items-center justify-center rounded-full bg-black px-7 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_12px_28px_rgba(0,0,0,0.14)] transition hover:bg-neutral-800"
            >
              Fix the flow
            </a>
          </div>
        </div>

        <div className="mt-12 w-full max-w-[16rem] overflow-hidden rounded-[1.45rem] border border-[#2b5f8f]/22 bg-white shadow-[0_14px_36px_rgba(35,54,79,0.08)] backdrop-blur sm:mt-16 sm:max-w-[18rem]">
          <Image
            src="/23-hero.png"
            alt="Jerami Singleton"
            width={1254}
            height={1254}
            priority
            className="aspect-square w-full rounded-b-[1.18rem] object-cover"
          />
          <div className="px-3 pb-3.5 pt-2.5 text-left sm:px-4">
            <p className="text-base font-semibold tracking-[-0.04em] text-neutral-950">Jerami Singleton</p>
            <p className="mt-1 text-xs font-medium text-neutral-500 sm:text-sm">CEO of Singleton Systems.</p>
          </div>
        </div>
      </section>

      <section id="about" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="about-heading">
        <div className="mx-auto max-w-5xl">
          <h2 id="about-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
            How It Starts
          </h2>
          <div
            id="beta-audit"
            className="mt-10 rounded-[2rem] border border-neutral-200/80 bg-white/90 p-7 shadow-[0_18px_48px_rgba(15,23,42,0.075)] backdrop-blur sm:p-12"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <span
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#004fa8] shadow-[0_8px_18px_rgba(0,79,168,0.18)]"
                aria-hidden="true"
              >
                <svg viewBox="2.5 4.5 32 27" className="h-[2.15rem] w-[2.15rem]" fill="none">
                  <g transform="translate(0.9 -0.65)">
                    <path
                      d="M7.05 13.45c0-1.43 1.15-2.58 2.58-2.58h5.22c.66 0 1.29.29 1.72.79l1.2 1.4c.44.5 1.06.79 1.72.79h5.64c1.43 0 2.58 1.15 2.58 2.58v8.8c0 1.43-1.15 2.58-2.58 2.58H9.63c-1.43 0-2.58-1.15-2.58-2.58V13.45Z"
                      fill="#7fd0ff"
                      stroke="#050505"
                      strokeWidth="1.55"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7.05 16.75h20.66v8.47c0 1.43-1.15 2.58-2.58 2.58H9.63c-1.43 0-2.58-1.15-2.58-2.58v-8.47Z"
                      fill="#35a8ff"
                      stroke="#050505"
                      strokeWidth="1.55"
                      strokeLinejoin="round"
                    />
                    <path d="M11.8 20.5h6.8" stroke="#050505" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M25.3 9.15 29.75 16.85h-8.9l4.45-7.7Z" fill="#ffcf3d" stroke="#050505" strokeWidth="1.35" strokeLinejoin="round" />
                    <path d="M25.3 12.1v2" stroke="#050505" strokeWidth="1.25" strokeLinecap="round" />
                    <path d="M25.3 15.35h.01" stroke="#050505" strokeWidth="1.45" strokeLinecap="round" />
                  </g>
                </svg>
              </span>
              <p className="max-w-4xl text-[1.42rem] font-semibold leading-tight tracking-[-0.025em] text-neutral-950 sm:text-3xl">
                Where the Work Gets Stuck
              </p>
            </div>
            <p className="mt-7 max-w-none text-xl leading-relaxed text-neutral-800 sm:text-2xl">
              Most workflow problems start before the real work begins: vague requests, scattered files, missing context, and follow-ups living in too many places.
            </p>
            <p className="mt-6 max-w-none text-xl leading-relaxed text-neutral-800 sm:text-2xl">
              Instead of chasing updates across tools, threads, and memory, your team gets a single{" "}
              <span className="font-semibold text-[#005cb9]">workflow hub</span>: one place to see what matters, what&apos;s stuck, and what ships next.
            </p>
          </div>
        </div>
      </section>

      <section id="services" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="services-heading">
        <div className="mx-auto max-w-6xl">
          <h2 id="services-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
            Solutions
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {solutions.map((solution, index) => (
              <article
                key={solution.title}
                className="overflow-hidden rounded-[2rem] border border-neutral-200/80 bg-white/90 p-7 shadow-[0_16px_42px_rgba(15,23,42,0.07)] backdrop-blur sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <SolutionIcon tone={solution.tone} />
                  <div>
                    <h3 className="text-2xl font-bold tracking-[-0.02em] text-black">{solution.title}</h3>
                    <p className="mt-3 text-base font-medium leading-relaxed text-neutral-600 sm:text-lg">{solution.copy}</p>
                  </div>
                </div>
                {index === 0 ? (
                  <IntakePreview />
                ) : index === 1 ? (
                  <AssetsPreview />
                ) : index === 2 ? (
                  <NotesPreview />
                ) : index === 3 ? (
                  <PackagePreview />
                ) : (
                  <div className="mt-8 rounded-[1.35rem] border border-neutral-200 bg-[#f7f7f5] p-5">
                    <div className="space-y-3">
                      {[0, 1, 2].map((line) => (
                        <div key={line} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                          <span className="h-2.5 w-2.5 rounded-full border border-black bg-neutral-200" />
                          <span className="h-2.5 flex-1 rounded-full bg-neutral-200" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-20 text-white sm:px-8 sm:py-24 lg:px-10" aria-labelledby="profile-heading">
        <div className="mx-auto max-w-6xl">
          <h2 id="profile-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
            Where I Can Help
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-center text-balance text-xl font-semibold leading-relaxed text-white/78 sm:text-2xl">
            Problems usually pop up during handoffs, when inputs, follow-ups, repeated tasks, and tools stop fitting how the team really works.
          </p>
          <div className="mt-12 divide-y divide-white/12 rounded-[2rem] border border-white/12 bg-white/[0.03] px-5 sm:px-7">
            {helpAreas.map((area) => (
              <div key={area.title} className="grid gap-4 py-7 sm:grid-cols-[20rem_1fr] sm:items-center sm:gap-10">
                <div className="flex items-center gap-3">
                  <span className={`h-3.5 w-3.5 shrink-0 rounded-full border border-white/55 ${area.accent} ${area.glow}`} aria-hidden="true" />
                  <p className="text-2xl font-semibold leading-tight tracking-[-0.02em] sm:whitespace-nowrap sm:text-3xl">{area.title}</p>
                </div>
                <p className="text-lg font-semibold leading-relaxed text-white/62 sm:text-xl">{area.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="results" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="results-heading">
        <div className="mx-auto max-w-6xl">
          <h2 id="results-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
            Proof From Real Systems
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-center text-lg font-medium leading-relaxed text-neutral-600">
            Real examples of messy work turned into cleaner systems, with the before state, build path, and proof kept together.
          </p>
          <div className="mt-10">
            <ProofShowcase title="Course Video Migration" tabs={nurseHubProofTabs} />
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="method-heading">
        <div className="mx-auto max-w-5xl">
          <h2 id="method-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
            How The Audit Works
          </h2>
          <div className="mt-10 overflow-hidden rounded-[2rem] border border-neutral-200/80 bg-white/90 shadow-[0_16px_42px_rgba(15,23,42,0.065)] backdrop-blur">
            {methodSteps.map((step, index) => (
              <div key={step} className="grid grid-cols-[4rem_1fr] border-b border-neutral-200 p-6 last:border-b-0 sm:grid-cols-[6rem_1fr] sm:p-8">
                <p className="text-sm font-bold text-neutral-400">0{index + 1}</p>
                <p className="text-xl font-bold tracking-[-0.02em] sm:text-2xl">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-black px-6 py-20 text-center text-white sm:px-8 sm:py-24 lg:px-10" aria-labelledby="pricing-heading">
        <div className="mx-auto max-w-3xl">
          <h2 id="pricing-heading" className="text-4xl font-semibold tracking-normal sm:text-5xl">
            Ready for a free audit?
          </h2>
          <p className="mt-8 text-balance text-xl font-semibold leading-relaxed text-white/78 sm:text-2xl">
            Stop relying on your team to remember what the workflow should handle.
          </p>
          <p className="mt-4 text-lg font-semibold leading-relaxed text-white/72">
            Bring one messy recurring workflow. I&apos;ll help turn it into a clear system your team can use again and again.
          </p>
          <a
            href="#beta-audit"
            className="mt-10 inline-flex min-h-14 items-center justify-center rounded-full bg-white px-8 text-sm font-bold uppercase tracking-normal text-black transition hover:bg-neutral-200"
          >
            Request Free Audit
          </a>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-[#fbfbfb] px-6 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Image
              src="/singleton-systems-wordmark.svg"
              alt="Singleton Systems"
              width={660}
              height={260}
              className="h-auto w-44"
            />
            <p className="mt-4 max-w-xl text-base font-semibold leading-relaxed text-neutral-600">
              Workflow audits for operational teams that need clearer state, less repeated work, and cleaner systems around the tools they already use.
            </p>
          </div>
          <nav aria-label="Footer" className="grid gap-3 text-lg font-bold">
            <a href="#about" className="transition hover:text-neutral-500">
              About
            </a>
            <a href="#services" className="transition hover:text-neutral-500">
              Services
            </a>
            <a href="#results" className="transition hover:text-neutral-500">
              Results
            </a>
            <a href="#pricing" className="transition hover:text-neutral-500">
              Pricing
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
