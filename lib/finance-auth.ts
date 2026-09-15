import crypto from "node:crypto";

export const FINANCE_SESSION_COOKIE = "singleton_finances_session";
export const FINANCE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const SESSION_PURPOSE = "singleton-systems-finances-v2";

function configuredToken(): string | null {
  const token = process.env.FINANCES_ACCESS_TOKEN?.trim();
  return token && token.length >= 24 ? token : null;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function signature(expiresAt: string, token: string): string {
  return crypto
    .createHmac("sha256", token)
    .update(`${SESSION_PURPOSE}:${expiresAt}`)
    .digest("hex");
}

function cookieValue(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) {
      try {
        return decodeURIComponent(value.join("="));
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function financeAuthConfigured(): boolean {
  return configuredToken() !== null;
}

export function financeSessionValue(now = Date.now()): string {
  const token = configuredToken();
  if (!token) throw new Error("FINANCES_ACCESS_TOKEN must contain at least 24 characters.");
  const expiresAt = String(now + FINANCE_SESSION_MAX_AGE_SECONDS * 1000);
  return `${expiresAt}.${signature(expiresAt, token)}`;
}

export function verifyFinanceSessionValue(value: string, now = Date.now()): boolean {
  const token = configuredToken();
  if (!token) return false;
  const [expiresAt, candidate, extra] = value.split(".");
  if (extra !== undefined || !/^\d{13}$/.test(expiresAt ?? "") || !candidate) return false;
  const expiresAtNumber = Number(expiresAt);
  if (!Number.isSafeInteger(expiresAtNumber) || expiresAtNumber <= now) return false;
  return safeEqual(candidate, signature(expiresAt, token));
}

export function verifyFinanceToken(candidate: string): boolean {
  const token = configuredToken();
  return Boolean(token && safeEqual(candidate, token));
}

export function isFinanceAuthorized(request: Request, now = Date.now()): boolean {
  const actual = cookieValue(request, FINANCE_SESSION_COOKIE);
  return Boolean(actual && verifyFinanceSessionValue(actual, now));
}

function jsonError(error: string, code: string, status: number): Response {
  return Response.json(
    { error, code },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}

export function financeAccessError(request: Request): Response | null {
  if (!financeAuthConfigured()) {
    return jsonError("Finance access is not configured.", "FINANCE_AUTH_UNCONFIGURED", 503);
  }
  if (!isFinanceAuthorized(request)) {
    return jsonError("Unlock finances to continue.", "FINANCE_UNAUTHORIZED", 401);
  }
  return null;
}
