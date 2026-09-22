import BreadcrumbLinkComponent from "@/components/common/BreadcrumbLink"

import { useMerchantFavoriteList } from "../hooks/useMerchantFavoriteList"
import { useProductFavoriteList } from "../hooks/useProductFavoriteList"

function FavoritesPage() {
  const { merchantFavoriteList } = useMerchantFavoriteList()
  const { productFavoriteList } = useProductFavoriteList()

  console.log(merchantFavoriteList, productFavoriteList)

  return (
    <div className="flex h-full flex-col gap-5 px-5 py-4 lg:px-10">
      <div className="mt-5">
        <BreadcrumbLinkComponent currentPage={"Search"} />
      </div>

      <div className="ml-4 flex w-full flex-col gap-3">
        <h1 className="text-lg font-semibold">Your Favorites List</h1>

        <main className="flex w-full"></main>
      </div>
    </div>
  )
}

export default FavoritesPage
