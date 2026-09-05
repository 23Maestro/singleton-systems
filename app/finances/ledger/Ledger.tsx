"use client";
import { AppProvider, useApp } from "./context"
import Nav from "./components/Nav"
import Home from "./pages/Home"
import Entry from "./pages/Entry"
import Plan from "./pages/Plan"
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion"
import { Check } from "lucide-react"

function AppShell() {
  const { page, notice, entryType } = useApp()
  const reduced = useReducedMotion()
  return (
    <div className="app-shell">
      <Nav />
      <main>
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0, behavior: "instant" })}>
          <motion.div key={page} initial={{ opacity: 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -4 }} transition={{ duration: reduced ? 0 : 0.16 }}>
            {page === "home" && <Home />}
            {page === "entry" && <Entry key={entryType ?? "entry"} />}
            {page === "plan" && <Plan />}
          </motion.div>
        </AnimatePresence>
      </main>
      <div className={`toast ${notice ? "visible" : ""}`} role="status">
        {notice && <><Check size={20} aria-hidden="true" /> {notice}</>}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user"><AppProvider>
      <AppShell />
    </AppProvider></MotionConfig>
  )
}
