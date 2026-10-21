import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PageError({
  message = "Something went wrong while loading this page.",
  onRetry,
  isRetrying = false,
}: {
  message?: string
  onRetry?: () => void
  isRetrying?: boolean
}) {
  return (
    <section
      role="alert"
      className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-card px-5 py-8 text-center shadow-sm sm:px-8"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle aria-hidden="true" className="size-5" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onRetry}
          disabled={isRetrying}
        >
          <RefreshCw
            aria-hidden="true"
            className={`size-4 ${isRetrying ? "animate-spin" : ""}`}
          />
          Try again
        </Button>
      )}
    </section>
  )
}
