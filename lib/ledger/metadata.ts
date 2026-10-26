import type { Metadata } from "next";
import type { Page } from "./types";
import { siteName, siteUrl } from "@/app/site";

export const financePaths: Record<Page, string> = {
  home: "/finances", entry: "/finances-form", calendar: "/finances-calendar", plan: "/finances-plan",
};
const titles: Record<Page, string> = { home: "Finances", entry: "Finance Entry", calendar: "Finance Calendar", plan: "Finance Plan" };
const descriptions: Record<Page, string> = {
  home: "Personal income, expenses, bills, and debt.",
  entry: "Record personal income or an expense.",
  calendar: "See upcoming bills, subscriptions, and debt payments.",
  plan: "Manage personal bills, subscriptions, advances, and debts.",
};
export function financePageInfo(page: Page) {
  return { title: `${titles[page]} | ${siteName}`, description: descriptions[page], url: `${siteUrl}${financePaths[page]}` };
}
export function financeMetadata(page: Page): Metadata {
  const { title, description, url } = financePageInfo(page);
  return {
    title: { absolute: title }, description, alternates: { canonical: url },
    robots: { index: false, follow: false },
    openGraph: { type: "website", siteName, title, description, url, images: [] },
    twitter: { card: "summary", title, description, images: [] },
  };
}
