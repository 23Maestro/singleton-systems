import { NextResponse } from "next/server";
import { commandSchema } from "@/lib/ledger/commands";
import { readLedger, executeCommand } from "@/lib/ledger/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

// Deployment-scoped cutover switch. Jerami selected an unlinked preview without login.
function disabled() {
  return process.env.FINANCE_LEDGER_ENABLED !== "true"
    ? NextResponse.json({ error: "Ledger access is not enabled for this deployment." }, { status: 503, headers }) : null;
}
export async function GET() {
  const blocked = disabled(); if (blocked) return blocked;
  try { return NextResponse.json(await readLedger(), { headers }); }
  catch { return NextResponse.json({ error: "Could not load the saved ledger. Please retry." }, { status: 503, headers }); }
}
export async function POST(request: Request) {
  const blocked = disabled(); if (blocked) return blocked;
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json({ error: "Use the Ledger page to save changes." }, { status: 403, headers });
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return NextResponse.json({ error: "Expected JSON." }, { status: 415, headers });
  const raw = await request.text();
  if (raw.length > 16000) return NextResponse.json({ error: "Entry is too large." }, { status: 413, headers });
  let payload: unknown;
  try { payload = JSON.parse(raw); } catch { payload = null; }
  const parsed = commandSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Check the entry fields." }, { status: 400, headers });
  try { return NextResponse.json(await executeCommand(parsed.data), { headers }); }
  catch (error) {
    const message = error instanceof Error ? error.message : "";
    // Do not return database paths, SQL, credentials, or row data in API errors.
    const safe = !message.startsWith("Supabase") && !message.includes("fetch") && !message.includes("timeout") && message.length < 220;
    return NextResponse.json({ error: safe ? message : "Save could not be confirmed. Retry the same confirmation." }, { status: 409, headers });
  }
}
