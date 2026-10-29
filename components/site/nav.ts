export type NavItem = { label: string; href: string };

export const videoNav: NavItem[] = [
  { label: "Start", href: "#start" },
  { label: "Work", href: "#portfolio" },
  { label: "How it works", href: "#how-it-starts" },
  { label: "Your edit", href: "#what-i-fix" },
  { label: "Pricing", href: "#offers" },
  { label: "AI consulting", href: "/AI-consultant" },
  { label: "Free test edit", href: "/video-inquiry?offer=free-test-edit" },
];

// AI consulting anchors. Landing pages can point back to the preserved AI site.
const NAV: NavItem[] = [
  { label: "Start", href: "#start" },
  { label: "Links", href: "/links" },
  { label: "Solutions", href: "#portfolio" },
  { label: "How It Starts", href: "#how-it-starts" },
  { label: "What I Fix", href: "#what-i-fix" },
  { label: "Pricing", href: "#offers" },
  { label: "Tampa", href: "/tampa-ai-consultant" },
  { label: "Video editing", href: "/" },
  { label: "Book", href: "#book" },
];

export function siteNavFor(basePath: "" | "/" | "/AI-consultant"): NavItem[] {
  if (basePath === "") return NAV;
  return NAV.map((item) => (item.href.startsWith("#") ? { ...item, href: `${basePath}${item.href}` } : item));
}
