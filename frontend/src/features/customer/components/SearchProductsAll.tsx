import { Navigate, useSearchParams } from "react-router-dom"

import ProductCard from "@/components/common/ProductCard"

import { useMemo, useState } from "react"
import SearchFilterProducts from "./SearchFilterProducts"
import BreadcrumbLinkComponent from "@/components/common/BreadcrumbLink"
import SkeletonPagination from "@/components/common/Skeleton/SkeletonPagination"
import { PaginationPage } from "@/components/common/PaginationPage"
import { useSearchProductResults } from "../hooks/useSearchProductsResults"
import { useCategories } from "../hooks/useCategories"
import { ArchiveX } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { getTimeRangeFromSelected } from "../utils/timeUtils"

function SearchProductsAll() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { categories } = useCategories()
  const selectedCategory = searchParams.get("category") || "All"
  const minPrice = Number(searchParams.get("minPrice")) || 5
  const maxPrice = Number(searchParams.get("maxPrice")) || 500
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice,
    maxPrice,
  ])

  const [selectedPrepTimes, setSelectedPrepTimes] = useState<string[]>([])
  const page = Number(searchParams.get("page")) || 1
  const query = String(searchParams.get("search")) || ""
  const timeRange = useMemo(() => {
    return getTimeRangeFromSelected(selectedPrepTimes)
  }, [selectedPrepTimes])
  console.log(timeRange)
  const { data, isLoading, isError } = useSearchProductResults(
    query,
    page,
    selectedCategory,
    priceRange,
    timeRange
  )

  const totalPages: number = data?.pagination?.pages || 1

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)

    params.set("page", String(page))

    setSearchParams(params)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }
  const pages = [
    {
      link: `/search?query=${query}`,
      pageName: "Search",
    },
  ]

  const handlePriceRangeChange = (value: number | readonly number[]) => {
    const nextValue = Array.isArray(value) ? value : [value, value]
    setPriceRange(nextValue as [number, number])
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCategory = e.target.value

    const params = new URLSearchParams(searchParams)

    params.set("page", "1")

    if (newCategory === "All" || newCategory === "") {
      params.delete("category")
    } else {
      params.set("category", newCategory)
    }

    setSearchParams(params)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handlePrepTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSelectedPrepTimes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    )
  }

  const handleResetFilters = () => {
    const params = new URLSearchParams(searchParams)

    params.delete("category")
    params.delete("minPrice")
    params.delete("maxPrice")
    params.delete("minTime")
    params.delete("maxTime")
    params.set("page", "1")

    setSearchParams(params)

    setPriceRange([5, 500])
    setSelectedPrepTimes([])
  }

  if (isLoading) {
    return (
      <div className="mt-50 flex h-full items-center justify-center">
        <Spinner className="size-10" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-red-500">
          Failed to load products. Please try again.
        </p>
      </div>
    )
  }

  if (!query.trim()) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <BreadcrumbLinkComponent currentPage={"Products"} pages={pages} />
      <h1 className="mb-6 text-2xl font-bold">
        All Products ({data?.pagination.total})
      </h1>
      <main className="flex w-full flex-row gap-10">
        <aside className="hidden lg:flex">
          <form>
            <SearchFilterProducts
              selectedCategory={selectedCategory}
              categories={categories || []}
              priceRange={priceRange}
              selectedPrepTimes={selectedPrepTimes}
              onHandlePriceRange={handlePriceRangeChange}
              onHandleCategoryChange={handleCategoryChange}
              onHandlePrepTimeChange={handlePrepTimeChange}
              onHandleResetFilter={handleResetFilters}
            />
          </form>
        </aside>
        <div className="flex w-full flex-col items-center gap-5">
          {data?.data && data?.data.length > 0 ? (
            <>
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {data?.data.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              <div className="shrink-0 py-4">
                {isLoading ? (
                  <SkeletonPagination />
                ) : (
                  <PaginationPage
                    currentPage={page}
                    onPageChange={handlePageChange}
                    totalPages={totalPages}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="mt-40 flex flex-col items-center justify-center gap-4">
              <ArchiveX className="size-15 text-muted-foreground" />
              <div className="flex flex-col items-center justify-center">
                <p className="text-lg text-muted-foreground">
                  No products found
                </p>
                <p className="text-sm text-muted-foreground/60">
                  Try adjusting your search or filter
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default SearchProductsAll
