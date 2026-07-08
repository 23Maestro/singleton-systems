"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { HighlightedCodeArtifactMap } from "@/lib/portfolio-code-artifact-types";

export type PortfolioTabTarget = "System" | "Workflow" | "AI Fit" | "Resume" | "Build Map";
export type PortfolioSlice = "Top" | "Bottom";
export type PortfolioVisualType = "Cards" | "Data Table" | "Flowchart" | "Review Panel" | "Diff View" | "Code Map";
export type SliceElementKind = "section" | "card" | "row" | "detail" | "action";

export type SliceElement = {
  id: string;
  label: string;
  eyebrow: string;
  body: string;
  before: string;
  after: string;
  route: string;
  kind: SliceElementKind;
};

export type EvidenceItem = {
  key: string;
  title: string;
  summary: string;
  problem: string;
  solution: string;
  result: string;
};

export type ProcessItem = {
  title: string;
  problem: string;
  solution: string;
  result: string;
};

export type SourceRouteItem = {
  key: string;
  title: string;
  source: string;
  linkLabel: string;
  inspect: string;
  result: string;
  href: string;
  previewImageSrc: string;
  previewImageAlt: string;
  previewImageWidth: number;
  previewImageHeight: number;
  previewFit?: "cover" | "contain";
  previewPosition?: "center" | "top" | "left-top";
  previewFrame?: "diagram" | "code" | "product";
  likec4ViewId?: string;
};

const likec4PortfolioFrameClass =
  "source-map-preview-frame static-likec4-artifact relative mx-auto w-full overflow-hidden rounded-[18px] bg-transparent";

const likec4ArtifactConfig: Record<string, { width: number; height: number; maxWidthClass: string }> = {
  ai_workflow_readme_map: {
    width: 1200,
    height: 1544,
    maxWidthClass: "max-w-[720px]",
  },
  scouting_coordinator_bucket_map: {
    width: 1600,
    height: 980,
    maxWidthClass: "max-w-[1040px]",
  },
  resume_timeline_map: {
    width: 1600,
    height: 980,
    maxWidthClass: "max-w-[1040px]",
  },
  review_first_implementation_loop: {
    width: 1600,
    height: 980,
    maxWidthClass: "max-w-[1040px]",
  },
};

const likec4ArtifactLabels: Record<string, string> = {
  ai_workflow_readme_map: "AI workflow portfolio README map",
  scouting_coordinator_bucket_map: "Scouting coordinator system map",
  resume_timeline_map: "Resume timeline map",
  review_first_implementation_loop: "Review-first implementation loop map",
};

function usePreloadLikeC4Artifacts() {
  useEffect(() => {
    const urls = Object.keys(likec4ArtifactConfig).flatMap((id) => [
      `/portfolio/likec4-static/light/${id}.svg`,
      `/portfolio/likec4-static/dark/${id}.svg`,
    ]);

    urls.forEach((src) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = src;
    });
  }, []);
}

export const tabTargets: PortfolioTabTarget[] = ["System", "Workflow", "AI Fit", "Resume", "Build Map"];
export const visualTypes: PortfolioVisualType[] = ["Cards", "Data Table", "Flowchart", "Review Panel", "Diff View", "Code Map"];

export const sliceOptionsByTab: Record<PortfolioTabTarget, PortfolioSlice[]> = {
  System: ["Top"],
  Workflow: ["Top", "Bottom"],
  "AI Fit": ["Top", "Bottom"],
  Resume: ["Bottom"],
  "Build Map": ["Top", "Bottom"],
};

export const defaultSliceByTab: Record<PortfolioTabTarget, PortfolioSlice> = {
  System: "Top",
  Workflow: "Top",
  "AI Fit": "Top",
  Resume: "Bottom",
  "Build Map": "Top",
};

export const sliceTitles: Record<PortfolioTabTarget, Record<PortfolioSlice, { title: string; lead: string; route: string }>> = {
  System: {
    Top: {
      title: "System View Cards",
      lead: "The three portfolio system cards above the divider: command surface, adapter, and reporting layer.",
      route: "components/AIWorkflowPortfolioCommand.tsx:SystemPanel > SystemTopSlice",
    },
    Bottom: {
      title: "System Workflow Panel",
      lead: "Locked out in the lab. System focuses on the top cards only.",
      route: "components/AIWorkflowPortfolioCommand.tsx:SystemPanel",
    },
  },
  Workflow: {
    Top: {
      title: "Evidence Diff Surface",
      lead: "The evidence list and git-diff readback area above the reporting divider.",
      route: "components/AIWorkflowPortfolioCommand.tsx:EvidencePanel > EvidenceTopSlice",
    },
    Bottom: {
      title: "Supabase Reports",
      lead: "The Supabase reporting table below the divider.",
      route: "components/AIWorkflowPortfolioCommand.tsx:EvidencePanel > EvidenceBottomSlice",
    },
  },
  "AI Fit": {
    Top: {
      title: "AI Specialist Cards",
      lead: "The data preparation, output review, and implementation support cards above the divider.",
      route: "components/AIWorkflowPortfolioCommand.tsx:FitPanel > AISpecialistTopSlice",
    },
    Bottom: {
      title: "Review-First Implementation Loop",
      lead: "The Gather, Classify, Draft, Review, Verify loop below the divider.",
      route: "components/AIWorkflowPortfolioCommand.tsx:FitPanel > AISpecialistBottomSlice",
    },
  },
  Resume: {
    Top: {
      title: "Resume Top Cards",
      lead: "Locked out in the lab. Resume focuses on the verification stack only.",
      route: "components/AIWorkflowPortfolioCommand.tsx:ResumePanel",
    },
    Bottom: {
      title: "Resume Details",
      lead: "The selectable resume verification stack below the divider.",
      route: "components/AIWorkflowPortfolioCommand.tsx:ResumePanel > ResumeBottomSlice",
    },
  },
  "Build Map": {
    Top: {
      title: "Build Map Cards",
      lead: "The build map cards above the divider.",
      route: "components/AIWorkflowPortfolioCommand.tsx:ProofMapPanel > SourceMapTopSlice",
    },
    Bottom: {
      title: "Review Route Panel",
      lead: "The route list and readback panel below the divider.",
      route: "components/AIWorkflowPortfolioCommand.tsx:ProofMapPanel > SourceMapBottomSlice",
    },
  },
};

