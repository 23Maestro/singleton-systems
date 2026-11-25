// Parent reel-order picker. The reel lives in the public `reel-orders` bucket under an
// unguessable token; the repo is public, so tokens never live in source.
export type ReelClip = { id: string; title: string };
export type Reel = { reel_id: string; athlete: string; timeline: ReelClip[]; bench: ReelClip[] };

const TOKEN = /^[a-f0-9]{24}$/;

export function reelMediaBase(token: string) {
  return `${process.env.SUPABASE_URL?.replace(/\/$/, "")}/storage/v1/object/public/reel-orders/${token}`;
}

export async function loadReel(token: string): Promise<Reel | null> {
  if (!TOKEN.test(token) || !process.env.SUPABASE_URL) return null;
  const response = await fetch(`${reelMediaBase(token)}/reel.json`, { next: { revalidate: 60 } });
  if (!response.ok) return null;
  return response.json();
}

// The order a parent sends must be clips from this reel, each used once.
export function checkOrder(reel: Reel, order: unknown, trashed: unknown) {
  const known = new Set([...reel.timeline, ...reel.bench].map((clip) => clip.id));
  const list = (value: unknown) => Array.isArray(value) && value.every((id) => typeof id === "string" && known.has(id)) ? value as string[] : null;
  const picked = list(order), gone = list(trashed ?? []);
  if (!picked || !gone || picked.length === 0) return null;
  if (new Set([...picked, ...gone]).size !== picked.length + gone.length) return null;
  return { order: picked, trashed: gone };
}
