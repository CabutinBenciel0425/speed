import { Card, CardDescription, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonProductCard() {
  return (
    <Card className="mx-auto w-full max-w-2xs overflow-hidden pt-0">
      <div className="aspect-video w-full">
        <Skeleton className="h-full w-full" />
      </div>

      <CardHeader className="flex flex-col items-center justify-start gap-3">
        <CardDescription className="flex flex-col items-start gap-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-60" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-8 w-12" />
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
