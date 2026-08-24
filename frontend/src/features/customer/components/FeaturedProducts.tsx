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
    <div className="flex w-full flex-col gap-5 px-20">
      <div className="flex items-center justify-between">
        <p className="block text-lg font-semibold">Featured Products</p>
        <ViewAllButton />
      </div>
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4 lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] xl:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
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

        <Carousel className="flex w-full flex-row justify-between">
          <CarouselPrevious />
          {!isLoading && !error && (
            <CarouselContent>
              {featuredProducts.map((product) => (
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
          )}

          <CarouselNext />
        </Carousel>
      </div>
    </div>
  )
}

export default FeaturedProducts
