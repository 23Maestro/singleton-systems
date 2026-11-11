"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { FOOTAGE_OPTIONS, REEL_PURPOSES, recruitingInquirySchema } from "@/lib/recruiting-intake";

import { prepareInquiryRequest, type InquiryAttempt } from "@/lib/inquiry-request";

const subscribe = () => () => {};
const field =
  "mt-2 block min-h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-lg text-neutral-950 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15";

export default function HighlightInquiryForm() {
  const preview = useSyncExternalStore(
    subscribe,
    () => window.location.hostname.endsWith(".chatgpt.site"),
    () => false,
  );
  const sending = useRef(false);
  const contactInput = useRef<HTMLInputElement>(null);
  const attempt = useRef<InquiryAttempt | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [contactError, setContactError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    const input = new FormData(form);
    attempt.current = prepareInquiryRequest(input, attempt.current);
    const result = recruitingInquirySchema.safeParse(Object.fromEntries(input));
    setContactError("");
    if (!result.success) {
      if (result.error.issues.some((issue) => issue.path[0] === "contact")) {
        setContactError("Enter a valid email address or a mobile number with 7–15 digits.");
        setError("");
        setStatus("error");
        contactInput.current?.focus();
        return;
      }
      setError("Check your email or mobile number and complete each required field.");
      setStatus("error");
      return;
    }
    if (preview) {
      setError(
        "This is the review preview. Submissions open when the page launches on Singleton Systems.",
      );
      setStatus("error");
      return;
    }
    sending.current = true;
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/recruiting-intake", { method: "POST", body: input });
      const body = (await response.json()) as { error?: string; delivery?: { state: string } };
      if (!response.ok || body.delivery?.state !== "delivered") {
        throw new Error(body.error || "Your request could not be sent. Please try again.");
      }
      setStatus("sent");
      form.reset();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Your request could not be sent. Please try again.",
      );
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-green-200 bg-green-50 p-8">
        <h3
          ref={(node) => node?.focus()}
          tabIndex={-1}
          className="text-2xl font-semibold focus:outline-none"
        >
          Your Request Is In
        </h3>
        <p className="mt-3 text-lg leading-relaxed">
          I’ll follow up using the contact details you shared to discuss your reel, price, and
          timing.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-6"
      aria-label="Highlight reel request"
      aria-busy={status === "sending"}
    >
      {preview && (
        <p className="rounded-xl bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
          Review preview. Submissions open after launch.
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-lg font-semibold">
          Your Name
          <input name="name" required maxLength={120} autoComplete="name" className={field} />
        </label>
        <label className="block text-lg font-semibold">
          Email or Mobile Number
          <input
            ref={contactInput}
            name="contact"
            required
            maxLength={320}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            className={field}
            aria-invalid={contactError ? true : undefined}
            aria-describedby={contactError ? "contact-hint contact-error" : "contact-hint"}
            onChange={() => setContactError("")}
          />
          <span id="contact-hint" className="mt-2 block text-sm font-normal text-neutral-600">
            Whichever you prefer.
          </span>
          {contactError && (
            <span
              id="contact-error"
              role="alert"
              className="mt-2 block text-sm font-normal leading-relaxed text-red-800"
            >
              {contactError}
            </span>
          )}
        </label>
      </div>
      <label className="block text-lg font-semibold">
        Sport
        <input name="sport" required maxLength={80} className={field} placeholder="e.g. Football" />
      </label>
      <label className="block text-lg font-semibold">
        What’s the Reel For?
        <select name="purpose" required defaultValue="" className={field}>
          <option value="" disabled>
            Choose one
          </option>
          {REEL_PURPOSES.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label className="block text-lg font-semibold">
        What Footage Do You Have?
        <select name="footage" required defaultValue="" className={field}>
          <option value="" disabled>
            Choose one
          </option>
          {FOOTAGE_OPTIONS.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label className="block text-lg font-semibold">
        Need It by a Particular Date? <span className="font-normal text-neutral-500">Optional</span>
        <input
          name="deadline"
          type="date"
          className={`${field} min-w-0 max-w-full appearance-none`}
        />
      </label>
      <label className="hidden" aria-hidden="true">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      {status === "error" && error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-lg leading-relaxed text-red-800">
          {error}
        </p>
      )}
      <button
        disabled={status === "sending"}
        className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#25c266] px-7 py-4 text-lg font-semibold text-[#080808] transition-colors hover:bg-[#20aa59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a8646] disabled:opacity-60 motion-reduce:transition-none"
      >
        {status === "sending" ? "Sending…" : "Request My Reel"}
        <span aria-hidden="true">↗</span>
      </button>
      <p className="text-sm leading-relaxed text-neutral-600">
        I’ll confirm the price and delivery date with you before you book.
      </p>
    </form>
  );
}
