import type { Metadata } from "next";
import VideoReviewApp from "./VideoReviewApp";
export const metadata: Metadata = { title: "Video review", robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ reviewId: string }> }) {
  return <VideoReviewApp reviewId={(await params).reviewId} />;
}
