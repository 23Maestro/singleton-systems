"use client";

import Image from "next/image";
import { Film } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./recruiting.module.css";

const sports = [
  { name: "Football", alt: "Football player reaching for the end zone", origin: "64% 58%" },
  { name: "Basketball", alt: "Basketball player driving past a defender", origin: "50% 45%" },
  { name: "Baseball", alt: "Baseball player swinging at a pitch", origin: "60% 50%" },
  { name: "Softball", alt: "Softball player throwing the ball", origin: "55% 50%" },
  { name: "Soccer", alt: "Soccer players chasing the ball", origin: "65% 65%" },
  { name: "Volleyball", alt: "Volleyball players ready to receive", origin: "48% 55%" },
  { name: "Lacrosse", alt: "Lacrosse players competing in a faceoff", origin: "48% 55%" },
];

export default function SportsPhotoStage() {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [ready, setReady] = useState<boolean[]>(sports.map(() => false));
  const stage = useRef<HTMLDivElement>(null);
  const photos = useRef<(HTMLImageElement | null)[]>([]);
  const motion = useRef<(Animation | undefined)[]>([]);
  const selection = useRef(0);
  const running = !reduced && visible && !hidden && ready[active];
  const next = (active + 1) % sports.length;
  const nextReady = ready[next];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduced(preference.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updatePreference();
    updateVisibility();
    preference.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 });
    if (stage.current) observer.observe(stage.current);
    return () => {
      preference.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateVisibility);
      observer.disconnect();
      motion.current.forEach((animation) => animation?.cancel());
    };
  }, []);

  useEffect(() => {
    if (reduced) {
      motion.current.forEach((animation) => animation?.cancel());
      motion.current = [];
      return;
    }
    const photo = photos.current[active];
    if (!photo) return;
    motion.current[active]?.cancel();
    const animation = photo.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.03)" }],
      { duration: 6000, easing: "linear", fill: "forwards" },
    );
    animation.pause();
    motion.current[active] = animation;
  }, [active, reduced]);

  useEffect(() => {
    motion.current.forEach((animation, index) => {
      if (!animation) return;
      if (running && index === active) animation.play();
      else animation.pause();
    });
  }, [active, running, reduced]);

  useEffect(() => {
    if (!running || !nextReady) return;
    const timer = window.setTimeout(() => setActive(next), 6000);
    return () => window.clearTimeout(timer);
  }, [running, next, nextReady]);

  async function choose(index: number) {
    const request = ++selection.current;
    try {
      await photos.current[index]?.decode();
      if (selection.current === request) setActive(index);
    } catch {
      // Keep the current photo visible if the next image cannot load.
    }
  }

  return (
    <div className={styles.gallery} role="region" aria-label="Sports photo gallery">
      <div className={styles.visual}>
        <p className={styles.editorBadge}>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/15">
            <Film aria-hidden="true" size={18} />
          </span>
          <span>Edited by Jerami Singleton</span>
        </p>
        <div className={styles.stage} ref={stage} id="sports-photo-stage" data-sport={sports[active].name} data-running={Boolean(running)}>
          {sports.map((sport, index) => (
            <div key={sport.name} className={styles.slide} data-active={active === index} aria-hidden={active !== index}>
              <Image
                ref={(node) => { photos.current[index] = node; }}
                src={`/portfolio/recruiting/${sport.name.toLowerCase()}.webp`}
                alt={sport.alt}
                fill
                unoptimized
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                sizes="(min-width: 1024px) 680px, 100vw"
                style={{ objectPosition: sport.origin, transformOrigin: sport.origin }}
                onLoad={() => setReady((current) => current.map((value, i) => i === index || value))}
              />
            </div>
          ))}
          <div className={styles.photoShade} aria-hidden="true" />
        </div>
      </div>
      <div className={styles.sports} aria-label="Choose a sport">
        {sports.map((sport, index) => (
          <button key={sport.name} type="button" aria-pressed={active === index} aria-controls="sports-photo-stage" onClick={() => void choose(index)}>
            {sport.name}
          </button>
        ))}
        <span className={styles.moreSports}>And more</span>
      </div>
    </div>
  );
}
