import { Navigate, useSearchParams } from "react-router-dom"
import MerchantCard from "@/components/common/MerchantCard"
import BreadcrumbLinkComponent from "@/components/common/BreadcrumbLink"
import SkeletonPagination from "@/components/common/Skeleton/SkeletonPagination"
import { PaginationPage } from "@/components/common/PaginationPage"
import { useSearchMerchantResults } from "../hooks/useSearchMerchantResults"
import { SkeletonMerchantCard } from "@/components/common/Skeleton/SkeletonMerchantCard"
import { ArchiveX } from "lucide-react"
import SearchFilterMerchants from "./SearchFilterMerchants"
import Sort from "@/components/common/Sort"
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"

function SearchMerchantsAll() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sortParams = searchParams.get("sort") ?? "-averageRating"
  const page = Number(searchParams.get("page")) || 1
  const query = String(searchParams.get("search")) || ""
  const { data, isLoading, isError } = useSearchMerchantResults(
    query,
    page,
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

  const pages = [
    {
      link: `/search?query=${query}`,
      pageName: "Search",
    },
  ]

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams)

    params.set("sort", "-averageRating")

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonMerchantCard key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-red-500">
          Failed to load merchants. Please try again.
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
        <p className="text-lg text-muted-foreground">No merchants found</p>
        <p className="text-sm text-muted-foreground/60">
          Try adjusting your search
        </p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-5 p-6">
      <BreadcrumbLinkComponent currentPage={"Merchants"} pages={pages} />
      <h1 className="text-2xl font-bold">
        All Merchants ({data?.pagination.total})
      </h1>

      <main className="flex w-full flex-col gap-2">
        <div className="mb-5 flex w-full items-end justify-end">
          <Sort value={sortParams}>
            <DropdownMenuLabel>Sort products by</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={sortParams}
              onValueChange={handleSortChange}
            >
              <DropdownMenuRadioItem value="-averageRating">
                <span className="text-md font-semibold">Rating</span>
                <span className="text-muted-foreground">Highest to Lowest</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="averageRating">
                <span className="text-md font-semibold">Rating</span>
                <span className="text-muted-foreground">Lowest to Highest</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="merchantName">
                <span className="text-md font-semibold">Name</span>
                <span className="text-muted-foreground">A to Z</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="-merchantName">
                <span className="text-md font-semibold">Name</span>
                <span className="text-muted-foreground">Z to A</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </Sort>
        </div>
        <div className="flex w-full flex-row gap-10">
          <aside className="hidden lg:flex">
            <form>
              <SearchFilterMerchants
              // selectedCategory={selectedCategory}
              // categories={categories || []}
              // priceRange={priceRange}
              // selectedPrepTimes={selectedPrepTimes}
              // onHandlePriceRange={handlePriceRangeChange}
              // onHandleCategoryChange={handleCategoryChange}
              // onHandlePrepTimeChange={handlePrepTimeChange}
              // onHandleResetFilter={handleResetFilters}
              />
            </form>
          </aside>
          <div className="flex w-full flex-col items-center gap-5">
            {data?.data && data?.data.length > 0 ? (
              <>
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {data?.data.map((merchant) => (
                    <MerchantCard key={merchant._id} merchant={merchant} />
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
                    No merchants found
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

export default SearchMerchantsAll
