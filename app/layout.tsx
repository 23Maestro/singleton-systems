import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jerami Singleton — Workflow Audit",
  description:
    "Workflow audits for operational teams that need clearer state, less repeated work, and cleaner systems around the tools they already use.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
