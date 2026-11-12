import type { Metadata } from "next";
import "./command-center.css";
import "./shadcn.css";
import "./visual-refresh.css";

export const metadata: Metadata = {
  title: "Command Center",
  robots: { index: false, follow: false },
  icons: { icon: [{ url: "/brand/apps/command-center.svg", type: "image/svg+xml" }], apple: [{ url: "/brand/apps/command-center-180.png", sizes: "180x180", type: "image/png" }] },
};

export default function CommandCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
