import { Skeleton } from "@/components/ui/skeleton"

function SkeletonPagination() {
  return (
    <div className="flex items-center justify-center">
      <Skeleton className="h-8 w-80" />
    </div>
  )
}

export default SkeletonPagination