export const evidenceData: EvidenceItem[] = [
  {
    key: "commands",
    title: "Commands Are Buttons",
    summary: "Repeated actions start from Raycast, so video tasks, scout prep, appointment work, and client messages can move faster.",
    problem: "Operators had to remember where the right athlete, task, message, and status lived inside the dashboard.",
    solution: "Raycast became the command surface. It starts the workflow, then domain modules decide what the action means.",
    result: "Repeated clicks became a smaller set of reviewable actions: Scout Prep, Set Meetings, Client Messages, and video workflow commands.",
  },
  {
    key: "adapter",
    title: "Legacy Adapter",
    summary: "Browser form behavior becomes direct local API calls with repeatable request shapes.",
    problem: "The source system worked through browser forms and session-bound dashboard behavior.",
    solution: "FastAPI translated that behavior into stable local calls with normalized IDs, payload handling, and readback checks.",
    result: "The workflow could be tested and repeated without rebuilding the same form mutation by hand.",
  },
  {
    key: "supabase",
    title: "Supabase Ownership",
    summary: "Appointments, lifecycle events, call logs, and video progress data stay in the right place.",
    problem: "Useful facts were mixed with UI state, support caches, and one-off reporting projections.",
    solution: "appointments, lifecycle_events, and call_log became the durable places for meeting, stage, and reporting truth.",
    result: "Prospect Web and audits could read the same reporting facts instead of trusting whatever a screen happened to show.",
  },
  {
    key: "audit",
    title: "Audit Before Cleanup",
    summary: "Checks confirm the reporting shape before cleanup changes what counts as truth.",
    problem: "Cleanup could break reporting if old projections were deleted before the new shape was proven.",
    solution: "Parity tests checked the projected call_log shape and read-only behavior before cleanup became real.",
    result: "The repo shows cleanup as a verified migration path, not a blind delete.",
  },
  {
    key: "repo",
    title: "Public Repo",
    summary: "400+ commits show a sustained workflow system, not a sample project.",
    problem: "A resume line alone cannot prove sustained system thinking.",
    solution: "The public repo shows one workflow system built through 400+ commits, docs, tests, and app surfaces.",
    result: "Reviewers can inspect the work instead of taking the claim on faith.",
  },
  {
    key: "web",
    title: "Prospect Web",
    summary: "Web views let cleaned data support review outside Raycast.",
    problem: "Raycast handled operator action, but reporting and mobile review needed a separate readable surface.",
    solution: "Prospect Web added mobile command views, call tracking, visual maps, and reporting screens on top of cleaned data.",
    result: "The workflow became reviewable outside the desktop command window.",
  },
  {
    key: "debug",
    title: "Debug Template",
    summary: "Repair work is documented as a repeatable checklist.",
    problem: "Legacy dashboard repairs can turn into one-off troubleshooting with no repeatable path.",
    solution: "The debug template captured request shape, IDs, browser constraints, and verification steps.",
    result: "Repair work became easier to repeat, review, and sanitize for public reference.",
  },
  {
    key: "tests",
    title: "Tests",
    summary: "Source-of-truth checks keep quick fixes from becoming business truth.",
    problem: "UI-local fixes can look correct while corrupting the source-of-truth contract.",
    solution: "Source-of-truth and parity checks lock the expected behavior around lifecycle, call-log, and cleanup paths.",
    result: "Changes have verification before they become business truth.",
  },
];

export const processData: ProcessItem[] = [
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
    solution: "Keep human review before mutation, sending, source-of-truth writes, or public-facing reference.",
    result: "The workflow stays responsible and business-relevant.",
  },
  {
    title: "Verify",
    problem: "A screen working once is not the same as a system being correct.",
    solution: "Use parity checks, readback, UI tests, or source review before treating the change as real.",
    result: "The final claim has evidence behind it.",
  },
];

