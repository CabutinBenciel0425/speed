import ViewAllButton from "@/components/common/ViewAllButton"
import ProductCard from "@/components/common/ProductCard"
import { useFeaturedProducts } from "../hooks/useProducts"
import { SkeletonProductCard } from "@/components/common/Skeleton/SkeletonProductCard"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

function FeaturedProducts() {
  const { featuredProducts, isLoading, error } = useFeaturedProducts()
  return (
    <div className="flex flex-col gap-5 px-5">
      <div className="flex items-center justify-between">
        <p className="block text-lg font-semibold">Featured Products</p>
        <ViewAllButton />
      </div>
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        {isLoading && (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonProductCard key={i} />
            ))}
          </>
        )}

        {error && (
          <div className="col-span-full flex w-full items-center justify-center">
            <p className="text-red-500">Error loading featured products</p>
          </div>
        )}

        <Carousel className="w-full">
          <CarouselContent>
            {!isLoading &&
              !error &&
              featuredProducts.map((product) => (
                <CarouselItem
                  key={product._id}
                  className="basis-1/2 pl-1 lg:basis-1/5"
                >
                  <div className="p-1">
                    <ProductCard product={product} />
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

export default FeaturedProducts
