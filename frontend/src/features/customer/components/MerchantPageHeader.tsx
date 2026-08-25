import { ChevronLeft, Dot } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

type MerchantPageHeaderProps = {
  banner: string
  logo: string
  merchantName: string
  averageRating: number
  ratingCount: number
  isOpen: boolean
  operatingHoursToday: string
  currentDay:
    | "Sunday"
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
}

function MerchantPageHeader({
  banner,
  logo,
  merchantName,
  ratingCount,
  isOpen,
  operatingHoursToday,
  currentDay,
}: MerchantPageHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="relative h-64 w-full md:h-80 lg:h-112.5">
      <Button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-20 h-12 w-12 rounded-full bg-black/40 p-2 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/60 lg:left-8"
      >
        <ChevronLeft className="-ml-1 size-6" />
      </Button>

      <motion.div
        className="absolute inset-0 h-full w-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 z-10 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

        <img
          src={banner || "/placeholder-banner.jpg"}
          alt={`${name} banner`}
          className="h-full w-full object-cover"
        />

        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-4 md:bottom-6 md:left-6">
          <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg md:h-24 md:w-24">
            <img
              src={logo || "/placeholder-logo.png"}
              alt={`${merchantName} logo`}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col text-white">
            <h1 className="text-2xl font-bold md:text-3xl lg:text-4xl">
              {merchantName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm md:text-base">
              {ratingCount > 0 && (
                <span className="text-white/80">({ratingCount} reviews)</span>
              )}

              <div className="-ml-3 flex items-center gap-1">
                <Dot
                  className={`size-8 ${isOpen ? "text-green-500" : "text-red-400"}`}
                />
                {isOpen ? (
                  <span className="-ml-2 font-semibold text-green-400">
                    Open
                  </span>
                ) : (
                  <span className="-ml-2 font-semibold text-red-400">
                    Closed
                  </span>
                )}
                <span className="px-1 text-white/50">|</span>
                <span className="text-white/80">
                  {operatingHoursToday} ({currentDay})
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MerchantPageHeader
