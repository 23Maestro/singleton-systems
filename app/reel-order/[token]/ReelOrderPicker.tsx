"use client";

import { motion, Reorder, useDragControls } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type DragEvent } from "react";
import type { Reel } from "@/lib/reel-order";
import styles from "./reel-order.module.css";
import Tour, { type TourStep } from "./Tour";

type Lists = { timeline: string[]; bench: string[]; trashed: string[] };

// Desktop and iPad landscape get the filmstrip; iPad portrait and phones get a scrolling list.
// Server render assumes desktop; the client corrects it on hydrate.
function useMedia(query: string, server: boolean) {
  return useSyncExternalStore(
    (onChange) => { const m = matchMedia(query); m.addEventListener("change", onChange); return () => m.removeEventListener("change", onChange); },
    () => matchMedia(query).matches,
    () => server,
  );
}

// Touch screens drag by the grip only, so a swipe on the card still scrolls
// (Motion docs: useDragControls + dragListener={false} + touch-action: none on the handle).
function ReelCard({ id, index, title, media, active, touch, dropClass, onSelect, onRemove }: {
  id: string; index: number; title?: string; media: string; active: boolean; touch: boolean; dropClass: string;
  onSelect: () => void; onRemove: () => void;
}) {
  const controls = useDragControls();
  const dragged = useRef(false);
  return (
    <Reorder.Item
      value={id}
      className={`${styles.card} ${active ? styles.active : ""} ${dropClass}`}
      dragListener={!touch}
      dragControls={controls}
      onDragStart={() => { dragged.current = true; }}
      onDragEnd={() => { setTimeout(() => { dragged.current = false; }, 0); }}
      onClick={() => { if (!dragged.current) onSelect(); }}
      whileDrag={{ scale: 1.04, zIndex: 5 }}
    >
      <img src={`${media}/${id}.jpg`} alt="" draggable={false} />
      <b>{index + 1}</b>
      <span>{title}</span>
      {touch && <span className={styles.grip} aria-hidden onPointerDown={(e) => controls.start(e)}>⠿</span>}
      <button className={styles.remove} aria-label={`Take out ${title}`} title="Take out" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onRemove(); }}>×</button>
    </Reorder.Item>
  );
}

