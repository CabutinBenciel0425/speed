import { useSearchParams } from "react-router-dom"
import BreadcrumbLinkComponent from "../../../components/common/BreadcrumbLink"
import { useSearchPageResults } from "@/hooks/useSearchPageResults"
import SearchPageResults from "../components/SearchPageResults"

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
        <h1 className="text-lg font-semibold">
          Search results for <span className="text-primary">"{query}"</span>
        </h1>

        <h4 className="text-base font-normal text-muted-foreground/50">
          {totalResults} results found
        </h4>

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
