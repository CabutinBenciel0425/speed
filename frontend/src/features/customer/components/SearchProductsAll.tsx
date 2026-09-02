import { Navigate, useSearchParams } from "react-router-dom"

import ProductCard from "@/components/common/ProductCard"

import { useState } from "react"
import SearchFilterProducts from "./SearchFilterProducts"
import BreadcrumbLinkComponent from "@/components/common/BreadcrumbLink"
import SkeletonPagination from "@/components/common/Skeleton/SkeletonPagination"
import { PaginationPage } from "@/components/common/PaginationPage"
import { useSearchProductResults } from "../hooks/useSearchProductsResults"
import { SkeletonProductCard } from "@/components/common/Skeleton/SkeletonProductCard"

function SearchProductsAll() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get("page")) || 1
  const query = String(searchParams.get("search")) || ""
  const { data, isLoading, isError } = useSearchProductResults(query, page)

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

  const [selectedCategory, setSelectedCategory] = useState("All")
  const [priceRange, setPriceRange] = useState<[number, number]>([5, 250])
  const [selectedPrepTimes, setSelectedPrepTimes] = useState<string[]>([])

  const handlePriceRangeChange = (value: number | readonly number[]) => {
    const nextValue = Array.isArray(value) ? value : [value, value]
    setPriceRange(nextValue as [number, number])
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCategory(e.target.value)
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
    setSelectedCategory("All")
    setPriceRange([5, 250])
    setSelectedPrepTimes([])
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonProductCard key={i} />
        ))}
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

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">No products found</p>
        <p className="text-sm text-muted-foreground/60">
          Try adjusting your search
        </p>
      </div>
    )
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
              priceRange={priceRange}
              selectedPrepTimes={selectedPrepTimes}
              onHandlePriceRange={handlePriceRangeChange}
              onHandleCategoryChange={handleCategoryChange}
              onHandlePrepTimeChange={handlePrepTimeChange}
              onHandleResetFilter={handleResetFilters}
            />
          </form>
        </aside>
        <div className="flex w-full flex-col gap-5">
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
        </div>
      </main>
    </div>
  )
}

export default SearchProductsAll
