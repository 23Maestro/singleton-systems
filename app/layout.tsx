import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jerami Singleton — Video Editor & Systems Builder",
  description:
    "I edit video. I engineer the system around it. Custom automation that lets me deliver 2–3x more — without burning out.",
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
