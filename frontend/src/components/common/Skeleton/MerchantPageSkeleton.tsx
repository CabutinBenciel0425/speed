import { Skeleton } from "@/components/ui/skeleton"

function MerchantPageSkeleton() {
  return (
    <div className="relative min-h-screen w-full pb-20">
      <div className="absolute -top-35 left-0 h-64 w-full overflow-hidden md:h-80 lg:h-112.5">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  )
}

export default MerchantPageSkeleton
