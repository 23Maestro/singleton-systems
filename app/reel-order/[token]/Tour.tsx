"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./reel-order.module.css";

export type TourStep = { target: string; title: string; text: string };

// First visible element for a selector (the send button exists twice: header and phone bar).
function find(selector: string) {
  return [...document.querySelectorAll<HTMLElement>(selector)].find((el) => el.getClientRects().length > 0) ?? null;
}

// Dims the page, cuts a lit hole around one target, and shows a short card. Skip, Back and Esc always work.
export default function Tour({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const next = useRef<HTMLButtonElement>(null);
  const step = steps[i];

  useLayoutEffect(() => {
    const el = find(step.target);
    el?.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    const measure = () => setRect(find(step.target)?.getBoundingClientRect() ?? null);
    measure();
    addEventListener("resize", measure);
    addEventListener("scroll", measure, true);
    return () => { removeEventListener("resize", measure); removeEventListener("scroll", measure, true); };
  }, [step.target]);

  useEffect(() => { next.current?.focus(); }, [i]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [onClose]);

  const pad = 8, cardW = Math.min(340, innerWidth - 32), cardH = 200;
  // Clip the lit area to the screen; a tall target (the phone reel list) would push the card off-screen.
  const top = rect ? Math.max(rect.top, 8) : 0, bottom = rect ? Math.min(rect.bottom, innerHeight - 8) : 0;
  // Below the target if it fits, else above, else pinned to the bottom of the screen.
  const place = !rect ? "bottom" : innerHeight - bottom > cardH ? "below" : top > cardH ? "above" : "bottom";
  const cardTop = place === "below" ? bottom + pad + 12 : place === "above" ? top - pad - 12 : innerHeight - 16;
  const cardLeft = rect ? Math.min(Math.max(16, rect.left + rect.width / 2 - cardW / 2), innerWidth - cardW - 16) : 16;
  const last = i === steps.length - 1;

  return (
    <div className={styles.tour} role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {rect && <div className={styles.spot} style={{ top: top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: bottom - top + pad * 2 }} />}
      <div className={styles.tourCard} style={{ top: cardTop, left: cardLeft, width: cardW, transform: place === "below" ? undefined : "translateY(-100%)" }}>
        <p className={styles.tourCount}>{i + 1} of {steps.length}</p>
        <h2 id="tour-title">{step.title}</h2>
        <p>{step.text}</p>
        <div className={styles.tourActions}>
          <button onClick={onClose}>Skip</button>
          {i > 0 && <button onClick={() => setI(i - 1)}>Back</button>}
          <button ref={next} className={styles.tourNext} onClick={() => (last ? onClose() : setI(i + 1))}>{last ? "Got it" : "Next"}</button>
        </div>
      </div>
    </div>
  );
}
