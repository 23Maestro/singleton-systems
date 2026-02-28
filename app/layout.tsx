import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Engineer & Workflow Automator",
  description:
    "Scale multimedia production with engineered workflows, automation, and resilient delivery systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
