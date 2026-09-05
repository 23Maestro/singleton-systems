export function getEasternDate(): Date {
  const now = new Date()
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const parts = fmt.formatToParts(now)
  const y = parseInt(parts.find((p) => p.type === "year")!.value)
  const m = parseInt(parts.find((p) => p.type === "month")!.value) - 1
  const d = parseInt(parts.find((p) => p.type === "day")!.value)
  return new Date(y, m, d)
}

export function getMondayOfWeek(date: Date): Date {
  const day = date.getDay()
  const daysBack = day === 0 ? 6 : day - 1
  const monday = new Date(date)
  monday.setDate(date.getDate() - daysBack)
  return monday
}

export function getCurrentCycle(): {
  monday: Date
  sunday: Date
  label: string
  weekLabel: string
} {
  const today = getEasternDate()
  const monday = getMondayOfWeek(today)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const fmtShort = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const fmtFull = (d: Date) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  const startOfYear = new Date(monday.getFullYear(), 0, 1)
  const weekNum = Math.ceil(
    ((monday.getTime() - startOfYear.getTime()) / 86400000 +
      startOfYear.getDay() +
      1) /
      7,
  )

  return {
    monday,
    sunday,
    label: `${fmtShort(monday)} – ${fmtFull(sunday)}`,
    weekLabel: `Week ${weekNum}`,
  }
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split("-").map(Number)
  return toISODate(new Date(y, m - 1, d)) === value
}

export function mondayFor(value: string): string {
  if (!isDate(value)) throw new Error("Choose a valid date.")
  const [y, m, d] = value.split("-").map(Number)
  return toISODate(getMondayOfWeek(new Date(y, m - 1, d)))
}

export function todayISO(): string {
  return toISODate(getEasternDate())
}

export function currentMondayISO(): string {
  return toISODate(getMondayOfWeek(getEasternDate()))
}

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function fmtCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}
