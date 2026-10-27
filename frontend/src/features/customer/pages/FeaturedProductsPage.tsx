import { useFeaturedProducts } from "../hooks/useFeaturedProducts"
import { useBestSellerProducts } from "../hooks/useBestSellerProducts"
import { useSearchParams } from "react-router-dom"
import FeaturedProductsComponent from "../components/FeaturedProductsComponent"
import BestSellersComponent from "../components/BestSellersComponent"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartBarBig, Sparkles } from "lucide-react"
import SkeletonPagination from "@/components/common/Skeleton/SkeletonPagination"
import PageControls from "@/components/common/PageControls"

function FeaturedProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const {
    data: featuredProductsData,
    isLoading: isLoadingFeatured,
    error: errorFeatured,
  } = useFeaturedProducts({ page })
  const {
    data: bestSellerProductsData,
    isLoading: isLoadingBestSellers,
    error: errorBestSellers,
  } = useBestSellerProducts()

  const setPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(nextPage))
    setSearchParams(params)
  }

  return (
    <div className="px-5 lg:px-15">
      <h1 className="text-sm font-semibold md:text-base lg:text-lg">
        Top Picks
      </h1>
      <p className="text-xs text-muted-foreground lg:text-sm">
        Our most loved products right now
      </p>

      <Tabs
        defaultValue="featured"
        className={"flex w-full flex-row items-center justify-center py-6"}
      >
        <TabsList className={"rounded-sm"}>
          <TabsTrigger
            value="featured"
            className={
              "rounded-sm px-5 text-sm sm:px-8 sm:tracking-wide md:px-12 md:text-base lg:px-20 lg:text-lg lg:tracking-wider"
            }
          >
            <Sparkles />
            Featured
          </TabsTrigger>
          <TabsTrigger
            value="bestsellers"
            className={
              "rounded-sm px-5 text-sm sm:px-8 sm:tracking-wide md:px-12 md:text-base lg:px-20 lg:text-lg lg:tracking-wider"
            }
          >
            <ChartBarBig />
            Best Sellers
          </TabsTrigger>
        </TabsList>
        <TabsContent value="featured" className={"w-full"}>
          <FeaturedProductsComponent
            isLoadingFeatured={isLoadingFeatured}
            errorFeatured={errorFeatured}
            featuredProductsData={featuredProductsData}
          />
          <div className="shrink-0 px-8">
            {isLoadingFeatured ? (
              <SkeletonPagination />
            ) : (
              <PageControls
                page={featuredProductsData?.pagination.page ?? page}
                pages={featuredProductsData?.pagination.pages ?? 0}
                total={featuredProductsData?.pagination.total ?? 0}
                onPageChange={setPage}
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value="bestsellers" className={"w-full"}>
          <BestSellersComponent
            isLoadingBestSellers={isLoadingBestSellers}
            errorBestSellers={errorBestSellers}
            bestSellerProductsData={bestSellerProductsData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FeaturedProductsPage
