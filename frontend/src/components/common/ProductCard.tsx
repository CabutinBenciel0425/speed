import { Clock, Plus } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { NavLink } from "react-router-dom"
import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import type { Product } from "@/features/customer/types/products"
import LikeButton from "./LikeButton"
import PressButton from "./PressButton"
import { useAddToCart } from "@/features/customer/hooks/useAddToCart"
import { Spinner } from "../ui/spinner"
import { useAuth } from "@/hooks/useAuth"
import { useToggleProductFavorite } from "@/features/customer/hooks/useToggleProductFavorite"
import { useProductFavorite } from "@/features/customer/hooks/useProductFavorite"
import { useExistingOrder } from "@/features/customer/hooks/useExistingOrder"
import { toast } from "sonner"

function ProductCard({ product }: { product: Product }) {
  const { isAuthenticated } = useAuth()
  const { existingOrder } = useExistingOrder()
  const { mutate, isPending } = useAddToCart({
    product,
    quantity: 1,
    notes: "",
  })
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { mutate: toggleProductFavorite } = useToggleProductFavorite()
  const { isProductFavorite } = useProductFavorite(product._id || "")

  const handleFavorite = () => {
    if (product._id) {
      toggleProductFavorite(product._id)
    }
  }

  const handleAddToCart = () => {
    mutate({ product, quantity: 1, notes: "" })
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="h-full w-full"
    >
      <Card className="relative mx-auto w-full max-w-2xs min-w-35 pt-0">
        <div className="absolute inset-0 z-30 aspect-video bg-black/15" />

        <img
          src={
            product.image ??
            `https://placeholderimage.co/400x400/f3f4f6/374151/?text=${product.name}`
          }
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="z-20 aspect-video w-full object-contain"
        />

        {isAuthenticated && (
          <div className="absolute top-3 right-3 z-40">
            <LikeButton
              isFavorite={!!isProductFavorite}
              onToggle={handleFavorite}
              baseSize={6}
            />
          </div>
        )}

        <CardHeader className="flex flex-col gap-3">
          <CardTitle>
            <NavLink
              to={`/merchant/${product?.merchant}/${product?._id}`}
              style={{ textDecoration: "none" }}
              className={"text-sm font-semibold lg:text-base"}
            >
              {product.name}
            </NavLink>
          </CardTitle>

          <CardDescription className="line-clamp-1 text-xs md:line-clamp-2 md:text-sm lg:line-clamp-1 lg:text-base">
            {product.description}
          </CardDescription>
          <CardDescription className="flex flex-row gap-2">
            <Clock className="mt-0.5 size-4 text-xs lg:text-base" />
            <span className="text-xs lg:text-sm">
              {product.preparationTime} mins
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-row items-center justify-between">
          <span className="text-sm font-bold text-primary md:text-base lg:text-lg">
            ₱{product?.price}
          </span>
        </CardContent>
        {isAuthenticated && (
          <PressButton
            className="absolute right-3 bottom-3 h-7 w-7 rounded-full bg-primary font-bold text-white shadow-lg md:right-4 md:bottom-4 lg:right-5 lg:bottom-5 lg:h-9 lg:w-9"
            onClick={() => {
              if (existingOrder?.order !== null) {
                toast.info(
                  "Please cancel first your existing order in Orders Page"
                )
                return
              }
              handleAddToCart()
            }}
            disabled={!isAuthenticated || isPending}
          >
            {isPending ? <Spinner /> : <Plus />}
          </PressButton>
        )}
      </Card>
    </motion.div>
  )
}

export default ProductCard