export const resumeData = [
  ["LEAD CASE STUDY", "Prospect ID", "Built AI-assisted workflows for video tasks and appointment setting, connecting Raycast commands, API calls, task updates, reporting views, and operator support."],
  ["PRODUCTION SYSTEMS", "NurseHub", "Built repeatable course production folders and editing workflows to speed up full-course video assembly for the NurseHub YouTube channel."],
  ["EDUCATION", "Stetson + SPC", "Bachelor of Communications, Stetson University. Additional Computer Programming and Information Technology coursework at St. Petersburg College."],
  ["ROLE MATCH", "AI Specialist", "Hands-on AI workflow builder focused on practical adoption, automation support, documentation, testing, and cleaner business processes."],
] as const;

const resumeTimelineData = [
  {
    year: "2012",
    title: "Stetson University",
    meta: "Started at Stetson",
    body: "Started at Stetson University.",
  },
  {
    year: "2016",
    title: "Stetson University",
    meta: "Graduated",
    body: "Graduated from Stetson University.",
  },
  {
    year: "2021",
    title: "St. Petersburg College",
    meta: "Programming / IT",
    body: "Started computer programming and information technology coursework.",
  },
  {
    year: "2024",
    title: "Production Systems",
    meta: "NurseHub + Prospect ID",
    body: "Scaled repeatable video, course, and workflow delivery systems.",
  },
  {
    year: "2026",
    title: "AI Specialist Fit",
    meta: "Data prep / review / support",
    body: "Positioned practical AI workflow work around preparation, review, and implementation support.",
  },
] as const;

export const sourceRouteData: SourceRouteItem[] = [
  {
    key: "readme",
    title: "Command UI",
    source: "README",
    linkLabel: "Open README",
    inspect: "Raycast commands that start video tasks, appointment work, client messages, and scouting workflows from one command surface.",
    result: "Shows that commands were built as a practical control surface, not just described in prose.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/README.md",
    previewImageSrc: "/portfolio/source-map/readme-c4.png",
    previewImageAlt: "README C4 architecture map",
    previewImageWidth: 1200,
    previewImageHeight: 760,
    previewFit: "contain",
    previewPosition: "center",
    previewFrame: "diagram",
    likec4ViewId: "ai_workflow_readme_map",
  },
  {
    key: "map",
    title: "System Map",
    source: "ARCHITECTURE",
    linkLabel: "Open Architecture",
    inspect: "How meetings, tasks, client communication, athlete stages, outcomes, contacts, and video work connect across the workflow.",
    result: "Shows where workflow meaning lives before code or cleanup changes are made.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/docs/architecture/scouting-coordinator-system-map.md",
    previewImageSrc: "/portfolio/source-map/system-map-c4.png",
    previewImageAlt: "Scouting coordinator C4 bucket map",
    previewImageWidth: 1200,
    previewImageHeight: 760,
    previewFit: "contain",
    previewPosition: "center",
    previewFrame: "diagram",
    likec4ViewId: "scouting_coordinator_bucket_map",
  },
  {
    key: "supabase",
    title: "Source Rules",
    source: "SUPABASE CONTRACT",
    linkLabel: "Open Supabase contract",
    inspect: "Rules for keeping meeting data, status updates, call activity, and message support aligned across the team.",
    result: "Shows how durable reporting truth was separated from support state.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/docs/architecture/scout-prep-supabase-source-of-truth.md",
    previewImageSrc: "/portfolio/source-map/supabase-contract.png",
    previewImageAlt: "Supabase contract code artifact",
    previewImageWidth: 3680,
    previewImageHeight: 3656,
    previewFit: "contain",
    previewPosition: "top",
    previewFrame: "code",
  },
  {
    key: "adapter",
    title: "Website Bridge",
    source: "API TEMPLATE",
    linkLabel: "Open API template",
    inspect: "API call patterns that update the existing site directly, instead of repeating searches, page clicks, and manual status changes.",
    result: "Shows the old dashboard workflow becoming repeatable adapter work.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/docs/api-specs/legacy-assignment-debug-template.md",
    previewImageSrc: "/portfolio/source-map/legacy-api.svg",
    previewImageAlt: "Legacy API JSON adapter artifact",
    previewImageWidth: 1200,
    previewImageHeight: 760,
    previewFit: "contain",
    previewPosition: "top",
    previewFrame: "code",
  },
  {
    key: "audit",
    title: "Audit Checks",
    source: "PARITY TEST",
    linkLabel: "Open Parity test",
    inspect: "Checks that confirm reporting data is shaped correctly before cleanup, sync, or workflow changes.",
    result: "Shows cleanup protected by verification instead of broad deletion.",
    href: "https://github.com/23Maestro/prospect-pipeline/blob/main/scripts/audit-call-tracker-live-parity.test.mjs",
    previewImageSrc: "/portfolio/source-map/live-parity-test.svg",
    previewImageAlt: "Live parity test code artifact",
    previewImageWidth: 852,
    previewImageHeight: 644,
    previewFit: "contain",
    previewPosition: "top",
    previewFrame: "code",
  },
  {
    key: "web",
    title: "Always-On Web Tools",
    source: "PROSPECT WEB",
    linkLabel: "Open Prospect Web",
    inspect: "Mobile web views that let me keep working on the go: send confirmation texts, offer reschedule slots, update sales stages, and keep the team aligned.",
    result: "Shows the workflow becoming readable outside Raycast.",
    href: "https://github.com/23Maestro/prospect-pipeline/tree/main/apps/prospect-web",
    previewImageSrc: "/portfolio/source-map/prospect-web-enhanced.png",
    previewImageAlt: "Prospect Web command surface artifact",
    previewImageWidth: 1280,
    previewImageHeight: 1280,
    previewFit: "cover",
    previewPosition: "top",
    previewFrame: "product",
  },
];

