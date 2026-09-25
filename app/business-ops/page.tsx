import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { founderName, siteName, siteUrl } from "../site";

export const metadata: Metadata = {
  title: "Business Ops",
  description: "Command Center, Fitness, and Finances in one place.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/business-ops",
  },
  openGraph: {
    title: `${founderName} Business Ops | ${siteName}`,
    description: "Command Center, Fitness, and Finances in one place.",
    url: `${siteUrl}/business-ops`,
  },
};

const links = [
  { label: "Command Center", href: "/dashboard", description: "Work queue, planning, and client context." },
  { label: "Fitness", href: "/fitness", description: "Workouts and morning movement." },
  { label: "Finances", href: "/finances", description: "Current money and financial plans." },
] as const;

export default function BusinessOpsPage() {
  return (
    <main className="min-h-dvh bg-[#f7f7f5] px-5 py-8 text-[#111318] [color-scheme:light] dark:bg-[#0c0d0f] dark:text-white dark:[color-scheme:dark] sm:px-8">
      <section className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[30rem] flex-col justify-center">
        <header className="text-center">
          <div className="mx-auto block w-32">
            <Image
              src="/singleton-systems-wordmark.svg"
              alt="Singleton Systems"
              width={660}
              height={260}
              priority
              className="h-auto w-full dark:invert"
            />
          </div>
          <h1 className="mx-auto mt-6 text-base font-bold leading-tight text-neutral-800 dark:text-neutral-100">
            Business Ops
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            Command Center, Fitness, and Finances.
          </p>
        </header>

        <nav className="mt-9 grid gap-3" aria-label="Business tools">
          {links.map((link) => (
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
        </nav>
      </section>
    </main>
  );
}
