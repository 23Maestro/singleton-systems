import type { Metadata } from "next";
import { founderName, siteDescription, siteName, siteUrl } from "../site";

export { default } from "../page";

const title = `${founderName} | AI Workflow Consultant`;
export const metadata: Metadata = {
  title: { absolute: title },
  description: siteDescription,
  alternates: { canonical: "/AI-consultant" },
  openGraph: {
    type: "website", siteName, title, description: siteDescription,
    url: `${siteUrl}/AI-consultant`,
    images: [{ url: "/23-hero.png", width: 1254, height: 1254, alt: founderName }],
  },
  twitter: { card: "summary_large_image", title, description: siteDescription, images: ["/23-hero.png"] },
};