const reportingRows = [
  ["Table", "Owner", "Write path", "What it verifies"],
  ["Booked Meetings", "Meeting workflow", "Set meeting actions", "Meetings can be found, checked, and confirmed"],
  ["Athlete Status Updates", "Stage tracking", "Post-call updates", "Sales Stage changes stay clear after each athlete or parent conversation"],
  ["Call History", "Reporting", "Audit checks", "Call activity can be reviewed before cleanup"],
  ["Message Support Notes", "Draft support", "Message helpers", "Notes can help with messages without becoming the main status record"],
];

const systemCards = [
  {
    id: "raycast-card",
    kicker: "COMMAND SURFACE",
    pill: "Action",
    title: "Raycast Command Menu",
    body: "A command center for video tasks, scouting workflows, messages, and appointment actions.",
    accent: "#ff6257",
    icon: "R",
    facts: ["Scout prep", "Set meetings", "Client messages", "Video workflow commands"],
  },
  {
    id: "adapter-card",
    kicker: "WORKFLOW SUPPORT",
    pill: "Adapter",
    title: "Website Workflow Bridge",
    body: "A powerful way to update tasks directly instead of repeating searches, clicks, and page changes.",
    accent: "#b86013",
    icon: "A",
    facts: ["Active login session", "Dynamic API calls", "Cleaner task updates", "Live site checks"],
  },
  {
    id: "truth-card",
    kicker: "REPORTING LAYER",
    pill: "Source",
    title: "Supabase Tracking Layer",
    body: "A cleaner place to track the workflow facts that need to stay reliable across video tasks and appointment work.",
    accent: "#25c266",
    icon: "S",
    facts: ["Appointments", "Status changes", "Call activity", "Video progress data"],
  },
];

const aiCards = [
  {
    id: "data-prep-card",
    kicker: "DATA PREPARATION",
    pill: "Gather",
    title: "Data Preparation",
    body: "Turned scattered workflow details into cleaner task, status, meeting, and reporting records.",
    accent: "#ff6257",
    icon: "D",
    facts: ["Workflow cleanup", "Status rules", "Reporting checks"],
  },
  {
    id: "output-review-card",
    kicker: "OUTPUT REVIEW",
    pill: "Evaluate",
    title: "Output Evaluation",
    body: "Used AI-assisted drafts and checked them against the real workflow, source data, and operator needs.",
    accent: "#25c266",
    icon: "O",
    facts: ["Prompt testing", "Human review", "Source checks"],
  },
  {
    id: "implementation-card",
    kicker: "IMPLEMENTATION",
    pill: "Support",
    title: "Implementation Support",
    body: "Built the workflow so it could be tested, explained, adjusted, and used inside daily operations.",
    accent: "#b86013",
    icon: "I",
    facts: ["Workflow mapping", "Command testing", "Process docs"],
  },
];

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function PortfolioCard({
  kicker,
  pill,
  title,
  body,
  accent,
  icon,
  facts,
  selected,
  onClick,
}: {
  kicker: string;
  pill: string;
  title: string;
  body: string;
  accent: string;
  icon: string;
  facts: string[];
  selected?: boolean;
  onClick?: () => void;
}) {
  const panelBackground = `linear-gradient(135deg, ${accent}12 0%, #ffffff 42%, #f8fafc 100%)`;
  const content = (
    <>
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-xl" style={{ backgroundColor: accent }} />
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 text-[11px] font-black text-white shadow-sm" style={{ backgroundColor: accent }}>
            {icon}
          </span>
          <p className="portfolio-top-card-kicker m-0 text-[13px] font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
            {kicker}
          </p>
        </div>
        <span className="portfolio-card-status rounded-full border border-[#d8e0ea] bg-white/80 px-2 py-0.5 text-[11px] font-black text-[#1f2937] shadow-sm">{pill}</span>
      </div>
      <h3 className="portfolio-top-card-title m-0 text-[22px] font-black leading-tight text-[#111318]">{title}</h3>
      <p className="portfolio-top-card-body mt-2 line-clamp-3 text-[17px] font-semibold leading-7 text-[#475467]">{body}</p>
      <ul className="portfolio-top-card-facts mt-4 list-disc space-y-1.5 border-t border-[#dfe6ef] pl-5 pt-3 text-[16px] font-bold leading-7 text-[#2f3746]">
        {facts.map((fact) => (
          <li key={fact}>
            {fact}
          </li>
        ))}
      </ul>
    </>
  );

  const className = cx(
    "portfolio-card-surface group relative flex min-h-[300px] w-full max-w-[400px] flex-col overflow-hidden rounded-[16px] border p-5 text-left shadow-[0_10px_20px_rgba(15,23,42,0.04)] transition duration-200",
    selected ? "portfolio-option-card-selected border-[#ef8a82]" : "border-[#dde3ec] hover:-translate-y-0.5 hover:border-[#c8d3e2] hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]",
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-pressed={selected} className={className} style={{ background: panelBackground }}>
        {content}
      </button>
    );
  }

  return (
    <section className={className} style={{ background: panelBackground }}>
      {content}
    </section>
  );
}

