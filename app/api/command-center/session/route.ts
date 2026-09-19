import { NextResponse } from "next/server";
import { z } from "zod";
import {
  COMMAND_CENTER_COOKIE,
  COMMAND_CENTER_SESSION_MAX_AGE,
  commandCenterConfigured,
  commandCenterSessionValue,
  isCommandCenterAuthorized,
  verifyCommandCenterToken,
} from "@/lib/command-center-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET(request: Request) {
  return NextResponse.json(
    {
      authenticated: isCommandCenterAuthorized(request),
      configured: commandCenterConfigured(),
    },
    { headers },
  );
}

export async function POST(request: Request) {
  if (!commandCenterConfigured())
    return NextResponse.json(
      { error: "Access is not configured." },
      { status: 503, headers },
    );
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Open Command Center to unlock this device." },
      { status: 403, headers },
    );
  const parsed = z
    .object({ token: z.string().min(1).max(512) })
    .strict()
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success || !verifyCommandCenterToken(parsed.data.token))
    return NextResponse.json(
      { error: "Passphrase is incorrect." },
      { status: 401, headers },
    );
  const response = NextResponse.json({ authenticated: true }, { headers });
  response.cookies.set(COMMAND_CENTER_COOKIE, commandCenterSessionValue(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COMMAND_CENTER_SESSION_MAX_AGE,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false }, { headers });
  response.cookies.set(COMMAND_CENTER_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
