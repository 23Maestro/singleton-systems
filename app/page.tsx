import Image from "next/image";
import Link from "next/link";
import {
  Check,
  CheckCircle,
  ClipboardText,
  Clock,
  CursorClick,
  Microphone,
  NotePencil,
  PaperPlaneTilt,
  Signpost,
  Timer,
  TrendUp,
  VideoCamera,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import BookQuickChatButton from "@/components/BookQuickChatButton";
import PortfolioVideoCarousel from "@/components/PortfolioVideoCarousel";
import type { AiWorkflowOffer } from "@/lib/ai-workflow-offers";
import { founderName, serviceDescription, serviceName, siteDescription, siteName, siteUrl } from "./site";

const AI_WORKFLOW_SESSION_URL = "/ai-workflow-session";
const CAL_URL = "https://cal.com/workflow-chat/15min";

function offerUrl(offer: AiWorkflowOffer) {
  return `${AI_WORKFLOW_SESSION_URL}?offer=${offer}`;
}

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: founderName,
    url: siteUrl,
    jobTitle: "AI Workflow Consultant",
    worksFor: {
      "@id": `${siteUrl}/#organization`,
    },
    knowsAbout: [
      "AI workflow consulting",
      "AI-assisted workflow systems",
      "video production workflows",
      "Premiere Pro workflow systems",
      "Notion workflow dashboards",
      "course video migration",
      "sports recruiting video operations",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    url: siteUrl,
    founder: {
      "@id": `${siteUrl}/#person`,
    },
    description: siteDescription,
    logo: `${siteUrl}/brand/ssystems-logo-wordmark-black-2640x1040.png`,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteUrl}/#service`,
    name: serviceName,
    serviceType: "AI workflow consulting",
    provider: {
      "@id": `${siteUrl}/#organization`,
    },
    areaServed: "United States",
    description: serviceDescription,
    audience: {
      "@type": "Audience",
      audienceType: "creators, coaches, course teams, small teams, and service businesses",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "What does Singleton Systems do?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Singleton Systems helps creators, coaches, small teams, and service businesses turn messy recurring workflows into cleaner reusable systems.",
        },
      },
      {
        "@type": "Question",
        name: "Does Singleton Systems work with video teams?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. AI video workflow consulting can cover Premiere Pro editing pipelines, footage organization, course video migrations, review links, delivery systems, and repeatable production handoffs.",
        },
      },
      {
        "@type": "Question",
        name: "Does Singleton Systems build AI workflows?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, when AI fits the real workflow. Practical AI-assisted steps can help summarize, sort, route, prep review, and turn messy inputs into usable next actions.",
        },
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${siteUrl}/#recruiting-ops-video`,
    name: "Recruiting Ops Command Center workflow preview",
    description: "A workflow preview showing how athlete video work moved through lookup, review, follow-up, and delivery without losing status.",
    thumbnailUrl: `${siteUrl}/portfolio-2-ssystems-poster.jpg`,
    contentUrl: `${siteUrl}/portfolio-2-ssystems.mp4`,
    uploadDate: "2026-07-02",
  },
];

const solutions = [
  {
    title: "Show Me What Takes Too Long",
    copy: "Send a note, voice memo, or Loom showing how you do it now.",
    tone: "blue",
  },
  {
    title: "See Where to Start",
    copy: "I review what you send and come to the call with 1-2 AI fixes built around the way you work.",
    tone: "yellow",
  },
  {
    title: "Choose What Happens Next",
    copy: "Take the plan and do it yourself, or have me build it for you.",
    tone: "coral",
  },
  {
    title: "Keep Making Things Easier",
    copy: "See what changed and the time it saves. Stop there, or keep me around for the next fix.",
    tone: "green",
  },
] as const;

