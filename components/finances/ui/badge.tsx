import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-finance-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-finance-primary text-finance-primary-foreground shadow hover:bg-finance-primary/80",
        secondary:
          "border-transparent bg-finance-secondary text-finance-secondary-foreground hover:bg-finance-secondary/80",
        destructive:
          "border-transparent bg-finance-destructive text-finance-destructive-foreground shadow hover:bg-finance-destructive/80",
        outline: "text-finance-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
