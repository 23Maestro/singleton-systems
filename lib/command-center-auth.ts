import crypto from "node:crypto";

export const COMMAND_CENTER_COOKIE = "singleton_command_center_session";
const MAX_AGE = 60 * 60 * 24 * 365;

function secret() {
  const value = process.env.COMMAND_CENTER_ACCESS_TOKEN?.trim();
  return value && value.length >= 24 ? value : null;
}

function equal(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function signature(expiry: string, token: string) {
  return crypto
    .createHmac("sha256", token)
    .update(`command-center-v1:${expiry}`)
    .digest("hex");
}

export function commandCenterConfigured() {
  return secret() !== null;
}

export function verifyCommandCenterToken(value: string) {
  const token = secret();
  return Boolean(token && equal(value, token));
}

export function commandCenterSessionValue(now = Date.now()) {
  const token = secret();
  if (!token) throw new Error("COMMAND_CENTER_ACCESS_TOKEN is not configured.");
  const expiry = String(now + MAX_AGE * 1000);
  return `${expiry}.${signature(expiry, token)}`;
}

export function isCommandCenterAuthorized(request: Request, now = Date.now()) {
  const token = secret();
  if (!token) return false;
  const raw = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COMMAND_CENTER_COOKIE}=`));
  if (!raw) return false;
  const value = raw.slice(COMMAND_CENTER_COOKIE.length + 1);
  const [expiry, candidate, extra] = value.split(".");
  return (
    extra === undefined &&
    /^\d{13}$/.test(expiry ?? "") &&
    Number(expiry) > now &&
    Boolean(candidate) &&
    equal(candidate, signature(expiry, token))
  );
}

export function commandCenterAccessError(request: Request): Response | null {
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
  };
  if (!commandCenterConfigured())
    return Response.json(
      { error: "Command Center access is not configured." },
      { status: 503, headers },
    );
  if (!isCommandCenterAuthorized(request))
    return Response.json(
      { error: "Unlock Command Center." },
      { status: 401, headers },
    );
  return null;
}

export const COMMAND_CENTER_SESSION_MAX_AGE = MAX_AGE;
