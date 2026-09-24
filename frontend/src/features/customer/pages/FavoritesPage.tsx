import BreadcrumbLinkComponent from "@/components/common/BreadcrumbLink"
import { useFavoriteLists } from "../hooks/useFavoriteLists"
import MerchantAndProductResults from "../components/MerchantAndProductsResults"
import { Heart } from "lucide-react"

function FavoritesPage() {
  const { data, isLoading, isError } = useFavoriteLists()
  const { products, merchants } = data || {}

  return (
    <div className="flex h-full flex-col gap-5 px-5 py-4 lg:px-10">
      <div className="mt-5">
        <BreadcrumbLinkComponent currentPage={"Search"} />
      </div>

      <div className="ml-4 flex w-full flex-col gap-3">
        <div className="flex flex-row items-center gap-3">
          <Heart
            className="size-6 lg:size-8 2xl:size-10"
            stroke="#ff6b00"
            fill="#ff6b00"
          />
          <h1 className="text-base font-semibold xl:text-lg">
            Your Favorites List
          </h1>
        </div>
        <main className="flex w-full">
          <MerchantAndProductResults
            products={products}
            merchants={merchants}
            isLoading={isLoading}
            error={isError}
          />
        </main>
      </div>
    </div>
  )
}

export default FavoritesPage
