import Image from "next/image";

// Shared first screen for the homepage and landing pages: pill, headline, one line, call button and a photo chip.
export default function Hero({
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <section id="start" data-hero className="px-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center rounded-[2rem] border border-neutral-200/80 bg-[radial-gradient(ellipse_at_top,rgba(35,131,226,0.13),transparent_62%),linear-gradient(180deg,#ffffff,#f7f9fc)] px-5 py-16 text-center shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:px-10 sm:py-20 lg:min-h-[calc(100svh-9rem)] lg:rounded-[2.5rem]">
        <p
          data-hero-pill
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-base font-semibold text-neutral-700 shadow-[0_6px_18px_rgba(15,23,42,0.06)]"
        >
          <span
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black bg-[#eef6ff] text-[#2383e2]"
            aria-hidden="true"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
              <path d="M8 2.5L8.8 5.4L11.5 6.2L8.8 7L8 9.8L7.2 7L4.5 6.2L7.2 5.4L8 2.5Z" fill="currentColor" stroke="#050505" strokeWidth="0.45" strokeLinejoin="round" />
              <path d="M4 10.2L4.4 11.4L5.6 11.8L4.4 12.2L4 13.5L3.6 12.2L2.4 11.8L3.6 11.4L4 10.2Z" fill="currentColor" stroke="#050505" strokeWidth="0.35" strokeLinejoin="round" />
              <path d="M12 9.2L12.4 10.4L13.6 10.8L12.4 11.2L12 12.5L11.6 11.2L10.4 10.8L11.6 10.4L12 9.2Z" fill="currentColor" stroke="#050505" strokeWidth="0.35" strokeLinejoin="round" />
            </svg>
          </span>
          First simple problem solved free
        </p>
        <h1 className="mt-7 max-w-4xl text-balance text-[2.6rem] font-semibold leading-[1.03] tracking-[-0.02em] sm:text-6xl lg:text-[4.5rem]">
          {title}
        </h1>
        <p data-hero-body className="mt-6 max-w-xl text-balance text-lg font-medium leading-relaxed text-neutral-700 sm:text-xl">
          {body}
        </p>
        <div className="mt-9 flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <a
            href={ctaHref}
            className="inline-flex min-h-12 min-w-[12.75rem] items-center justify-center rounded-full bg-black px-7 text-base font-bold uppercase tracking-normal text-white shadow-[0_12px_28px_rgba(0,0,0,0.14)] transition hover:bg-neutral-800"
          >
            {ctaLabel}
          </a>
          <span data-hero-chip className="inline-flex items-center gap-3 text-base font-semibold text-neutral-700">
            <Image src="/23-hero.png" alt="Jerami Singleton" width={80} height={80} className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />
            Jerami Singleton · Tampa
          </span>
        </div>
      </div>
    </section>
  );
}
