import { SkeletonProductCard } from "@/components/common/Skeleton/SkeletonProductCard"
import type { Product } from "../types/products"
import ProductCard from "@/components/common/ProductCard"
type MerchantPageProducts = {
  productsByMerchant: Product[] | []
  isLoadingProducts: boolean
  errorProducts: Error | null
}

function MerchantPageProducts({
  productsByMerchant,
  isLoadingProducts,
  errorProducts,
}: MerchantPageProducts) {
  return (
    <div className="flex w-full flex-col gap-5 px-5 lg:px-20">
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4 lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] xl:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
        {isLoadingProducts && (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonProductCard key={i} />
            ))}
          </>
        )}

        {errorProducts && (
          <div className="col-span-full flex w-full items-center justify-center">
            <p className="text-red-500">Error loading featured products</p>
          </div>
        )}

        {productsByMerchant.map((product) => (
          <ProductCard product={product} />
        ))}
      </div>
    </div>
  )
}

export default MerchantPageProducts
