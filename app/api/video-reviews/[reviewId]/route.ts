import { reviewId } from "@/lib/video-review";
import { readVideoReview, reviewHeaders } from "@/lib/video-review-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: { params: Promise<{ reviewId: string }> }) {
  const id = reviewId.safeParse((await context.params).reviewId);
  if (!id.success) return Response.json({ error: "Invalid review link." }, { status: 400, headers: reviewHeaders });
  try {
    const review = await readVideoReview(id.data);
    return Response.json(review, { status: review.renders.length ? 200 : 404, headers: reviewHeaders });
  } catch {
    return Response.json({ error: "Review storage is unavailable. Try again." }, { status: 503, headers: reviewHeaders });
  }
}
