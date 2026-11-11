import type { Metadata } from "next";
import SportsPhotoStage from "./SportsPhotoStage";
import { Barlow_Condensed } from "next/font/google";
import styles from "./recruiting.module.css";
import { ArrowDown, ArrowUpRight, Check, Film, Scan, Smartphone, TriangleAlert } from "lucide-react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { FEATURED_EDITS } from "@/lib/video-portfolio";
import HighlightInquiryForm from "./HighlightInquiryForm";

const headline = Barlow_Condensed({ weight: "800", subsets: ["latin"], display: "swap" });

const emphasis = Barlow_Condensed({ weight: "400", style: "italic", subsets: ["latin"], display: "swap" });

const description =
  "Football, basketball, baseball, softball, soccer, volleyball, and more. Highlight reels by Jerami Singleton, with up to 25 selected plays. From $225.";
export const metadata: Metadata = {
  title: "Football & multi-sport highlight reels",
  description,
  alternates: { canonical: "/recruiting-highlights" },
  openGraph: {
    title: "Football & multi-sport highlight reels | Singleton Systems",
    description,
    url: "/recruiting-highlights",
  },
  twitter: { title: "Football & multi-sport highlight reels | Singleton Systems", description },
};

const nav = [
  { label: "Watch My Work", href: "#work" },
  { label: "Pricing", href: "#pricing" },
  { label: "Custom Covers", href: "#covers" },
  { label: "Request a Reel", href: "#request" },
  { label: "More Video Editing", href: "/" },
];
const sample = FEATURED_EDITS.find((edit) => edit.title === "Athlete Highlight Reels")!;
const covers = [
  { sport: "Football", number: "22", color: "#ff6675", dark: "#321d25" },
  { sport: "Basketball", number: "03", color: "#86baff", dark: "#182a41" },
  { sport: "Lacrosse", number: "12", color: "#84d99e", dark: "#163525" },
  { sport: "Baseball", number: "07", color: "#f0c773", dark: "#382c1a" },
];
const button =
  "inline-flex min-h-12 items-center justify-center gap-4 rounded-full px-6 py-3 text-base font-semibold transition-colors bg-[#25c266] text-[#080808] hover:bg-[#20aa59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a8646] motion-reduce:transition-none";
const included = [
  "Up to 25 selected plays",
  "Custom cover and player info card",
  "Player identification before each play",
  "1 revision round and an HD download",
];