export default function ReelOrderPicker({ reel, token, media }: { reel: Reel; token: string; media: string }) {
  const titles = useMemo(() => new Map([...reel.timeline, ...reel.bench].map((clip) => [clip.id, clip.title])), [reel]);
  const start: Lists = { timeline: reel.timeline.map((c) => c.id), bench: reel.bench.map((c) => c.id), trashed: [] };
  const key = `reel-order:${token}`;
  const [lists, setLists] = useState<Lists>(start);
  const [current, setCurrent] = useState(start.timeline[0]);
  const [playNext, setPlayNext] = useState(true);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const wide = useMedia("(min-width: 1024px)", true);
  const touch = useMedia("(pointer: coarse)", false);
  const strip = useRef<HTMLUListElement>(null);
  const [ready, setReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [touring, setTouring] = useState(false);
  const tourKey = "reel-order-tour-seen";

  // Show the guide once per device; "How it works" replays it.
  useEffect(() => {
    try { if (!localStorage.getItem(tourKey)) setTouring(true); } catch {}
  }, []);
  const closeTour = useCallback(() => { setTouring(false); try { localStorage.setItem(tourKey, "1"); } catch {} }, []);
  const tourSteps: TourStep[] = [
    { target: "[data-tour=reel]", title: "Set the order", text: touch ? "Hold ⠿ on a play and drag it up or down. Tap a play to watch it." : "Drag a play left or right to move it. Click a play to watch it." },
    { target: "[data-tour=add]", title: "Add more plays", text: "More plays are here. Open it to add one to your reel or trash it." },
    { target: "[data-tour=send]", title: "Send it to Jerami", text: "Press this when the order looks right. Your work saves on this device until then." },
  ];

  // Restore saved work, but only if it still holds exactly this reel's clips.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "null") as Lists | null;
      const all = [...saved?.timeline ?? [], ...saved?.bench ?? [], ...saved?.trashed ?? []];
      if (saved && all.length === titles.size && all.every((id) => titles.has(id)) && new Set(all).size === all.length) {
        setLists(saved);
        if (saved.timeline[0]) setCurrent(saved.timeline[0]);
      }
    } catch {}
    setReady(true);
  }, [key, titles]);

  // Save only after the restore above has run, so the start order never overwrites saved work.
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(key, JSON.stringify(lists)); } catch {}
    if (status === "sent") setStatus("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lists, key, ready]);

  const move = (id: string, to: keyof Lists, index?: number) => setLists((prev) => {
    const next: Lists = { timeline: prev.timeline.filter((x) => x !== id), bench: prev.bench.filter((x) => x !== id), trashed: prev.trashed.filter((x) => x !== id) };
    const target = [...next[to]];
    target.splice(index ?? (to === "timeline" ? target.length : 0), 0, id);
    return { ...next, [to]: target };
  });

  const spot = lists.timeline.indexOf(current);
  const video = useRef<HTMLVideoElement>(null);

  // Space plays or pauses (and replays a finished clip). Shift+Space turns "play the next one" on or off.
  // Works wherever focus sits after a click (a card, a button, the checkbox, the video), so it
  // never silently does something else. Only text boxes keep Space for typing. We blur the
  // focused control so its own Space click (fired on keyup) and the video's built-in toggle
  // can't fire too and cancel ours out. Enter still presses buttons.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code !== "Space" || touring || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || t.matches("textarea, select, input:not([type=checkbox]):not([type=radio]):not([type=button])"))) return;
      const v = video.current;
      if (!v) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.repeat) return;
      if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) document.activeElement.blur();
      if (e.shiftKey) {
        setPlayNext((on) => !on);
      } else if (v.paused || v.ended) {
        if (v.ended) v.currentTime = 0;
        void v.play();
      } else {
        v.pause();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [touring]);

  function dropIndex(event: DragEvent) {
    const cards = [...(strip.current?.children ?? [])] as HTMLElement[];
    const i = cards.findIndex((card) => { const r = card.getBoundingClientRect(); return wide ? event.clientX < r.left + r.width / 2 : event.clientY < r.top + r.height / 2; });
    return i === -1 ? lists.timeline.length : i;
  }

  async function send() {
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/reel-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, order: lists.timeline, trashed: lists.trashed }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Something went wrong. Try again.");
      setStatus("sent");
      setMessage(`Sent! Jerami has your order of ${lists.timeline.length} plays. You can still change it and send again.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Try again.");
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div>
          <h1>{reel.athlete} highlight order</h1>
          <p>Drag the plays into the order you want. Press the button when it looks right.</p>
        </div>
        <div className={styles.topActions}>
          <button onClick={() => setTouring(true)}>How it works</button>
          <button data-tour="send" className={styles.send} onClick={send} disabled={status === "sending" || lists.timeline.length === 0}>
            {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : "Done, send my order"}
          </button>
        </div>
      </header>
      {message && <p role="status" className={status === "error" ? styles.error : styles.notice}>{message}</p>}

      <main className={`${styles.main} ${panelOpen ? styles.mainOpen : ""}`}>
        <section className={styles.player} aria-label="Selected play">
          <div className={styles.playerHead}>
            <h2>{spot >= 0 ? `${spot + 1}. ` : ""}{titles.get(current)}</h2>
            {!touch && <span className={styles.keys}><kbd>Space</kbd> play or pause · <kbd>Shift</kbd>+<kbd>Space</kbd> keep playing on/off</span>}
            <label className={styles.toggle}>
              <input type="checkbox" checked={playNext} onChange={(e) => setPlayNext(e.target.checked)} /> Play the next one when it ends
            </label>
          </div>
          <video
            ref={video}
            key={current}
            className={styles.video}
            src={`${media}/${current}.mp4`}
            poster={`${media}/${current}.jpg`}
            controls
            autoPlay
            playsInline
            onEnded={() => { const next = lists.timeline[spot + 1]; if (playNext && spot >= 0 && next) setCurrent(next); }}
          />
        </section>

        {panelOpen && <aside id="more-plays" className={styles.panel} aria-label="More plays">
          <div className={styles.panelHead}>
            <h2>More plays <span>{lists.bench.length}</span></h2>
            <button onClick={() => setPanelOpen(false)}>Hide</button>
          </div>
          <p className={styles.hint}>{touch ? "Press Add to put a play at the end of your reel." : "Drag one down into your reel, or press Add."} Press Trash if you don&apos;t want it.</p>
          <ul className={styles.benchList}>
            {lists.bench.map((id) => (
              <li key={id} draggable={!touch} onDragStart={(e) => e.dataTransfer.setData("text/plain", id)} className={current === id ? styles.active : undefined}>
                <button className={styles.benchPlay} onClick={() => setCurrent(id)} aria-label={`Watch ${titles.get(id)}`}>
                  <img src={`${media}/${id}.jpg`} alt="" draggable={false} />
                  <span>{titles.get(id)}</span>
                </button>
                <div className={styles.benchActions}>
                  <button onClick={() => move(id, "timeline")}>Add</button>
                  <button onClick={() => move(id, "trashed")}>Trash</button>
                </div>
              </li>
            ))}
            {lists.bench.length === 0 && <li className={styles.empty}>No more plays here.</li>}
          </ul>
          {lists.trashed.length > 0 && (
            <details className={styles.trash}>
              <summary>Trash ({lists.trashed.length})</summary>
              <ul>
                {lists.trashed.map((id) => (
                  <li key={id}><span>{titles.get(id)}</span><button onClick={() => move(id, "bench")}>Put back</button></li>
                ))}
              </ul>
            </details>
          )}
        </aside>}
      </main>

      <section
        data-tour="reel"
        className={styles.film}
        aria-label="Your reel"
        onDragOver={(e) => { if (e.dataTransfer.types.includes("text/plain")) { e.preventDefault(); setDropAt(dropIndex(e)); } }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropAt(null); }}
        onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (titles.has(id)) { move(id, "timeline", dropIndex(e)); setCurrent(id); } setDropAt(null); }}
      >
        <div className={styles.filmHead}>
          <h2>Your reel <span>{lists.timeline.length} plays</span></h2>
          <small>{touch ? "Hold ⠿ to drag. " : ""}Saved on this device</small>
          <button data-tour="add" className={styles.addMore} aria-expanded={panelOpen} aria-controls="more-plays" onClick={() => setPanelOpen((open) => !open)}>
            {panelOpen ? "Hide more plays" : `+ Add more plays (${lists.bench.length})`}
          </button>
        </div>
        {/* Motion auto-scrolls the nearest scrolling ancestor of the group, so the wrapper scrolls, not the group. */}
        <motion.div className={styles.stripScroll} layoutScroll>
        <Reorder.Group key={wide ? "x" : "y"} ref={strip} as="ul" axis={wide ? "x" : "y"} values={lists.timeline} onReorder={(timeline) => setLists((prev) => ({ ...prev, timeline }))} className={styles.strip}>
          {lists.timeline.map((id, i) => (
            <ReelCard
              key={id}
              id={id}
              index={i}
              title={titles.get(id)}
              media={media}
              active={current === id}
              touch={touch}
              dropClass={dropAt === i ? styles.dropBefore : dropAt === lists.timeline.length && i === lists.timeline.length - 1 ? styles.dropAfter : ""}
              onSelect={() => { setCurrent(id); if (!wide) window.scrollTo({ top: 0, behavior: "smooth" }); }}
              onRemove={() => move(id, "bench")}
            />
          ))}
        </Reorder.Group>
        </motion.div>
      </section>
      {touring && <Tour steps={tourSteps} onClose={closeTour} />}
      <div className={styles.bottomBar}>
        <button data-tour="send" className={styles.send} onClick={send} disabled={status === "sending" || lists.timeline.length === 0}>
          {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : "Done, send my order"}
        </button>
      </div>
    </div>
  );
}
