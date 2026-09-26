import type { MetadataRoute } from "next";
import { siteUrl } from "./site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date("2026-07-02"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/tampa-ai-consultant`,
      lastModified: new Date("2026-09-26"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
