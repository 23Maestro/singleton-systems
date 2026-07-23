import { supabaseRest, supabaseStorageUpload } from "@/lib/supabase-rest";

const STORAGE_BUCKET = "linear-inbox-drafts";

export type LinearInboxDraftSources = {
  webLink: { present: true; url: string; title?: string } | { present: false };
  image: { present: true; name?: string; path?: string; kind?: string } | { present: false };
};

export async function buildDraftSourcesFromForm(form: FormData): Promise<LinearInboxDraftSources> {
  const sources: LinearInboxDraftSources = { webLink: { present: false }, image: { present: false } };

  const url = form.get("url");
  const text = form.get("text");
  const title = form.get("title");
  const link = typeof url === "string" && url.trim() ? url.trim() : typeof text === "string" && /^https?:\/\//.test(text.trim()) ? text.trim() : "";
  if (link) {
    sources.webLink = { present: true, url: link, title: typeof title === "string" ? title : undefined };
  }

  const file = form.get("file") ?? form.get("files");
  if (file instanceof File && file.size > 0) {
    const objectPath = `${crypto.randomUUID()}/${file.name}`;
    const path = await supabaseStorageUpload(STORAGE_BUCKET, objectPath, file, file.type || "application/octet-stream");
    sources.image = { present: true, name: file.name, path, kind: file.type || undefined };
  }

  return sources;
}

export async function createLinearInboxDraft(sources: LinearInboxDraftSources) {
  const [row] = await supabaseRest("linear_inbox_drafts", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ sources }),
  });
  return row.id as string;
}

export async function getLinearInboxDraft(id: string): Promise<{ sources: LinearInboxDraftSources } | null> {
  const rows = await supabaseRest(
    `linear_inbox_drafts?id=eq.${encodeURIComponent(id)}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=sources`,
  );
  if (!rows || rows.length === 0) return null;
  return { sources: rows[0].sources as LinearInboxDraftSources };
}
