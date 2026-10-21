import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4" role="status" aria-label="Loading orders">
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="rounded-2xl border-border/70 shadow-sm">
          <CardContent className="space-y-5 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3.5 w-44 max-w-full" />
              </div>
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <div className="space-y-3 border-y py-4">
              {Array.from({ length: 2 }, (_, row) => (
                <div key={row} className="flex justify-between gap-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-14" />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-between gap-3">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-5 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
