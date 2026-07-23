"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowSquareUpRight,
  Check,
  Hourglass,
  House,
  Keyboard,
  Lightbulb,
  Link as LinkIcon,
  Paperclip,
  Stack,
  Wrench,
} from "@phosphor-icons/react";

type ProjectLabel = { id: string; name: string; color: string };

type ProjectContext = {
  name: string;
  icon: string;
  states: string[];
  labels: ProjectLabel[];
  initiatives: string[];
};

type InboxContext = {
  projects: ProjectContext[];
  templates: { id: string; label: string }[];
};

type Submission = {
  issueId: string;
  identifier: string | null;
  title: string | null;
  state: string | null;
  labelNames: string[];
  assigneeName: string | null;
  status: "created" | "agent_updated" | "confirmed";
};

type DraftSources = {
  webLink: { present: true; url: string; title?: string } | { present: false };
  image: { present: true; name?: string } | { present: false };
};

const statuses = ["Backlog", "Todo", "In Progress", "In Review", "Done"] as const;

const emptyForm = {
  action: "new" as "new" | "update",
  project: "",
  template: "quick_task",
  title: "",
  context: "",
  status: "Backlog" as string,
  dueDate: "",
  labelIds: [] as string[],
  issue: "",
  webLinkUrl: "",
};

