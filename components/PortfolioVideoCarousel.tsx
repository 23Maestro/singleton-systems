"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import LoopingPortfolioVideo, { type LoopingPortfolioVideoHandle } from "@/components/LoopingPortfolioVideo";

const projects = [
  {
    name: "1-Click Follow-Up",
    source: "Prospect ID",
    src: "/portfolio/proof-videos/prospect-id.mp4",
    poster: "/portfolio/proof-videos/prospect-id-poster.jpg",
  },
  {
    name: "$300 Job. 2 Hours.",
    source: "Upwork Client",
    src: "/portfolio/proof-videos/hnoc.mp4",
    poster: "/portfolio/proof-videos/hnoc-poster.jpg",
  },
  {
    name: "AI Preps the Project",
    source: "Catena Media",
    src: "/portfolio/proof-videos/catena.mp4",
    poster: "/portfolio/proof-videos/catena-poster.jpg",
  },
  {
    name: "140+ Videos. 6 Weeks.",
    source: "Prospect ID",
    src: "/portfolio-2-ssystems.mp4",
    poster: "/portfolio-2-ssystems-poster.jpg",
  },
] as const;

const SWIPE_DISTANCE = 50;
const SWIPE_VELOCITY = 0.5;

export default function PortfolioVideoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [deckWidth, setDeckWidth] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Array<LoopingPortfolioVideoHandle | null>>([]);
  const pointerIdRef = useRef<number | null>(null);
  const dragStartRef = useRef(0);
  const lastPointRef = useRef({ x: 0, time: 0 });
  const velocityRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const deck = deckRef.current;

    if (!deck) return;

    const updateWidth = () => setDeckWidth(deck.getBoundingClientRect().width);
    const resizeObserver = new ResizeObserver(updateWidth);

    updateWidth();
    resizeObserver.observe(deck);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 },
    );

    observer.observe(carousel);
    return () => observer.disconnect();
  }, []);

  const isMobile = deckWidth > 0 && deckWidth < 640;
  const cardWidth = deckWidth === 0
    ? 0
    : isMobile
      ? Math.min(deckWidth * 0.72, 250)
      : Math.min(deckWidth * 0.55, 560);
  const spacing = cardWidth * (isMobile ? 0.44 : 0.46);
  const deckHeight = cardWidth === 0 ? 260 : cardWidth * (9 / 16) * 1.22 + (isMobile ? 124 : 100);

  function previous() {
    setActiveIndex((index) => (index - 1 + projects.length) % projects.length);
  }

  function next() {
    setActiveIndex((index) => (index + 1) % projects.length);
  }

  function chooseFromSwipe(distance: number, velocity: number) {
    if (distance < -SWIPE_DISTANCE || velocity < -SWIPE_VELOCITY) {
      next();
    } else if (distance > SWIPE_DISTANCE || velocity > SWIPE_VELOCITY) {
      previous();
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) return;

    pointerIdRef.current = event.pointerId;
    dragStartRef.current = event.clientX;
    lastPointRef.current = { x: event.clientX, time: performance.now() };
    velocityRef.current = 0;
    setDragOffset(0);
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || pointerIdRef.current !== event.pointerId) return;

    const now = performance.now();
    const elapsed = Math.max(now - lastPointRef.current.time, 1);
    const movement = event.clientX - lastPointRef.current.x;

    velocityRef.current = movement / elapsed;
    lastPointRef.current = { x: event.clientX, time: now };
    setDragOffset(event.clientX - dragStartRef.current);
  }

  function finishDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || pointerIdRef.current !== event.pointerId) return;

    chooseFromSwipe(dragOffset, velocityRef.current);
    pointerIdRef.current = null;
    setDragOffset(0);
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function cancelDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || pointerIdRef.current !== event.pointerId) return;

    pointerIdRef.current = null;
    setDragOffset(0);
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
  }

  return (
    <div
      id="portfolio"
      ref={carouselRef}
      role="region"
      aria-label="Portfolio proof videos"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="mt-14 w-full outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-8 sm:mt-16"
    >
      <h2 className="text-center text-3xl font-semibold tracking-normal text-neutral-950 sm:text-4xl">
        Solutions Built With AI
      </h2>
      <div
        ref={deckRef}
        className="relative mt-7 flex w-full touch-pan-y select-none items-center justify-center overflow-visible sm:mt-9"
        style={{
          height: `${deckHeight}px`,
          opacity: deckWidth === 0 ? 0 : 1,
          perspective: "1500px",
          perspectiveOrigin: "center center",
          transition: "opacity 160ms ease",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={cancelDrag}
      >
        {projects.map((project, index) => {
          const baseOffset = index - activeIndex;
          const offset = baseOffset + (spacing === 0 ? 0 : dragOffset / spacing);
          const distance = Math.abs(offset);
          const isActive = index === activeIndex;
          const circularDistance = Math.min(
            (index - activeIndex + projects.length) % projects.length,
            (activeIndex - index + projects.length) % projects.length,
          );
          const x = spacing * offset;
          const z = isActive ? 260 : -90 * distance;
          const rotation = isActive ? 0 : offset < 0 ? 42 : -42;
          const scale = isActive ? 1.22 : Math.max(0.74, 1.02 - distance * 0.08);
          const zIndex = isActive ? 1000 : Math.max(10, 200 - Math.round(distance * 50));

          return (
            <div
              key={project.name}
              className={`portfolio-card-motion absolute ${isActive ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
              style={{
                width: `${cardWidth}px`,
                aspectRatio: "16 / 9",
                opacity: distance > 2.1 ? 0 : 1,
                transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotation}deg) scale(${scale})`,
                transformOrigin: "center center",
                transformStyle: "preserve-3d",
                transition: isDragging
                  ? "none"
                  : "transform 520ms cubic-bezier(0.23, 1, 0.32, 1), opacity 380ms ease",
                zIndex,
              }}
              onClick={() => {
                if (!isDragging && Math.abs(dragOffset) < 8) setActiveIndex(index);
              }}
              aria-hidden={!isActive}
            >
              <div className="relative h-full w-full rounded-[1rem] border border-black/20 bg-black shadow-[0_22px_44px_-24px_rgba(15,23,42,0.32),0_8px_18px_-12px_rgba(15,23,42,0.22)] sm:rounded-[1.25rem]">
                <LoopingPortfolioVideo
                  ref={(video) => {
                    videoRefs.current[index] = video;
                  }}
                  src={project.src}
                  poster={project.poster}
                  label={`${project.source}: ${project.name} portfolio video`}
                  active={isActive && isVisible && !prefersReducedMotion}
                  preload={circularDistance <= 1 ? "auto" : "metadata"}
                  priority={index === 0}
                  className="h-full w-full rounded-[inherit] object-contain"
                  onPausedChange={isActive ? setIsVideoPaused : undefined}
                />
                <span
                  className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/15"
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-1 grid grid-cols-[2.5rem_9rem_2.5rem] grid-rows-[2rem_auto] items-center justify-center gap-x-3 gap-y-2 sm:mt-2 sm:grid-cols-[3rem_14rem_3rem] sm:grid-rows-[2.25rem_auto] sm:gap-x-12 sm:gap-y-3">
        <button
          type="button"
          onClick={() => videoRefs.current[activeIndex]?.togglePlayback()}
          className="relative col-start-3 row-start-1 inline-flex h-8 w-8 items-center justify-self-end rounded-full border border-black/15 bg-white text-black shadow-[0_8px_22px_rgba(15,23,42,0.16)] transition hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-black/60 sm:h-9 sm:w-9"
          aria-label={isVideoPaused ? "Play portfolio video" : "Pause portfolio video"}
        >
          {isVideoPaused ? (
            <svg viewBox="0 0 24 24" className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2" fill="currentColor" aria-hidden="true">
              <path d="M8 5.6v12.8c0 .7.78 1.13 1.38.75l9.85-6.4a.9.9 0 0 0 0-1.5L9.38 4.85C8.78 4.47 8 4.9 8 5.6Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2" fill="currentColor" aria-hidden="true">
              <path d="M7.75 5.5c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h1.5c.69 0 1.25-.56 1.25-1.25V6.75c0-.69-.56-1.25-1.25-1.25h-1.5Zm7 0c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h1.5c.69 0 1.25-.56 1.25-1.25V6.75c0-.69-.56-1.25-1.25-1.25h-1.5Z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={previous}
          aria-label="Previous project"
          className="col-start-1 row-start-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-lg text-neutral-950 shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition hover:border-neutral-950 sm:h-12 sm:w-12 sm:text-xl"
        >
          <span aria-hidden="true">←</span>
        </button>

        <div aria-live="polite" className="col-start-2 row-start-2 w-36 text-center sm:w-56">
          <p className="text-base font-semibold leading-tight text-neutral-950 [text-shadow:0_1px_0_#fff,0_0_12px_rgba(255,255,255,0.9)] sm:text-xl">{projects[activeIndex].name}</p>
          <p className="mt-1 text-xs font-semibold text-neutral-500 sm:text-sm">{projects[activeIndex].source}</p>
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Next project"
          className="col-start-3 row-start-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-lg text-neutral-950 shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition hover:border-neutral-950 sm:h-12 sm:w-12 sm:text-xl"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-2.5" aria-label="Choose a project">
        {projects.map((project, index) => (
          <button
            key={project.name}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show ${project.name}`}
            aria-current={index === activeIndex ? "true" : undefined}
            className={`h-2.5 rounded-full transition-[width,background-color] ${
              index === activeIndex ? "w-8 bg-black" : "w-2.5 bg-neutral-300 hover:bg-neutral-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
