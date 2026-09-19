export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Older open tabs may still call this endpoint. Personal pages now open directly.
export function GET() {
  return Response.json(
    { authenticated: true, configured: true, access: "open" },
    { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } },
  );
}
export const POST = GET;
export const DELETE = GET;
