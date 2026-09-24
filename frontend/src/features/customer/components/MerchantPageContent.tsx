import LikeButton from "@/components/common/LikeButton"
import { useAuthStore } from "@/store/authStore"
import { MapPin } from "lucide-react"
import { PiStarFill } from "react-icons/pi"
type MerchantPageContentProps = {
  logo: string
  merchantName: string
  averageRating: number
  ratingCount: number
  description: string
  isFavorite?: boolean | undefined
  onFavorite: () => void
  address: {
    location: {
      type: string
      coordinates: number[]
    }
    street: string
    barangay: string
    city: string
    province: string
  }
}

function MerchantPageContent({
  logo,
  merchantName,
  averageRating,
  ratingCount,
  description,
  isFavorite,
  onFavorite,
  address,
}: MerchantPageContentProps) {
  const { isAuthenticated } = useAuthStore()
  const addressFormatted = `${address.street} ${address.barangay} ${address.city}, ${address.province}`
  return (
    <div className="mx-auto max-w-full px-4 py-6 md:px-6 lg:px-20">
      <div className="mb-6 flex flex-row items-center justify-between gap-3">
        <div className="flex flex-row items-center justify-center">
          <img src={logo} alt={merchantName} className="w-30 md:w-45 lg:w-60" />
          <div className="flex flex-col gap-2">
            <h1 className="text-base lg:text-lg">{merchantName}</h1>
            <p className="line-clamp-2 truncate text-xs text-wrap text-muted-foreground lg:text-sm">
              {description}
            </p>
            <div className="flex flex-row items-center justify-start gap-2">
              <PiStarFill className="-mt-0.5 size-4 fill-amber-500 md:size-6 xl:size-9" />
              <span className="text-sm lg:text-lg">
                {averageRating.toFixed(1)}
              </span>
              <span className="px-1 text-sm font-medium text-white/50 lg:text-lg">
                |
              </span>
              <span className="text-sm lg:text-lg">{ratingCount} reviews</span>
            </div>
            <div className="flex flex-row items-start justify-start gap-2 md:items-center">
              <MapPin className="mt-1 size-4 shrink-0 md:-mt-0.5 md:size-6 lg:size-9" />
              <span className="text-xs lg:text-sm">{addressFormatted}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isAuthenticated && (
            <LikeButton
              isFavorite={isFavorite}
              onToggle={onFavorite}
              baseSize={8}
            />
          )}
        </div>
      </div>
    </div>
  )
}
export default MerchantPageContent
