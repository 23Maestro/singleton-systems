import { NextResponse } from "next/server";
import { getLinearInboxDraft } from "@/lib/linear-inbox-drafts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const draft = await getLinearInboxDraft(id);
    if (!draft) return NextResponse.json({ error: "Draft not found or expired." }, { status: 404 });
    return NextResponse.json(draft);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
