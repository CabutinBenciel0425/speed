import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MerchantPageContent from "./MerchantPageContent"
import MerchantPageProducts from "./MerchantPageProducts"
import type { Product } from "../types/products"
import MerchantReviewsSection from "@/features/reviews/components/MerchantReviewsSection"
import { MessageSquareMore, SquareMenu } from "lucide-react"

type MerchantMenuContentTabsProps = {
  logo: string
  merchantName: string
  averageRating: number
  ratingCount: number
  description: string
  isFavorite: boolean
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

type MerchantPageProductsProps = {
  productsByMerchant: Product[]
  isLoadingProducts: boolean
  errorProducts: Error | null
}

function MerchantMenuContentTabs({
  merchantPageContentProps,
  merchantPageProductsProps,
  merchantId,
}: {
  merchantPageContentProps: MerchantMenuContentTabsProps
  merchantPageProductsProps: MerchantPageProductsProps
  merchantId: string
}) {
  const {
    logo,
    merchantName,
    averageRating,
    ratingCount,
    description,
    isFavorite,
    onFavorite,
    address,
  } = merchantPageContentProps

  const { productsByMerchant, isLoadingProducts, errorProducts } =
    merchantPageProductsProps
  return (
    <Tabs
      defaultValue="menu"
      className={"flex flex-row items-center justify-center py-6"}
    >
      <TabsList className={"rounded-sm"}>
        <TabsTrigger
          value="menu"
          className={
            "rounded-sm px-5 text-sm sm:px-8 sm:tracking-wide md:px-12 md:text-base lg:px-20 lg:text-lg lg:tracking-wider"
          }
        >
          <SquareMenu />
          Menu
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className={
            "rounded-sm px-5 text-sm sm:px-8 sm:tracking-wide md:px-12 md:text-base lg:px-20 lg:text-lg lg:tracking-wider"
          }
        >
          <MessageSquareMore />
          Reviews
        </TabsTrigger>
      </TabsList>
      <TabsContent value="menu">
        <MerchantPageContent
          logo={logo}
          merchantName={merchantName}
          averageRating={averageRating}
          ratingCount={ratingCount}
          description={description}
          isFavorite={isFavorite}
          onFavorite={onFavorite}
          address={address}
        />
        <MerchantPageProducts
          productsByMerchant={productsByMerchant}
          isLoadingProducts={isLoadingProducts}
          errorProducts={errorProducts}
        />
      </TabsContent>
      <TabsContent value="reviews">
        <MerchantReviewsSection merchantId={merchantId} />
      </TabsContent>
    </Tabs>
  )
}

export default MerchantMenuContentTabs
