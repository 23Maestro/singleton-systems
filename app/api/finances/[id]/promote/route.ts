import { NextResponse } from "next/server";
import { z } from "zod";
import { promoteDebtPayment } from "@/lib/finance-entries";
import { financeAccessError } from "@/lib/finance-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const promoteSchema = z.object({
  amount: z.number().positive(),
  entryDate: z.string().date(),
}).strict();
const idSchema = z.string().uuid();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const accessError = financeAccessError(request);
  if (accessError) return accessError;
  const parsedId = idSchema.safeParse((await params).id);
  if (!parsedId.success) return NextResponse.json({ error: "Invalid entry ID." }, { status: 400 });
  const payload = await request.json().catch(() => null);
  const parsed = promoteSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid debt payment.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const result = await promoteDebtPayment(parsedId.data, parsed.data.amount, parsed.data.entryDate);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
