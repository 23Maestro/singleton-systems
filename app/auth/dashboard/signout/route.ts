import { NextResponse, type NextRequest } from "next/server";
import { dashboardAuth } from "@/lib/dashboard-auth";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return new Response("Invalid origin", { status: 403 });
  const auth = await dashboardAuth();
  await auth.auth.signOut();
  return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}
