import Link from "next/link";
import { Check, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import {
  BUILD_IT_FOR_ME,
  BUILD_MY_AI_SYSTEM,
  FIRST_FIX_LIMIT_LINE,
  KEEP_IT_WORKING,
  START_WITH_ONE_THING,
  offerUrl,
} from "@/lib/site-offers";

// Cards follow the buying order: free first fix, one more workflow, monthly, big build.
export default function OffersSection() {
  return (
    <section id="offers" className="px-6 pb-20 pt-6 sm:px-8 sm:pb-24 sm:pt-10 lg:px-10" aria-labelledby="offers-heading">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base font-bold uppercase tracking-[0.16em] text-[#126f39]">How working together goes</p>
          <h2 id="offers-heading" className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
            Start Free. Pay When You Want More.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-relaxed text-neutral-600 sm:text-xl">
            Every client starts with a free call and one simple problem solved at no cost. If you like the result, pick the next step that fits.
          </p>
        </div>

        <article className="mx-auto mt-12 max-w-4xl rounded-[2rem] border-2 border-black bg-[#fff5cf] p-7 shadow-[0_14px_0_#050505] sm:p-8">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-black bg-[#ffc83d] px-3 py-1 text-base font-black uppercase tracking-[0.13em] text-black">Start here</span>
                <span className="text-base font-bold text-neutral-600">Free call · 1 simple task</span>
              </div>
              <h3 className="mt-4 text-3xl font-bold tracking-[-0.035em]">{START_WITH_ONE_THING.name}</h3>
              <p className="mt-3 text-lg font-medium leading-relaxed text-neutral-700">{START_WITH_ONE_THING.summary}</p>
              <p className="mt-3 text-base font-bold text-neutral-600">{FIRST_FIX_LIMIT_LINE}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-4xl font-bold tracking-[-0.045em]">{START_WITH_ONE_THING.display}</p>
              <Link href={offerUrl(START_WITH_ONE_THING.value)} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-6 text-base font-bold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#fff5cf]">
                Get my first fix
              </Link>
            </div>
          </div>
        </article>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <article className="flex h-full flex-col rounded-[2rem] border border-neutral-200/80 bg-white p-7 shadow-[0_16px_42px_rgba(15,23,42,0.07)] sm:p-8">
            <p className="text-base font-bold uppercase tracking-[0.14em] text-[#075985]">Liked the first one</p>
            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-3xl font-bold tracking-[-0.035em]">{BUILD_IT_FOR_ME.name}</h3>
              <p className="text-2xl font-bold tracking-[-0.03em]">{BUILD_IT_FOR_ME.display}</p>
            </div>
            <p className="mt-4 text-lg font-medium leading-relaxed text-neutral-600">{BUILD_IT_FOR_ME.summary}</p>
            <ul className="mt-6 space-y-3 text-base font-semibold text-neutral-800">
              {["Configured around your real work", "Tested across real examples", "Written steps your team can follow", "1 private refinement session"].map((item) => (
                <li key={item} className="flex items-start gap-2.5"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#075985]" weight="bold" aria-hidden="true" /><span>{item}</span></li>
              ))}
            </ul>
            <Link href={offerUrl(BUILD_IT_FOR_ME.value)} className="mt-8 inline-flex min-h-12 items-center justify-center self-start rounded-full bg-black px-6 text-base font-bold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
              Build 1 more
            </Link>
          </article>

          <article className="flex h-full flex-col rounded-[2rem] border border-neutral-200/80 bg-white p-7 shadow-[0_16px_42px_rgba(15,23,42,0.07)] sm:p-8">
            <p className="text-base font-bold uppercase tracking-[0.14em] text-[#126f39]">Want it ongoing</p>
            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-3xl font-bold tracking-[-0.035em]">{KEEP_IT_WORKING.name}</h3>
              <p className="text-2xl font-bold tracking-[-0.03em]">{KEEP_IT_WORKING.display}<span className="text-base text-neutral-500">/month</span></p>
            </div>
            <p className="mt-4 text-lg font-medium leading-relaxed text-neutral-600">{KEEP_IT_WORKING.summary}</p>
            <ul className="mt-6 space-y-3 text-base font-semibold text-neutral-800">
              {["2 new workflows each month", "Fixes when something stops working", "2 private working sessions each month", "Your written steps kept up to date"].map((item) => (
                <li key={item} className="flex items-start gap-2.5"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#126f39]" weight="bold" aria-hidden="true" /><span>{item}</span></li>
              ))}
            </ul>
            <Link href={offerUrl(KEEP_IT_WORKING.value)} className="mt-8 inline-flex min-h-12 items-center justify-center self-start rounded-full bg-black px-6 text-base font-bold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
              Keep it working
            </Link>
          </article>
        </div>

        <article className="relative mt-5 overflow-hidden rounded-[2rem] bg-black px-7 py-8 text-white shadow-[0_22px_60px_rgba(0,0,0,0.18)] sm:px-10 sm:py-10">
          <div className="absolute right-0 top-0 h-56 w-56 translate-x-16 -translate-y-16 rounded-full bg-[#25c266]/25 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#25c266] px-3 py-1 text-base font-black uppercase tracking-[0.13em] text-black">Big builds</span>
                <span className="text-base font-semibold text-white/60">3 or more workflows · 60 days</span>
              </div>
              <h3 className="mt-5 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{BUILD_MY_AI_SYSTEM.name}</h3>
              <p className="mt-3 max-w-2xl text-lg font-medium leading-relaxed text-white/72 sm:text-xl">
                {BUILD_MY_AI_SYSTEM.summary}
              </p>
              <ul className="mt-6 grid gap-3 text-base font-semibold text-white/88 sm:grid-cols-2">
                {["Business interview and working foundation", "3 workflows built and tested", "3 private working sessions", "Written steps and 60 days of refinement"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#62d26f]" weight="fill" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex min-w-[13rem] flex-col items-start lg:items-end">
              <p className="text-4xl font-bold tracking-[-0.045em] sm:text-5xl">{BUILD_MY_AI_SYSTEM.display}</p>
              <p className="mt-1 text-base font-semibold text-white/55">one-time</p>
              <Link href={offerUrl(BUILD_MY_AI_SYSTEM.value)} className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-base font-bold text-black transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#62d26f] focus:ring-offset-2 focus:ring-offset-black">
                Build my system
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
