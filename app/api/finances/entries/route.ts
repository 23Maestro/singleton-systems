import { shortcutEntryHandler } from "@/lib/ledger/shortcut";
import { executeCommand } from "@/lib/ledger/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return shortcutEntryHandler({
    token: process.env.FINANCES_SHORTCUT_TOKEN,
    enabled: process.env.FINANCE_LEDGER_ENABLED === "true",
    execute: executeCommand,
  })(request);
}
