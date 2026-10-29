import type { Metadata } from "next";
import "./command-center.css";
import "./shadcn.css";
import "./visual-refresh.css";

export const metadata: Metadata = {
  title: "Command Center",
  robots: { index: false, follow: false },
};

export default function CommandCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
