import { checkOrder, loadReel, type Reel } from "@/lib/reel-order";
import { supabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const reel = typeof body?.token === "string" ? await loadReel(body.token) : null;
  if (!reel) return Response.json({ error: "This link is not active." }, { status: 404, headers });
  const picked = checkOrder(reel, body.order, body.trashed);
  if (!picked) return Response.json({ error: "The play list did not match. Refresh and try again." }, { status: 400, headers });

  const submitted_at = new Date().toISOString();
  try {
    await supabaseRest("reel_orders", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ reel_id: reel.reel_id, clip_order: picked.order, trashed: picked.trashed, submitted_at }),
    });
  } catch (error) {
    console.error("reel-order save", error);
    return Response.json({ error: "We could not save your order. Try again in a minute." }, { status: 503, headers });
  }

  // The order is saved; a failed email must not make the parent send it again.
  await notify(reel, picked, submitted_at).catch((error) => console.error("reel-order email", error));
  return Response.json({ ok: true }, { headers });
}

async function notify(reel: Reel, picked: { order: string[]; trashed: string[] }, submittedAt: string) {
  const key = process.env.RESEND_API_KEY, to = process.env.REEL_ORDER_EMAIL_TO;
  if (!key || !to) return console.warn("reel-order email skipped: RESEND_API_KEY or REEL_ORDER_EMAIL_TO missing");
  const titles = new Map([...reel.timeline, ...reel.bench].map((clip) => [clip.id, clip.title]));
  const lines = picked.order.map((id, i) => `${i + 1}. ${titles.get(id)} (${id})`);
  const text = [`${reel.athlete} order is in: ${picked.order.length} plays.`, "", ...lines, "",
    `Trashed: ${picked.trashed.join(", ") || "none"}`, "", JSON.stringify({ reel_id: reel.reel_id, order: picked.order, trashed: picked.trashed, submitted_at: submittedAt })].join("\n");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.REEL_ORDER_EMAIL_FROM || "Reel Order <onboarding@resend.dev>",
      to: [to],
      subject: `${reel.athlete} reel order is in`,
      text,
    }),
  });
  if (!response.ok) throw new Error(`Resend ${response.status} ${await response.text()}`);
}
