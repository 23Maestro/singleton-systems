"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoReview } from "@/lib/video-review";

type Draft = { noteId: string; renderId: string; revision: string; presentedTime: number; snapshot: Blob; url: string };
const button = "rounded-lg border border-white/25 px-4 py-2 text-sm font-medium disabled:opacity-40";
export default function VideoReviewApp({ reviewId }: { reviewId: string }) {
  const [review, setReview] = useState<VideoReview | null>(null);
  const [selected, setSelected] = useState("");
  const [canComment, setCanComment] = useState(false);
  const [ready, setReady] = useState(false), [draft, setDraft] = useState<Draft | null>(null), [body, setBody] = useState("");
  const [verifiedMedia, setVerifiedMedia] = useState<{ renderId: string; url: string } | null>(null);
  const [saving, setSaving] = useState(false), [message, setMessage] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const pendingPlayback = useRef<{ renderId: string; time: number; playing: boolean } | null>(null);
  const frame = useRef<{ canvas: HTMLCanvasElement; time: number; renderId: string } | null>(null);
  const current = review?.renders.find(render => render.renderId === selected) ?? review?.renders[0];
  const renderId = current?.renderId;
  const mediaUrl = current?.media.url, mediaHash = current?.media.sha256;
  const verifiedUrl = verifiedMedia?.renderId === renderId ? verifiedMedia?.url : undefined;
  const load = useCallback(async () => {
    const response = await fetch(`/api/video-reviews/${reviewId}`, { cache: "no-store" });
    const value = await response.json();
    if (!response.ok) throw new Error(value.error ?? "This review could not be opened.");
    setReview(value);
    return value as VideoReview;
  }, [reviewId]);

  useEffect(() => {
    void load().catch(error => setMessage(error.message));
    void fetch("/api/video-reviews/session", { cache: "no-store" }).then(response => response.json()).then(value => setCanComment(value.canComment === true)).catch(() => setMessage("Could not load commenting. Reload this review to retry."));
  }, [load]);
  useEffect(() => {
    if (!renderId || !mediaUrl || !mediaHash) return;
    let active = true, url: string | undefined;
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(mediaUrl, { cache: "no-store", credentials: "omit", signal: controller.signal });
        if (!response.ok) throw new Error("The render could not be loaded for frame notes.");
        const bytes = await response.arrayBuffer();
        const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map(n => n.toString(16).padStart(2, "0")).join("");
        if (hash !== mediaHash) throw new Error("Render bytes no longer match this revision.");
        if (!active) return;
        url = URL.createObjectURL(new Blob([bytes], { type: response.headers.get("content-type") ?? "video/mp4" }));
        if (video.current) pendingPlayback.current = { renderId, time: video.current.currentTime, playing: !video.current.paused };
        setVerifiedMedia({ renderId, url });
      } catch (error) { if (active) setMessage((error as Error).message); }
    })();
    return () => { active = false; controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [renderId, mediaUrl, mediaHash]);
  useEffect(() => {
    const element = video.current;
    if (!element || !renderId || !verifiedUrl) return;
    frame.current = null;
    let active = true, callback = 0;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context || !element.requestVideoFrameCallback) return;
    const clear = () => { frame.current = null; setReady(false); };
    const presented = (_now: number, metadata: VideoFrameCallbackMetadata) => {
      if (!active) return;
      if (!element.seeking && element.readyState >= 2) {
        if (canvas.width !== element.videoWidth) canvas.width = element.videoWidth;
        if (canvas.height !== element.videoHeight) canvas.height = element.videoHeight;
        context.drawImage(element, 0, 0, canvas.width, canvas.height);
        frame.current = { canvas, time: metadata.mediaTime, renderId };
        setReady(true);
      }
      callback = element.requestVideoFrameCallback(presented);
    };
    element.addEventListener("seeking", clear);
    callback = element.requestVideoFrameCallback(presented);
    return () => { active = false; element.cancelVideoFrameCallback(callback); element.removeEventListener("seeking", clear); };
  }, [renderId, verifiedUrl]);
  useEffect(() => () => { if (draft) URL.revokeObjectURL(draft.url); }, [draft]);

  function restorePlayback(event: React.SyntheticEvent<HTMLVideoElement>) {
    const element = event.currentTarget, pending = pendingPlayback.current;
    if (!verifiedUrl || !pending || element.currentSrc !== verifiedUrl || pending.renderId !== renderId) return;
    pendingPlayback.current = null;
    if (pending.time > 0) element.currentTime = Math.min(pending.time, element.duration);
    if (pending.playing) void element.play().catch(() => setMessage("Press play to resume."));
  }

  async function capture() {
    const shown = frame.current, element = video.current;
    if (!shown || !element || !current || shown.renderId !== current.renderId || element.seeking) return;
    element.pause();
    const canvas = document.createElement("canvas");
    canvas.width = shown.canvas.width; canvas.height = shown.canvas.height;
    canvas.getContext("2d")!.drawImage(shown.canvas, 0, 0);
    try {
      const snapshot = await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("This frame could not be captured.")), "image/png"));
      setDraft({ noteId: crypto.randomUUID(), renderId: shown.renderId, revision: current.revision, presentedTime: shown.time, snapshot, url: URL.createObjectURL(snapshot) });
      setBody(""); setMessage("");
    } catch { setMessage("This video does not allow frame capture. Your saved notes are safe."); }
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setSaving(true); setMessage("Saving…");
    try {
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await draft.snapshot.arrayBuffer()))).map(n => n.toString(16).padStart(2, "0")).join("");
      const form = new FormData();
      form.set("note", JSON.stringify({ noteId: draft.noteId, renderId: draft.renderId, body, presentedTime: draft.presentedTime }));
      form.set("snapshot", draft.snapshot, "frame.png");
      const response = await fetch(`/api/video-reviews/${reviewId}/notes`, { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save. Your draft is still here.");
      const saved = (await load()).notes.find(note => note.noteId === draft.noteId);
      if (!saved || saved.renderId !== draft.renderId || saved.snapshotSha256 !== hash || saved.body !== body.trim() || saved.presentedTime !== draft.presentedTime) throw new Error("Save could not be confirmed. Your draft is still here; retry to check it.");
      setDraft(null); setBody(""); setMessage("Saved.");
    } catch (error) { setMessage(error instanceof TypeError ? "Could not save. Your draft is still here. Try again." : (error as Error).message); }
    finally { setSaving(false); }
  }

  return <main className="min-h-screen bg-[#101216] px-5 py-10 text-white sm:px-10">
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><p className="mb-2 text-sm text-white/60">Video review</p><h1 className="text-3xl font-semibold sm:text-4xl">{current?.title ?? "Open video review"}</h1></div>
        <span className="text-sm text-white/70">Anyone with this link can leave notes</span>
      </header>
      <p role="status" aria-live="polite" className="mb-4 min-h-6 text-sm text-white/80">{message}</p>
      {current && <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <section aria-label="Video and frame note" className="min-w-0">
          <label className="mb-4 flex items-center gap-3 text-sm">Render revision<select value={current.renderId} onChange={event => { setSelected(event.target.value); setReady(false); }} className="rounded border border-white/25 bg-[#1b1e24] p-2">{review?.renders.map(render => <option key={render.renderId} value={render.renderId}>{render.revision}</option>)}</select></label>
          <video key={current.renderId} ref={video} controls playsInline preload="auto" src={verifiedUrl ?? current.media.url} onLoadedMetadata={restorePlayback} className="aspect-video w-full rounded-xl bg-black" aria-label="Review video" />
          <div className="my-4 flex flex-wrap items-center gap-3"><button className={button + " bg-white/10"} disabled={!canComment || !verifiedUrl || !ready || !!draft || saving} onClick={capture}>Capture frame</button><span className="text-sm text-white/60">Pause on a frame to leave a note.</span></div>
          {draft && <form onSubmit={save} className="mt-5 grid gap-4 rounded-xl border border-white/20 bg-white/5 p-5">
            <p className="text-sm">{draft.revision} · {draft.presentedTime.toFixed(3)}s</p>
            {/* A captured frame has its own immutable image; later seeking cannot replace it. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={draft.url} alt="Captured frame" className="w-full rounded-lg" />
            <div className="grid gap-2"><label htmlFor="frame-review-note">Frame note</label><textarea id="frame-review-note" required maxLength={6000} value={body} onChange={event => setBody(event.target.value)} disabled={saving} className="min-h-28 rounded-lg border border-white/25 bg-black/20 p-3" /></div>
            <button className={button + " justify-self-start bg-white text-black"} disabled={saving || !body.trim()}>Save note</button>
          </form>}
        </section>
        <section aria-label="Saved frame notes">
          <h2 className="mb-4 text-xl font-semibold">Saved frame notes</h2>
          <div className="grid gap-4">{review?.notes.filter(note => note.renderId === current.renderId).map(note => <article key={note.noteId} className="rounded-xl border border-white/20 bg-white/5 p-4">
            <button className="mb-3 text-sm text-white/70 underline" onClick={() => { if (video.current) { video.current.pause(); video.current.currentTime = note.presentedTime; } }}>{current.revision} · {note.presentedTime.toFixed(3)}s</button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={note.snapshotUrl} alt={`Saved frame at ${note.presentedTime.toFixed(3)} seconds`} className="mb-3 w-full rounded" />
            <p className="whitespace-pre-wrap break-words">{note.body}</p>
          </article>)}</div>
          {!review?.notes.some(note => note.renderId === current.renderId) && <p className="text-sm text-white/60">No saved notes on this revision.</p>}
        </section>
      </div>}
    </div>
  </main>;
}
