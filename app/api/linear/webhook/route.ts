import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { applyLinearInboxWebhookUpdate, getLinearInboxSubmission } from "@/lib/linear-inbox-submissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.LINEAR_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "LINEAR_WEBHOOK_SECRET is not configured." }, { status: 500 });

  const rawBody = await request.text();
  const signature = request.headers.get("linear-signature");
  if (!signature || !isValidSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: LinearWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed payload." }, { status: 400 });
  }

  const issueId = resolveTrackedIssueId(payload);
  if (!issueId) return NextResponse.json({ ok: true, tracked: false });

  const submission = await getLinearInboxSubmission(issueId);
  if (!submission) return NextResponse.json({ ok: true, tracked: false });

  await applyLinearInboxWebhookUpdate(issueId, {
    title: payload.data?.title,
    state: payload.data?.state?.name,
    labelNames: payload.data?.labels?.map((label) => label.name),
    assigneeName: payload.data?.assignee?.name ?? null,
  });

  return NextResponse.json({ ok: true, tracked: true });
}

function isValidSignature(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

function resolveTrackedIssueId(payload: LinearWebhookPayload): string | undefined {
  if (payload.type === "Issue") return payload.data?.id;
  if (payload.type === "Comment") return payload.data?.issueId ?? payload.data?.issue?.id;
  return undefined;
}

type LinearWebhookPayload = {
  action: string;
  type: string;
  data?: {
    id?: string;
    issueId?: string;
    issue?: { id?: string };
    title?: string;
    state?: { name?: string };
    labels?: { name: string }[];
    assignee?: { name?: string };
  };
};
