import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { founderName, siteName, siteUrl } from "../site";

export const metadata: Metadata = {
  title: "Business Links",
  description: "Focused Singleton Systems links for daily work and reference.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/business-links",
  },
  openGraph: {
    title: `${founderName} Business Links | ${siteName}`,
    description: "Focused Singleton Systems links for daily work and reference.",
    url: `${siteUrl}/business-links`,
  },
};

const linkGroups = [
  {
    title: "Operate",
    links: [
      {
        label: "Dashboard",
        href: "/dashboard",
        description: "Work queue, planning, and client context.",
      },
      {
        label: "Finances",
        href: "/finances",
        description: "Current money and financial plans.",
      },
      {
        label: "Linear Inbox",
        href: "/linear-inbox",
        description: "Capture and triage work.",
      },
    ],
  },
  {
    title: "Reference",
    links: [
      {
        label: "Decision Maps",
        href: "/decision-maps",
        description: "Active project reviews and decisions.",
      },
      {
        label: "Visual Maps",
        href: "/visual-maps",
        description: "System views and architecture.",
      },
    ],
  },
] as const;

export default function BusinessLinksPage() {
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
          <h1 className="mx-auto mt-6 text-base font-bold leading-tight text-neutral-800 dark:text-neutral-100">
            Business Workspace
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            Focused links for daily work and reference.
          </p>
        </header>

        <div className="mt-9 grid gap-6">
          {linkGroups.map((group) => (
            <section key={group.title} aria-labelledby={`${group.title.toLowerCase()}-heading`}>
              <h2
                id={`${group.title.toLowerCase()}-heading`}
                className="text-sm font-bold uppercase tracking-normal text-neutral-500 dark:text-neutral-500"
              >
                {group.title}
              </h2>
              <div className="mt-3 grid gap-3">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group block border-b border-black/15 py-3.5 transition hover:border-black/50 hover:bg-black/[0.03] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#f7f7f5] dark:border-white/15 dark:hover:border-white/60 dark:hover:bg-white/[0.03] dark:focus:ring-white dark:focus:ring-offset-[#0c0d0f]"
                  >
                    <span className="flex items-center gap-4">
                      <span className="min-w-0 flex-1">
                        <span className="block text-left text-base font-bold leading-tight text-[#111318] dark:text-white">
                          {link.label}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                          {link.description}
                        </span>
                      </span>
                      <span aria-hidden="true" className="text-lg text-neutral-400 transition group-hover:text-[#2383e2]">
                        →
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <nav className="mt-8 text-center text-sm font-bold text-neutral-500 dark:text-neutral-400" aria-label="Back links">
          <Link href="/links" className="transition hover:text-[#111318] dark:hover:text-white">
            Back to Links
          </Link>
        </nav>
      </section>
    </main>
  );
}
