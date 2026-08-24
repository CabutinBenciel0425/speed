import { useParams } from "react-router-dom"
import { useMerchant } from "../hooks/useMerchant"
import { useState } from "react"
import { toast } from "sonner"
import MerchantPageHeader from "../components/MerchantPageHeader"
import MerchantPageContent from "../components/MerchantPageContent"
import { useProductsByMerchant } from "../hooks/useProductByMerchant"
import MerchantPageProducts from "../components/MerchantPageProducts"
import MerchantPageSkeleton from "@/components/common/Skeleton/MerchantPageSkeleton"
import { formatOperatingHours, isMerchantOpen } from "@/utils/timeUtils"

function MerchantPage() {
  const { merchantId } = useParams()
  const { merchant, isLoading, error } = useMerchant(merchantId || "")
  const { productsByMerchant, isLoadingProducts, errorProducts } =
    useProductsByMerchant(merchantId || "")
  const [isFavorite, setIsFavorite] = useState(false)
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
    name,
    banner,
    logo,
    description,
    address,
    operatingHours,
    averageRating,
    ratingCount,
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
  const isOpen = isMerchantOpen(todayHours)
  const operatingHoursToday = formatOperatingHours(todayHours)

  console.log(currentDay)

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
  }

  return (
    <div className="relative min-h-screen w-full pb-20">
      <MerchantPageHeader
        name={name}
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
        name={name}
        averageRating={averageRating}
        ratingCount={ratingCount}
        description={description || ""}
        isFavorite={isFavorite}
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
