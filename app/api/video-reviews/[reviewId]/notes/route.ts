import { frameNoteSchema, reviewId } from "@/lib/video-review";
import { reviewBackend, reviewConfigured, reviewHeaders, reviewSameOrigin } from "@/lib/video-review-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request, context: { params: Promise<{ reviewId: string }> }) {
  if (!reviewConfigured()) return Response.json({ error: "Review storage is not configured." }, { status: 503, headers: reviewHeaders });
  if (!reviewSameOrigin(request)) return Response.json({ error: "Invalid origin." }, { status: 403, headers: reviewHeaders });
  try {
    const id = reviewId.parse((await context.params).reviewId);
    if (Number(request.headers.get("content-length")) > 4 * 1024 * 1024) return new Response("Frame too large.", { status: 413 });
    const form = await request.formData();
    frameNoteSchema.parse(JSON.parse(String(form.get("note"))));
    const snapshot = form.get("snapshot");
    if (!(snapshot instanceof Blob) || snapshot.type !== "image/png" || snapshot.size > 3 * 1024 * 1024) return Response.json({ error: "Use a PNG frame under 3 MiB." }, { status: 413, headers: reviewHeaders });
    const response = await reviewBackend(id, form);
    return Response.json(await response.json(), { status: response.status, headers: reviewHeaders });
  } catch {
    return Response.json({ error: "Could not save. Your draft is still here. Try again." }, { status: 503, headers: reviewHeaders });
  }
}
