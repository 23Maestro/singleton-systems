import { NextResponse } from "next/server";
import { buildDraftSourcesFromForm, createLinearInboxDraft, type LinearInboxDraftSources } from "@/lib/linear-inbox-drafts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let sources: LinearInboxDraftSources;

    if (contentType.includes("multipart/form-data")) {
      sources = await buildDraftSourcesFromForm(await request.formData());
    } else {
      const body = await request.json();
      sources = {
        webLink: typeof body.url === "string" && body.url.trim() ? { present: true, url: body.url.trim(), title: typeof body.title === "string" ? body.title : undefined } : { present: false },
        image: { present: false },
      };
    }

    if (!sources.webLink.present && !sources.image.present) {
      return NextResponse.json({ error: "Nothing shared — include a link or a file." }, { status: 400 });
    }

    const id = await createLinearInboxDraft(sources);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
