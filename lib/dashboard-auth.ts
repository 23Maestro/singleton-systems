import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function dashboardAuth() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Dashboard sign-in is not configured.");
  const jar = await cookies();
  return createServerClient(url, key, {
    cookieOptions: { sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 400 },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (items) => { try { for (const { name, value, options } of items) jar.set(name, value, options); } catch { /* Proxy refreshes cookies for server components. */ } },
    },
  });
}

export function isDashboardUser(user: { email?: string; email_confirmed_at?: string; identities?: { provider: string }[] } | null, allowed?: string) {
  return !!allowed && !!user?.email_confirmed_at && user.email?.toLowerCase() === allowed.toLowerCase() && user.identities?.some((identity) => identity.provider === "google") === true;
}

export async function dashboardOwner() {
  try {
    const auth = await dashboardAuth();
    const { data: { user }, error } = await auth.auth.getUser();
    const allowed = process.env.DASHBOARD_OWNER_EMAIL;
    return !error && isDashboardUser(user, allowed);
  } catch { return false; }
}
