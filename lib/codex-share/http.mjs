export function createShareHttp({ login, saveImages, startThread, prepareExpenses }) {
  const reply = (body, status) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  return async request => {
    if (!login || request.headers.get("tailscale-user-login") !== login || request.headers.has("origin")) return reply({ error: "Connect with your Tailscale account." }, 403);
    if (request.method !== "POST" || request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return reply({ error: "Use a JSON request." }, 415);
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "Share a link or screenshot." }, 400);
    const chunks = []; let size = 0;
    try {
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        size += value.length;
        if (size > 20_000_000) { await reader.cancel(); return reply({ error: "The share is too large." }, 413); }
        chunks.push(value);
      }
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      const valid = s => typeof s === "string" && /^[A-Za-z0-9+/]*={0,2}$/.test(s);
      if (!body || Array.isArray(body) || Object.keys(body).sort().join() !== "images,note64,text64" || !Array.isArray(body.images) || body.images.length > 10 ||
          body.images.some(s => !valid(s) || s.length > 10_000_000) || !valid(body.note64) || body.note64.length > 6000 || !valid(body.text64) || body.text64.length > 17000)
        return reply({ error: "Check the share and note." }, 400);
      const decoder = new TextDecoder("utf-8", { fatal: true });
      const note = decoder.decode(Buffer.from(body.note64, "base64"));
      const sharedText = decoder.decode(Buffer.from(body.text64, "base64"));
      if (note.length > 4000 || sharedText.length > 12000 || (!sharedText.trim() && !body.images.length)) return reply({ error: "Share a link or screenshot." }, 400);
      // Only explicit recording requests enter the finance confirmation flow.
      if (prepareExpenses && body.images.length && !sharedText.trim() && /\b(add|record|log|enter|save)\b/i.test(note) && /\b(expense|expenses|transaction|transactions|spending)\b/i.test(note)) {
        const result = await prepareExpenses(body.images, note);
        if (result.status !== "review") return reply(result, 200);
        const summary = result.entries.map((entry, index) => {
          const matches = result.duplicates.find(item => item.index === index)?.matches;
          return `${entry.name} — $${entry.amount.toFixed(2)} — ${entry.date}${matches ? `\nPossible match: ${matches.join(", ")}` : ""}`;
        }).join("\n\n");
        return reply({ ...result, summary }, 200);
      }
      const imagePaths = body.images.length ? await saveImages(body.images) : [];
      const task = await startThread({ note, sharedText, imagePaths });
      return reply({ status: "started", threadId: task.threadId }, 200);
    } catch {
      return reply({ error: "The task was not confirmed. Check Codex before trying again." }, 500);
    } finally { reader.releaseLock(); }
  };
}
