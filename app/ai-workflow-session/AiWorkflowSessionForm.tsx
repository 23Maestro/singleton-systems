"use client";

import { FormEvent, useRef, useState } from "react";
import { prepareInquiryRequest, type InquiryAttempt } from "@/lib/inquiry-request";
import { AI_WORKFLOW_OFFERS, type AiWorkflowOffer } from "@/lib/ai-workflow-offers";

export default function AiWorkflowSessionForm({ initialOffer }: { initialOffer?: AiWorkflowOffer }) {
  const attempt = useRef<InquiryAttempt | null>(null);
  const sending = useRef(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    const input = new FormData(form);
    attempt.current = prepareInquiryRequest(input, attempt.current);
    sending.current = true;
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/ai-intake", { method: "POST", body: input });
      const body = (await response.json()) as { error?: string; delivery?: { state: string; error?: string } };
      if (!response.ok || body.delivery?.state !== "delivered") {
        throw new Error(body.delivery?.error || body.error || "Something went wrong. Please try again.");
      }
      setStatus("sent");
      form.reset();
    } catch (caught) {
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      sending.current = false;
    }
  }

  if (status === "sent") {
    return <div className="py-8 text-center"><p className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950">Got it.</p><p className="mt-2 text-[15px] leading-6 text-neutral-600">I&apos;ll take a look and come back with the clearest next step.</p></div>;
  }

  return <form onSubmit={submit} className="space-y-9" encType="multipart/form-data">
    <p className="text-center text-xl font-semibold tracking-[-0.025em] text-neutral-950">What are one or two things you&apos;d like AI to make easier?</p>
    <label className="block"><span className="text-base font-semibold text-neutral-950">Where would you like to start?</span><select name="offer" required defaultValue={initialOffer ?? ""} className="mt-3 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-[16px] text-neutral-950 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"><option value="" disabled>Choose an option</option>{AI_WORKFLOW_OFFERS.map((offer) => <option key={offer.value} value={offer.value}>{offer.label}</option>)}</select></label>
    <div><label className="block"><span className="sr-only">Tell me what repeats</span><textarea name="aiWish" rows={4} aria-label="Tell me what repeats" placeholder="Drop your notes, add a Loom link or upload a voice memo" className="block w-full resize-y rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[16px] leading-6 text-neutral-950 outline-none placeholder:text-neutral-500 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" /></label><label className="mt-3 inline-block cursor-pointer text-sm font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-950"><span>Attach a voice memo</span><span className="sr-only"> (optional, up to 25 MB)</span><input name="audio" type="file" accept="audio/*" className="sr-only" /></label></div>
    <div className="grid gap-7 sm:grid-cols-2"><label className="block"><span className="text-base font-semibold text-neutral-950">Name</span><input name="name" required autoComplete="name" className="mt-3 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-[16px] text-neutral-950 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" /></label><label className="block"><span className="text-base font-semibold text-neutral-950">Email</span><input name="email" required type="email" autoComplete="email" className="mt-3 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-[16px] text-neutral-950 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" /></label></div>
    <label className="hidden" aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
    {status === "error" && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button disabled={status === "sending"} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-black px-6 text-base font-semibold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-4 disabled:opacity-60">{status === "sending" ? "Sending…" : "Send it over"}</button>
  </form>;
}
