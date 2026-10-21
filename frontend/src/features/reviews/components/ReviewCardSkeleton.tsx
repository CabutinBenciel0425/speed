import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReviewCardSkeleton({
  count = 1,
}: {
  count?: number
}) {
  return (
    <div
      className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="Loading reviews"
    >
      {Array.from({ length: count }, (_, index) => (
        <Card
          key={index}
          className="h-full rounded-2xl border-border/70 shadow-sm"
        >
          <CardContent className="flex h-full flex-col gap-4 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 shrink-0 rounded-full sm:size-12" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 max-w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-36 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
