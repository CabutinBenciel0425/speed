import ProductCard from "@/components/common/ProductCard"
import { SkeletonProductCard } from "@/components/common/Skeleton/SkeletonProductCard"
import type { BestSellerProducts } from "../hooks/useBestSellerProducts"

function BestSellersComponent({
  isLoadingBestSellers,
  errorBestSellers,
  bestSellerProductsData,
}: {
  isLoadingBestSellers: boolean
  errorBestSellers?: Error | null
  bestSellerProductsData?: BestSellerProducts
}) {
  return (
    <div className="flex-1 overflow-hidden py-10">
      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(170px,220px))] items-center justify-center gap-4 lg:grid-cols-[repeat(auto-fill,minmax(220px,260px))] xl:grid-cols-[repeat(auto-fill,minmax(300px,340px))] 2xl:items-start 2xl:justify-start">
        {isLoadingBestSellers && (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonProductCard key={i} />
            ))}
          </>
        )}
        {!isLoadingBestSellers && errorBestSellers && (
          <p className="col-span-full text-center text-red-500">
            Error on fetching the products
          </p>
        )}
        {!isLoadingBestSellers &&
          !errorBestSellers &&
          bestSellerProductsData?.bestSellerProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
      </div>

      {!isLoadingBestSellers &&
        !errorBestSellers &&
        bestSellerProductsData?.bestSellerProducts.length === 0 && (
          <div className="flex h-40 items-center justify-center">
            <p className="text-gray-500">No products found in this category</p>
          </div>
        )}
    </div>
  )
}

export default BestSellersComponent
