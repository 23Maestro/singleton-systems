import { NextResponse } from "next/server";
import { dashboardAuth } from "@/lib/dashboard-auth";
export const dynamic = "force-dynamic";
export async function GET() {
  const auth = await dashboardAuth();
  const callback = new URL("/auth/dashboard/callback", process.env.DASHBOARD_ORIGIN || "https://www.singleton-systems.com");
  const { data, error } = await auth.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback.toString() } });
  if (error || !data.url) return new Response("Google sign-in is unavailable. Try again.", { status: 503 });
  return NextResponse.redirect(data.url);
}
