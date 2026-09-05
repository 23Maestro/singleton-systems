import { useState } from "react"
import Image from "next/image"
import assets from "@/lib/ledger/icon-sources.json"
import { BriefcaseBusiness, Car, Cloud, CreditCard, Dumbbell, GraduationCap, HeartPulse, House, LayoutGrid, Receipt, UserRound, UsersRound, Utensils, Zap, type LucideIcon } from "lucide-react"
import type { Category } from "@/lib/ledger/types"

// Bundled assets: opening the ledger never contacts an icon provider.
const SOURCES: Record<string, string> = {
  ChatGPT: "chatgpt",
  Figma: "figma",
  Raycast: "raycast",
  "Google Workspace": "google",
  "Screen Studio": "screenstudio",
  "Envato Elements": "envato",
  Cleo: "cleo",
  Albert: "albert",
  Brigit: "brigit",
  "Cash App": "cashapp",
  Chime: "chime",
  "Credit Genie": "creditgenie",
  Dave: "dave",
  Earnin: "earnin",
  Grant: "grant",
  Klarna: "klarna",
  "Money Lion": "moneylion",
  Tilt: "tilt",
  Vola: "vola",
  Zip: "zip",
  InstaLoan: "instaloan",
  "HSN/Synchrony": "hsn",
  "HSN / Synchrony — first payment": "hsn",
  "Macy's PRA": "macys",
  Apple: "apple",
  Discover: "discover",
  USAA: "usaa",
  Spectrum: "spectrum",
  GEICO: "geico",
  "Frontier WiFi": "frontier",
  "Direct Auto": "directauto",
}
export default function SourceIcon({
  name,
  category,
  tone = "slate",
}: {
  name: string
  category?: Category
  tone?: string
}) {
  const [failed, setFailed] = useState(false)
  const source = SOURCES[name]
  const file = assets.find((asset) => "id" in asset && asset.id === source)
    ?.file
  const categoryIcons: Record<Category, LucideIcon> = { Food: Utensils, Transportation: Car, Health: HeartPulse, Household: House, Family: UsersRound, Work: BriefcaseBusiness, Personal: UserRound, Miscellaneous: LayoutGrid }
  const namedIcons: Record<string, LucideIcon> = { Rent: House, "Light Bill": Zap, "Constellation Academy": GraduationCap, "2024 taxes": Receipt, "Mirage Host": Cloud, "Gym membership": Dumbbell }
  const Fallback = namedIcons[name] ?? (category ? categoryIcons[category] : CreditCard)
  return (
    <span
      className={`source-icon ${
        file && !failed ? "brand-icon" : `tone-${tone}`
      }`}
      aria-hidden="true"
    >
      {file && !failed ? (
        <Image
          src={`/ledger/icons/${file}`}
          alt=""
          width={32}
          height={32}
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <Fallback size={24} strokeWidth={1.8} />
      )}
    </span>
  )
}
