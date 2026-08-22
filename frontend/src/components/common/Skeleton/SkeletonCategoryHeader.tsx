import { Skeleton } from "@/components/ui/skeleton"

function SkeletonCategoryHeader() {
  return (
    <div className="mb-5 flex w-full flex-row items-center gap-5">
      <Skeleton className="h-25 w-45 md:h-30 md:w-30 lg:h-35 lg:w-35" />
      <div className="flex flex-col gap-1 lg:gap-5">
        <Skeleton className="h-6 w-25 md:h-8 lg:h-10 lg:w-40" />
        <Skeleton className="h-4 w-60 md:h-4 md:w-150 lg:h-6 lg:w-180 xl:w-200" />
        <Skeleton className="block h-4 w-60 md:h-4 md:w-60 lg:h-6 lg:w-40 xl:hidden" />
        <Skeleton className="block h-4 w-60 md:hidden" />
      </div>
    </div>
  )
}

export default SkeletonCategoryHeader
