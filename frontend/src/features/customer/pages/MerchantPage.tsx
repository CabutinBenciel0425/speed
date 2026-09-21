import { useParams } from "react-router-dom"
import { useMerchant } from "../hooks/useMerchant"
import MerchantPageHeader from "../components/MerchantPageHeader"
import MerchantPageContent from "../components/MerchantPageContent"
import { useProductsByMerchant } from "../hooks/useProductsByMerchant"
import MerchantPageProducts from "../components/MerchantPageProducts"
import MerchantPageSkeleton from "@/components/common/Skeleton/MerchantPageSkeleton"
import { formatOperatingHours } from "@/utils/timeUtils"
import { useToggleMerchantFavorite } from "../hooks/useToggleMerchantFavorite"
import { useMerchantFavorite } from "../hooks/useMerchantFavorite"

function MerchantPage() {
  const { merchantId } = useParams()
  const { isMerchantFavorite } = useMerchantFavorite(merchantId || "")
  const { mutate: toggleMerchantFavorite } = useToggleMerchantFavorite()
  const { merchant, isLoading, error } = useMerchant(merchantId || "")
  const { productsByMerchant, isLoadingProducts, errorProducts } =
    useProductsByMerchant(merchantId || "")

  const products = productsByMerchant?.data?.products || []

  if (isLoading) {
    return <MerchantPageSkeleton />
  }

  if (error || !merchant) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-red-500">Failed to load merchant</p>
      </div>
    )
  }

  const {
    merchantName,
    banner,
    logo,
    description,
    address,
    operatingHours,
    averageRating,
    ratingCount,
    isOpen,
  } = merchant

  const today = new Date()
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ] as const
  const currentDay = days[today.getDay()]
  const todayHours = operatingHours?.[currentDay]
  const operatingHoursToday = formatOperatingHours(todayHours)

  const handleFavorite = () => {
    if (merchantId) {
      toggleMerchantFavorite(merchantId)
    }
  }

  return (
    <div className="relative min-h-screen w-full pb-20">
      <MerchantPageHeader
        merchantName={merchantName}
        banner={banner}
        logo={logo}
        averageRating={averageRating}
        ratingCount={ratingCount}
        isOpen={isOpen}
        operatingHoursToday={operatingHoursToday}
        currentDay={currentDay}
      />

      <MerchantPageContent
        logo={logo}
        merchantName={merchantName}
        averageRating={averageRating}
        ratingCount={ratingCount}
        description={description || ""}
        isFavorite={!!isMerchantFavorite}
        onFavorite={handleFavorite}
        address={address}
      />

      <MerchantPageProducts
        productsByMerchant={products}
        isLoadingProducts={isLoadingProducts}
        errorProducts={errorProducts || null}
      />
    </div>
  )
}

export default MerchantPage
