import { useParams, useSearchParams } from "react-router-dom"
import { useProductsByCategory } from "../hooks/useProductsByCategory"
import ProductCard from "@/components/common/ProductCard"
import { PaginationPage } from "@/components/common/PaginationPage"
import { SkeletonProductCard } from "@/components/common/Skeleton/SkeletonProductCard"

function CategoryProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get("page")) || 1
  const { categoryId } = useParams<{ categoryId: string }>()
  const { productsByCategory, isLoading, error } = useProductsByCategory(
    categoryId || "",
    page
  )
  const totalPages = productsByCategory?.pagination?.pages || 1
  const category = productsByCategory?.data?.category
  const categoryName =
    typeof category === "string" ? category : category?.name || ""

  const handlePageChange = (page: number) => {
    setSearchParams({ page: String(page) })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="flex h-full flex-col gap-5 px-5 py-4">
      <div className="mb-5 flex flex-row items-center">
        <img
          src={category?.image}
          alt={categoryName}
          className="h-25 w-25 md:h-30 md:w-30 lg:h-35 lg:w-35"
        />
        <div>
          <h1 className="mb-2 text-2xl font-bold md:mb-5 md:text-3xl">
            {categoryName}
          </h1>
          <p className="md:text-md text-sm text-muted-foreground lg:text-lg">
            {category?.description}
          </p>
        </div>
      </div>

      <div className="-mb-2 ml-7 md:mb-5">
        <p className="text-md text-muted-foreground md:text-lg">
          {productsByCategory?.pagination?.total} items found
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(170px,220px))] items-center justify-center gap-4 lg:grid-cols-[repeat(auto-fill,minmax(220px,260px))] xl:grid-cols-[repeat(auto-fill,minmax(300px,340px))] 2xl:items-start 2xl:justify-start">
          {isLoading && (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonProductCard key={i} />
              ))}
            </>
          )}
          {!isLoading && error && (
            <p className="col-span-full text-center text-red-500">
              Error on fetching the products
            </p>
          )}
          {!isLoading &&
            !error &&
            productsByCategory?.data?.products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
        </div>

        {!isLoading &&
          !error &&
          productsByCategory?.data?.products.length === 0 && (
            <div className="flex h-40 items-center justify-center">
              <p className="text-gray-500">
                No products found in this category
              </p>
            </div>
          )}
      </div>

      <div className="shrink-0 py-4">
        <PaginationPage
          id={categoryId || ""}
          currentPage={page}
          onPageChange={handlePageChange}
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}

export default CategoryProductsPage
