import { reviewConfigured, reviewHeaders } from "@/lib/video-review-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json({ canComment: reviewConfigured() }, { headers: reviewHeaders });
}
