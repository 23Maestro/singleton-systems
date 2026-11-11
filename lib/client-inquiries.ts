import { randomUUID } from "node:crypto";
import { supabaseRest } from "@/lib/supabase-rest";

export type ClientInquiry = {
  requestId?: string;
  form: "video" | "recruiting" | "ai";
  name: string;
  email?: string | null;
  phone?: string | null;
  offer: string;
  details: Record<string, unknown>;
};

// The server-only RPC saves the contact link and inquiry in one transaction.
export async function recordClientInquiry(input: ClientInquiry) {
  const rows = await supabaseRest("rpc/record_client_inquiry", {
    method: "POST",
    body: JSON.stringify({
      p_request_id: input.requestId ?? randomUUID(),
      p_form: input.form,
      p_name: input.name,
      p_email: input.email ?? null,
      p_phone: input.phone ?? null,
      p_offer: input.offer,
      p_details: input.details,
    }),
  });
  const row = rows?.[0] as { inquiry_id?: string; contact_id?: number } | undefined;
  if (!row?.inquiry_id || !Number.isSafeInteger(row.contact_id) || row.contact_id! <= 0) {
    throw new Error("Inquiry was not saved. Please try again.");
  }
  return {
    recordId: row.inquiry_id,
    recordUrl: `https://singleton-systems.com/command-center?contact=${row.contact_id}`,
  };
}
