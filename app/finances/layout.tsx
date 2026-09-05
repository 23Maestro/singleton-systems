import type { Metadata, Viewport } from "next";
import LedgerTheme from "./ledger/theme";
import "./ledger/ledger.css";

export const metadata: Metadata = {
  title: "Finances",
  manifest: "/finances/manifest.webmanifest",
  description: "Personal income, expenses, bills, and debt.",
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
    { media: "(prefers-color-scheme: light)", color: "#eef3f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function FinancesLayout({ children }: { children: React.ReactNode }) {
  return <LedgerTheme>{children}</LedgerTheme>;
}
