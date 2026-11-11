import { z } from "zod";

export const studioAssetKey = z.object({
  projectId: z.uuid(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
});
export const studioAssetUpload = studioAssetKey.extend({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]),
  bytes: z.number().int().min(1).max(25 * 1024 * 1024),
}).strict();
export const studioAssetPath = z.string().regex(/^\/api\/studio\/assets\?projectId=[a-f0-9-]{36}&sha256=[a-f0-9]{64}$/);
const ticketSchema = studioAssetUpload.extend({ expires: z.number().int() });
const encoder = new TextEncoder();

async function signingKey(token: string) {
  return crypto.subtle.importKey("raw", encoder.encode(token), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export function hexDigest(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function issueStudioAssetTicket(asset: z.infer<typeof studioAssetUpload>, token: string) {
  const payload = JSON.stringify({ ...asset, expires: Date.now() + 300_000 });
  const signature = await crypto.subtle.sign("HMAC", await signingKey(token), encoder.encode(payload));
  return hexDigest(signature) + "." + payload;
}

export async function readStudioAssetTicket(ticket: string, token: string) {
  const signature = ticket.slice(0, 64);
  const payload = ticket.slice(65);
  if (ticket.length > 512 || ticket[64] !== "." || !/^[a-f0-9]{64}$/.test(signature)) return null;
  const signatureBytes = Uint8Array.from(signature.match(/../g)!, pair => parseInt(pair, 16));
  if (!await crypto.subtle.verify("HMAC", await signingKey(token), signatureBytes, encoder.encode(payload))) return null;
  const asset = ticketSchema.parse(JSON.parse(payload));
  return asset.expires > Date.now() ? asset : null;
}