export default function LinearInboxApp() {
  const [ctx, setCtx] = useState<InboxContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftSources, setDraftSources] = useState<DraftSources | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/linear/inbox", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load projects.");
        setCtx(data);
        if (data.projects[0]) setForm((current) => ({ ...current, project: data.projects[0].name }));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load projects."))
      .finally(() => setLoading(false));

    const params = new URLSearchParams(window.location.search);
    const draft = params.get("draft");
    if (draft) {
      setDraftId(draft);
      fetch(`/api/linear/inbox/draft/${draft}`)
        .then(async (response) => {
          if (!response.ok) return;
          const data = await response.json();
          setDraftSources(data.sources);
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => () => stopPolling(), []);

  function stopPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  }

  function pollStatus(issueId: string) {
    stopPolling();
    let elapsed = 0;
    pollRef.current = setInterval(async () => {
      elapsed += 2000;
      try {
        const response = await fetch(`/api/linear/status?issueId=${issueId}`, { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          setSubmission(data);
          if (data.status !== "created") stopPolling();
        }
      } catch {
        // keep polling until the timeout below
      }
      if (elapsed >= 60000) stopPolling();
    }, 2000);
  }

  const project = ctx?.projects.find((candidate) => candidate.name === form.project);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.project) return;
    setSubmitting(true);
    setError("");
    setSubmission(null);

    try {
      const body = {
        action: form.action,
        project: form.project,
        template: form.template,
        title: form.title.trim(),
        context: form.context.trim(),
        status: form.status,
        dueDate: form.dueDate || null,
        labelIds: form.labelIds,
        issue: form.issue.trim() || undefined,
        draftId: draftId || undefined,
        sources: {
          webLink: form.webLinkUrl.trim() ? { present: true, url: form.webLinkUrl.trim() } : { present: false },
          image: file ? { present: true, name: file.name, kind: file.type } : { present: false },
        },
      };

      const response = await fetch("/api/linear/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit.");

      setSubmission({
        issueId: data.issue.id,
        identifier: data.issue.identifier,
        title: data.issue.title,
        state: null,
        labelNames: [],
        assigneeName: null,
        status: "created",
      });
      pollStatus(data.issue.id);
      setForm(emptyForm);
      setFile(null);
      setDraftId(null);
      setDraftSources(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmSubmission() {
    if (!submission) return;
    setSubmission({ ...submission, status: "confirmed" });
    try {
      await fetch("/api/linear/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId: submission.issueId }),
      });
    } catch {
      // local state already reflects confirmation; a failed write here just means the
      // next poll would have shown agent_updated again, which is an acceptable no-op
    }
  }

  return (
    <main className="min-h-dvh bg-[#eef3f7] text-[#101820] [color-scheme:light_dark] dark:bg-black dark:text-[#f7f8fa]">
      <section className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-3 pb-24 pt-[max(16px,env(safe-area-inset-top))] sm:px-6">
        <header className="sticky top-0 z-10 -mx-3 mb-4 flex items-center gap-3 border-b border-black/5 bg-white/70 px-3 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-black/50 sm:mx-0 sm:rounded-[24px] sm:border">
          <Stack size={26} weight="duotone" />
          <h1 className="text-lg font-semibold">Linear inbox</h1>
        </header>

        {error ? (
          <div className="mb-4 rounded-2xl border border-[#D9474F]/25 bg-[#D9474F]/10 p-3 text-sm text-[#9f2f36] dark:text-[#ffb6bb]">{error}</div>
        ) : null}

        {loading ? (
          <div className="h-40 animate-pulse rounded-[24px] border border-white/60 bg-white/55 dark:border-white/10 dark:bg-white/8" />
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(["new", "update"] as const).map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => setForm({ ...form, action })}
                  className={`h-11 rounded-2xl text-sm font-semibold capitalize transition ${
                    form.action === action ? "bg-[#111820] text-white dark:bg-white dark:text-[#101820]" : "border border-black/10 bg-white/60 text-[#607080] dark:border-white/10 dark:bg-white/8 dark:text-[#aeb8c2]"
                  }`}
                >
                  {action}
                </button>
              ))}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-[#394856] dark:text-white">Project</p>
              <div className="grid grid-cols-2 gap-2">
                {ctx?.projects.map((candidate) => (
                  <button
                    key={candidate.name}
                    type="button"
                    onClick={() => setForm({ ...form, project: candidate.name, labelIds: [] })}
                    className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
                      form.project === candidate.name ? "border-[#2F80ED] bg-[#2F80ED]/10" : "border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/8"
                    }`}
                  >
                    <ProjectIcon icon={candidate.icon} />
                    {candidate.name}
                  </button>
                ))}
              </div>
            </div>

            {ctx && ctx.templates.length > 0 ? (
              <div>
                <p className="mb-2 text-sm font-medium text-[#394856] dark:text-white">Template</p>
                <div className="flex flex-wrap gap-2">
                  {ctx.templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setForm({ ...form, template: template.id })}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        form.template === template.id ? "bg-[#2F80ED] text-white" : "border border-black/10 text-[#607080] dark:border-white/10 dark:text-[#aeb8c2]"
                      }`}
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {form.action === "update" ? (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[#394856] dark:text-white">Issue (identifier or URL)</span>
                <input
                  value={form.issue}
                  onChange={(event) => setForm({ ...form, issue: event.target.value })}
                  placeholder="23M-142"
                  className="h-11 w-full rounded-2xl border border-black/10 bg-white px-3 dark:border-white/10 dark:bg-[#0d1624]"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#394856] dark:text-white">Title</span>
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className="h-11 w-full rounded-2xl border border-black/10 bg-white px-3 dark:border-white/10 dark:bg-[#0d1624]"
                autoFocus
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#394856] dark:text-white">Context</span>
              <textarea
                value={form.context}
                onChange={(event) => setForm({ ...form, context: event.target.value })}
                rows={3}
                className="w-full resize-none rounded-2xl border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-[#0d1624]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[#394856] dark:text-white">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                  className="h-11 w-full rounded-2xl border border-black/10 bg-white px-2 dark:border-white/10 dark:bg-[#0d1624]"
                >
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[#394856] dark:text-white">Due date</span>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                  className="h-11 w-full rounded-2xl border border-black/10 bg-white px-2 dark:border-white/10 dark:bg-[#0d1624]"
                />
              </label>
            </div>

            {project && project.labels.length > 0 ? (
              <div>
                <p className="mb-2 text-sm font-medium text-[#394856] dark:text-white">Labels</p>
                <div className="flex flex-wrap gap-2">
                  {project.labels.map((label) => {
                    const active = form.labelIds.includes(label.id);
                    return (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            labelIds: active ? form.labelIds.filter((id) => id !== label.id) : [...form.labelIds, label.id],
                          })
                        }
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          active ? "border-[#2F80ED] bg-[#2F80ED]/10 text-[#2F80ED]" : "border-black/10 text-[#607080] dark:border-white/10 dark:text-[#aeb8c2]"
                        }`}
                      >
                        {label.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {project && project.initiatives.length > 0 ? (
              <p className="text-xs text-[#607080] dark:text-[#aeb8c2]">Initiative: {project.initiatives.join(", ")}</p>
            ) : null}

            {draftSources ? <DraftSourcesChip sources={draftSources} /> : null}

            <div className="grid grid-cols-2 gap-2">
              <label className="flex h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 dark:border-white/10 dark:bg-[#0d1624]">
                <LinkIcon size={16} />
                <input
                  value={form.webLinkUrl}
                  onChange={(event) => setForm({ ...form, webLinkUrl: event.target.value })}
                  placeholder="Paste a link"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
              <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white text-sm dark:border-white/10 dark:bg-[#0d1624]">
                <Paperclip size={16} />
                {file ? file.name : "Attach file"}
                <input type="file" className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} />
              </label>
            </div>

            <button
              disabled={submitting || !form.title.trim() || !form.project}
              className="h-12 w-full rounded-2xl bg-[#111820] text-sm font-semibold text-white transition disabled:bg-[#9aa1a8] dark:bg-white dark:text-[#101820]"
            >
              {submitting ? "Creating" : form.action === "new" ? "Create issue" : "Update issue"}
            </button>
          </form>
        )}

        {submission ? <StatusPanel submission={submission} onConfirm={confirmSubmission} /> : null}
      </section>
    </main>
  );
}

function DraftSourcesChip({ sources }: { sources: DraftSources }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-3 text-sm dark:border-white/10 dark:bg-white/8">
      <p className="mb-1 font-medium text-[#394856] dark:text-white">Attached from share</p>
      {sources.webLink.present ? <p className="truncate text-[#2F80ED]">{sources.webLink.url}</p> : null}
      {sources.image.present ? <p className="text-[#607080] dark:text-[#aeb8c2]">{sources.image.name || "Image"}</p> : null}
    </div>
  );
}

function StatusPanel({ submission, onConfirm }: { submission: Submission; onConfirm: () => void }) {
  return (
    <div className="mt-4 space-y-2">
      {submission.status === "created" ? (
        <div className="flex items-center gap-2 rounded-2xl border border-[#F2A93B]/30 bg-[#F2A93B]/10 px-3 py-2.5 text-sm text-[#854F0B] dark:text-[#F2A93B]">
          <Hourglass size={16} weight="fill" />
          Linear agent updating — awaiting approval
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#27AE60]/30 bg-[#27AE60]/10 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#173404] dark:text-[#97C459]">
          <Check size={16} weight="bold" />
          {submission.identifier ? `${submission.identifier} — ${submission.title}` : submission.title}
        </div>
        {submission.labelNames.length > 0 ? (
          <p className="mt-1 text-xs text-[#607080] dark:text-[#aeb8c2]">Labels: {submission.labelNames.join(", ")}</p>
        ) : null}
        {submission.state ? <p className="text-xs text-[#607080] dark:text-[#aeb8c2]">Status: {submission.state}</p> : null}

        {submission.status !== "confirmed" ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={onConfirm} className="h-9 rounded-xl bg-[#111820] text-xs font-semibold text-white dark:bg-white dark:text-[#101820]">
              Looks good
            </button>
            <a
              href={`https://linear.app/issue/${submission.identifier || ""}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 items-center justify-center gap-1 rounded-xl border border-black/10 text-xs font-semibold dark:border-white/10"
            >
              Open in Linear <ArrowSquareUpRight size={14} />
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ProjectIcon({ icon }: { icon: string }) {
  const props = { size: 18, weight: "duotone" as const };
  if (icon === "lightbulb") return <Lightbulb {...props} />;
  if (icon === "keyboard") return <Keyboard {...props} />;
  if (icon === "house") return <House {...props} />;
  if (icon === "wrench") return <Wrench {...props} />;
  return <Stack {...props} />;
}
