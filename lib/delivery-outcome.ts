export type DeliveryState = "pending" | "delivered" | "failed";
export type ReceiptState = "not_required" | "recorded" | "failed";

export type ReceiptOutcome = {
  state: ReceiptState;
  owner: "Supabase";
  recordId: string | null;
  error: string | null;
};

export type DeliveryOutcome = {
  state: DeliveryState;
  owner: string;
  recordId: string | null;
  recordUrl: string | null;
  error: string | null;
  receipt: ReceiptOutcome;
};

export function recordedReceipt(recordId: string): ReceiptOutcome {
  return { state: "recorded", owner: "Supabase", recordId, error: null };
}

export function failedReceipt(error: string): ReceiptOutcome {
  return { state: "failed", owner: "Supabase", recordId: null, error };
}

export function receiptNotRequired(): ReceiptOutcome {
  return { state: "not_required", owner: "Supabase", recordId: null, error: null };
}

export function delivered(input: {
  owner: string;
  recordId: string;
  recordUrl: string;
  receipt?: ReceiptOutcome;
}): DeliveryOutcome {
  return {
    state: "delivered",
    owner: input.owner,
    recordId: input.recordId,
    recordUrl: input.recordUrl,
    error: null,
    receipt: input.receipt ?? receiptNotRequired(),
  };
}

export function deliveryFailed(input: {
  owner: string;
  error: string;
  receipt?: ReceiptOutcome;
}): DeliveryOutcome {
  return {
    state: "failed",
    owner: input.owner,
    recordId: null,
    recordUrl: null,
    error: input.error,
    receipt: input.receipt ?? receiptNotRequired(),
  };
}

export function deliveryHttpStatus(outcome: DeliveryOutcome) {
  return outcome.state === "delivered" ? 201 : 202;
}
