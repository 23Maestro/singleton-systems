import { owner } from "@/lib/studio-session";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return Response.json({ authenticated: owner(request), configured: Boolean(process.env.STUDIO_OWNER_KEY), access: "private" },
    { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
