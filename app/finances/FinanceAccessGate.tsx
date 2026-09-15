"use client";

import Image from "next/image";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";

type AccessState = "checking" | "locked" | "unlocked";

export default function FinanceAccessGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessState>("checking");
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkSession() {
      try {
        const response = await fetch("/api/finances/session", {
          cache: "no-store",
          credentials: "same-origin",
        });
        const result = await response.json();
        if (!active) return;
        if (!response.ok && response.status !== 401) {
          setError(result.error || "Could not check this device.");
        }
        setState(result.authenticated === true ? "unlocked" : "locked");
      } catch {
        if (!active) return;
        setError("Could not check this device. Please retry.");
        setState("locked");
      }
    }
    void checkSession();
    return () => {
      active = false;
    };
  }, []);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/finances/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ token: passphrase }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not unlock finances.");
      setPassphrase("");
      setState("unlocked");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not unlock finances.");
    } finally {
      setSubmitting(false);
    }
  }

  if (state === "unlocked") return children;

  return (
    <main className="access-page">
      <section className="access-card" aria-labelledby="finance-access-title">
        <Image
          src="/singleton-systems-wordmark.svg"
          width={660}
          height={260}
          alt="Singleton Systems"
          className="access-wordmark"
          priority
        />
        <p className="access-eyebrow">Private workspace</p>
        <h1 id="finance-access-title">Finances</h1>
        {state === "checking" ? (
          <p role="status" className="access-copy">Checking this device…</p>
        ) : (
          <>
            <p className="access-copy">Unlock once. This device stays trusted for one year.</p>
            <form className="access-form" onSubmit={unlock}>
              <label className="field">
                <span>Passphrase</span>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(event) => setPassphrase(event.target.value)}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  autoFocus
                />
              </label>
              {error && <p className="error" role="alert">{error}</p>}
              <button className="btn btn-primary access-submit" type="submit" disabled={submitting || !passphrase}>
                {submitting ? "Unlocking…" : "Unlock finances"}
              </button>
            </form>
          </>
        )}
        {state === "checking" && error && <p className="error" role="alert">{error}</p>}
      </section>
    </main>
  );
}
