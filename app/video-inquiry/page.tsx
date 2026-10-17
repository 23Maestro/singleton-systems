import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import VideoInquiryForm from "./VideoInquiryForm";

export const metadata: Metadata = {
  title: "Video Inquiry",
  description: "Send footage for a free test edit or a Singleton Systems video bundle: 4 long-form + 2 shorts or 8 long-form + 4 shorts.",
  alternates: { canonical: "/video-inquiry" },
  robots: { index: false, follow: false },
};
export default function VideoInquiryPage() {
  return <main className="min-h-dvh bg-white px-6 py-14 text-neutral-950 sm:px-8 sm:py-20"><div className="mx-auto max-w-[38rem]">
    <Link href="/" className="mx-auto block w-72 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-4 sm:w-80" aria-label="Singleton Systems video editing home"><Image src="/singleton-systems-wordmark.svg" alt="Singleton Systems" width={660} height={260} priority className="h-auto w-full" /></Link>
    <section className="mt-16 sm:mt-20"><h1 className="text-center text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Tell Me About Your Next Episode</h1><p className="mt-6 text-center text-lg leading-relaxed text-neutral-600">Start with a free sample, or send the footage for your chosen bundle. We confirm the scope and delivery dates together.</p><div className="mt-12"><Suspense fallback={<p role="status">Loading your video offer…</p>}><VideoInquiryForm /></Suspense></div></section>
  </div></main>;
}
