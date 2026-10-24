import type { ReactNode } from "react"
import { Alert, AlertDescription } from "@/components/finances/ui/alert"

export function ErrorNotice({ children }: { children: ReactNode }) {
  return <Alert variant="destructive" className="error"><AlertDescription>{children}</AlertDescription></Alert>
}
