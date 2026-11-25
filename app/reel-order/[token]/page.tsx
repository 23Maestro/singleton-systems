import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadReel, reelMediaBase } from "@/lib/reel-order";
import ReelOrderPicker from "./ReelOrderPicker";

export const metadata: Metadata = {
  title: "Highlight order",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ReelOrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const reel = await loadReel(token);
  if (!reel) notFound();
  return <ReelOrderPicker reel={reel} token={token} media={reelMediaBase(token)} />;
}
