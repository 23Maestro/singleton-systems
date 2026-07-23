import { supabaseRest } from "@/lib/supabase-rest";

export type LinearInboxSubmission = {
  issueId: string;
  identifier: string | null;
  title: string | null;
  state: string | null;
  labelNames: string[];
  assigneeName: string | null;
  status: "created" | "agent_updated" | "confirmed";
  updatedAt: string;
};

export async function recordLinearInboxSubmission(issue: { id: string; identifier: string; title: string }) {
  await supabaseRest("linear_inbox_submissions?on_conflict=issue_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      issue_id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      status: "created",
    }),
  });
}

export async function getLinearInboxSubmission(issueId: string): Promise<LinearInboxSubmission | null> {
  const rows = await supabaseRest(`linear_inbox_submissions?issue_id=eq.${encodeURIComponent(issueId)}&select=*`);
  if (!rows || rows.length === 0) return null;
  const row = rows[0];
  return {
    issueId: row.issue_id,
    identifier: row.identifier,
    title: row.title,
    state: row.state,
    labelNames: row.label_names || [],
    assigneeName: row.assignee_name,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export async function confirmLinearInboxSubmission(issueId: string) {
  await supabaseRest(`linear_inbox_submissions?issue_id=eq.${encodeURIComponent(issueId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "confirmed", updated_at: new Date().toISOString() }),
  });
}

export async function applyLinearInboxWebhookUpdate(
  issueId: string,
  snapshot: Partial<{ title: string; state: string; labelNames: string[]; assigneeName: string | null }>,
) {
  await supabaseRest(`linear_inbox_submissions?issue_id=eq.${encodeURIComponent(issueId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      ...(snapshot.title !== undefined ? { title: snapshot.title } : {}),
      ...(snapshot.state !== undefined ? { state: snapshot.state } : {}),
      ...(snapshot.labelNames !== undefined ? { label_names: snapshot.labelNames } : {}),
      ...(snapshot.assigneeName !== undefined ? { assignee_name: snapshot.assigneeName } : {}),
      status: "agent_updated",
      updated_at: new Date().toISOString(),
    }),
  });
}