export function SystemTopSlice({ selectedId, onSelect }: { selectedId?: string; onSelect?: (id: string) => void }) {
  return (
    <div className="grid justify-items-center gap-5 sm:grid-cols-2 lg:flex lg:justify-center lg:gap-8">
      {systemCards.map((card) => (
        <PortfolioCard key={card.id} {...card} selected={selectedId === card.id} onClick={onSelect ? () => onSelect(card.id) : undefined} />
      ))}
    </div>
  );
}

export function EvidenceTopSlice({ selectedKey, onSelect }: { selectedKey: string; onSelect: (key: string) => void }) {
  const selected = evidenceData.find((item) => item.key === selectedKey) ?? evidenceData[0];

  return (
    <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-[minmax(0,680px)_minmax(0,1fr)]">
      <div className="min-w-0 overflow-visible bg-transparent p-0">
        <div className="grid gap-2 sm:grid-cols-2">
          {evidenceData.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={item.key === selectedKey}
              onClick={() => onSelect(item.key)}
              className={cx(
                "portfolio-card-surface grid min-h-[112px] w-full gap-1 rounded-[11px] border px-3 py-3 text-left transition-[background-color,border-color,box-shadow,opacity] duration-200",
                item.key === selectedKey ? "portfolio-option-card-selected border-[#ef8a82] bg-[#fff8f7]" : "border-[#e1e5eb] bg-white hover:bg-[#f8fafc]",
              )}
            >
              <strong className="portfolio-top-card-title text-[17px] font-black leading-tight text-[#1e2736]">{item.title}</strong>
              <span className="portfolio-top-card-body portfolio-muted-copy line-clamp-3 text-[15px] leading-6 text-[#475467]">{item.summary}</span>
            </button>
          ))}
        </div>
      </div>

      <GitDiffPanel selected={selected} />
    </div>
  );
}

export function GitDiffPanel({ selected }: { selected: EvidenceItem }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[16px] border border-[#d8e2ef] bg-[#0d1117] text-[#c9d1d9] shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
      <div className="flex items-center gap-3 border-b border-[#30363d] bg-[#161b22] px-4 py-2.5">
        <span className="text-[12px] font-mono font-medium text-[#8b949e]">a/{selected.key}.ts b/{selected.key}.ts</span>
      </div>
      <div className="flex-1 p-4 text-[13px] font-mono leading-6">
        <div className="mb-2 text-[#8b949e]">@@ -1,3 +1,3 @@</div>
        <DiffLine marker="-" tone="remove">{selected.problem}</DiffLine>
        <DiffLine marker="+" tone="add">{selected.solution}</DiffLine>
        <DiffLine marker="+" tone="add">{selected.result}</DiffLine>
      </div>
      <div className="flex items-center justify-between border-t border-[#30363d] bg-[#161b22] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
        <span>Verification: {selected.title}</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#3fb950]" /> Verified</span>
      </div>
    </div>
  );
}

function DiffLine({ marker, tone, children }: { marker: string; tone: "add" | "remove"; children: ReactNode }) {
  return (
    <div className={cx("mb-1 flex rounded-sm px-2 py-0.5 text-[#24292f]", tone === "add" ? "bg-[#e6ffec]" : "bg-[#ffebe9]")}>
      <span className={cx("w-6 shrink-0 select-none", tone === "add" ? "text-[#1a7f37]" : "text-[#cf222e]")}>{marker}</span>
      <span>{children}</span>
    </div>
  );
}

