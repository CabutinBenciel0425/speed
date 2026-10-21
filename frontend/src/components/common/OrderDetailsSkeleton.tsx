import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function OrderDetailsSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <Skeleton className="h-4 w-28" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <Card className="rounded-2xl">
            <CardContent className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <Skeleton className="h-28 w-full rounded-xl sm:w-64" />
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="space-y-4 p-4 sm:p-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="space-y-3 p-4 sm:p-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="rounded-2xl">
            <CardContent className="space-y-4 p-4 sm:p-6">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
