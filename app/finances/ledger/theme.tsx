"use client";
import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
const Theme = createContext({ dark: false, toggle: () => {} });
export const useTheme = () => useContext(Theme);
export default function LedgerTheme({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => {
      const height = viewport?.height ?? window.innerHeight;
      const top = viewport?.offsetTop ?? 0;
      root.current?.style.setProperty("--visual-height", `${height}px`);
      root.current?.style.setProperty("--visual-top", `${top}px`);
      root.current?.style.setProperty("--keyboard-inset", `${Math.max(0, window.innerHeight - height - top)}px`);
      if (root.current) root.current.dataset.keyboard = window.innerHeight - height > 100 ? "open" : "closed";
    };
    update(); viewport?.addEventListener("resize", update); viewport?.addEventListener("scroll", update); window.addEventListener("resize", update);
    return () => { viewport?.removeEventListener("resize", update); viewport?.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  useEffect(() => { try { const saved = localStorage.getItem("ledger-theme"); setDark(saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches); } catch {} }, []);
  return <Theme.Provider value={{ dark, toggle: () => setDark(current => { const next = !current; try { localStorage.setItem("ledger-theme", next ? "dark" : "light"); } catch {} return next; }) }}><div ref={root} className="ledger-app" data-theme={dark ? "dark" : "light"}>{children}</div></Theme.Provider>;
}
