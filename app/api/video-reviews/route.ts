import { reviewRenderInputSchema } from "@/lib/video-review";
import { producer, reviewBackend, reviewHeaders } from "@/lib/video-review-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Only the trusted render producer can register a render and bind its origin.
export async function POST(request: Request) {
  if (!producer(request)) return Response.json({ error: "A trusted render producer is required." }, { status: 401, headers: reviewHeaders });
  try {
    const raw = await request.text();
    if (raw.length > 12000) return new Response("Render record too large.", { status: 413 });
    const value = reviewRenderInputSchema.parse(JSON.parse(raw));
    if (value.origin && (!process.env.VIDEO_REVIEW_PRODUCER_HOST_ID || value.origin.hostId !== process.env.VIDEO_REVIEW_PRODUCER_HOST_ID)) return new Response("The producer cannot bind this host.", { status: 403 });
    const response = await reviewBackend(undefined, JSON.stringify(value));
    return Response.json(await response.json(), { status: response.status, headers: reviewHeaders });
  } catch {
    return Response.json({ error: "Render registration failed. Check the saved record before retrying." }, { status: 409, headers: reviewHeaders });
  }
}
