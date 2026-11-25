import { NextResponse, type NextRequest } from "next/server";
import { dashboardAuth, dashboardOwner } from "@/lib/dashboard-auth";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const auth = await dashboardAuth();
  if (!code || (await auth.auth.exchangeCodeForSession(code)).error || !await dashboardOwner()) {
    await auth.auth.signOut();
    return NextResponse.redirect(new URL("/dashboard?signin=denied", request.url));
  }
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
