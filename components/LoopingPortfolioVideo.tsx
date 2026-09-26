"use client";

import Image from "next/image";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export type LoopingPortfolioVideoHandle = {
  togglePlayback: () => void;
};

type LoopingPortfolioVideoProps = {
  src: string;
  poster: string;
  label: string;
  active: boolean;
  preload?: "auto" | "metadata" | "none";
  priority?: boolean;
  className?: string;
  onPausedChange?: (isPaused: boolean) => void;
};

const LoopingPortfolioVideo = forwardRef<LoopingPortfolioVideoHandle, LoopingPortfolioVideoProps>(function LoopingPortfolioVideo({
  src,
  poster,
  label,
  active,
  preload = "metadata",
  priority = false,
  className,
  onPausedChange,
}, ref) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoFrameCallbackRef = useRef<number | null>(null);
  const fallbackFrameCallbackRef = useRef<number | null>(null);
  const [hasPresentedFrame, setHasPresentedFrame] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const video = videoRef.current;

    if (!video) return;

    if (!active || prefersReducedMotion) {
      video.pause();
      video.currentTime = 0;
      setHasPresentedFrame(false);
      if (active) onPausedChange?.(true);
    } else {
      void video.play().catch(() => onPausedChange?.(true));
    }

    return () => {
      if (videoFrameCallbackRef.current !== null && typeof video.cancelVideoFrameCallback === "function") {
        video.cancelVideoFrameCallback(videoFrameCallbackRef.current);
        videoFrameCallbackRef.current = null;
      }

      if (fallbackFrameCallbackRef.current !== null) {
        cancelAnimationFrame(fallbackFrameCallbackRef.current);
        fallbackFrameCallbackRef.current = null;
      }
    };
  }, [active, onPausedChange]);

  function revealAfterPresentedFrame(video: HTMLVideoElement) {
    if (hasPresentedFrame || videoFrameCallbackRef.current !== null || fallbackFrameCallbackRef.current !== null) return;

    if (typeof video.requestVideoFrameCallback === "function") {
      videoFrameCallbackRef.current = video.requestVideoFrameCallback(() => {
        videoFrameCallbackRef.current = null;
        setHasPresentedFrame(true);
      });
      return;
    }

    fallbackFrameCallbackRef.current = requestAnimationFrame(() => {
      fallbackFrameCallbackRef.current = requestAnimationFrame(() => {
        fallbackFrameCallbackRef.current = null;
        setHasPresentedFrame(true);
      });
    });
  }

  function togglePlayback() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      void video.play().catch(() => onPausedChange?.(true));
    } else {
      video.pause();
    }
  }

  useImperativeHandle(ref, () => ({ togglePlayback }));

  return (
    <div className="relative h-full overflow-visible rounded-[inherit]">
      <video
        ref={videoRef}
        className={className}
        src={src}
        muted
        loop
        playsInline
        preload={preload}
        aria-label={label}
        onPlaying={(event) => {
          if (active) onPausedChange?.(false);
          revealAfterPresentedFrame(event.currentTarget);
        }}
        onPause={() => {
          if (active) onPausedChange?.(true);
        }}
        onError={() => {
          setHasPresentedFrame(false);
          if (active) onPausedChange?.(true);
        }}
      >
        Your browser does not support the video tag.
      </video>
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] transition-opacity duration-[700ms] [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] ${
          hasPresentedFrame ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      >
        <Image
          src={poster}
          alt=""
          fill
          priority={priority}
          draggable={false}
          sizes="(min-width:640px) 560px, 72vw"
          className="object-contain"
        />
      </div>
    </div>
  );
});

export default LoopingPortfolioVideo;
