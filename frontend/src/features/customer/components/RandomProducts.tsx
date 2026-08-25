// frontend/src/features/customer/components/RandomProducts.tsx
import { useRandomProducts } from "../hooks/useRandomProducts"
import ProductCard from "@/components/common/ProductCard"
import { SkeletonProductCard } from "@/components/common/Skeleton/SkeletonProductCard"

interface RandomProductsProps {
  productId: string
  limit?: number
}

function RandomProducts({ productId, limit = 4 }: RandomProductsProps) {
  const { randomProducts, isLoading } = useRandomProducts(productId, limit)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(limit)].map((_, i) => (
          <SkeletonProductCard key={i} />
        ))}
      </div>
    )
  }

  if (!randomProducts || randomProducts.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No other products available
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {randomProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}

export default RandomProducts
