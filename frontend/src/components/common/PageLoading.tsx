import { LoaderCircle } from "lucide-react"

export default function PageLoading({
  label = "Loading page",
  className = "",
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex min-h-48 w-full items-center justify-center p-6 ${className}`}
    >
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        {label}
      </span>
    </div>
  )
}
