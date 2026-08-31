import { NextResponse } from "next/server";
import { z } from "zod";
import {
  FINANCE_SESSION_COOKIE,
  financeAuthConfigured,
  financeSessionValue,
  isFinanceAuthorized,
  verifyFinanceToken,
} from "@/lib/finance-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sessionSchema = z.object({ token: z.string().min(1).max(512) }).strict();

export async function GET(request: Request) {
  if (!financeAuthConfigured()) {
    return NextResponse.json(
      { authenticated: false, error: "Finance access is not configured." },
      { status: 503 },
    );
  }
  return NextResponse.json({ authenticated: isFinanceAuthorized(request) });
}

export async function POST(request: Request) {
  if (!financeAuthConfigured()) {
    return NextResponse.json(
      { authenticated: false, error: "Finance access is not configured." },
      { status: 503 },
    );
  }
  const parsed = sessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !verifyFinanceToken(parsed.data.token)) {
    return NextResponse.json({ authenticated: false, error: "Invalid access token." }, { status: 401 });
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(FINANCE_SESSION_COOKIE, financeSessionValue(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(FINANCE_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
