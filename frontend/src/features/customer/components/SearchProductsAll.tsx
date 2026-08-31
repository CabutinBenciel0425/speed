import { useLocation, Navigate } from "react-router-dom"
import type { Product } from "../types/products"
import ProductCard from "@/components/common/ProductCard"

function SearchProductsAll() {
  const location = useLocation()
  const products: Product[] = location.state?.products

  if (!products) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">
        All Products ({products.length})
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default SearchProductsAll
