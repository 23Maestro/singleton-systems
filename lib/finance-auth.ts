import crypto from "node:crypto";

export const FINANCE_SESSION_COOKIE = "singleton_finances_session";
const SESSION_PURPOSE = "singleton-systems-finances-v1";

function configuredToken(): string | null {
  const token = process.env.FINANCES_ACCESS_TOKEN?.trim();
  return token && token.length >= 24 ? token : null;
}

function previewOpenAccess(): boolean {
  return process.env.VERCEL_ENV === "preview" && process.env.FINANCES_PREVIEW_OPEN_ACCESS === "true";
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
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
  return previewOpenAccess() || configuredToken() !== null;
}

export function financeSessionValue(): string {
  const token = configuredToken();
  if (!token) throw new Error("FINANCES_ACCESS_TOKEN must contain at least 24 characters.");
  return crypto.createHmac("sha256", token).update(SESSION_PURPOSE).digest("hex");
}

export function verifyFinanceToken(candidate: string): boolean {
  const token = configuredToken();
  return Boolean(token && safeEqual(candidate, token));
}

export function isFinanceAuthorized(request: Request): boolean {
  if (previewOpenAccess()) return true;
  const token = configuredToken();
  const actual = cookieValue(request, FINANCE_SESSION_COOKIE);
  if (!token || !actual) return false;
  const expected = crypto.createHmac("sha256", token).update(SESSION_PURPOSE).digest("hex");
  return safeEqual(actual, expected);
}

function jsonError(error: string, code: string, status: number): Response {
  return Response.json({ error, code }, { status });
}

export function financeAccessError(request: Request): Response | null {
  if (!financeAuthConfigured()) {
    return jsonError("Finance access is not configured.", "FINANCE_AUTH_UNCONFIGURED", 503);
  }
  if (!isFinanceAuthorized(request)) {
    return jsonError("Unauthorized", "FINANCE_UNAUTHORIZED", 401);
  }
  return null;
}
