import { useApp } from "../context";
import type { Page } from "@/lib/ledger/types";
import { useTheme } from "../theme";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
export default function Nav() {
  const { page, navigate } = useApp(); const { dark, toggle } = useTheme();
  return <header className="app-header"><div className="header-inner">
    <div className="wordmark"><Image src="/singleton-systems-wordmark.svg" width={660} height={260} alt="Singleton Systems" className="singleton-wordmark" priority /><strong>Finances</strong></div>
    <nav aria-label="Main navigation">{(["home", "entry", "plan"] as Page[]).map(item => <button key={item} aria-current={page === item ? "page" : undefined} className={page === item ? "active" : ""} onClick={() => navigate(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</nav>
    <button className="theme-button icon-button" aria-label={dark ? "Use light mode" : "Use dark mode"} onClick={toggle}>{dark ? <Sun size={22} /> : <Moon size={22} />}</button>
  </div></header>;
}
