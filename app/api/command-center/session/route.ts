import { dashboardOwner } from "@/lib/dashboard-auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json({ authenticated: await dashboardOwner(), configured: Boolean(process.env.DASHBOARD_OWNER_EMAIL), access: "private" },
    { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