function SolutionIcon({ tone }: { tone: (typeof solutions)[number]["tone"] }) {
  const classes = {
    blue: "bg-black",
    yellow: "bg-[#ffc83d]",
    coral: "bg-[#ff6257]",
    green: "bg-[#25c266]",
  }[tone];
  const sizeClass = "h-14 w-14 sm:h-16 sm:w-16";
  const svgSizeClass = "h-8 w-8 sm:h-9 sm:w-9";
  const Icon = {
    blue: Timer,
    yellow: Signpost,
    coral: CursorClick,
    green: TrendUp,
  }[tone];

  return (
    <span className={`inline-flex ${sizeClass} shrink-0 items-center justify-center rounded-full border-2 border-black ${classes}`}>
      <Icon className={`${svgSizeClass} ${tone === "blue" ? "text-white" : "text-black"}`} weight="bold" aria-hidden="true" />
    </span>
  );
}

function IntakeTabIcon({ tab }: { tab: "Note" | "Voice memo" | "Loom" }) {
  const Icon = tab === "Note" ? NotePencil : tab === "Voice memo" ? Microphone : VideoCamera;
  const color = tab === "Note" ? "bg-[#22c7c8]" : tab === "Voice memo" ? "bg-[#ffc83d]" : "bg-[#22c86a]";

  return (
    <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.35px] border-black ${color}`} aria-hidden="true">
      <Icon className="h-3.5 w-3.5 text-black" weight="bold" />
    </span>
  );
}

function IntakeRowIcon({ title }: { title: "What takes too long?" | "How do you do it now?" | "What do you use?" | "What would feel easier?" }) {
  const Icon = title === "What takes too long?" ? Clock : title === "How do you do it now?" ? ClipboardText : title === "What do you use?" ? Wrench : CheckCircle;
  return <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-600" weight="bold" aria-hidden="true" />;
}

function IntakePreview() {
  const tabs = ["Note", "Voice memo", "Loom"] as const;
  const rows = [
    ["What takes too long?", "The thing you want to make easier"],
    ["How do you do it now?", "Show the steps you follow today"],
    ["What do you use?", "The apps, files, or messages involved"],
    ["What would feel easier?", "Tell me what you want off your plate"],
  ] as const;

  return (
    <div className="-mb-7 -mr-7 mt-8 flex flex-col overflow-hidden rounded-l-[1.35rem] border-y border-l border-neutral-200 bg-[#f7f7f5] px-4 pb-0 pt-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:-mb-8 sm:-mr-8 sm:px-5 lg:min-h-[455px] lg:flex-1">
      <div className="flex justify-end pr-1 sm:pr-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-[0_8px_20px_rgba(15,23,42,0.11)]">
          <svg viewBox="0 0 18 18" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6.8" fill="#f7f7f5" stroke="#050505" strokeWidth="1.4" />
            <path d="M9 5.5v7M5.5 9h7" stroke="#050505" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          Show me your task
        </span>
      </div>
      <div className="-mr-4 ml-1 mt-10 flex-1 rounded-tl-[1.1rem] border-l border-t border-neutral-200 bg-white shadow-[0_18px_36px_rgba(15,23,42,0.08)] sm:-mr-5 sm:ml-2">
        <div className="px-5 pt-5 text-base font-semibold text-neutral-600">4 quick answers</div>
        <div className="relative mt-4 grid grid-cols-3 border-b-2 border-neutral-200 text-sm font-bold text-neutral-800">
          <span className="absolute bottom-[-2px] left-0 h-0.5 w-1/3 bg-black" aria-hidden="true" />
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
                <p className="text-base font-bold tracking-[-0.02em] text-neutral-950">{title}</p>
                <p className="mt-0.5 text-base font-medium leading-relaxed text-neutral-600">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssetsPreview() {
  const tabs = ["Option 1", "Option 2", "Start here"] as const;
  const rows = [
    ["First AI fix", "Fix the task costing you the most time", "Option 1", "bg-[#dbeafe] text-[#075985] border-[#93c5fd]"],
    ["Second AI fix", "Take another repeated task off your plate", "Option 2", "bg-[#fee2e2] text-[#9f1239] border-[#fca5a5]"],
    ["My pick", "Where I’d start", "Start here", "bg-[#dcfce7] text-[#166534] border-[#86efac]"],
  ] as const;

  return (
    <div className="-mx-7 -mb-7 mt-8 flex h-[600px] flex-col overflow-hidden rounded-b-[1.75rem] bg-[#efefec] px-3 pb-0 pt-7 max-[359px]:h-[650px] sm:-mx-8 sm:-mb-8 sm:h-[560px] sm:px-4 lg:flex-1">
      <div className="mx-auto flex w-full max-w-[420px] justify-end sm:max-w-[480px]">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-[0_8px_20px_rgba(15,23,42,0.11)]">
          <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6.7" stroke="#050505" strokeWidth="1.5" />
            <path d="m6.1 9.2 1.9 1.9 4-4.3" stroke="#050505" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Your options are ready
        </span>
      </div>
      <div className="mx-auto mt-8 flex w-full max-w-[420px] flex-1 flex-col overflow-hidden rounded-t-2xl border border-b-0 border-neutral-200 bg-white shadow-[0_18px_36px_rgba(15,23,42,0.08)] sm:max-w-[480px]">
        <div className="relative mt-5 grid grid-cols-3 border-b-2 border-neutral-200 text-sm font-bold text-neutral-800">
          <span className="absolute bottom-[-2px] left-0 h-0.5 w-1/3 bg-black" aria-hidden="true" />
          {tabs.map((tab, index) => (
            <div key={tab} className="min-w-0 overflow-hidden px-1 pb-3 sm:px-3">
              <div className={`flex min-w-0 items-center justify-center gap-1 whitespace-nowrap ${index === 0 ? "pl-1.5 sm:pl-2" : ""}`}>
                <svg viewBox="0 0 18 18" className="h-3.5 w-3.5 shrink-0 text-neutral-800" fill="none" aria-hidden="true">
                  {index < 2 ? (
                    <>
                      <circle cx="9" cy="9" r="6.2" stroke="currentColor" strokeWidth="1.5" />
                      <text x="9" y="11.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor">{index + 1}</text>
                    </>
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
            <div key={title} className="grid grid-cols-[1rem_1fr_auto] items-center gap-3 py-3 max-[359px]:grid-cols-[1rem_1fr]">
              <svg viewBox="0 0 18 18" className="h-4 w-4 shrink-0 text-neutral-600" fill="none" aria-hidden="true">
                <path d="M3.2 4.2h11.6v9.6H3.2V4.2Zm2.4 3h6.8M5.6 10h4.8" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="min-w-0">
                <p className="text-base font-bold tracking-[-0.02em] text-neutral-950">{title}</p>
                <p className="mt-0.5 text-base font-medium leading-snug text-neutral-600">{copy}</p>
              </div>
              <span className={`rounded-md border px-2 py-1 text-sm font-bold leading-none max-[359px]:col-start-2 max-[359px]:justify-self-start ${statusClassName}`}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotesTabIcon({ tab }: { tab: "Your plan" | "I’ll do it" | "Build it for me" }) {
  const Icon = tab === "Your plan" ? ClipboardText : tab === "I’ll do it" ? CheckCircle : Wrench;
  return <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" weight="bold" aria-hidden="true" />;
}

function NotesPreview() {
  const tabs = ["Your plan", "I’ll do it", "Build it for me"] as const;
  const rows = [
    ["I’ll do it", "Follow the steps and set it up yourself.", "Your choice", "bg-blue-100 text-blue-700", "task"],
    ["Build it for me", "I set it up and show you how it works.", "Built for you", "bg-green-100 text-green-700", "people"],
  ] as const;

  return (
    <div className="-mx-7 -mb-7 mt-8 flex h-[600px] justify-center overflow-hidden rounded-b-[1.75rem] bg-[#f55252] px-3 pt-8 max-[359px]:h-[680px] sm:-mx-8 sm:-mb-8 sm:h-[560px] sm:px-4">
      <div className="flex h-[585px] w-full max-w-[420px] flex-col gap-4 rounded-t-2xl bg-white p-6 shadow-2xl sm:h-[545px] sm:max-w-[480px]">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-neutral-200 p-2">
            <svg className="h-[18px] w-[18px] text-neutral-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5Z" />
            </svg>
          </div>
          <span className="rounded-md bg-neutral-100 px-3 py-1.5 text-base font-bold text-neutral-800">Your plan is ready</span>
        </div>

        <p className="text-base font-medium text-neutral-600">Choose what works for you.</p>

        <div className="grid grid-cols-3 gap-1 border-b border-neutral-100 pb-2 text-sm font-semibold leading-none">
          {tabs.map((tab) => (
            <span
              key={tab}
              className={`flex min-w-0 items-center justify-center gap-0.5 text-center max-[359px]:whitespace-normal sm:gap-1.5 ${
                tab === "Your plan" ? "relative z-10 -mb-[9px] border-b-2 border-black pb-2 text-black" : "text-neutral-600"
              }`}
            >
              <NotesTabIcon tab={tab} />
              {tab}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white" aria-hidden="true">
            <ClipboardText className="h-5 w-5" weight="bold" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-base font-bold text-neutral-950">The first step</span>
            <p className="mt-1 text-base font-medium text-neutral-600">Start with one small change.</p>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {rows.map(([title, copy, status, statusClassName, icon]) => (
            <div key={title} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-xl border border-neutral-100 bg-white px-3 py-4 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.045)] max-[359px]:grid-cols-[2rem_1fr]">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] ${icon === "task" ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"}`}
                aria-hidden="true"
              >
                {icon === "task" ? (
                  <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none">
                    <path d="M5.2 4.4h7.6v9.2H5.2V4.4Zm2.2 4.5 1.2 1.2 2.3-2.5" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none">
                    <path d="M6.5 8.2a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2Zm5 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM3.3 14c.4-2.2 1.5-3.3 3.2-3.3s2.8 1.1 3.2 3.3m.3-.5c.4-1.5 1.2-2.3 2.5-2.3 1.2 0 2.1.8 2.4 2.3" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold leading-tight text-neutral-800">{title}</p>
                <p className="mt-1 text-base font-medium leading-snug text-neutral-600">{copy}</p>
              </div>
              <span className={`rounded-md px-3 py-1.5 text-sm font-bold leading-none max-[359px]:col-start-2 max-[359px]:justify-self-start ${statusClassName}`}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PackagePreview() {
  const rows = [
    ["Check-ins", "Monthly", "bg-purple-100 text-purple-700"],
    ["Updates", "Covered", "bg-blue-100 text-blue-700"],
    ["Next AI fix", "Ready", "bg-green-100 text-green-700"],
  ] as const;

  return (
    <div className="-mx-7 -mb-7 mt-8 flex h-[760px] justify-center overflow-hidden rounded-b-[1.75rem] bg-[#4eba6b] px-3 pt-8 max-[359px]:h-[780px] sm:-mx-8 sm:-mb-8 sm:h-[500px] sm:px-4 lg:h-auto lg:min-h-[500px] lg:flex-1">
      <div className="relative h-full w-full max-w-[420px] sm:max-w-[500px]">
        <div className="absolute -left-5 bottom-0 right-14 top-0 overflow-hidden rounded-t-xl border border-neutral-100 bg-white p-5 shadow-sm max-[359px]:-left-3 max-[359px]:right-8 sm:-left-6 sm:right-16">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                aria-label="Step 1"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#25c266] text-[1.6rem] font-black leading-none text-white shadow-[0_0_14px_rgba(37,194,102,0.55)]"
                style={{ WebkitTextStroke: "1.15px black" }}
              >
                1
              </span>
              <span className="text-base font-bold text-neutral-900">Your progress</span>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-sm font-bold text-green-700">
              Easy to find <span className="text-green-500">✓</span>
            </span>
          </div>
          <p className="mb-5 pr-4 text-base leading-snug text-neutral-600">Keep your instructions and what we&apos;ve built in one place.</p>

          <ul className="space-y-4 text-base font-medium text-neutral-600">
            {[
              ["What changed", "check"],
              ["Time saved", "clock"],
              ["What worked", "notes"],
            ].map(([item, icon]) => (
              <li key={item} className="flex items-center gap-3">
                {icon === "check" ? (
                  <CheckCircle className="h-4 w-4 shrink-0" weight="bold" aria-hidden="true" />
                ) : icon === "clock" ? (
                  <Clock className="h-4 w-4 shrink-0" weight="bold" aria-hidden="true" />
                ) : (
                  <ClipboardText className="h-4 w-4 shrink-0" weight="bold" aria-hidden="true" />
                )}
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute bottom-0 left-1 -right-5 z-10 h-[360px] rounded-t-2xl border border-neutral-100 bg-white p-5 shadow-2xl max-[359px]:left-0 max-[359px]:-right-4 sm:left-44 sm:-right-8 sm:h-[360px]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                aria-label="Step 2"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#25c266] text-[1.6rem] font-black leading-none text-white shadow-[0_0_14px_rgba(37,194,102,0.55)]"
                style={{ WebkitTextStroke: "1.15px black" }}
              >
                2
              </span>
              <span className="text-base font-bold text-neutral-900">Next up</span>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-sm font-bold text-green-700">
              Ready when you are <span className="text-green-500">✓</span>
            </span>
          </div>

          <p className="mb-4 border-b border-neutral-100 pb-2 text-sm font-semibold uppercase tracking-wide text-neutral-600">Keep going</p>

          <div className="flex flex-col gap-4">
            {rows.map(([title, status, statusClassName]) => (
              <div key={title} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 text-sm sm:gap-2">
                <div className="flex min-w-0 items-center gap-3 font-semibold text-neutral-800">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-green-500 text-xs leading-none text-white">✓</div>
                  <span className="min-w-0 text-base leading-tight">{title}</span>
                </div>
                <span className={`shrink-0 rounded-md px-2 py-1 text-[13px] font-bold sm:text-sm ${statusClassName}`}>{status}</span>
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
    <main className="overflow-x-clip bg-[#fbfbfb] text-[#080808]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-7 py-8 sm:px-8 lg:px-10">
        <a href="#start" className="block w-24 sm:w-28" aria-label="Singleton Systems home">
          <Image
            src="/singleton-systems-wordmark.svg"
            alt="Singleton Systems"
            width={660}
            height={260}
            priority
            className="h-auto w-full"
          />
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-5 text-xs font-semibold text-neutral-600 md:flex lg:gap-7 lg:text-sm">
          <a className="transition hover:text-black" href="#start">
            Start
          </a>
          <Link className="transition hover:text-black" href="/links">
            Links
          </Link>
          <a className="transition hover:text-black" href="#what-i-fix">
            What I Fix
          </a>
          <a className="transition hover:text-black" href="#portfolio">
            Portfolio
          </a>
          <a className="transition hover:text-black" href="#offers">
            Pricing
          </a>
        </nav>
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
            <a href="#start">Start</a>
            <Link href="/links">Links</Link>
            <a href="#what-i-fix">What I Fix</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#offers">Pricing</a>
          </nav>
        </details>
      </header>

      <section id="start" className="mx-auto flex w-full max-w-5xl flex-col items-center px-7 pb-14 pt-16 text-center sm:px-8 sm:pb-18 sm:pt-20 lg:px-10">
        <div className="w-full max-w-2xl">
          <h1 className="mx-auto w-full max-w-[22rem] text-center text-[2.34rem] font-semibold leading-[1.05] tracking-normal sm:max-w-[24rem] lg:max-w-2xl lg:text-[3.5rem]">
            AI should make your day easier
          </h1>
          <div className="mx-auto mt-6">
            <p className="mx-auto max-w-[17rem] text-balance text-[15px] font-medium leading-relaxed text-neutral-700 sm:max-w-[20rem] sm:text-base lg:max-w-[28rem] lg:text-lg">
              I find what&apos;s taking too long and build an AI fix around the way you work
            </p>
          </div>
          <div className="mx-auto mt-3">
            <p className="mx-auto flex max-w-[20rem] items-center justify-center gap-2 text-center text-sm font-semibold leading-snug text-neutral-600 sm:max-w-[24rem] sm:text-base lg:max-w-[28rem] lg:text-lg">
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
              <span>Start with one thing</span>
            </p>
          </div>
          <div className="mt-8 flex items-center justify-center">
            <Link
              href={AI_WORKFLOW_SESSION_URL}
              className="inline-flex min-h-11 min-w-[12.75rem] items-center justify-center rounded-full bg-black px-6 text-xs font-bold uppercase tracking-[0.13em] text-white shadow-[0_12px_28px_rgba(0,0,0,0.14)] transition hover:bg-neutral-800"
            >
              Let&apos;s start
            </Link>
          </div>
        </div>

        <div className="mt-10 w-full max-w-[12rem] overflow-hidden rounded-[1.45rem] border border-[#2b5f8f]/22 bg-white shadow-[0_14px_36px_rgba(35,54,79,0.08)] backdrop-blur sm:mt-14 sm:max-w-[14rem]">
          <Image
            src="/23-hero.png"
            alt="Jerami Singleton"
            width={1254}
            height={1254}
            priority
            fetchPriority="high"
            sizes="(min-width: 640px) 14rem, 12rem"
            className="aspect-square w-full rounded-b-[1.18rem] object-cover"
          />
          <div className="px-3 pb-3.5 pt-2.5 text-left sm:px-4">
            <p className="text-base font-semibold tracking-[-0.04em] text-neutral-950">Jerami Singleton</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-neutral-600 sm:text-sm">
              <span className="block">2 years of Programming | IT</span>
              <span className="block">at St. Petersburg College</span>
              <span className="mt-2 block">Video Editing since 2022</span>
              <span className="mt-2 block">Building with AI since 2024</span>
            </p>
          </div>
        </div>

        <PortfolioVideoCarousel />
      </section>

      <section className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="start-heading">
        <div className="mx-auto max-w-5xl">
          <h2 id="start-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
            How It Starts
          </h2>
          <div
            id="beta-session"
            className="mt-10 rounded-[2rem] border border-neutral-200/80 bg-white/90 p-7 shadow-[0_18px_48px_rgba(15,23,42,0.075)] backdrop-blur sm:p-12"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <span
                className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#004fa8] shadow-[0_8px_18px_rgba(0,79,168,0.18)]"
                aria-hidden="true"
              >
                <PaperPlaneTilt className="h-[1.85rem] w-[1.85rem] text-white" weight="bold" />
                <span className="absolute -bottom-1 -right-1 inline-flex h-[1.15rem] w-[1.15rem] items-center justify-center rounded-full border-2 border-black bg-[#62d26f]">
                  <Check className="h-3 w-3 text-black" weight="bold" />
                </span>
              </span>
              <p className="max-w-4xl text-[1.42rem] font-semibold leading-tight tracking-[-0.025em] text-neutral-950 sm:text-3xl">
                The Process
              </p>
            </div>
            <p className="mt-7 max-w-none text-xl leading-relaxed text-neutral-800 sm:text-2xl">
              Tell me what you wish took less time. Send a <strong className="font-bold">note</strong>, <strong className="font-bold">voice memo</strong>, or <strong className="font-bold">Loom</strong>. Explain it in your own words.
            </p>
            <p className="mt-6 max-w-none text-xl leading-relaxed text-neutral-800 sm:text-2xl">
              I review it before our call and bring 1-2 AI fixes. I ask questions to understand what matters to you and how the work should be done.
            </p>
            <p className="mt-6 max-w-none text-xl leading-relaxed text-neutral-800 sm:text-2xl">
              Follow the plan yourself, or have me build it for you.
            </p>
          </div>
        </div>
      </section>

      <section id="what-i-fix" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="what-i-fix-heading">
        <div className="mx-auto max-w-6xl">
          <h2 id="what-i-fix-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
            There&apos;s a Better Way
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-center text-lg font-medium leading-relaxed text-neutral-600 sm:text-xl">
            I map repeated work into one clear workflow AI handles the busywork while you keep the decisions
          </p>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {solutions.map((solution, index) => (
              <article
                key={solution.title}
                className="flex flex-col overflow-hidden rounded-[2rem] border border-neutral-200/80 bg-white/90 p-7 shadow-[0_16px_42px_rgba(15,23,42,0.07)] backdrop-blur sm:p-8"
              >
                <div className="flex items-start gap-4 max-[359px]:flex-col">
                  <SolutionIcon tone={solution.tone} />
                  <div className="max-[359px]:w-full">
                    <h3 className="text-2xl font-bold tracking-[-0.02em] text-black">{solution.title}</h3>
                    <p className="mt-3 text-lg font-medium leading-relaxed text-neutral-600">{solution.copy}</p>
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

      <section id="offers" className="px-6 pb-20 pt-6 sm:px-8 sm:pb-24 sm:pt-10 lg:px-10" aria-labelledby="offers-heading">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#126f39]">Choose your starting point</p>
            <h2 id="offers-heading" className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
              Choose Where to Start
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-relaxed text-neutral-600 sm:text-xl">
              Start with 1 repeated task, build the workflow, or put the complete foundation in place.
            </p>
          </div>

          <article className="relative mt-12 overflow-hidden rounded-[2rem] bg-black px-7 py-8 text-white shadow-[0_22px_60px_rgba(0,0,0,0.18)] sm:px-10 sm:py-10">
            <div className="absolute right-0 top-0 h-56 w-56 translate-x-16 -translate-y-16 rounded-full bg-[#25c266]/25 blur-3xl" aria-hidden="true" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#25c266] px-3 py-1 text-xs font-black uppercase tracking-[0.13em] text-black">Complete system</span>
                  <span className="text-sm font-semibold text-white/60">Up to 3 workflows</span>
                </div>
                <h3 className="mt-5 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Build My AI System</h3>
                <p className="mt-3 max-w-2xl text-lg font-medium leading-relaxed text-white/72 sm:text-xl">
                  Put your business knowledge into a working foundation, then build the 3 repeated workflows costing you the most time.
                </p>
                <ul className="mt-6 grid gap-3 text-base font-semibold text-white/88 sm:grid-cols-2">
                  {["Business interview and working foundation", "Up to 3 configured workflows", "3 private working sessions", "Documentation and 30 days of refinement"].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#62d26f]" weight="fill" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex min-w-[13rem] flex-col items-start lg:items-end">
                <p className="text-4xl font-bold tracking-[-0.045em] sm:text-5xl">$1,500</p>
                <p className="mt-1 text-sm font-semibold text-white/55">one-time</p>
                <Link href={offerUrl("build-my-ai-system")} className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-black transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#62d26f] focus:ring-offset-2 focus:ring-offset-black">
                  Build my system
                </Link>
              </div>
            </div>
          </article>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <article className="flex h-full flex-col rounded-[2rem] border border-neutral-200/80 bg-white p-7 shadow-[0_16px_42px_rgba(15,23,42,0.07)] sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#075985]">1 complete workflow</p>
              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="text-3xl font-bold tracking-[-0.035em]">Build It for Me</h3>
                <p className="text-2xl font-bold tracking-[-0.03em]">$500</p>
              </div>
              <p className="mt-4 text-lg font-medium leading-relaxed text-neutral-600">Turn 1 repeated task into a tested workflow you can keep using.</p>
              <ul className="mt-6 space-y-3 text-base font-semibold text-neutral-800">
                {["Configured around your real work", "Tested across real examples", "Documented so you can repeat it", "1 private refinement session"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#075985]" weight="bold" aria-hidden="true" /><span>{item}</span></li>
                ))}
              </ul>
              <Link href={offerUrl("build-it-for-me")} className="mt-8 inline-flex min-h-12 items-center justify-center self-start rounded-full bg-black px-6 text-sm font-bold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
                Build 1 workflow
              </Link>
            </article>

            <article className="flex h-full flex-col rounded-[2rem] border border-neutral-200/80 bg-white p-7 shadow-[0_16px_42px_rgba(15,23,42,0.07)] sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#126f39]">Ongoing improvement</p>
              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="text-3xl font-bold tracking-[-0.035em]">Keep It Working</h3>
                <p className="text-2xl font-bold tracking-[-0.03em]">$500<span className="text-base text-neutral-500">/month</span></p>
              </div>
              <p className="mt-4 text-lg font-medium leading-relaxed text-neutral-600">Keep expanding the working foundation as your business changes.</p>
              <ul className="mt-6 space-y-3 text-base font-semibold text-neutral-800">
                {["2 private working sessions each month", "1 new workflow or major improvement", "Updates to existing instructions", "Questions and refinements covered"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#126f39]" weight="bold" aria-hidden="true" /><span>{item}</span></li>
                ))}
              </ul>
              <Link href={offerUrl("keep-it-working")} className="mt-8 inline-flex min-h-12 items-center justify-center self-start rounded-full bg-black px-6 text-sm font-bold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
                Keep it working
              </Link>
            </article>
          </div>

          <article className="mx-auto mt-5 max-w-4xl rounded-[2rem] border-2 border-black bg-[#fff5cf] p-7 shadow-[0_14px_0_#050505] sm:p-8">
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-black bg-[#ffc83d] px-3 py-1 text-xs font-black uppercase tracking-[0.13em] text-black">Best first step</span>
                  <span className="text-sm font-bold text-neutral-600">1 task · 2 real examples</span>
                </div>
                <h3 className="mt-4 text-3xl font-bold tracking-[-0.035em]">Start With One Thing</h3>
                <p className="mt-3 text-lg font-medium leading-relaxed text-neutral-700">
                  Bring 1 repeated task. We finish it, save what worked, and make sure AI can repeat it reliably.
                </p>
                <p className="mt-3 text-sm font-bold text-neutral-600">Continue within 14 days and the $75 goes toward Build It for Me.</p>
              </div>
              <div className="sm:text-right">
                <p className="text-4xl font-bold tracking-[-0.045em]">$75</p>
                <Link href={offerUrl("start-with-one-thing")} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-bold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#fff5cf]">
                  Start with 1 task
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="book" className="bg-black px-6 py-20 text-center text-white sm:px-8 sm:py-24 lg:px-10" aria-labelledby="book-heading">
        <div className="mx-auto max-w-3xl">
          <h2 id="book-heading" className="text-4xl font-semibold tracking-normal sm:text-5xl">
            Let&apos;s check out <em className="font-bold text-brand-text-green drop-shadow-[0_0_12px_rgba(37,194,102,0.42)]">your</em> flow
          </h2>
          <p className="mt-8 text-balance text-xl font-semibold leading-relaxed text-white/78 sm:text-2xl">
            Book a Workflow Session or tell me what you wish AI could help you do
          </p>
          <div className="mt-10 flex items-center justify-center">
            <a
              href={CAL_URL}
              className="inline-flex min-h-14 min-w-[13rem] items-center justify-center rounded-full bg-white px-7 text-sm font-bold uppercase tracking-normal text-black transition hover:bg-neutral-200 md:hidden"
            >
              Book a Workflow Session
            </a>
            <BookQuickChatButton className="hidden min-h-14 min-w-[13rem] items-center justify-center rounded-full bg-white px-7 text-sm font-bold uppercase tracking-normal text-black transition hover:bg-neutral-200 md:inline-flex" />
          </div>
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
              Workflow sessions for people who want AI to handle repeated work while they stay in charge
            </p>
          </div>
          <nav aria-label="Footer" className="grid gap-3 text-lg font-bold">
            <a href="#start" className="transition hover:text-neutral-600">
              Start
            </a>
            <Link href="/links" className="transition hover:text-neutral-600">
              Links
            </Link>
            <a href="#what-i-fix" className="transition hover:text-neutral-600">
              What I Fix
            </a>
            <a href="#portfolio" className="transition hover:text-neutral-600">
              Portfolio
            </a>
            <a href="#offers" className="transition hover:text-neutral-600">
              Pricing
            </a>
            <a href="#book" className="transition hover:text-neutral-600">
              Book
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
