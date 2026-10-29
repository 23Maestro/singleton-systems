import Image from "next/image";
import EvilIcon from "@/components/site/EvilIcon";
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
import EditingPortfolio from "@/components/home/EditingPortfolio";
import { VideoRealProblemSection, VideoTriedSection } from "@/components/home/VideoBuyerStorySections";
import ReviewsSection from "@/components/home/ReviewsSection";
import { ORGANIZATION_PROFILES, PERSON_PROFILES, founderName, serviceDescription, serviceName, siteDescription, siteName, siteUrl } from "./site";
import VideoBookSection from "@/components/site/VideoBookSection";
import VideoOffersSection from "@/components/site/VideoOffersSection";
import { VIDEO_OFFERS, VIDEO_FAQ, videoInquiryUrl } from "@/lib/video-offers";
import SiteFooter from "@/components/site/SiteFooter";
import ProfileCard from "@/components/site/ProfileCard";
import Hero from "@/components/site/Hero";
import SiteHeader from "@/components/site/SiteHeader";
import { videoNav } from "@/components/site/nav";
import "./video-offer.css";

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: founderName,
    url: siteUrl,
    jobTitle: "Video Editor",
    hasOccupation: [
      { "@type": "Occupation", name: "Video Editor" },
      { "@type": "Occupation", name: "Broadcast Production Specialist" },
    ],
    homeLocation: {
      "@type": "Place",
      name: "Tampa, Florida",
    },
    sameAs: PERSON_PROFILES,
    worksFor: {
      "@id": `${siteUrl}/#organization`,
    },
    knowsAbout: [
      "recurring video editing",
      "reusable Figma graphics kits",
      "video production workflows",
      "Premiere Pro workflow systems",
      "episode review and delivery",
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
    sameAs: ORGANIZATION_PROFILES,
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
    serviceType: "recurring video editing",
    provider: {
      "@id": `${siteUrl}/#organization`,
    },
    areaServed: [
      { "@type": "City", name: "Tampa, FL" },
      { "@type": "Country", name: "United States" },
    ],
    description: serviceDescription,
    url: siteUrl,
    offers: VIDEO_OFFERS.map((offer) => ({
      "@type": "Offer", name: offer.name, description: offer.summary, priceCurrency: "USD", url: `${siteUrl}${videoInquiryUrl(offer.value)}`,
      price: offer.price,
    })),
    audience: {
      "@type": "Audience",
      audienceType: "teams recording recurring lessons, episodes or tutorials",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
    mainEntity: VIDEO_FAQ.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
  },
];

