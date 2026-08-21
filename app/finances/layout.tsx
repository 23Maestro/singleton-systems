import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Finances",
  description: "Personal income, bills, and debt ledger.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2EFE9" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function FinancesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
