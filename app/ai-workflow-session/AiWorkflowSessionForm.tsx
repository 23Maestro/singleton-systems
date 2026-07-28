"use client";

import { FormEvent, useState } from "react";

export default function AiWorkflowSessionForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const response = await fetch("/api/ai-intake", { method: "POST", body: new FormData(event.currentTarget) });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus("error");
      setError(body.error || "Something went wrong. Please try again.");
      return;
    }
    setStatus("sent");
    event.currentTarget.reset();
  }

  if (status === "sent") {
    return <div className="py-8 text-center"><p className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950">Got it.</p><p className="mt-2 text-[15px] leading-6 text-neutral-600">I&apos;ll take a look and come back with the clearest next step.</p></div>;
  }

  return <form onSubmit={submit} className="space-y-9" encType="multipart/form-data">
    <p className="text-center text-xl font-semibold tracking-[-0.025em] text-neutral-950">What are one or two things you&apos;d like AI to make easier?</p>
    <div><label className="block"><span className="text-base font-semibold text-neutral-950">Add a Loom link, attach a voice memo, or paste your notes.</span><textarea name="aiWish" rows={4} aria-label="Add a Loom link, attach a voice memo, or paste your notes" className="mt-4 block w-full resize-y rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[16px] leading-6 text-neutral-950 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" /></label><label className="mt-3 inline-block cursor-pointer text-sm font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-950"><span>Attach a voice memo</span><span className="sr-only"> (optional, up to 25 MB)</span><input name="audio" type="file" accept="audio/*" className="sr-only" /></label></div>
    <div className="grid gap-7 sm:grid-cols-2"><label className="block"><span className="text-base font-semibold text-neutral-950">Name</span><input name="name" required autoComplete="name" className="mt-3 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-[16px] text-neutral-950 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" /></label><label className="block"><span className="text-base font-semibold text-neutral-950">Email</span><input name="email" required type="email" autoComplete="email" className="mt-3 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-[16px] text-neutral-950 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10" /></label></div>
    <label className="hidden" aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
    {status === "error" && <p className="text-sm text-red-700">{error}</p>}
    <button disabled={status === "sending"} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-black px-6 text-base font-semibold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-4 disabled:opacity-60">{status === "sending" ? "Sending…" : "Send it over"}</button>
  </form>;
}
