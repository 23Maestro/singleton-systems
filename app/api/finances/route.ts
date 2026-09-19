import { NextResponse } from "next/server";
import { z } from "zod";
import {
  FINANCE_CATEGORIES,
  FINANCE_KINDS,
  createFinanceEntry,
  listFinanceEntries,
} from "@/lib/finance-entries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  kind: z.enum(FINANCE_KINDS),
  name: z.string().trim().min(1),
  category: z.enum(FINANCE_CATEGORIES),
  amount: z.number().positive(),
  entryDate: z.string().date().nullable().default(null),
}).strict();

export async function GET(request: Request) {
  try {
    const entries = await listFinanceEntries();
    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid finance entry.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const entry = await createFinanceEntry(parsed.data);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
