import MerchantCard from "@/components/common/MerchantCard"
import ViewAllButton from "@/components/common/ViewAllButton"
import { useMerchants } from "../hooks/useMerchants"
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
    <div className="flex flex-col gap-5 px-10 lg:px-20">
      <div className="flex items-center justify-between">
        <p className="block text-lg font-semibold">Popular Restaurants</p>
        <ViewAllButton />
      </div>
      <div className="w-full px-5 lg:px-10 2xl:px-15">
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
          <CarouselContent className="py-3">
            {!isLoading &&
              !error &&
              merchants.map((merchant) => (
                <CarouselItem
                  key={merchant._id}
                  className="basis-1/1 md:basis-1/2 xl:basis-1/4"
                >
                  <div className="px-5">
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
