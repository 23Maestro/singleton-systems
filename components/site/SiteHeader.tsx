import Image from "next/image";
import Link from "next/link";
import type { NavItem } from "@/components/site/nav";

export default function SiteHeader({ items, homeHref }: { items: NavItem[]; homeHref: string }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-7 py-8 sm:px-8 lg:px-10">
      <a href={homeHref} className="block w-24 sm:w-28" aria-label="Singleton Systems home">
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
        {items.map((item) => (
          <Link key={item.href} className="whitespace-nowrap transition hover:text-black" href={item.href}>
            {item.label}
          </Link>
        ))}
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
          {items.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </details>
    </header>
  );
}
