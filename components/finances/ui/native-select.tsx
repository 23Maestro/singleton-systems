import * as React from "react"
import { ChevronDownIcon } from "@/components/icons/evil"
import { cn } from "@/lib/utils"

// shadcn Native Select pattern, adapted for the app's Tailwind 3 theme.
export function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return <div className="native-select-wrap">
    <select data-slot="native-select" className={cn("flex h-10 w-full rounded-md border border-finance-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-finance-ring disabled:opacity-50", className)} {...props}>{children}</select>
    <ChevronDownIcon className="native-select-arrow" size={20} />
  </div>
}
