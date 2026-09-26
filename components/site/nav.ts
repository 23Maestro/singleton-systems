export type NavItem = { label: string; href: string };

// Homepage anchors. Landing pages call siteNavFor("/") to point back at the homepage.
const NAV: NavItem[] = [
  { label: "Start", href: "#start" },
  { label: "Links", href: "/links" },
  { label: "Solutions", href: "#portfolio" },
  { label: "How It Starts", href: "#how-it-starts" },
  { label: "What I Fix", href: "#what-i-fix" },
  { label: "Pricing", href: "#offers" },
  { label: "Tampa", href: "/tampa-ai-consultant" },
  { label: "Book", href: "#book" },
];

export function siteNavFor(basePath: "" | "/"): NavItem[] {
  if (basePath === "") return NAV;
  return NAV.map((item) => (item.href.startsWith("#") ? { ...item, href: `/${item.href}` } : item));
}
