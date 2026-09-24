import { useSearchParams } from "react-router-dom"
import BreadcrumbLinkComponent from "../../../components/common/BreadcrumbLink"
import { useSearchPageResults } from "@/hooks/useSearchPageResults"
import SearchPageResults from "../components/SearchPageResults"
import { Search } from "lucide-react"

function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("query") || ""
  const { data, isLoading, isError } = useSearchPageResults(query || "")
  const { products, merchants } = data || {}

  const totalResults =
    products && merchants
      ? products?.pagination.total + merchants?.pagination?.total
      : 0
  return (
    <div className="flex h-full flex-col gap-5 px-5 py-4 lg:px-10">
      <div className="mt-5">
        <BreadcrumbLinkComponent currentPage={"Search"} />
      </div>

      <div className="ml-4 flex w-full flex-col gap-3">
        <div className="flex flex-row items-center gap-3">
          <Search className="size-6 lg:size-8 2xl:size-10" stroke="#ff6b00" />
          <h1 className="text-base font-semibold xl:text-lg">
            Search results for <span className="text-primary">"{query}"</span>
          </h1>

          <h4 className="text-xs font-normal text-muted-foreground/50 lg:text-sm">
            {totalResults} results found
          </h4>
        </div>

        <main className="flex w-full">
          <SearchPageResults
            products={products}
            merchants={merchants}
            isLoading={isLoading}
            isError={isError}
            query={query}
          />
        </main>
      </div>
    </div>
  )
}

export default SearchPage
