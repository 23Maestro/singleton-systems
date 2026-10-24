import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

const roboto = localFont({
  src: "./fonts/Roboto-Variable.ttf",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Home Tasks",
  description: "Room tasks, pending and today.",
  manifest: "/home-tasks.webmanifest",
  icons: {
    icon: [{ url: "/home-tasks-icon.svg", type: "image/svg+xml" }],
    apple: "/home-tasks-icon.svg",
  },
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
    { media: "(prefers-color-scheme: light)", color: "#f6f7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#101820" },
  ],
};

export default function HomeTasksLayout({ children }: { children: React.ReactNode }) {
  return <div className={roboto.className}>{children}</div>;
}
