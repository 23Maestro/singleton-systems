"use client";

import { Reorder } from "motion/react";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import type { Reel } from "@/lib/reel-order";
import styles from "./reel-order.module.css";

type Lists = { timeline: string[]; bench: string[]; trashed: string[] };

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
  const dragging = useRef(false);
  const strip = useRef<HTMLUListElement>(null);
  const [ready, setReady] = useState(false);

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

  function dropIndex(event: DragEvent) {
    const cards = [...(strip.current?.children ?? [])] as HTMLElement[];
    const i = cards.findIndex((card) => { const r = card.getBoundingClientRect(); return event.clientX < r.left + r.width / 2; });
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
        <button className={styles.send} onClick={send} disabled={status === "sending" || lists.timeline.length === 0}>
          {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : "Done, send my order"}
        </button>
      </header>
      {message && <p role="status" className={status === "error" ? styles.error : styles.notice}>{message}</p>}

      <main className={styles.main}>
        <section className={styles.player} aria-label="Selected play">
          <div className={styles.playerHead}>
            <h2>{spot >= 0 ? `${spot + 1}. ` : ""}{titles.get(current)}</h2>
            <label className={styles.toggle}>
              <input type="checkbox" checked={playNext} onChange={(e) => setPlayNext(e.target.checked)} /> Play the next one when it ends
            </label>
          </div>
          <video
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

        <aside className={styles.panel} aria-label="More plays">
          <h2>More plays <span>{lists.bench.length}</span></h2>
          <p className={styles.hint}>Drag one down into your reel, or press Add. Press Trash if you don&apos;t want it.</p>
          <ul className={styles.benchList}>
            {lists.bench.map((id) => (
              <li key={id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", id)} className={current === id ? styles.active : undefined}>
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
        </aside>
      </main>

      <section
        className={styles.film}
        aria-label="Your reel"
        onDragOver={(e) => { if (e.dataTransfer.types.includes("text/plain")) { e.preventDefault(); setDropAt(dropIndex(e)); } }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropAt(null); }}
        onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (titles.has(id)) { move(id, "timeline", dropIndex(e)); setCurrent(id); } setDropAt(null); }}
      >
        <h2>Your reel <span>{lists.timeline.length} plays</span> <small>Saved on this computer</small></h2>
        <Reorder.Group ref={strip} as="ul" axis="x" values={lists.timeline} onReorder={(timeline) => setLists((prev) => ({ ...prev, timeline }))} className={styles.strip} layoutScroll>
          {lists.timeline.map((id, i) => (
            <Reorder.Item
              key={id}
              value={id}
              className={`${styles.card} ${current === id ? styles.active : ""} ${dropAt === i ? styles.dropBefore : ""} ${dropAt === lists.timeline.length && i === lists.timeline.length - 1 ? styles.dropAfter : ""}`}
              onDragStart={() => { dragging.current = true; }}
              onDragEnd={() => { setTimeout(() => { dragging.current = false; }, 0); }}
              onClick={() => { if (!dragging.current) setCurrent(id); }}
              whileDrag={{ scale: 1.05, zIndex: 5 }}
            >
              <img src={`${media}/${id}.jpg`} alt="" draggable={false} />
              <b>{i + 1}</b>
              <button className={styles.remove} aria-label={`Take out ${titles.get(id)}`} title="Take out" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); move(id, "bench"); }}>×</button>
              <span>{titles.get(id)}</span>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </section>
    </div>
  );
}
