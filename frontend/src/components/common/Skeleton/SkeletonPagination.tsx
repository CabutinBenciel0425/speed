import { Skeleton } from "@/components/ui/skeleton"

function SkeletonPagination() {
  return (
    <div className="mt-6 flex items-center justify-between space-y-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-7 w-40" />
    </div>
  )
}

export default SkeletonPagination
