import { Navigate, useSearchParams } from "react-router-dom"
import MerchantCard from "@/components/common/MerchantCard"
import BreadcrumbLinkComponent from "@/components/common/BreadcrumbLink"
import SkeletonPagination from "@/components/common/Skeleton/SkeletonPagination"
import { PaginationPage } from "@/components/common/PaginationPage"
import { useSearchMerchantResults } from "../hooks/useSearchMerchantResults"
import { SkeletonMerchantCard } from "@/components/common/Skeleton/SkeletonMerchantCard"

function SearchMerchantsAll() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get("page")) || 1
  const query = String(searchParams.get("search")) || ""
  const { data, isLoading, isError } = useSearchMerchantResults(query, page)

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
      <h1 className="mb-6 text-2xl font-bold">
        All Merchants ({data?.pagination.total})
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
    </div>
  )
}

export default SearchMerchantsAll
