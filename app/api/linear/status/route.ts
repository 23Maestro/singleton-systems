import { NextResponse } from "next/server";
import { confirmLinearInboxSubmission, getLinearInboxSubmission } from "@/lib/linear-inbox-submissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const issueId = new URL(request.url).searchParams.get("issueId");
  if (!issueId) return NextResponse.json({ error: "issueId is required." }, { status: 400 });

  try {
    const submission = await getLinearInboxSubmission(issueId);
    if (!submission) return NextResponse.json({ error: "Not tracked." }, { status: 404 });
    return NextResponse.json(submission);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { issueId } = await request.json();
  if (!issueId) return NextResponse.json({ error: "issueId is required." }, { status: 400 });

  try {
    await confirmLinearInboxSubmission(issueId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
