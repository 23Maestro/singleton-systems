import type { Metadata } from "next";
import { ProofSection } from "@/components/home/BuyerStorySections";
import ReviewsSection from "@/components/home/ReviewsSection";
import BookSection from "@/components/site/BookSection";
import OffersSection from "@/components/site/OffersSection";
import ProfileCard from "@/components/site/ProfileCard";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { siteNavFor } from "@/components/site/nav";
import {
  BUILD_IT_FOR_ME,
  BUILD_MY_AI_SYSTEM,
  FIRST_BUILD_CREDIT_LINE,
  KEEP_IT_WORKING,
  SITE_OFFERS,
  START_WITH_ONE_THING,
  offerJsonLd,
} from "@/lib/site-offers";
import { CAL_URL, founderName, siteName, siteUrl } from "../site";

// 23M-206. Structure follows the Tampa pages ranking on 2026-09-25
// (romeogolfconsultants.com/ai-consultant-tampa, azaisolutions.com/locations/tampa):
// Tampa in title and H1, answer first, start with one workflow, visible price, buyer FAQ.
// Visual system: the homepage template (shared header, proof, reviews, pricing, booking, footer).

const PAGE_PATH = "/tampa-ai-consultant";
const PAGE_URL = `${siteUrl}${PAGE_PATH}`;
const TITLE = "AI Consultant in Tampa for Small Businesses";
const DESCRIPTION =
  "Tampa AI consultant for small businesses. Start with one repeated task, get a working AI workflow built around how you already work, and keep it documented.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    siteName,
    title: `${TITLE} | ${siteName}`,
    description: DESCRIPTION,
    images: [{ url: "/23-hero.png", width: 1254, height: 1254, alt: founderName }],
  },
};

const steps = [
  {
    title: "Show Me What Takes Too Long",
    body: "Book a free 15 minute call and tell me which task your team repeats every week. We figure out together if AI can help.",
  },
  {
    title: `Build the First One for ${START_WITH_ONE_THING.display}`,
    body: `I build that one task into a working AI workflow inside the tools you already use and test it on your real examples. ${FIRST_BUILD_CREDIT_LINE}`,
  },
  {
    title: "Keep Going if It Works",
    body: "Pick the package that fits. You get written instructions so every workflow keeps working after I hand it over.",
  },
];

const faqs = [
  {
    q: "What does an AI consultant do for a small business in Tampa?",
    a: "I find the repeated tasks that eat your week, like follow ups, intake, scheduling, reporting, or content prep, and build AI steps that handle the busy work. You stay in control of the final call.",
  },
  {
    q: "How much does AI consulting cost?",
    a: `The first call is free. Building your first task is ${START_WITH_ONE_THING.display}. ${FIRST_BUILD_CREDIT_LINE} Building one complete workflow is ${BUILD_IT_FOR_ME.display}. A full system with up to three workflows is ${BUILD_MY_AI_SYSTEM.display}. Ongoing help is ${KEEP_IT_WORKING.display} a month.`,
  },
  {
    q: "Do I need to be technical or buy new software?",
    a: "No. I work inside the tools you already use when possible and write plain instructions so you and your team can run it.",
  },
  {
    q: "What kind of work can AI take off my plate?",
    a: "Anything repeated and rule based: sorting inquiries, drafting replies, summarizing calls, preparing briefs, organizing files, and turning messy notes into next steps.",
  },
  {
    q: "How is this different from hiring an automation agency?",
    a: "You work directly with the person who builds it. We start with one task, prove it works on your real examples, and only expand after that.",
  },
  {
    q: "Are you local to Tampa?",
    a: "Yes. Singleton Systems is based in Tampa and works with businesses across Tampa Bay, including St. Petersburg and Clearwater. Sessions run on video calls so they fit your schedule.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${PAGE_URL}#service`,
    name: TITLE,
    serviceType: "AI consulting",
    description: DESCRIPTION,
    url: PAGE_URL,
    provider: { "@id": `${siteUrl}/#organization` },
    areaServed: [
      { "@type": "City", name: "Tampa, FL" },
      { "@type": "City", name: "St. Petersburg, FL" },
      { "@type": "City", name: "Clearwater, FL" },
    ],
    offers: SITE_OFFERS.map(offerJsonLd),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${PAGE_URL}#faq`,
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: siteName, item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Tampa AI Consultant", item: PAGE_URL },
    ],
  },
];

export default function TampaAiConsultantPage() {
  const nav = siteNavFor("/");

  return (
    <main className="overflow-x-clip bg-[#fbfbfb] text-[#080808]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader items={nav} homeHref="/" />

      <section id="start" className="mx-auto flex w-full max-w-5xl flex-col items-center px-7 pb-14 pt-16 text-center sm:px-8 sm:pb-18 sm:pt-20 lg:px-10">
        <div className="w-full max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#126f39]">Tampa, Florida</p>
          <h1 className="mx-auto mt-4 w-full max-w-[22rem] text-center text-[2.34rem] font-semibold leading-[1.05] tracking-normal sm:max-w-[26rem] lg:max-w-2xl lg:text-[3.5rem]">
            AI Consultant in Tampa for Small Businesses
          </h1>
          <p className="mx-auto mt-6 max-w-[19rem] text-balance text-[15px] font-medium leading-relaxed text-neutral-700 sm:max-w-[24rem] sm:text-base lg:max-w-[30rem] lg:text-lg">
            I help Tampa Bay owners and small teams hand their repeated busy work to AI, one task at a time, built around the way they already work.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <a
              href={CAL_URL}
              className="inline-flex min-h-11 min-w-[12.75rem] items-center justify-center rounded-full bg-black px-6 text-xs font-bold uppercase tracking-[0.13em] text-white shadow-[0_12px_28px_rgba(0,0,0,0.14)] transition hover:bg-neutral-800"
            >
              Book a free 15 minute call
            </a>
          </div>
          <p className="mt-4 text-sm font-semibold text-neutral-500">
            Free call. First build {START_WITH_ONE_THING.display}, credited if you continue within 14 days.
          </p>
        </div>
        <ProfileCard />
      </section>

      <section id="how-it-starts" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="how-heading">
        <div className="mx-auto max-w-5xl">
          <h2 id="how-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
            How AI Consulting Starts
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-center text-lg font-medium leading-relaxed text-neutral-600 sm:text-xl">
            One workflow first. We prove it works on your real examples before doing more.
          </p>
          <ol className="mt-10 grid gap-5 lg:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-col rounded-[2rem] border border-neutral-200/80 bg-white/90 p-7 shadow-[0_16px_42px_rgba(15,23,42,0.07)] backdrop-blur sm:p-8"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-black bg-[#62d26f] text-lg font-black text-black">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-2xl font-bold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-3 text-lg font-medium leading-relaxed text-neutral-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ProofSection />
      <ReviewsSection />
      <OffersSection />

      <section id="faq" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-3xl">
          <h2 id="faq-heading" className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
            Tampa AI Consulting Questions
          </h2>
          <div className="mt-10 space-y-4">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-[2rem] border border-neutral-200/80 bg-white/90 p-6 shadow-[0_16px_42px_rgba(15,23,42,0.06)] sm:p-7"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold tracking-[-0.01em] marker:hidden sm:text-xl">
                  {item.q}
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black text-base font-black transition group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-lg font-medium leading-relaxed text-neutral-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <BookSection />
      <SiteFooter items={nav} />
    </main>
  );
}
