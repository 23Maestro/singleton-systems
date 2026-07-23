import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Linear Inbox",
  description: "Create or update Linear issues from desktop or mobile.",
  manifest: "/linear-inbox.webmanifest",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef3f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function LinearInboxLayout({ children }: { children: React.ReactNode }) {
  return children;
}
