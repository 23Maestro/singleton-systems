import Link from "next/link";
import { FEATURED_EDITS, MORE_EDITS } from "@/lib/video-portfolio";
import YouTubeSample from "./YouTubeSample";

export default function EditingPortfolio() {
  return <section id="portfolio" className="mt-16 w-full sm:mt-20" aria-labelledby="portfolio-heading">
    <div className="mx-auto max-w-3xl text-center"><p className="text-base font-bold uppercase tracking-[0.14em] text-[#126f39]">Selected edits</p><h2 id="portfolio-heading" className="mt-4 text-4xl font-semibold sm:text-5xl">Video Editing Across Formats</h2></div>
    <div className="mt-10 grid gap-6 sm:grid-cols-2">{FEATURED_EDITS.map((sample) => <YouTubeSample key={sample.id} sample={sample} />)}</div>
    <details className="mt-8 rounded-[1.5rem] border border-neutral-200 bg-white p-5 sm:p-7"><summary className="cursor-pointer text-lg font-bold">See All {FEATURED_EDITS.length + MORE_EDITS.length} Edits · {MORE_EDITS.length} More Examples</summary><div className="mt-6 grid gap-6 sm:grid-cols-2">{MORE_EDITS.map((sample) => <YouTubeSample key={sample.id} sample={sample} />)}</div></details>
    <p className="mt-8 text-center text-lg leading-relaxed text-neutral-700">Have footage like this? <Link href="#offers" className="font-semibold underline underline-offset-4">Compare the video bundles.</Link></p>
  </section>;
}
