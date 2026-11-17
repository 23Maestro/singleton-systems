import { createExpenseReview } from "./expense-review.ts";

// This handler is intended only for a loopback server behind Tailscale Serve.
// Serve strips spoofed identity headers and supplies the authenticated caller.
export function createExpenseHttp(options: {
  login: string;
  review: ReturnType<typeof createExpenseReview>;
  parseImages: (images: string[], note: string) => Promise<{ threadId: string; entries: { name: string; amount: number; date: string; category: string }[]; questions: string[] }>;
}) {
  const reply = (body: object, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  return async (request: Request) => {
    if (!options.login || request.headers.get("tailscale-user-login") !== options.login) return reply({ error: "Connect with your Tailscale account." }, 403);
    if (request.headers.has("origin")) return reply({ error: "Open this from Shortcuts." }, 403);
    if (request.method !== "POST" || request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return reply({ error: "Use a JSON request." }, 415);
    const url = new URL(request.url);
    if (!["/prepare", "/confirm"].includes(url.pathname)) return reply({ error: "Not found." }, 404);
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "Request is empty." }, 400);
    const chunks: Uint8Array[] = []; let length = 0;
    try {
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        length += value.length;
        if (length > 20_000_000) { await reader.cancel(); return reply({ error: "Screenshots are too large." }, 413); }
        chunks.push(value);
      }
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      if (!body || typeof body !== "object" || Array.isArray(body)) return reply({ error: "Check the request." }, 400);
      if (url.pathname === "/confirm") {
        if (Object.keys(body).join() !== "id" || typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id)) return reply({ error: "Check the review." }, 400);
        return reply(await options.review.confirm(body.id), 200);
      }
      if (Object.keys(body).sort().join() !== "images,note64" || !Array.isArray(body.images) || body.images.length < 1 || body.images.length > 10 ||
          body.images.some((s: unknown) => typeof s !== "string" || s.length > 10_000_000 || !/^[A-Za-z0-9+/]*={0,2}$/.test(s)) ||
          typeof body.note64 !== "string" || body.note64.length > 6000 || !/^[A-Za-z0-9+/]*={0,2}$/.test(body.note64)) return reply({ error: "Check the screenshots and note." }, 400);
      const note = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.from(body.note64, "base64"));
      if (note.length > 4000) return reply({ error: "The note is too long." }, 400);
      const result = await options.review.prepare(await options.parseImages(body.images, note));
      if (result.status === "questions") return reply(result, 200);
      const summary = result.entries.map((entry, index) => {
        const matches = result.duplicates.find(item => item.index === index)?.matches;
        return `${entry.name} — $${entry.amount.toFixed(2)} — ${entry.date}${matches ? `\nPossible match: ${matches.join(", ")}` : ""}`;
      }).join("\n\n");
      return reply({ ...result, summary }, 200);
    } catch {
      return reply({ error: "Could not finish. Check the review or finance page before retrying." }, 409);
    } finally { reader.releaseLock(); }
  };
}
