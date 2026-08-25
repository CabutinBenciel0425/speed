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
    <div className="flex w-full flex-col gap-5 px-10 lg:px-20">
      <div className="flex items-center justify-between">
        <p className="block text-lg font-semibold">Featured Products</p>
        <ViewAllButton />
      </div>
      <div className="w-full px-5 lg:px-10 2xl:px-15">
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

        <Carousel className="mx-auto flex w-full flex-row items-center justify-center">
          <CarouselPrevious />
          {!isLoading && !error && (
            <CarouselContent className="mx-auto flex w-full items-start justify-start p-0">
              {featuredProducts.map((product) => (
                <CarouselItem
                  key={product._id}
                  className="basis-1/1 md:basis-1/2 lg:basis-1/4"
                >
                  <div className="px-5">
                    <ProductCard product={product} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          )}

          <CarouselNext />
        </Carousel>
      </div>
    </div>
  )
}

export default FeaturedProducts
