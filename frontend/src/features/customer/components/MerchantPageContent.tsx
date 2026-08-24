import { Button } from "@/components/ui/button"
import { Heart, MapPin } from "lucide-react"
import { PiStarFill } from "react-icons/pi"

type MerchantPageContentProps = {
  logo: string
  name: string
  averageRating: number
  ratingCount: number
  description: string
  isFavorite: boolean
  onFavorite: (isFavorite: boolean) => void
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
  name,
  averageRating,
  ratingCount,
  description,
  isFavorite,
  onFavorite,
  address,
}: MerchantPageContentProps) {
  const addressFormatted = `${address.street} ${address.barangay} ${address.city}, ${address.province}`
  return (
    <div className="mx-auto max-w-full px-4 py-6 md:px-6 lg:px-20">
      <div className="mb-6 flex flex-row items-center justify-between gap-3">
        <div className="flex flex-row items-center justify-center">
          <img src={logo} alt={name} className="w-30 md:w-45 lg:w-60" />
          <div className="flex flex-col gap-2">
            <h1 className="text-lg lg:text-2xl">{name}</h1>
            <p className="text-sm text-wrap text-muted-foreground lg:text-base">
              {description}
            </p>
            <div className="flex flex-row items-center justify-start gap-2">
              <PiStarFill className="-mt-0.5 size-7 fill-amber-500 lg:size-9" />
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
              <span className="text-sm lg:text-lg">{addressFormatted}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFavorite(!isFavorite)}
            className="text-md gap-2 rounded-full px-3 py-4"
          >
            <Heart
              className={`size-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
            />
            <span className="hidden md:block">Favorite</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
export default MerchantPageContent
