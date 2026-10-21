import type { ReactNode } from "react"

const statusClasses: Record<string, string> = {
  Delivered:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Cancelled:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  Rejected:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  NoDriverFound:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  Pending:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Preparing: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  ReadyForPickup:
    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  PickedUp:
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
}

export default function OrderStatusBadge({
  status,
}: {
  status: string
}): ReactNode {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[status] ?? "border-border bg-muted text-muted-foreground"}`}
    >
      {status === "NoDriverFound"
        ? "No driver found"
        : status.replaceAll(/([a-z])([A-Z])/g, "$1 $2")}
    </span>
  )
}
