import Link from "next/link";
import { CAL_URL } from "@/app/site";
import { videoInquiryUrl } from "@/lib/video-offers";

export default function VideoBookSection() {
  return <section id="book" className="bg-black px-6 py-20 text-center text-white sm:px-8 sm:py-24 lg:px-10" aria-labelledby="book-heading"><div className="mx-auto max-w-3xl">
    <h2 id="book-heading" className="text-4xl font-semibold tracking-normal sm:text-5xl">Let&apos;s Edit <em className="mr-[0.12em] font-bold text-brand-text-green">Your</em> Next Episode</h2>
    <p className="mt-8 text-balance text-xl font-semibold leading-relaxed text-white/78 sm:text-2xl">Send your footage and see a free 30-45 second sample before choosing a video bundle.</p>
    <div className="mt-10 flex flex-wrap items-center justify-center gap-5"><Link href={videoInquiryUrl("free-test-edit")} className="inline-flex min-h-14 items-center justify-center rounded-full bg-white px-7 text-base font-bold text-black transition hover:bg-neutral-200">Try my footage free</Link><a href={CAL_URL} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/60 px-7 text-base font-bold text-white transition hover:bg-white/10">Talk through the fit</a></div>
  </div></section>;
}
