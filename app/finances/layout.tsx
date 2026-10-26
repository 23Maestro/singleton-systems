import type { Metadata, Viewport } from "next";
import LedgerTheme from "./ledger/theme";
import "./ledger/ledger.css";
import { financeMetadata } from "@/lib/ledger/metadata";

export const metadata: Metadata = {
  ...financeMetadata("home"),
  manifest: "/finances/manifest.webmanifest",
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
