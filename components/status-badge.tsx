import type React from "react"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "open" | "closed" | "canceled"
  children: React.ReactNode
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const statusColors = {
    open: "bg-[var(--status-open)] text-[var(--status-open-foreground)]",
    closed: "bg-[var(--status-closed)] text-[var(--status-closed-foreground)]",
    canceled: "bg-[var(--status-canceled)] text-[var(--status-canceled-foreground)]",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-current/10",
        statusColors[status],
      )}
    >
      {children}
    </span>
  )
}
