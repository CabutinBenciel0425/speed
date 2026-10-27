import ProductCard from "@/components/common/ProductCard"
import { SkeletonProductCard } from "@/components/common/Skeleton/SkeletonProductCard"
import type { FeaturedProducts } from "../hooks/useFeaturedProducts"

function FeaturedProductsComponent({
  isLoadingFeatured,
  errorFeatured,
  featuredProductsData,
}: {
  isLoadingFeatured: boolean
  errorFeatured?: Error | null
  featuredProductsData?: FeaturedProducts
}) {
  return (
    <div className="flex-1 overflow-hidden py-10">
      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(170px,220px))] items-center justify-center gap-4 lg:grid-cols-[repeat(auto-fill,minmax(220px,260px))] xl:grid-cols-[repeat(auto-fill,minmax(300px,340px))] 2xl:items-start 2xl:justify-start">
        {isLoadingFeatured && (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonProductCard key={i} />
            ))}
          </>
        )}
        {!isLoadingFeatured && errorFeatured && (
          <p className="col-span-full text-center text-red-500">
            Error on fetching the products
          </p>
        )}
        {!isLoadingFeatured &&
          !errorFeatured &&
          featuredProductsData?.featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
      </div>

      {!isLoadingFeatured &&
        !errorFeatured &&
        featuredProductsData?.featuredProducts.length === 0 && (
          <div className="flex h-40 items-center justify-center">
            <p className="text-gray-500">No products found in this category</p>
          </div>
        )}
    </div>
  )
}

export default FeaturedProductsComponent