export default function RecruitingHighlightsPage() {
  return (
    <main id="start" className="video-offer-page bg-[#fbfbfb] text-[#080808]">
      <a
        href="#request"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4"
      >
        Skip to request form
      </a>
      <div className={styles.hero}>
        <div className={styles.header}>
          <SiteHeader items={nav} homeHref="/" />
        </div>
        <section className={styles.heroInner} aria-labelledby="hero-heading">
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <h1 id="hero-heading" className={`${headline.className} ${styles.headline}`}>
                Highlight Reels for <em className={`${emphasis.className} ${styles.anySport}`}>ANY</em> Sport
              </h1>
              <p className="mt-6 max-w-md text-xl leading-relaxed text-neutral-300">
                I edit your best plays into a reel for coaches or social.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a href="#request" className={`${button} ${styles.heroButton}`}>
                  Request a reel <ArrowUpRight aria-hidden="true" size={20} />
                </a>
                <a href="#work" className="inline-flex min-h-12 items-center gap-2 text-lg font-medium underline decoration-white/40 underline-offset-4 hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                  Watch my work <ArrowDown aria-hidden="true" size={18} />
                </a>
              </div>
              <p className="mt-5 text-lg text-neutral-300">
                <strong className="font-semibold text-white">From $225</strong> · 50% to start
              </p>
            </div>
            <SportsPhotoStage />
          </div>
        </section>
      </div>

      <section id="work" className="mx-auto grid max-w-6xl scroll-mt-8 items-center gap-9 px-7 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 lg:px-10" aria-labelledby="work-heading">
        <div>
          <h2 id="work-heading" className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Watch My Athlete Reel</h2>
          <p className="mt-5 text-xl leading-relaxed text-neutral-600">
            I’ve edited <strong className="font-semibold text-neutral-950">over 1,200 highlight reels</strong>, including 2 years with Prospect ID.
            Football, basketball, baseball, softball, soccer, volleyball, and more.
          </p>
        </div>
          <figure
            className="min-w-0 scroll-mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white"
          >
            <div className="flex items-center justify-between gap-4 bg-[#111318] px-5 py-4 text-white">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Film aria-hidden="true" size={16} /> Watch My Athlete Reel
              </p>
              <span className="font-mono text-xs text-neutral-300">01 / PLAY</span>
            </div>
            <iframe
              loading="lazy"
              className="aspect-video w-full border-0 bg-black"
              src={`https://www.youtube-nocookie.com/embed/${sample.id}?rel=0`}
              title="Singleton Systems athlete highlight editing reel"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            <figcaption className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 text-sm text-neutral-600">
              <a
                href={`https://www.youtube.com/watch?v=${sample.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 font-medium text-neutral-950 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Watch on YouTube <ArrowUpRight aria-hidden="true" size={14} />
              </a>
            </figcaption>
          </figure>
      </section>

      <section
        id="pricing"
        className="scroll-mt-8 border-y border-neutral-200 bg-white px-7 py-14 sm:px-8 sm:py-20 lg:px-10"
        aria-labelledby="pricing-heading"
      >
        <div className="mx-auto max-w-6xl lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-[#004fa8]">Up to 25 Selected Plays</p>
              <h2
                id="pricing-heading"
                className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
              >
                Choose Your Reel
              </h2>
            </div>
            <p className="max-w-sm text-xl leading-relaxed text-neutral-600">
              Start with the full reel. Add a short vertical cut if you want one for social.
            </p>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-2">
            <article className="flex flex-col rounded-2xl border-2 border-[#004fa8] bg-[#f6f9ff] p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <Film aria-hidden="true" size={24} className="text-[#004fa8]" />
                <span className="text-xs font-semibold uppercase tracking-widest text-[#004fa8]">
                  The Full Reel
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight">Highlight Reel</h3>
              <p className="mt-3 text-5xl font-semibold tracking-[-0.05em]">$225</p>
              <p className="mt-3 text-xl leading-relaxed text-neutral-600">
                Your selected plays, edited into 1 finished reel.
              </p>
              <ul className="my-7 space-y-3 text-lg text-neutral-700">
                {included.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check aria-hidden="true" size={18} className="mt-1 shrink-0 text-[#004fa8]" />
                    <span>{item === "Up to 25 selected plays" || item === "1 vertical social cut, up to 60 seconds" ? <strong className="font-semibold">{item}</strong> : item}</span>
                  </li>
                ))}
              </ul>
              <a href="#request" className={`${button} mt-auto`}>
                Request a Reel <ArrowUpRight aria-hidden="true" size={18} />
              </a>
              <p className="mt-3 text-center text-sm text-neutral-600">$112.50 to start</p>
            </article>
            <article className="flex flex-col rounded-2xl border border-neutral-300 bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <Smartphone aria-hidden="true" size={24} className="text-neutral-600" />
                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-600">
                  With a Social Cut
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight">Reel + Social</h3>
              <p className="mt-3 text-5xl font-semibold tracking-[-0.05em]">$300</p>
              <p className="mt-3 text-xl leading-relaxed text-neutral-600">
                The full reel, plus a shorter cut for your phone.
              </p>
              <ul className="my-7 space-y-3 text-lg text-neutral-700">
                {[
                  "Everything in the highlight reel",
                  "1 vertical social cut, up to 60 seconds",
                  "Cut from the same selected plays",
                  "Sized for Reels, TikTok, and Shorts",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check aria-hidden="true" size={18} className="mt-1 shrink-0 text-[#004fa8]" />
                    <span>{item === "Up to 25 selected plays" || item === "1 vertical social cut, up to 60 seconds" ? <strong className="font-semibold">{item}</strong> : item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#request"
                className={`${button} mt-auto`}
              >
                Request Reel + Social <ArrowUpRight aria-hidden="true" size={18} />
              </a>
              <p className="mt-3 text-center text-sm text-neutral-600">$150 to start</p>
            </article>
          </div>
          <div className="mt-5 flex flex-col gap-5 rounded-2xl bg-[#f3f4f5] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <Scan
                aria-hidden="true"
                size={24}
                className="mt-1 hidden shrink-0 text-neutral-600 sm:block"
              />
              <div>
                <h3 className="text-lg font-semibold">Need Help Picking Plays?</h3>
                <ul className="mt-3 max-w-lg list-disc space-y-2 pl-5 text-lg leading-relaxed text-neutral-600">
                  <li>I’ll watch your game and pick the plays.</li>
                  <li>Up to 90 minutes per game.</li>
                </ul>
              </div>
            </div>
            <p className="shrink-0 text-3xl font-semibold tracking-tight">
              +$60<span className="text-lg font-normal text-neutral-600"> / game</span>
            </p>
          </div>
          <ul className="mt-6 max-w-3xl list-disc space-y-2 pl-5 text-lg leading-relaxed text-neutral-600">
            <li>We agree on the footage, work, and due date first.</li>
            <li><strong className="font-semibold text-neutral-950">Pay half to start.</strong></li>
            <li>Approve the reel, then pay the rest to get the final file.</li>
            <li>Extra plays, footage, or edits cost more. I’ll give you a price first.</li>
          </ul>
        </div>
      </section>

      <section
        id="covers"
        className="scroll-mt-8 px-7 py-14 sm:px-8 sm:py-20 lg:px-10"
        aria-labelledby="covers-heading"
      >
        <div className="mx-auto max-w-6xl lg:px-10">
          <div className="grid gap-5 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-sm font-semibold text-[#004fa8]">Included With Every Reel</p>
              <h2
                id="covers-heading"
                className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl"
              >
                Their Name
                <br />
                Their Team Colors
              </h2>
            </div>
            <p className="max-w-lg text-xl leading-relaxed text-neutral-600">
              A cover built around <strong className="font-semibold text-neutral-950">your athlete’s photo and team colors</strong>. An opening card with their
              position, graduation year, and contact details for coaches.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {covers.map((cover) => (
              <figure key={cover.sport}>
                <div
                  className="relative isolate aspect-[4/5] overflow-hidden rounded-xl p-3 text-white sm:aspect-[4/3] sm:p-5"
                  style={{ backgroundColor: cover.dark }}
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-y-0 right-0 w-1/3 border-l border-white/20"
                  />
                  <span className="relative text-xs font-medium tracking-wide">CLASS OF 20XX</span>
                  <p className="relative mt-5 text-2xl font-black italic leading-[0.95] tracking-[-0.04em] sm:text-3xl">
                    YOUR
                    <br />
                    <span style={{ color: cover.color }}>ATHLETE</span>
                  </p>
                  <p className="relative mt-4 text-xs font-medium">Your Team / Your Position</p>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-3 right-1 -z-10 text-8xl font-black leading-none text-white/10"
                  >
                    {cover.number}
                  </span>
                  <div
                    className="absolute bottom-0 left-0 h-1 w-full"
                    style={{ backgroundColor: cover.color }}
                  />
                </div>
                <figcaption className="mt-3 text-sm font-medium text-neutral-600">
                  {cover.sport}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section
        id="request"
        className="scroll-mt-8 border-y border-[#dce6f1] bg-[#edf4fc] px-7 py-14 sm:px-8 sm:py-20 lg:px-10"
        aria-labelledby="request-heading"
      >
        <div className="mx-auto grid max-w-6xl items-start gap-9 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-10">
          <div>
            <p className="text-sm font-semibold text-[#004fa8]">Start With 5 Quick Details</p>
            <h2
              id="request-heading"
              className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl"
            >
              Request Your
              <br />
              Athlete’s Reel
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-neutral-600">
              Tell me the sport and what footage you have. I’ll follow up to confirm your package,
              price, and delivery date.
            </p>
            <p className="mt-4 text-base font-medium text-[#004fa8]">
              <em>Footage and player details come later.</em>
            </p>
            <div className="mt-8 flex items-center gap-4 border-t border-[#ccd9e9] pt-6">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#004fa8] text-sm font-semibold text-white"
              >
                JS
              </span>
              <div>
                <p className="font-semibold">Jerami Singleton</p>
                <p className="mt-1 text-sm text-neutral-600">Your Editor · Singleton Systems</p>
              </div>
            </div>
            <p className="mt-6 flex max-w-md items-start gap-3 text-sm leading-relaxed text-neutral-700">
              <TriangleAlert aria-hidden="true" size={24} className="mt-0.5 shrink-0 fill-[#ffc83d] text-[#080808]" />
              <span>For athletes under 18, please have a parent or guardian send the request.</span>
            </p>
          </div>
          <div className="min-w-0 rounded-2xl border border-[#dce6f1] bg-white p-5 sm:p-8">
            <HighlightInquiryForm />
          </div>
        </div>
      </section>
      <SiteFooter
        items={nav}
        description="Athlete highlight reels by Jerami Singleton. Based in Tampa, editing footage from families across the US."
      />
    </main>
  );
}
