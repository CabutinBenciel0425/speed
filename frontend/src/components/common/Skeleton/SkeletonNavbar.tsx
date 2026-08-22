import { Skeleton } from "@/components/ui/skeleton"

function SkeletonNavbar() {
  return (
    <header className="flex w-full flex-row gap-1 px-2 py-4 lg:px-10 lg:py-6 xl:gap-5">
      <div className="flex-start flex w-1/4 items-center">
        <Skeleton className="h-12 w-40" />
      </div>
      <div className="flex w-2/4 flex-row items-center justify-between md:gap-2">
        <Skeleton className="h-12 w-70" />
        <Skeleton className="hidden md:block md:h-12 md:w-30" />
      </div>
      <div className="flex w-1/4 flex-row items-center justify-end gap-5">
        <Skeleton className="h-12 w-20" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </header>
  )
}

export default SkeletonNavbar