const solutions = [
  {
    title: "Send Your Recording",
    copy: "Share organized footage, your topic and a reference for the edit.",
    tone: "blue",
  },
  {
    title: "Set Your Editing Style",
    copy: "We lock in the pacing, then use your existing brand for simple titles and captions.",
    tone: "yellow",
  },
  {
    title: "Review Your Cut",
    copy: "Leave timestamped feedback in Frame.io. Each video includes two revision rounds to refine the cut.",
    tone: "coral",
  },
  {
    title: "Keep the Series Moving",
    copy: "Choose 4 or 8 main videos, with short cutdowns from the same footage.",
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

function IntakeTabIcon({ tab }: { tab: "Footage" | "Brief" | "Brand" }) {
  const Icon = tab === "Footage" ? NotePencil : tab === "Brief" ? Microphone : VideoCamera;
  const color = tab === "Footage" ? "bg-[#22c7c8]" : tab === "Brief" ? "bg-[#ffc83d]" : "bg-[#22c86a]";

  return (
    <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.35px] border-black ${color}`} aria-hidden="true">
      <Icon className="h-3.5 w-3.5 text-black" weight="bold" />
    </span>
  );
}

function IntakeRowIcon({ title }: { title: "Your recording" | "Your topic" | "Your brand" | "Your reference" }) {
  const Icon = title === "Your recording" ? Clock : title === "Your topic" ? ClipboardText : title === "Your brand" ? Wrench : CheckCircle;
  return <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-600" weight="bold" aria-hidden="true" />;
}

function IntakePreview() {
  const tabs = ["Footage", "Brief", "Brand"] as const;
  const rows = [
    ["Your recording", "Up to 60 minutes of organized footage"],
    ["Your topic", "What this episode should cover"],
    ["Your brand", "Existing assets and approved rules"],
    ["Your reference", "A sample of the finish you want"],
  ] as const;

  return (
    <div data-illustration data-workflow-art="intake" className="-mb-7 -mr-7 mt-8 flex flex-col overflow-hidden rounded-l-[1.35rem] border-y border-l border-neutral-200 bg-[#f7f7f5] px-4 pb-0 pt-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:-mb-8 sm:-mr-8 sm:px-5 lg:min-h-[455px] lg:flex-1">
      <div className="flex justify-end pr-1 sm:pr-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-[0_8px_20px_rgba(15,23,42,0.11)]">
          <svg viewBox="0 0 18 18" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6.8" fill="#f7f7f5" stroke="#050505" strokeWidth="1.4" />
            <path d="M9 5.5v7M5.5 9h7" stroke="#050505" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          Your episode handoff
        </span>
      </div>
      <div className="-mr-4 ml-1 mt-10 flex-1 rounded-tl-[1.1rem] border-l border-t border-neutral-200 bg-white shadow-[0_18px_36px_rgba(15,23,42,0.08)] sm:-mr-5 sm:ml-2">
        <div className="px-5 pt-5 text-base font-semibold text-neutral-600">Ready for the edit</div>
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
  const tabs = ["Brand", "Titles", "Style"] as const;
  const rows = [
    ["Your brand", "Existing fonts and colors", "Brand", "bg-[#dbeafe] text-[#075985] border-[#93c5fd]"],
    ["Simple titles", "Names and key information", "Titles", "bg-[#fee2e2] text-[#9f1239] border-[#fca5a5]"],
    ["Approved style", "The same look across your videos", "Style", "bg-[#dcfce7] text-[#166534] border-[#86efac]"],
  ] as const;

  return (
    <div data-illustration data-workflow-art="assets" className="-mx-7 -mb-7 mt-8 flex h-[600px] flex-col overflow-hidden rounded-b-[1.75rem] bg-[#efefec] px-3 pb-0 pt-7 max-[359px]:h-[650px] sm:-mx-8 sm:-mb-8 sm:h-[560px] sm:px-4 lg:flex-1">
      <div className="mx-auto flex w-full max-w-[420px] justify-end sm:max-w-[480px]">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-[0_8px_20px_rgba(15,23,42,0.11)]">
          <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6.7" stroke="#050505" strokeWidth="1.5" />
            <path d="m6.1 9.2 1.9 1.9 4-4.3" stroke="#050505" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Your editing style is set
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

function NotesTabIcon({ tab }: { tab: "First cut" | "Notes" | "Approved" }) {
  const Icon = tab === "First cut" ? ClipboardText : tab === "Notes" ? CheckCircle : Wrench;
  return <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" weight="bold" aria-hidden="true" />;
}

function NotesPreview() {
  const tabs = ["First cut", "Notes", "Approved"] as const;
  const rows = [
    ["Notes", "Two revision rounds in Frame.io.", "Review", "bg-blue-100 text-blue-700", "task"],
    ["Approved", "The finished episode and caption file.", "Delivery", "bg-green-100 text-green-700", "people"],
  ] as const;

  return (
    <div data-illustration data-workflow-art="notes" className="-mx-7 -mb-7 mt-8 flex h-[600px] justify-center overflow-hidden rounded-b-[1.75rem] bg-[#f55252] px-3 pt-8 max-[359px]:h-[680px] sm:-mx-8 sm:-mb-8 sm:h-[560px] sm:px-4">
      <div className="flex h-[585px] w-full max-w-[420px] flex-col gap-4 rounded-t-2xl bg-white p-6 shadow-2xl sm:h-[545px] sm:max-w-[480px]">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-neutral-200 p-2">
            <svg className="h-[18px] w-[18px] text-neutral-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5Z" />
            </svg>
          </div>
          <span className="rounded-md bg-neutral-100 px-3 py-1.5 text-base font-bold text-neutral-800">Your cut is ready</span>
        </div>

        <p className="text-base font-medium text-neutral-600">Timestamped feedback in Frame.io.</p>

        <div className="grid grid-cols-3 gap-1 border-b border-neutral-100 pb-2 text-sm font-semibold leading-none">
          {tabs.map((tab) => (
            <span
              key={tab}
              className={`flex min-w-0 items-center justify-center gap-0.5 text-center max-[359px]:whitespace-normal sm:gap-1.5 ${
                tab === "First cut" ? "relative z-10 -mb-[9px] border-b-2 border-black pb-2 text-black" : "text-neutral-600"
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
            <span className="text-base font-bold text-neutral-950">Your review notes</span>
            <p className="mt-1 text-base font-medium text-neutral-600">Send one consolidated set of changes.</p>
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
    ["Main videos", "4 or 8", "bg-purple-100 text-purple-700"],
    ["Short cutdowns", "2 or 4", "bg-blue-100 text-blue-700"],
    ["Delivery day", "Confirmed", "bg-green-100 text-green-700"],
  ] as const;

  return (
    <div data-illustration data-workflow-art="delivery" className="-mx-7 -mb-7 mt-8 flex h-[760px] justify-center overflow-hidden rounded-b-[1.75rem] bg-[#4eba6b] px-3 pt-8 max-[359px]:h-[780px] sm:-mx-8 sm:-mb-8 sm:h-[500px] sm:px-4 lg:h-auto lg:min-h-[500px] lg:flex-1">
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
              <span className="text-base font-bold text-neutral-900">Your episode files</span>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-sm font-bold text-green-700">
              Easy to find <span className="text-green-500">✓</span>
            </span>
          </div>
          <p className="mb-5 pr-4 text-base leading-snug text-neutral-600">Your finished edit and caption file in one handoff.</p>

          <ul className="space-y-4 text-base font-medium text-neutral-600">
            {[
              ["1080p export", "check"],
              ["Audio cleanup", "clock"],
              ["Caption file", "notes"],
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
              <span className="text-base font-bold text-neutral-900">Your next recording</span>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-sm font-bold text-green-700">
              Scheduled <span className="text-green-500">✓</span>
            </span>
          </div>

          <p className="mb-4 border-b border-neutral-100 pb-2 text-sm font-semibold uppercase tracking-wide text-neutral-600">Your video bundle</p>

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
    <main className="video-offer-page overflow-x-clip bg-[#fbfbfb] text-[#080808]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader items={videoNav} homeHref="#start" />

      <Hero
        title="Your Next Episode, Already on Brand"
        pill="Video editing from your footage"
        body="I edit YouTube episodes, course lessons and software tutorials from footage you supply. I also cut sports videos and short clips for social. Each edit follows your brand."
        ctaLabel="Try my footage free"
        ctaHref={videoInquiryUrl("free-test-edit")}
      />

      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-7 pb-14 sm:px-8 sm:pb-18 lg:px-10">
        <ProfileCard video />

        <EditingPortfolio />
      </section>

      <VideoTriedSection />
      <VideoRealProblemSection />

      <section id="how-it-starts" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="start-heading">
        <div className="mx-auto max-w-5xl">
          <h2 id="start-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
            Try an Edit With Your Own Footage
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
                See Your Footage Edited First
              </p>
            </div>
            <p className="mt-7 max-w-none text-xl leading-relaxed text-neutral-800 sm:text-2xl">
              Send a recording link and an example of the style you like. I’ll check the footage and confirm a delivery date for your free sample.
            </p>
            <p className="mt-6 max-w-none text-xl leading-relaxed text-neutral-800 sm:text-2xl">
              You’ll receive a 30–45-second edit using your own footage and branding, so you can see how I handle the pacing and finish before you book.
            </p>
            <p className="mt-6 max-w-none text-xl leading-relaxed text-neutral-800 sm:text-2xl">
              Like the sample? Choose the bundle that fits your recordings, and we’ll confirm the full scope and delivery dates before payment.
            </p>
            <div className="mt-8 grid gap-5 border-t border-neutral-200 pt-8 sm:grid-cols-2">
              <div><h3 className="text-xl font-bold">Who This Is For</h3><ul className="mt-4 space-y-3 text-lg leading-relaxed text-neutral-700">
                <li className="flex items-start gap-2"><EvilIcon name="camera" className="h-7 w-7 shrink-0 text-[#126f39]" /><span>You record lessons, episodes or walkthroughs.</span></li>
                <li className="flex items-start gap-2"><EvilIcon name="user" className="h-7 w-7 shrink-0 text-[#126f39]" /><span>You want a regular editor who knows your style.</span></li>
                <li className="flex items-start gap-2"><EvilIcon name="check" className="h-7 w-7 shrink-0 text-[#126f39]" /><span>Someone on your team can review each cut.</span></li>
              </ul></div>
              <div><h3 className="text-xl font-bold">What I Need From You</h3><ul className="mt-4 space-y-3 text-lg leading-relaxed text-neutral-700">
                <li className="flex items-start gap-2"><EvilIcon name="clock" className="h-7 w-7 shrink-0 text-[#126f39]" /><span>Up to 60 minutes of organized footage per main video.</span></li>
                <li className="flex items-start gap-2"><EvilIcon name="archive" className="h-7 w-7 shrink-0 text-[#126f39]" /><span>The episode topic and any files I’ll need.</span></li>
                <li className="flex items-start gap-2"><EvilIcon name="comment" className="h-7 w-7 shrink-0 text-[#126f39]" /><span>Review directly in Frame.io, with your team’s feedback in one place.</span></li>
              </ul></div>
            </div>
          </div>
        </div>
      </section>

      <section id="what-i-fix" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="what-i-fix-heading">
        <div className="mx-auto max-w-6xl">
          <h2 id="what-i-fix-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
            How Your Editing Works
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-center text-lg font-medium leading-relaxed text-neutral-600 sm:text-xl">
            With your approved style saved in the project, I can carry the same fonts, colors and pacing into the next edit.
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

      <ReviewsSection videoTestimonial />

      <VideoOffersSection />


      <VideoBookSection />


      <SiteFooter items={videoNav} description="Video editing from footage you supply. Based in Tampa, editing course lessons, episodes and tutorials for clients across the US." />
    </main>
  );
}
