"use client";
import { AppProvider, useApp } from "./context"
import { Tabs, TabsContent } from "@/components/finances/ui/tabs"
import { Alert, AlertDescription } from "@/components/finances/ui/alert"
import type { Page } from "@/lib/ledger/types"
import PayoffReward from "./components/PayoffReward"
import Nav from "./components/Nav"
import Home from "./pages/Home"
import Entry from "./pages/Entry"
import Calendar from "./pages/Calendar"
import Plan from "./pages/Plan"
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion"
import { Check } from "@/components/icons/evil"

function AppShell() {
  const { page, notice, entryType, navigate, reward } = useApp()
  const reduced = useReducedMotion()
  return (
    <Tabs className="app-shell" value={page} onValueChange={value => navigate(value as Page)} activationMode="manual">
      <Nav />
      <main>
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0, behavior: "instant" })}>
          <TabsContent value={page} asChild><motion.div key={page} initial={{ opacity: 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -4 }} transition={{ duration: reduced ? 0 : 0.16 }}>
            {page === "home" && <Home />}
            {page === "entry" && <Entry key={entryType ?? "entry"} />}
            {page === "calendar" && <Calendar />}
            {page === "plan" && <Plan />}
          </motion.div></TabsContent>
        </AnimatePresence>
      </main>
      <PayoffReward reward={reward} />
      <Alert className={`toast ${notice ? "visible" : ""}`} role="status">
        {notice && <><span aria-hidden="true"><Check size={20} /></span><AlertDescription className="text-base">{notice}</AlertDescription></>}
      </Alert>
    </Tabs>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user"><AppProvider>
      <AppShell />
    </AppProvider></MotionConfig>
  )
}
