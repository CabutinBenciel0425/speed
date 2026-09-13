import { useRandomProducts } from "../hooks/useRandomProducts"
import ProductCard from "@/components/common/ProductCard"
import { SkeletonProductCard } from "@/components/common/Skeleton/SkeletonProductCard"

interface RandomProductsProps {
  productIds?: string[]
  limit?: number
}

function RandomProducts({ productIds = [], limit = 4 }: RandomProductsProps) {
  const { data: randomProducts = [], isLoading } = useRandomProducts(
    productIds,
    limit
  )

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
