import { NextResponse } from "next/server";
import { z } from "zod";
import { FINANCE_CATEGORIES, deleteFinanceEntry, updateFinanceEntry } from "@/lib/finance-entries";
import { financeAccessError } from "@/lib/finance-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  category: z.enum(FINANCE_CATEGORIES).optional(),
  amount: z.number().positive().optional(),
  entryDate: z.string().date().nullable().optional(),
  paid: z.boolean().optional(),
}).strict().refine((patch) => Object.keys(patch).length > 0, "At least one field is required.");
const idSchema = z.string().uuid();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const accessError = financeAccessError(request);
  if (accessError) return accessError;
  const parsedId = idSchema.safeParse((await params).id);
  if (!parsedId.success) return NextResponse.json({ error: "Invalid entry ID." }, { status: 400 });
  const payload = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid finance update.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const entry = await updateFinanceEntry(parsedId.data, parsed.data);
    return NextResponse.json({ entry });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const accessError = financeAccessError(request);
  if (accessError) return accessError;
  const parsedId = idSchema.safeParse((await params).id);
  if (!parsedId.success) return NextResponse.json({ error: "Invalid entry ID." }, { status: 400 });
  try {
    await deleteFinanceEntry(parsedId.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
