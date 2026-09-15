import { NextResponse } from "next/server";
import { z } from "zod";
import {
  FINANCE_SESSION_COOKIE,
  FINANCE_SESSION_MAX_AGE_SECONDS,
  financeAuthConfigured,
  financeSessionValue,
  isFinanceAuthorized,
  verifyFinanceToken,
} from "@/lib/finance-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};
const sessionSchema = z.object({ token: z.string().min(1).max(512) }).strict();

export async function GET(request: Request) {
  if (!financeAuthConfigured()) {
    return NextResponse.json(
      { authenticated: false, error: "Finance access is not configured." },
      { status: 503, headers },
    );
  }
  return NextResponse.json(
    { authenticated: isFinanceAuthorized(request) },
    { headers },
  );
}

export async function POST(request: Request) {
  if (!financeAuthConfigured()) {
    return NextResponse.json(
      { authenticated: false, error: "Finance access is not configured." },
      { status: 503, headers },
    );
  }
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json(
      { authenticated: false, error: "Open the Finances page to unlock this device." },
      { status: 403, headers },
    );
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json(
      { authenticated: false, error: "Expected JSON." },
      { status: 415, headers },
    );
  }

  const parsed = sessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !verifyFinanceToken(parsed.data.token)) {
    return NextResponse.json(
      { authenticated: false, error: "That passphrase is not correct." },
      { status: 401, headers },
    );
  }

  const response = NextResponse.json({ authenticated: true }, { headers });
  response.cookies.set(FINANCE_SESSION_COOKIE, financeSessionValue(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: FINANCE_SESSION_MAX_AGE_SECONDS,
    priority: "high",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false }, { headers });
  response.cookies.set(FINANCE_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    priority: "high",
  });
  return response;
}
