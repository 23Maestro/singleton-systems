"use client";
import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { VideoSample } from "@/lib/video-portfolio";

export default function YouTubeSample({ sample }: { sample: VideoSample }) {
  const [playing, setPlaying] = useState(false);
  const watchUrl = sample.watchUrl ?? `https://www.youtube.com/watch?v=${sample.id}${sample.start ? `&t=${sample.start}s` : ""}`;
  return <article data-video-sample={sample.id} className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white text-left shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
    <div className="relative aspect-video bg-neutral-950">
      {playing ? <iframe src={sample.embedUrl ?? `https://www.youtube-nocookie.com/embed/${sample.id}?autoplay=1&rel=0&start=${sample.start}`} title={sample.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="absolute inset-0 h-full w-full border-0" /> : <button type="button" onClick={() => setPlaying(true)} aria-label={`Play ${sample.title}`} className="group absolute inset-0 block h-full w-full focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-[#62d26f]">
        <Image unoptimized src={sample.poster ?? `https://i.ytimg.com/vi/${sample.id}/hqdefault.jpg`} alt="" width={480} height={360} className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" />
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true"><span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-black/85 text-white shadow-lg transition group-hover:scale-105"><svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor"><path d="M7 4v16l14-8Z" /></svg></span></span>
      </button>}
    </div>
    <div className="p-5 sm:p-6"><p className="text-sm font-bold uppercase tracking-[0.12em] text-[#126f39]">{sample.category}</p><h3 className="mt-2 text-xl font-semibold leading-snug">{sample.title}</h3><a href={watchUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-base font-semibold hover:text-[#075985] focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
      <span className="inline-flex items-center gap-2 border-b border-current pb-0.5">{sample.embedUrl ? "Watch on Google Drive" : "Watch on YouTube"}<ArrowUpRight aria-hidden="true" weight="bold" className="h-5 w-5 shrink-0 overflow-visible" /></span><span className="sr-only">: {sample.title}</span>
    </a></div>
  </article>;
}
