import { useParams, useSearchParams } from "react-router-dom"
import { useProductsByCategory } from "../hooks/useProductsByCategory"
import ProductCard from "@/components/common/ProductCard"
import { PaginationPage } from "@/components/common/PaginationPage"
import { SkeletonProductCard } from "@/components/common/Skeleton/SkeletonProductCard"
import Filter from "@/components/common/Filter"
import { useProductTopTags } from "../hooks/useProductTopTags"
import { CategoryHeader } from "@/components/common/CategoryHeader"
import Sort from "@/components/common/Sort"
import SkeletonCategoryHeader from "@/components/common/Skeleton/SkeletonCategoryHeader"
import SkeletonPagination from "@/components/common/Skeleton/SkeletonPagination"
import BreadcrumbLinkComponent from "@/components/common/BreadcrumbLink"
import { useMemo } from "react"
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"

function CategoryProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get("page")) || 1
  const tagsParams = searchParams.get("tags") ?? ""
  const sortParams = searchParams.get("sort") ?? "-price"
  const { categoryId } = useParams<{ categoryId: string }>()
  const { productsByCategory, isLoading, error } = useProductsByCategory(
    categoryId || "",
    page,
    tagsParams,
    sortParams
  )
  const { tags: topTags } = useProductTopTags(categoryId || "")

  const allTags = useMemo(() => {
    if (!tagsParams || tagsParams === "all") return topTags

    const exists = topTags.some((tag) => tag._id === tagsParams)
    if (exists) return topTags

    return [{ _id: tagsParams, count: 0 }, ...topTags]
  }, [topTags, tagsParams])

  const totalPages = productsByCategory?.pagination?.pages || 1
  const category = productsByCategory?.data?.category
  const categoryName =
    typeof category === "string" ? category : category?.name || ""

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)

    params.set("page", String(page))

    setSearchParams(params)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleFilterChange = (tag: string) => {
    const params = new URLSearchParams(searchParams)

    params.set("page", "1")

    if (tag === "all" || tag === "") {
      params.delete("tags")
    } else {
      params.set("tags", tag)
    }

    setSearchParams(params)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
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

  return (
    <div className="flex h-full flex-col gap-5 px-5 py-4 lg:px-10">
      <div className="mt-5">
        <BreadcrumbLinkComponent currentPage={categoryName} />
      </div>
      {isLoading ? (
        <SkeletonCategoryHeader />
      ) : (
        <CategoryHeader
          name={categoryName}
          description={category?.description || ""}
          image={category?.image || ""}
        />
      )}

      <div className="-mb-2 flex flex-col gap-5 md:mb-5">
        <p className="text-base text-muted-foreground md:text-lg">
          {productsByCategory?.pagination?.total} items found
        </p>
        <div className="flex w-full items-center justify-between">
          <Filter
            tags={allTags}
            value={tagsParams || "all"}
            onFilterChange={handleFilterChange}
          />

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

export default CategoryProductsPage
