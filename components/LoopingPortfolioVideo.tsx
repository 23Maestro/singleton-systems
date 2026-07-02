"use client";

import { useEffect, useRef, useState } from "react";

type LoopingPortfolioVideoProps = {
  src: string;
  poster: string;
  label: string;
  className?: string;
};

export default function LoopingPortfolioVideo({ src, poster, label, className }: LoopingPortfolioVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion && videoRef.current) {
      videoRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  function togglePlayback() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      void video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className={className}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
      />
      <button
        type="button"
        onClick={togglePlayback}
        className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/72 text-white shadow-[0_10px_24px_rgba(0,0,0,0.3)] backdrop-blur transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-white/70"
        aria-label={isPaused ? "Play portfolio video" : "Pause portfolio video"}
      >
        {isPaused ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4 translate-x-px" fill="currentColor" aria-hidden="true">
            <path d="M8 5.6v12.8c0 .7.78 1.13 1.38.75l9.85-6.4a.9.9 0 0 0 0-1.5L9.38 4.85C8.78 4.47 8 4.9 8 5.6Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M7.75 5.5c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h1.5c.69 0 1.25-.56 1.25-1.25V6.75c0-.69-.56-1.25-1.25-1.25h-1.5Zm7 0c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h1.5c.69 0 1.25-.56 1.25-1.25V6.75c0-.69-.56-1.25-1.25-1.25h-1.5Z" />
          </svg>
        )}
      </button>
    </div>
  );
}
