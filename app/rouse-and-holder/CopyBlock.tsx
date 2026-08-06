"use client";

import { useState } from "react";

export default function CopyBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-lg bg-neutral-950 px-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] font-medium tracking-[0.08em] text-neutral-500">{label}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="rounded-md bg-brand-blue px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-text-blue"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-neutral-200">{code}</pre>
    </div>
  );
}
