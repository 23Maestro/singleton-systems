import { NextResponse } from "next/server";
import { buildDraftSourcesFromForm, createLinearInboxDraft } from "@/lib/linear-inbox-drafts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Web Share Target endpoint (Android). Browsers expect a redirect after a
// share_target POST, not a JSON body — see public/linear-inbox.webmanifest.
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  try {
    const form = await request.formData();
    const sources = await buildDraftSourcesFromForm(form);

    if (!sources.webLink.present && !sources.image.present) {
      return NextResponse.redirect(`${origin}/linear-inbox`, 303);
    }

    const id = await createLinearInboxDraft(sources);
    return NextResponse.redirect(`${origin}/linear-inbox?draft=${id}`, 303);
  } catch {
    return NextResponse.redirect(`${origin}/linear-inbox`, 303);
  }
}
