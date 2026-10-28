import { producer, reviewBackend, reviewHeaders } from "@/lib/video-review-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!producer(request)) return Response.json({ error: "A trusted render producer is required." }, { status: 401, headers: reviewHeaders });
  try {
    const response = await reviewBackend(undefined, "{}", "/video-review-uploads");
    return Response.json(await response.json(), { status: response.status, headers: reviewHeaders });
  } catch {
    return Response.json({ error: "Could not prepare the video upload. Try again." }, { status: 503, headers: reviewHeaders });
  }
}
