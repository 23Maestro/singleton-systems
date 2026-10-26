"use client";

import { useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { VIDEO_OFFERS, isVideoOffer, videoOffer } from "@/lib/video-offers";

const subscribe = () => () => {};

export default function VideoInquiryForm() {
  const requested = useSearchParams().get("offer");
  const preview = useSyncExternalStore(subscribe, () => window.location.hostname.endsWith(".chatgpt.site"), () => false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = new FormData(form);
    const selected = input.get("offer");
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/video-intake", { method: "POST", body: input });
      const body = await response.json() as { error?: string; preview?: boolean; offer?: { label: string }; delivery?: { state: string } };
      if (body.preview) throw new Error("This is a review preview. Your inquiry has not been sent. Submission opens after the production launch.");
      if (!response.ok || body.delivery?.state !== "delivered") throw new Error(body.error || "Your inquiry could not be delivered. Please try again.");
      setReceipt(body.offer?.label ?? (isVideoOffer(selected) ? videoOffer(selected).label : "Video inquiry"));
      setStatus("sent");
      form.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your inquiry could not be delivered. Please try again.");
      setStatus("error");
    }
  }
  if (status === "sent") return <div role="status" className="rounded-2xl border border-neutral-200 bg-white p-8 text-center"><h2 className="text-2xl font-semibold">Your Video Inquiry Is In</h2><p className="mt-4 text-lg">{receipt}</p><p className="mt-3 text-base leading-relaxed text-neutral-600">I&apos;ll review your footage and confirm the scope and delivery dates with you.</p></div>;
  const field = "mt-3 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-950 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10";
  return <form onSubmit={submit} className="space-y-8">
    {preview && <p className="rounded-xl border border-neutral-300 bg-neutral-50 p-4 text-base leading-relaxed">Review preview. Submissions open after the production launch.</p>}
    <label className="block"><span className="text-base font-semibold">Selected video offer</span><select name="offer" required defaultValue={isVideoOffer(requested) ? requested : ""} className={field}><option value="" disabled>Choose a video offer</option>{VIDEO_OFFERS.map((offer) => <option key={offer.value} value={offer.value}>{offer.label}</option>)}</select></label>
    <p className="text-base leading-relaxed text-neutral-600">Paid bundles include two revision rounds per video, with timestamped feedback in Frame.io. Pay 50% to start and the remaining 50% after approval, before final delivery. The test edit is free.</p>
    <label className="block"><span className="text-base font-semibold">Recording link or series brief</span><textarea name="footage" required maxLength={5000} rows={5} className={field} placeholder="What do you record, and what should the finished episode look like? Add a footage link if it is ready." /></label>
    <p className="text-base leading-relaxed text-neutral-600">Share a link you have permission to send. Keep private access codes out of this form.</p>
    <div className="grid gap-7 sm:grid-cols-2"><label className="block"><span className="text-base font-semibold">Name</span><input name="name" required maxLength={120} autoComplete="name" className={field} /></label><label className="block"><span className="text-base font-semibold">Email</span><input name="email" required type="email" maxLength={320} autoComplete="email" className={field} /></label></div>
    <label className="hidden" aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
    {status === "error" && <p role="alert" className="text-base leading-relaxed text-red-700">{error}</p>}
    <button disabled={status === "sending"} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-black px-6 text-base font-semibold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-4 disabled:opacity-60">{status === "sending" ? "Sending…" : "Send my video inquiry"}</button>
  </form>;
}
