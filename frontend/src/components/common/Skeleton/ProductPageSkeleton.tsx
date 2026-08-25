import { Skeleton } from "@/components/ui/skeleton"

function ProductPageSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col gap-6 px-4 py-4 md:px-6 lg:px-40">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <Skeleton className="aspect-square max-h-150 max-w-150 rounded-xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  )
}

export default ProductPageSkeleton
