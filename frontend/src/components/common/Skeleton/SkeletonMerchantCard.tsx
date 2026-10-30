import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonMerchantCard() {
  return (
    <Card className="mx-auto w-full max-w-sm overflow-hidden pt-0">
      <div className="aspect-video w-full">
        <Skeleton className="h-full w-full" />
      </div>

      <CardHeader className="relative">
        <div className="absolute top-2 right-2">
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>

        <CardTitle>
          <Skeleton className="h-6 w-3/4" />
        </CardTitle>

        <CardDescription>
          <Skeleton className="h-4 w-2/3" />
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
