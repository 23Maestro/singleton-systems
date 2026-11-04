import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { commandSchema, type LedgerCommand } from "./commands.ts";

const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const inputSchema = z.object({
  requestId: z.string().min(20).max(100).regex(/^[A-Za-z0-9:+.\-]+$/),
  type: z.enum(["income", "expense"]),
  name: z.string().trim().min(1).max(160),
  amount: z.number(),
  date: z.string(),
  category: z.enum(["Family", "Food", "Health", "Household", "Miscellaneous", "Personal", "Transportation", "Work"]),
}).strict();

// A stable namespace keeps Shortcut retries separate from other ledger commands.
function operationId(requestId: string) {
  const hex = createHash("sha256").update(`finance-shortcut-v1:${requestId}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function shortcutEntryHandler(options: {
  token: string | undefined;
  enabled: boolean;
  execute: (command: LedgerCommand) => Promise<unknown>;
}) {
  const reply = (body: object, status: number) => Response.json(body, { status, headers });
  return async (request: Request) => {
    if (!options.enabled || !options.token || options.token.length < 32)
      return reply({ error: "Finance Shortcut access is not set up." }, 503);
    const authorization = request.headers.get("authorization") ?? "";
    const hash = (value: string) => createHash("sha256").update(value).digest();
    if (!timingSafeEqual(hash(authorization), hash(`Bearer ${options.token}`)))
      return reply({ error: "Check the finance Shortcut key." }, 401);
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json")
      return reply({ error: "Send a JSON entry." }, 415);

    // Bound streamed bodies too; Content-Length is optional and untrusted.
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "Check the entry fields." }, 400);
    let text = "";
    let size = 0;
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 4096) {
          await reader.cancel();
          return reply({ error: "The entry is too large." }, 413);
        }
        text += decoder.decode(value, { stream: true });
      }
      text += decoder.decode();
    } catch {
      return reply({ error: "The entry could not be read." }, 400);
    } finally {
      reader.releaseLock();
    }
    let raw: unknown;
    try { raw = JSON.parse(text); }
    catch { return reply({ error: "Check the entry fields." }, 400); }
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return reply({ error: "Check type, name, amount, date and category." }, 400);
    const { requestId, ...entry } = parsed.data;
    const command = commandSchema.safeParse({ type: "entry", id: operationId(requestId), entry });
    if (!command.success) return reply({ error: "Use a positive amount with up to 2 decimal places and a real date." }, 400);
    try {
      await options.execute(command.data);
      // Never return balances, plan items or transaction history to the Shortcut.
      return reply({ status: "saved", id: command.data.id }, 200);
    } catch {
      return reply({ error: "Save was not confirmed. Check the finance page before starting a new entry. Retry only with the same request ID and details." }, 409);
    }
  };
}
