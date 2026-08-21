import { NextResponse } from "next/server";
import { z } from "zod";
import { promoteDebtPayment } from "@/lib/finance-entries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const promoteSchema = z.object({ amount: z.number().positive() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await request.json().catch(() => null);
  const parsed = promoteSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const result = await promoteDebtPayment(id, parsed.data.amount);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
