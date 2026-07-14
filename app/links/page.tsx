import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { founderName, siteName, siteUrl } from "../site";

export const metadata: Metadata = {
  title: "Links",
  description: "The main Singleton Systems, portfolio, social, and GitHub links in one place.",
  alternates: {
    canonical: "/links",
  },
  openGraph: {
    title: `${founderName} Links | ${siteName}`,
    description: "The main Singleton Systems, portfolio, social, and GitHub links in one place.",
    url: `${siteUrl}/links`,
  },
};

const linkGroups = [
  {
    title: "Start Here",
    links: [
      {
        label: "Singleton Systems Website",
        href: "/",
        icon: "website",
        iconClassName: "text-[#8a6d3b] drop-shadow-[0_3px_7px_rgba(138,109,59,0.2)] dark:text-[#e4d5bd] dark:drop-shadow-[0_3px_7px_rgba(228,213,189,0.42)]",
      },
      {
        label: "Book a Flow Check",
        href: "https://cal.com/workflow-chat/15min",
        icon: "calendar",
        iconClassName: "text-[#4d7c0f] drop-shadow-[0_3px_7px_rgba(77,124,15,0.2)] dark:text-[#b7e36f] dark:drop-shadow-[0_3px_7px_rgba(183,227,111,0.42)]",
      },
      {
        label: "Send Details First",
        href: "https://tally.so/r/obgLaX",
        icon: "note",
        iconClassName: "text-[#2563eb] drop-shadow-[0_3px_7px_rgba(37,99,235,0.2)] dark:text-[#8bbcf8] dark:drop-shadow-[0_3px_7px_rgba(139,188,248,0.42)]",
      },
    ],
  },
  {
    title: "Portfolio",
    links: [
      {
        label: "AI Workflow Portfolio",
        href: "/ai-workflow-portfolio",
        icon: "portfolio",
        iconClassName: "text-[#be185d] drop-shadow-[0_3px_7px_rgba(190,24,93,0.18)] dark:text-[#f59ac9] dark:drop-shadow-[0_3px_7px_rgba(245,154,201,0.4)]",
      },
      {
        label: "Educational Content",
        href: "https://jeramisingleton.carrd.co/",
        icon: "education",
        iconClassName: "text-[#b45309] drop-shadow-[0_3px_7px_rgba(180,83,9,0.18)] dark:text-[#f7c948] dark:drop-shadow-[0_3px_7px_rgba(247,201,72,0.4)]",
      },
    ],
  },
  {
    title: "Social + Code",
    links: [
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/jeramisingleton/",
        icon: "linkedin",
        iconClassName: "text-[#4338ca] drop-shadow-[0_3px_7px_rgba(67,56,202,0.18)] dark:text-[#9da9fb] dark:drop-shadow-[0_3px_7px_rgba(157,169,251,0.4)]",
      },
      {
        label: "GitHub",
        href: "https://github.com/23Maestro",
        icon: "github",
        iconClassName: "text-[#111827] drop-shadow-[0_3px_7px_rgba(17,24,39,0.18)] dark:text-[#e5e7eb] dark:drop-shadow-[0_3px_7px_rgba(229,231,235,0.32)]",
      },
    ],
  },
] as const;

type LinkIconName = (typeof linkGroups)[number]["links"][number]["icon"];

function isExternalLink(href: string) {
  return href.startsWith("http");
}

function LinkCard({ link }: { link: (typeof linkGroups)[number]["links"][number] }) {
  const content = (
    <span className="flex items-center gap-4">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center ${link.iconClassName}`} aria-hidden="true">
        <LinkIcon name={link.icon} />
      </span>
      <span className="min-w-0 flex-1 text-left text-base font-bold leading-tight text-[#111318] dark:text-white">{link.label}</span>
    </span>
  );
  const className = "group block border-b border-black/15 py-3.5 transition hover:border-black/50 hover:bg-black/[0.03] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#f7f7f5] dark:border-white/15 dark:hover:border-white/60 dark:hover:bg-white/[0.03] dark:focus:ring-white dark:focus:ring-offset-[#0c0d0f]";

  if (isExternalLink(link.href)) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {content}
    </Link>
  );
}

function LinkIcon({ name }: { name: LinkIconName }) {
  const iconClassName = "h-5 w-5";

  if (name === "website") {
    return (
      <svg viewBox="0 0 24 24" className={iconClassName} fill="none" aria-hidden="true">
        <path d="M4 6.5h16v11H4z" stroke="currentColor" strokeWidth="2" />
        <path d="M4 10h16" stroke="currentColor" strokeWidth="2" />
        <path d="M8 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" className={iconClassName} fill="none" aria-hidden="true">
        <path d="M5 6h14v13H5z" stroke="currentColor" strokeWidth="2" />
        <path d="M8 4v4M16 4v4M5 10h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 14h2M14 14h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "note") {
    return (
      <svg viewBox="0 0 24 24" className={iconClassName} fill="none" aria-hidden="true">
        <path d="M6 4h9l3 3v13H6z" stroke="currentColor" strokeWidth="2" />
        <path d="M14 4v4h4M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "portfolio") {
    return (
      <svg viewBox="0 0 24 24" className={iconClassName} fill="none" aria-hidden="true">
        <path d="M5 8h14v11H5z" stroke="currentColor" strokeWidth="2" />
        <path d="M9 8V5h6v3M9 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "education") {
    return (
      <svg viewBox="0 0 24 24" className={iconClassName} fill="none" aria-hidden="true">
        <path d="m3 9 9-4 9 4-9 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M7 11v5c2.6 2 7.4 2 10 0v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" className={iconClassName} fill="currentColor" aria-hidden="true">
        <path d="M6.9 8.9H3.8v10.3h3.1zM5.3 7.6c1 0 1.8-.8 1.8-1.8S6.3 4 5.3 4 3.5 4.8 3.5 5.8s.8 1.8 1.8 1.8M20.5 13.6c0-3.2-1.7-4.9-4.2-4.9-1.9 0-2.8 1.1-3.3 1.8V8.9H10v10.3h3.1v-5.7c0-1.5.8-2.3 2-2.3s2.2.8 2.2 2.4v5.6h3.2z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={iconClassName} fill="currentColor" aria-hidden="true">
      <path d="M12 2.5A9.8 9.8 0 0 0 8.9 21.6c.5.1.7-.2.7-.5v-1.9c-2.9.6-3.5-1.2-3.5-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.6 2.5 1.1 3 .9.1-.7.4-1.1.7-1.4-2.3-.3-4.7-1.2-4.7-5A3.9 3.9 0 0 1 6.8 9c-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.9 1.1a10 10 0 0 1 5.3 0c2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1.1 2.7c0 3.9-2.4 4.7-4.7 5 .4.3.7.9.7 1.8v2.6c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.5" />
    </svg>
  );
}

export default function LinksPage() {
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
            Website | Portfolio | Booking | Socials | GitHub
          </p>
        </header>

        <div className="mt-9 grid gap-6">
          {linkGroups.map((group) => (
            <section key={group.title} aria-labelledby={`${group.title.toLowerCase().replaceAll(" ", "-")}-heading`}>
              <h2 id={`${group.title.toLowerCase().replaceAll(" ", "-")}-heading`} className="text-sm font-bold uppercase tracking-normal text-neutral-500 dark:text-neutral-500">
                {group.title}
              </h2>
              <div className="mt-3 grid gap-3">
                {group.links.map((link) => (
                  <LinkCard key={link.href} link={link} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
