import { ArchiveX } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { useCategories } from "../hooks/useCategories"
import { useMemo, useState } from "react"
import { getTimeRangeFromSelected } from "../utils/timeUtils"

import { Spinner } from "@/components/ui/spinner"
import BreadcrumbLinkComponent from "@/components/common/BreadcrumbLink"
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import Sort from "@/components/common/Sort"
import SearchFilterProducts from "./SearchFilterProducts"
import ProductCard from "@/components/common/ProductCard"
import SkeletonPagination from "@/components/common/Skeleton/SkeletonPagination"
import { PaginationPage } from "@/components/common/PaginationPage"
import { useProductFavoriteList } from "../hooks/useProductFavoriteList"
import { LiaBoxOpenSolid } from "react-icons/lia"

function ProductFavoritesAll() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sortParams = searchParams.get("sort") ?? "-price"
  const { categories } = useCategories()
  const selectedCategory = searchParams.get("category") || ""
  const minPrice = Number(searchParams.get("minPrice")) || 0
  const maxPrice = Number(searchParams.get("maxPrice")) || 1000
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice,
    maxPrice,
  ])

  const [selectedPrepTimes, setSelectedPrepTimes] = useState<string[]>([])
  const page = Number(searchParams.get("page")) || 1
  const timeRange = useMemo(() => {
    return getTimeRangeFromSelected(selectedPrepTimes)
  }, [selectedPrepTimes])

  const { data, isLoading, error } = useProductFavoriteList(
    page,
    selectedCategory,
    priceRange,
    timeRange,
    sortParams
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

  const handlePriceRangeChange = (value: number | readonly number[]) => {
    const nextValue = Array.isArray(value) ? value : [value, value]
    setPriceRange(nextValue as [number, number])
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCategory = e.target.value

    const params = new URLSearchParams(searchParams)

    params.set("page", "1")

    if (newCategory === "") {
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

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams)

    params.set("sort", "-price")

    if (sort === "") {
      params.delete("sort")
    } else {
      params.set("sort", sort)
    }

    setSearchParams(params)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const pages = [
    {
      link: `/favorites`,
      pageName: "Favorites",
    },
  ]

  if (isLoading) {
    return (
      <div className="mt-50 flex h-full items-center justify-center">
        <Spinner className="size-10" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-red-500">
          {error.message || "Failed to load products. Please try again."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <BreadcrumbLinkComponent currentPage={"Products"} pages={pages} />
      <h1 className="flex flex-row items-center gap-2 text-2xl font-bold">
        <LiaBoxOpenSolid className="size-6 text-primary lg:size-8" />
        <span className="text-base font-semibold lg:text-lg">
          All Favorite Products ({data?.pagination.total})
        </span>
      </h1>
      <main className="flex w-full flex-col gap-2">
        <div className="mb-5 flex w-full items-end justify-end">
          <Sort value={sortParams}>
            <DropdownMenuLabel>Sort products by</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={sortParams}
              onValueChange={handleSortChange}
            >
              <DropdownMenuRadioItem value="-price">
                <span className="text-base font-semibold">Price</span>
                <span className="text-muted-foreground">Highest to Lowest</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="price">
                <span className="text-base font-semibold">Price</span>
                <span className="text-muted-foreground">Lowest to Highest</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="name">
                <span className="text-base font-semibold">Name</span>
                <span className="text-muted-foreground">A to Z</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="-name">
                <span className="text-base font-semibold">Name</span>
                <span className="text-muted-foreground">Z to A</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </Sort>
        </div>
        <div className="flex w-full flex-row gap-10">
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
            {data?.products && data?.products.length > 0 ? (
              <>
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {data?.products.map((product) => (
                    <ProductCard key={product._id} product={product.product} />
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
        </div>
      </main>
    </div>
  )
}

export default ProductFavoritesAll
