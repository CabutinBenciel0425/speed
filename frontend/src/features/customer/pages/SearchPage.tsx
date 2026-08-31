import { useSearchParams } from "react-router-dom"
import BreadcrumbLinkComponent from "../../../components/common/BreadcrumbLink"
import { useState } from "react"
import SearchFilter from "../components/SearchFilter"
import { useSearchPageResults } from "@/hooks/useSearchPageResults"
import SearchPageResults from "../components/SearchPageResults"

function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("query") || ""
  const { data, isLoading, isError } = useSearchPageResults(query || "")

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

  console.log(data)

  return (
    <div className="flex h-full flex-col gap-5 px-5 py-4 lg:px-10">
      <div className="mt-5">
        <BreadcrumbLinkComponent currentPage={"Search"} />
      </div>

      <div className="ml-4 flex w-full flex-col gap-3">
        <h1 className="text-lg font-semibold">
          Search results for <span className="text-primary">"{query}"</span>
        </h1>

        <h4 className="text-md font-normal text-muted-foreground/50">
          10 results found
        </h4>

        <div className="flex w-full flex-row gap-10">
          <aside className="hidden lg:flex">
            <form>
              <SearchFilter
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

          <main className="flex w-full">
            <SearchPageResults
              products={data?.products || []}
              merchants={data?.merchants || []}
              isLoading={isLoading}
              isError={isError}
            />
          </main>
        </div>
      </div>
    </div>
  )
}

export default SearchPage
