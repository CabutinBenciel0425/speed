import MerchantCard from "@/components/common/MerchantCard"
import ViewAllButton from "@/components/common/ViewAllButton"
import { useMerchants } from "../hooks/useMerchant"
import { SkeletonMerchantCard } from "@/components/common/Skeleton/SkeletonMerchantCard"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

function Merchant() {
  const { merchants, isLoading, error } = useMerchants()
  return (
    <div className="flex flex-col gap-5 px-5">
      <div className="flex items-center justify-between">
        <p className="block text-lg font-semibold">Popular Restaurants</p>
        <ViewAllButton />
      </div>
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-4">
        {isLoading && (
          <>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonMerchantCard key={i} />
            ))}
          </>
        )}

        {error && (
          <div className="col-span-full flex w-full items-center justify-center">
            <p className="text-red-500">Error loading merchants</p>
          </div>
        )}

        <Carousel className="w-full">
          <CarouselContent>
            {!isLoading &&
              !error &&
              merchants.map((merchant) => (
                <CarouselItem
                  key={merchant.id}
                  className="basis-1/2 pl-1 lg:basis-1/4"
                >
                  <div className="p-1">
                    <MerchantCard merchant={merchant} />
                  </div>
                </CarouselItem>
              ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  )
}

export default Merchant
