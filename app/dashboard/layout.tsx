import type { Metadata } from "next";
import "../command-center/command-center.css";
import "../command-center/shadcn.css";
import "../command-center/visual-refresh.css";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
