import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Jerami Singleton — Workflow Audit",
  description:
    "Workflow audits for operational teams that need clearer state, less repeated work, and cleaner systems around the tools they already use.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} min-h-screen bg-[#fbfbfb] text-neutral-950 antialiased`}>
        {children}
      </body>
    </html>
  );
}
