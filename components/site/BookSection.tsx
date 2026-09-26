import BookQuickChatButton from "@/components/BookQuickChatButton";
import { CAL_URL } from "@/app/site";

export default function BookSection() {
  return (
    <section id="book" className="bg-black px-6 py-20 text-center text-white sm:px-8 sm:py-24 lg:px-10" aria-labelledby="book-heading">
      <div className="mx-auto max-w-3xl">
        <h2 id="book-heading" className="text-4xl font-semibold tracking-normal sm:text-5xl">
          Let&apos;s check out <em className="font-bold text-brand-text-green drop-shadow-[0_0_12px_rgba(37,194,102,0.42)]">your</em> flow
        </h2>
        <p className="mt-8 text-balance text-xl font-semibold leading-relaxed text-white/78 sm:text-2xl">
          Book a free call or tell me what you wish AI could help you do
        </p>
        <div className="mt-10 flex items-center justify-center">
          <a
            href={CAL_URL}
            className="inline-flex min-h-14 min-w-[13rem] items-center justify-center rounded-full bg-white px-7 text-sm font-bold uppercase tracking-normal text-black transition hover:bg-neutral-200 md:hidden"
          >
            Book a Free Call
          </a>
          <BookQuickChatButton className="hidden min-h-14 min-w-[13rem] items-center justify-center rounded-full bg-white px-7 text-sm font-bold uppercase tracking-normal text-black transition hover:bg-neutral-200 md:inline-flex" />
        </div>
      </div>
    </section>
  );
}
