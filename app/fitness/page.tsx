import type { Metadata, Viewport } from "next";
import FitnessApp from "./FitnessApp";
export const metadata: Metadata = {
  title: "Fitness",
  description: "Your routine. One set at a time.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/fitness" },
  icons: { icon: [{ url: "/brand/apps/fitness.svg", type: "image/svg+xml" }], apple: [{ url: "/brand/apps/fitness-180.png", sizes: "180x180", type: "image/png" }] },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#121318",
};
export default function FitnessPage() {
  return <FitnessApp />;
}
