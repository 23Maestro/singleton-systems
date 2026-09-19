import type { Metadata } from "next";
import "./command-center.css";

export const metadata: Metadata = {
  title: "Command Center | Singleton Systems",
  robots: { index: false, follow: false },
};

export default function CommandCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
