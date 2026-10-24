import { Button } from "@/components/finances/ui/button"
import { TabsList, TabsTrigger } from "@/components/finances/ui/tabs"
import { useApp } from "../context"
import { useTheme } from "../theme"
import Image from "next/image"
import { Moon, Sun, HomeIcon, EntryIcon, CalendarIcon, PlanIcon } from "@/components/icons/evil"
const pages = [{ id: "home", label: "Home", Icon: HomeIcon }, { id: "entry", label: "Entry", Icon: EntryIcon }, { id: "calendar", label: "Calendar", Icon: CalendarIcon }, { id: "plan", label: "Plan", Icon: PlanIcon }] as const
export default function Nav() {
  const { page } = useApp(); const { dark, toggle } = useTheme()
  return <header className="app-header"><div className="header-inner">
    <div className="wordmark"><Image src="/singleton-systems-wordmark.svg" width={660} height={260} alt="Singleton Systems" className="singleton-wordmark" priority /><strong>Finances</strong></div>
    <nav aria-label="Main navigation"><TabsList aria-label="Finance pages">{pages.map(({ id, label, Icon }) => <TabsTrigger key={id} value={id} aria-current={page === id ? "page" : undefined}><Icon size={24} /><span>{label}</span></TabsTrigger>)}</TabsList></nav>
    <Button className="theme-button icon-button" aria-label={dark ? "Use light mode" : "Use dark mode"} onClick={toggle}>{dark ? <Sun size={24} /> : <Moon size={24} />}</Button>
  </div></header>
}
