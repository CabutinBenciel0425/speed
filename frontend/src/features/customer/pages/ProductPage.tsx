import { useParams } from "react-router-dom"
import { useProduct } from "../hooks/useProductByMerchant"
import BreadcrumbLinkComponent from "@/components/common/BreadcrumbLink"
import LikeButton from "@/components/common/LikeButton"
import { useState } from "react"
import { Clock, ShoppingCart } from "lucide-react"
import PressButton from "@/components/common/PressButton"
import { Separator } from "@/components/ui/separator"
import ToggleQuantity from "@/components/common/ToggleQuantity"
import RandomProducts from "../components/RandomProducts"
import { Badge } from "@/components/ui/badge"
import ProductPageSkeleton from "@/components/common/Skeleton/ProductPageSkeleton"
import { useAuth } from "@/hooks/useAuth"

function ProductPage() {
  const { isAuthenticated } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { productId } = useParams()
  const { product, isLoading } = useProduct(productId || "")

  if (isLoading) {
    return <ProductPageSkeleton />
  }

  if (!product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    )
  }

  const merchant = product?.merchant
  const merchantId = typeof merchant === "object" ? merchant._id.toString() : ""
  const merchantName = typeof merchant === "object" ? merchant.merchantName : ""
  const merchantLogo = typeof merchant === "object" ? merchant.logo : ""

  const pages = [
    {
      link: `/merchant/${merchantId}`,
      pageName: merchantName || "Merchant",
    },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 px-4 py-4 md:px-6 xl:px-40">
      {/* Breadcrumb */}
      <BreadcrumbLinkComponent currentPage={product.name} pages={pages} />

      <div className="grid w-full grid-cols-1 gap-8 px-10 lg:grid-cols-2 lg:place-items-center lg:gap-12 lg:px-15">
        <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center overflow-hidden rounded-xl bg-muted/30 lg:max-w-lg xl:max-w-xl">
          <img
            src={product.image || "/placeholder-image.png"}
            alt={product.name}
            className="h-full w-full object-contain p-4"
          />
          {isAuthenticated && (
            <div className="absolute top-4 right-4">
              <LikeButton
                isFavorite={isFavorite}
                setIsFavorite={setIsFavorite}
                baseSize={9}
              />
            </div>
          )}
          {product.isAvailable ? (
            <Badge className="absolute bottom-4 left-4 bg-green-500 hover:bg-green-600">
              Available
            </Badge>
          ) : (
            <Badge variant="destructive" className="absolute bottom-4 left-4">
              Unavailable
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {/* Product Name & Rating */}
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-4xl lg:text-3xl">
              {product.name}
            </h1>
            <div className="-mt-3 flex items-center gap-4">
              <img
                src={merchantLogo}
                alt={merchantName}
                className="-ml-5 h-15 w-15 lg:h-20 lg:w-20"
              />
              <span className="-ml-5 font-normal lg:font-semibold">
                {merchantName}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-xl font-bold text-primary md:text-2xl xl:text-3xl">
              ₱{product.price.toFixed(2)}
            </span>
          </div>

          {/* Description */}
          <p className="lg:text-md text-sm text-muted-foreground">
            {product.description}
          </p>

          <Separator />

          {/* Ingredients & Prep Time */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between xl:gap-40">
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Ingredients
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.ingredients?.map((ing) => (
                  <span
                    key={ing}
                    className="rounded-full border bg-muted/50 px-1.5 py-0.5 text-xs lg:px-3 lg:py-1"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Preparation Time
              </h3>
              <div className="flex flex-row items-center gap-2 text-sm">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-xs lg:text-sm">
                  {product.preparationTime} minutes
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Add to Cart Section */}
          {isAuthenticated && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity</span>
                <ToggleQuantity
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                />
              </div>
              <PressButton className="flex-1 gap-2 rounded-lg bg-primary px-6 py-3 text-white shadow-lg transition hover:bg-primary/90 sm:flex-none">
                <ShoppingCart className="size-5" />
                Add to Cart
              </PressButton>
            </div>
          )}

          {/* Delivery Info */}

          <div className="flex w-fit items-center justify-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-xs lg:text-sm">Est. delivery: 20–30 min</span>
          </div>
        </div>
      </div>

      {/* Random Products Section */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold lg:text-2xl">You might also like</h2>
        </div>
        <RandomProducts productId={productId || ""} limit={5} />
      </section>
    </div>
  )
}

export default ProductPage