function LikeC4Artifact({ viewId, stableFrame = false }: { viewId: string; stableFrame?: boolean }) {
  usePreloadLikeC4Artifacts();

  const config = likec4ArtifactConfig[viewId] ?? {
    width: 1600,
    height: 980,
    maxWidthClass: "max-w-[1040px]",
  };
  const label = likec4ArtifactLabels[viewId] ?? "LikeC4 architecture map";
  const lightSrc = `/portfolio/likec4-static/light/${viewId}.svg`;
  const darkSrc = `/portfolio/likec4-static/dark/${viewId}.svg`;
  const image = (
    <picture className="block h-full w-full">
      <source srcSet={darkSrc} media="(prefers-color-scheme: dark)" />
      <img
        src={lightSrc}
        alt={label}
        width={config.width}
        height={config.height}
        className={cx("h-full w-full", stableFrame ? "object-contain" : "object-cover")}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );

  if (stableFrame) {
    return (
      <section
        className="source-map-preview-frame portfolio-artifact-surface static-likec4-artifact relative mx-auto flex h-[460px] min-h-[460px] w-full max-w-[1040px] items-center justify-center overflow-hidden rounded-[18px] border border-[#dfe7f1] bg-white p-3 md:h-[560px] md:min-h-[560px] md:p-5"
        aria-live="polite"
        data-likec4-artifact={viewId}
      >
        <div
          key={viewId}
          className={`${config.maxWidthClass} source-map-likec4-layer h-full w-full animate-[sourceMapPreviewFade_220ms_ease-out]`}
          style={{ aspectRatio: `${config.width} / ${config.height}` }}
        >
          {image}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${likec4PortfolioFrameClass} ${config.maxWidthClass}`}
      style={{ aspectRatio: `${config.width} / ${config.height}` }}
      aria-live="polite"
      data-likec4-artifact={viewId}
    >
      <div key={viewId} className="source-map-likec4-layer h-full w-full animate-[sourceMapPreviewFade_220ms_ease-out]">
        {image}
      </div>
    </section>
  );
}

export function EvidenceBottomSlice() {
  const [header, ...rows] = reportingRows;

  return (
    <section className="portfolio-artifact-surface mx-auto w-full max-w-[880px] overflow-hidden rounded-[18px] border border-[#dfe7f1] bg-white shadow-[0_18px_52px_rgba(15,23,42,0.09)]">
      <div className="portfolio-artifact-header grid gap-2 border-b border-[#e2e8f0] bg-[#fbfdff] px-4 py-3 md:grid-cols-[minmax(0,240px)_1fr] md:items-center md:px-5">
        <strong className="text-[16px] font-black leading-tight text-[#111318]">Supabase reporting shape</strong>
        <span className="portfolio-muted-copy max-w-[520px] text-[14px] font-bold leading-relaxed text-[#667085]">Important workflow facts stay separate from temporary command data and message support.</span>
      </div>
      <div className="p-3 md:p-4">
        <div className="portfolio-artifact-surface overflow-hidden rounded-[12px] border border-[#e1e7f0] bg-white">
          <table className="w-full min-w-0 table-fixed border-collapse text-left text-[11px] leading-snug sm:min-w-[720px] sm:text-[14px] sm:leading-relaxed">
            <caption className="sr-only">Supabase reporting source-of-truth verification table</caption>
            <colgroup>
              <col className="w-[27%] sm:w-[24%]" />
              <col className="w-[22%] sm:w-[20%]" />
              <col className="w-[21%] sm:w-[20%]" />
              <col className="w-[30%] sm:w-[36%]" />
            </colgroup>
            <thead className="bg-[#eef4fc] text-[#20304a]">
              <tr>
                {header.map((cell) => (
                  <th key={cell} scope="col" className="break-words border-b border-[#dce5f0] px-1.5 py-2 font-black sm:px-3 sm:py-3">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[#303746]">
              {rows.map((row) => (
                <tr key={row[0]} className="border-t border-[#e6ebf2]">
                  {row.map((cell, cellIndex) => (
                    <td key={cell} className={cx("break-words align-top px-1.5 py-2 sm:px-3 sm:py-3", cellIndex === 0 ? "font-black text-[#172033]" : "font-semibold text-[#465062]")}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function AISpecialistTopSlice({ selectedId, onSelect }: { selectedId?: string; onSelect?: (id: string) => void }) {
  return (
    <div className="grid justify-items-center gap-5 sm:grid-cols-2 lg:flex lg:justify-center lg:gap-8">
      {aiCards.map((card) => (
        <PortfolioCard key={card.id} {...card} selected={selectedId === card.id} onClick={onSelect ? () => onSelect(card.id) : undefined} />
      ))}
    </div>
  );
}

export function AISpecialistBottomSlice() {
  return <LikeC4Artifact viewId="review_first_implementation_loop" />;
}

export function ResumeBottomSlice() {
  return <LikeC4Artifact viewId="resume_timeline_map" />;
}

function CodeArtifactPreview({
  artifact,
}: {
  artifact: NonNullable<HighlightedCodeArtifactMap[string]>;
}) {
  const tone =
    artifact.key === "supabase"
      ? {
          label: "json",
          codeLight: "#8f4b24",
          codeDark: "#c76f43",
          badge: "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]",
        }
      : artifact.key === "adapter"
        ? {
            label: "json",
            codeLight: "#8f4b24",
            codeDark: "#c76f43",
            badge: "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]",
          }
        : {
            label: "test",
            codeLight: "#0f766e",
            codeDark: "#64d6c5",
            badge: "border-[#99f6e4] bg-[#f0fdfa] text-[#0f766e]",
          };

  return (
    <section className="source-map-preview-frame relative mx-auto h-[430px] min-h-[430px] w-full max-w-[1040px] overflow-hidden bg-transparent" aria-live="polite">
      <div key={artifact.key} className="absolute inset-0 flex animate-[sourceMapPreviewFade_240ms_ease-out] items-center justify-center p-4 md:p-6">
        <div className="portfolio-code-artifact-shell flex h-full max-h-[350px] w-full max-w-[720px] flex-col overflow-hidden rounded-[18px] border shadow-[0_18px_52px_rgba(15,23,42,0.09)]">
          <div className="portfolio-code-artifact-header grid h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b px-4">
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-[#cbd5e1]" />
              <span className="h-3 w-3 rounded-full bg-[#cbd5e1]" />
              <span className="h-3 w-3 rounded-full bg-[#cbd5e1]" />
            </div>
            <strong className="portfolio-code-artifact-title text-[13px] font-black">{artifact.title}</strong>
            <span className={`justify-self-end rounded-md border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${tone.badge}`}>
              {tone.label}
            </span>
          </div>
          <div className="relative min-h-0 flex-1">
            <div
              className="code-artifact-body h-full overflow-hidden px-3.5 py-3 pb-12 md:px-5 md:py-4"
              style={{ "--artifact-code-light": tone.codeLight, "--artifact-code-dark": tone.codeDark } as CSSProperties}
              dangerouslySetInnerHTML={{ __html: artifact.html }}
            />
            <div className="portfolio-code-artifact-fade pointer-events-none absolute inset-x-px bottom-px h-14" aria-hidden="true" />
          </div>
        </div>
      </div>
      <style jsx>{`
        .code-artifact-body :global(pre) {
          margin: 0;
          min-width: 0;
          background: transparent !important;
          color: var(--artifact-code) !important;
          font-size: 11.5px;
          line-height: 1.52;
          font-weight: 700;
          letter-spacing: 0;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
        .code-artifact-body :global(span[style]) {
          color: var(--artifact-code) !important;
        }
        .code-artifact-body :global(code) {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        }
        @media (min-width: 768px) {
          .code-artifact-body :global(pre) {
            font-size: 12.5px;
          }
        }
        @keyframes sourceMapPreviewFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}

export function SourceMapTopSlice({ selectedId, onSelect }: { selectedId?: string; onSelect?: (id: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sourceRouteData.map((route) => {
        const className = cx(
          "portfolio-card-surface relative rounded-[14px] border bg-white p-3.5 text-left shadow-[0_12px_28px_rgba(15,23,42,0.045)] transition-[background-color,border-color,box-shadow,opacity] duration-200",
          selectedId === route.key ? "portfolio-option-card-selected border-[#ef8a82]" : "border-[#e4e8ef]",
        );
        const content = (
          <>
            <p className="portfolio-top-card-kicker source-map-card-kicker mb-2 text-[13px] font-black uppercase tracking-[0.16em] text-[#e5484d]">{route.source}</p>
            <h3 className="portfolio-top-card-title m-0 mb-1.5 text-[20px] font-black leading-tight text-[#111318]">{route.title}</h3>
            <p className="portfolio-top-card-body portfolio-muted-copy m-0 text-[15px] font-semibold leading-6 text-[#475467]">{route.inspect}</p>
          </>
        );

        if (onSelect) {
          return (
            <section key={route.key} className={className}>
              <button type="button" aria-pressed={selectedId === route.key} onClick={() => onSelect(route.key)} className="block w-full text-left">
                {content}
              </button>
              <a className="mt-2 inline-flex min-h-[26px] items-center text-[12px] font-extrabold text-[#2383e2] hover:underline" href={route.href}>
                {route.linkLabel}
              </a>
            </section>
          );
        }

        return (
          <section key={route.key} className={className}>
            {content}
            <a className="mt-2 inline-flex min-h-[26px] items-center text-[12px] font-extrabold text-[#2383e2] hover:underline" href={route.href}>
              {route.linkLabel}
            </a>
          </section>
        );
      })}
    </div>
  );
}

export function SourceMapBottomSlice({
  selectedKey,
  codeArtifacts,
}: {
  selectedKey: string;
  onSelect?: (key: string) => void;
  codeArtifacts?: HighlightedCodeArtifactMap;
}) {
  const selected = sourceRouteData.find((route) => route.key === selectedKey) ?? sourceRouteData[0];
  if (selected.likec4ViewId) {
    return <LikeC4Artifact viewId={selected.likec4ViewId} stableFrame />;
  }

  const codeArtifact = selected.previewFrame === "code" ? codeArtifacts?.[selected.key] : undefined;
  if (codeArtifact) {
    return <CodeArtifactPreview artifact={codeArtifact} />;
  }

  const frameClass = cx(
    "source-map-preview-frame portfolio-artifact-surface relative mx-auto w-full overflow-hidden rounded-[18px] border border-[#dfe7f1] bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)]",
    selected.previewFrame === "product"
      ? "max-w-[900px] aspect-[1.2/1] md:aspect-[1.42/1]"
      : selected.previewFrame === "diagram"
        ? "max-w-[860px] aspect-[1.58/1]"
        : "max-w-[820px] aspect-[1.34/1] md:aspect-[1.54/1]",
  );
  const imagePositionClass =
    selected.previewPosition === "left-top" ? "object-left-top" : selected.previewPosition === "top" ? "object-top" : "object-center";

  return (
    <section className={frameClass} aria-live="polite">
      <div key={selected.key} className="absolute inset-0 origin-center">
        <Image
          src={selected.previewImageSrc}
          alt={selected.previewImageAlt}
          width={selected.previewImageWidth}
          height={selected.previewImageHeight}
          sizes="(min-width: 900px) 900px, 100vw"
          className={cx(
            "h-full w-full animate-[sourceMapPreviewFade_240ms_ease-out]",
            selected.previewFit === "cover" ? "object-cover" : "object-contain",
            imagePositionClass,
          )}
        />
      </div>
      <div className="source-map-preview-blur" aria-hidden="true" />
      <style jsx>{`
        .source-map-preview-blur {
          position: absolute;
          inset: auto 0 0;
          height: 10%;
          pointer-events: none;
          background: linear-gradient(to top, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0));
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
          -webkit-mask-image: linear-gradient(to top, #000 8%, transparent 100%);
          mask-image: linear-gradient(to top, #000 8%, transparent 100%);
        }
        @keyframes sourceMapPreviewFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}

export function getSliceElements(tab: PortfolioTabTarget, slice: PortfolioSlice): SliceElement[] {
  if (tab === "System") {
    return systemCards.map((card) => ({
      id: card.id,
      label: card.title,
      eyebrow: card.kicker,
      body: card.body,
      before: "The lab used mock cards instead of the real system card section.",
      after: `Render the real ${card.title} card from the portfolio top slice.`,
      route: "components/AIWorkflowPortfolioCommand.tsx:SystemPanel > SystemTopSlice",
      kind: "card" as const,
    }));
  }

  if (tab === "Workflow" && slice === "Top") {
    return evidenceData.map((item) => ({
      id: item.key,
      label: item.title,
      eyebrow: "Evidence diff",
      body: item.summary,
      before: item.problem,
      after: `${item.solution} ${item.result}`,
      route: "components/AIWorkflowPortfolioCommand.tsx:EvidencePanel > EvidenceTopSlice",
      kind: "row" as const,
    }));
  }

  if (tab === "Workflow") {
    return reportingRows.slice(1).map((row) => ({
      id: row[0],
      label: row[0],
      eyebrow: row[1],
      body: row[3],
      before: "Command state, support cache, and reporting truth were blended in one preview.",
      after: `Use ${row[0]} as a separate reporting truth row with owner ${row[1]}.`,
      route: "components/AIWorkflowPortfolioCommand.tsx:EvidencePanel > EvidenceBottomSlice",
      kind: "row" as const,
    }));
  }

  if (tab === "AI Fit" && slice === "Top") {
    return aiCards.map((card) => ({
      id: card.id,
      label: card.title,
      eyebrow: card.kicker,
      body: card.body,
      before: "AI role fit appeared as generic AI surface language.",
      after: `Keep the real ${card.title} card and tune only this visual treatment.`,
      route: "components/AIWorkflowPortfolioCommand.tsx:FitPanel > AISpecialistTopSlice",
      kind: "card" as const,
    }));
  }

  if (tab === "AI Fit") {
    return processData.map((step) => ({
      id: step.title.toLowerCase(),
      label: step.title,
      eyebrow: "Implementation loop",
      body: step.solution,
      before: step.problem,
      after: step.result,
      route: "components/AIWorkflowPortfolioCommand.tsx:FitPanel > AISpecialistBottomSlice",
      kind: "row" as const,
    }));
  }

  if (tab === "Resume") {
    return resumeData.map(([eyebrow, title, body]) => ({
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label: title,
      eyebrow,
      body,
      before: "Resume support repeated the same evidence without a focused selection path.",
      after: `Use the verification stack to focus ${title} as the selected resume angle.`,
      route: "components/AIWorkflowPortfolioCommand.tsx:ResumePanel > ResumeBottomSlice",
      kind: "card" as const,
    }));
  }

  if (tab === "Build Map" && slice === "Top") {
    return sourceRouteData.map((route) => ({
      id: route.key,
      label: route.title,
      eyebrow: route.source,
      body: route.inspect,
      before: "Portfolio claim routing was represented by a mock map instead of the build map cards.",
      after: `Render the real ${route.title} build map card and route it to ${route.source}.`,
      route: "components/AIWorkflowPortfolioCommand.tsx:ProofMapPanel > SourceMapTopSlice",
      kind: "card" as const,
    }));
  }

  return sourceRouteData.map((route) => ({
    id: route.key,
    label: route.title,
    eyebrow: "Review route",
    body: route.inspect,
    before: "Claim copy was detached from the reviewable source readback.",
    after: route.result,
    route: "components/AIWorkflowPortfolioCommand.tsx:ProofMapPanel > SourceMapBottomSlice",
    kind: "detail" as const,
  }));
}

export function SliceRawPreview({
  tab,
  slice,
  selectedId,
  onSelect,
}: {
  tab: PortfolioTabTarget;
  slice: PortfolioSlice;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (tab === "System") return <SystemTopSlice selectedId={selectedId} onSelect={onSelect} />;
  if (tab === "Workflow" && slice === "Top") return <EvidenceTopSlice selectedKey={selectedId} onSelect={onSelect} />;
  if (tab === "Workflow") return <EvidenceBottomSlice />;
  if (tab === "AI Fit" && slice === "Top") return <AISpecialistTopSlice selectedId={selectedId} onSelect={onSelect} />;
  if (tab === "AI Fit") return <AISpecialistBottomSlice />;
  if (tab === "Resume") return <ResumeBottomSlice />;
  if (tab === "Build Map" && slice === "Top") return <SourceMapTopSlice selectedId={selectedId} onSelect={onSelect} />;
  return <SourceMapBottomSlice selectedKey={selectedId} onSelect={onSelect} />;
}
