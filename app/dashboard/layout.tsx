import type { Metadata } from "next";
import "../command-center/command-center.css";

export const metadata: Metadata = {
  title: "Dashboard | Singleton Systems",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
