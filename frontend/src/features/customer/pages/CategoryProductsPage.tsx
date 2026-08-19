import { useParams } from "react-router-dom"
import { useProductsByCategory } from "../hooks/useProductsByCategory"
import { Spinner } from "@/components/ui/spinner"
import ProductCard from "@/components/common/ProductCard"

function CategoryProductsPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { productsByCategory, isLoading, error } = useProductsByCategory(
    categoryId || ""
  )

  console.log(productsByCategory)

  return (
    <div className="flex flex-col items-center justify-center">
      {isLoading && <Spinner className="size-8" />}
      {!isLoading && error && <p>Error on fetching the products</p>}
      {!isLoading &&
        !error &&
        productsByCategory?.map((product) => <ProductCard product={product} />)}
    </div>
  )
}

export default CategoryProductsPage
