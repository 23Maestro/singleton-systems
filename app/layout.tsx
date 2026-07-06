import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { founderName, nicheKeywords, serviceName, siteDescription, siteName, siteUrl } from "./site";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const verification: Metadata["verification"] = {
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
  ...(process.env.BING_SITE_VERIFICATION
    ? {
        other: {
          "msvalidate.01": process.env.BING_SITE_VERIFICATION,
        },
      }
    : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${founderName} | Workflow Cleanup Consultant`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: founderName, url: siteUrl }],
  creator: founderName,
  publisher: siteName,
  keywords: nicheKeywords,
  category: "workflow consulting",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: `${founderName} | ${serviceName}`,
    description: siteDescription,
    images: [
      {
        url: "/23-hero.png",
        width: 1254,
        height: 1254,
        alt: founderName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${founderName} | ${serviceName}`,
    description: siteDescription,
    images: ["/23-hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(verification && Object.keys(verification).length > 0 ? { verification } : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#07080a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`${poppins.className} site-theme min-h-dvh bg-white text-neutral-950 antialiased`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
