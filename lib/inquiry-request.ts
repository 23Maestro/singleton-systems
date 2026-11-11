export type InquiryAttempt = { signature: string; id: string };

// Keep one ID while retrying the same answers. New answers start a new request.
export function prepareInquiryRequest(form: FormData, previous: InquiryAttempt | null): InquiryAttempt {
  const signature = JSON.stringify([...form].filter(([key]) => key !== "requestId").map(([key,value]) => [key,
    typeof value === "string" ? value : value.size === 0 ? null : [value.name,value.size,value.type,value.lastModified],
  ]));
  const attempt = previous?.signature === signature ? previous : { signature, id: crypto.randomUUID() };
  form.set("requestId", attempt.id);
  return attempt;
}
