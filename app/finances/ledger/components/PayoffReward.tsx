import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Check } from "@/components/icons/evil"
import { fmtCurrency } from "@/lib/ledger/dates"
import type { PayoffReward as Reward } from "../context"

export default function PayoffReward({ reward }: { reward: Reward | null }) {
  const reduced = useReducedMotion()
  return <AnimatePresence>{reward && <motion.aside key={reward.id} role="status" aria-live="polite" className="payoff-reward"
    initial={{ opacity: 0, y: reduced ? 0 : -12, scale: reduced ? 1 : .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : -6 }}
    transition={{ duration: reduced ? 0 : .32, ease: [.16, 1, .3, 1] }}>
    <motion.span className="payoff-reward-mark" initial={{ scale: reduced ? 1 : .6 }} animate={{ scale: 1 }} transition={{ delay: reduced ? 0 : .08, type: "spring", stiffness: 340, damping: 18 }}><Check size={32} /></motion.span>
    <motion.div initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : .16, duration: .2 }}>
      <strong>{reward.milestone ? `${fmtCurrency(reward.milestone)} milestone reached!` : "Another step forward"}</strong><p>+{fmtCurrency(reward.amount)} paid off</p>
    </motion.div>
    {!reduced && Array.from({ length: 8 }, (_, i) => <motion.i aria-hidden="true" className="payoff-spark" key={i}
      initial={{ opacity: 0, x: 0, y: 0, scale: .4 }} animate={{ opacity: [0, 1, 0], x: Math.cos(i * Math.PI / 4) * 58, y: Math.sin(i * Math.PI / 4) * 44, rotate: i * 47, scale: 1 }}
      transition={{ delay: .2 + i * .018, duration: .65, ease: [.16, 1, .3, 1] }} />)}
  </motion.aside>}</AnimatePresence>
}
