import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const accents = {
  brand: "bg-primary/10 text-primary",
  success: "bg-chart-2/10 text-chart-2",
  warning: "bg-chart-3/10 text-chart-3",
  neutral: "bg-muted text-muted-foreground",
}

export default function AdminStatCard({
  label,
  value,
  icon: Icon,
  accent = "brand",
}: {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: keyof typeof accents
}) {
  return (
    <Card className="border-border/60 py-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-center justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
            {value}
          </p>
        </div>
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl ${accents[accent]}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  )
}
