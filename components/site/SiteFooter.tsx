import Image from "next/image";
import Link from "next/link";
import type { NavItem } from "@/components/site/nav";

export default function SiteFooter({ items }: { items: NavItem[] }) {
  return (
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
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-neutral-600">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
