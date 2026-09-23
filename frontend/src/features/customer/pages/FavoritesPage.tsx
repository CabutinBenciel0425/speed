import BreadcrumbLinkComponent from "@/components/common/BreadcrumbLink"
import { useFavoriteLists } from "../hooks/useFavoriteLists"
import MerchantAndProductResults from "../components/MerchantAndProductsResults"

function FavoritesPage() {
  const { data, isLoading, isError } = useFavoriteLists()
  const { products, merchants } = data || {}

  return (
    <div className="flex h-full flex-col gap-5 px-5 py-4 lg:px-10">
      <div className="mt-5">
        <BreadcrumbLinkComponent currentPage={"Search"} />
      </div>

      <div className="ml-4 flex w-full flex-col gap-3">
        <h1 className="text-lg font-semibold">Your Favorites List</h1>

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
