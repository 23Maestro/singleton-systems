import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { founderName, siteName, siteUrl } from "../site";

export const metadata: Metadata = {
  title: "Decision Maps",
  description: "Visual Singleton Systems decision maps and Wayfinder review surfaces.",
  alternates: {
    canonical: "/decision-maps",
  },
  openGraph: {
    title: `${founderName} Decision Maps | ${siteName}`,
    description: "Visual Singleton Systems decision maps and Wayfinder review surfaces.",
    url: `${siteUrl}/decision-maps`,
  },
};

const decisionMaps = [
  {
    label: "Visual Daily Planning",
    href: "/decision-maps/visual-daily-planning-wayfinder/",
    tags: ["Wayfinder", "Opportunity HQ", "Excalidraw"],
    accent: "border-[#6d44d9] text-[#6d44d9] dark:text-[#c9b8ff]",
  },
  {
    label: "Excalidraw Setup Pass",
    href: "/decision-maps/excalidraw-setup-pass/",
    tags: ["Obsidian", "Scripts", "Templater"],
    accent: "border-[#23835f] text-[#23835f] dark:text-[#8fd8b6]",
  },
] as const;

export default function DecisionMapsPage() {
  return (
    <main className="min-h-dvh bg-[#f7f7f5] px-5 py-8 text-[#111318] [color-scheme:light] dark:bg-[#0c0d0f] dark:text-white dark:[color-scheme:dark] sm:px-8">
      <section className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[30rem] flex-col justify-center">
        <header className="text-center">
          <Link href="/" className="mx-auto block w-32" aria-label="Singleton Systems home">
            <Image
              src="/singleton-systems-wordmark.svg"
              alt="Singleton Systems"
              width={660}
              height={260}
              priority
              className="h-auto w-full dark:invert"
            />
          </Link>
          <p className="mx-auto mt-6 max-w-sm text-center text-sm font-bold leading-tight text-neutral-700 dark:text-neutral-100 sm:text-base">
            Decision Maps
          </p>
        </header>

        <section className="mt-9" aria-labelledby="active-maps-heading">
          <h1 id="active-maps-heading" className="text-sm font-bold uppercase tracking-normal text-neutral-500 dark:text-neutral-500">
            Active Maps
          </h1>
          <div className="mt-3 grid gap-3">
            {decisionMaps.map((map) => (
              <Link
                key={map.href}
                href={map.href}
                className={`group block border-b py-4 transition hover:bg-black/[0.03] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#f7f7f5] dark:hover:bg-white/[0.03] dark:focus:ring-white dark:focus:ring-offset-[#0c0d0f] ${map.accent}`}
              >
                <span className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                      <path d="M5 5.5 9.5 4l5 1.5L19 4v14.5L14.5 20l-5-1.5L5 20z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <path d="M9.5 4v14.5M14.5 5.5V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-left text-base font-bold leading-tight text-[#111318] dark:text-white">{map.label}</span>
                    <span className="mt-2 flex flex-wrap gap-2">
                      {map.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-black/15 px-2.5 py-1 text-xs font-bold text-neutral-600 dark:border-white/15 dark:text-neutral-300">
                          {tag}
                        </span>
                      ))}
                    </span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <nav className="mt-8 text-center text-sm font-bold text-neutral-500 dark:text-neutral-400" aria-label="Back links">
          <Link href="/links" className="transition hover:text-[#111318] dark:hover:text-white">
            Back to Links
          </Link>
        </nav>
      </section>
    </main>
  );
}
