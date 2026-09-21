import ProductCard from "@/components/common/ProductCard"
import { SkeletonProductCard } from "@/components/common/Skeleton/SkeletonProductCard"
import { useRandomProductsFromMerchant } from "../hooks/useRandomProductsFromMerchant"

interface RandomProductsProps {
  productIds?: string[]
  limit?: number
  merchantId?: string
}

function RandomProducts({
  productIds = [],
  limit = 4,
  merchantId = "",
}: RandomProductsProps) {
  const { data: randomProducts = [], isLoading } =
    useRandomProductsFromMerchant(productIds, limit, merchantId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(limit)].map((_, i) => (
          <SkeletonProductCard key={i} />
        ))}
      </div>
    )
  }

  if (randomProducts.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No other products available
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {randomProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}

export default RandomProducts
