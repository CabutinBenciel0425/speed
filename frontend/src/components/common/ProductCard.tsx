import { Clock, Plus } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { NavLink } from "react-router-dom"
import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import type { Product } from "@/features/customer/types/products"
import LikeButton from "./LikeButton"
import PressButton from "./PressButton"

function ProductCard({ product }: { product: Product }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="h-full w-full"
    >
      <Card className="relative mx-auto w-full max-w-2xs pt-0">
        <div className="absolute inset-0 z-30 aspect-video bg-black/15" />

        <img
          src={
            product.image ??
            `https://placeholderimage.co/400x400/f3f4f6/374151/?text=${product.name}`
          }
          alt={product.name}
          className="z-20 aspect-video w-full object-contain"
        />

        <div className="absolute top-3 right-3 z-40">
          <LikeButton
            isFavorite={isFavorite}
            setIsFavorite={setIsFavorite}
            baseSize={6}
          />
        </div>

        <CardHeader className="flex flex-col gap-3">
          <CardTitle>
            <NavLink to={`/merchant/${product?.merchant}/${product?._id}`}>
              {product.name}
            </NavLink>
          </CardTitle>

          <CardDescription className="lg:text-md line-clamp-1 text-xs md:line-clamp-2 lg:line-clamp-1">
            {product.description}
          </CardDescription>
          <CardDescription className="flex flex-row gap-2">
            <Clock className="lg:text-md mt-0.5 size-4 text-xs" />
            <span>{product.preparationTime} mins</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-row items-center justify-between">
          <span className="md:text-md text-sm font-bold text-primary lg:text-lg">
            ₱{product?.price}
          </span>
        </CardContent>
        <PressButton className="absolute right-3 bottom-3 h-7 w-7 rounded-full bg-primary font-bold text-white shadow-lg md:right-4 md:bottom-4 lg:right-5 lg:bottom-5 lg:h-9 lg:w-9">
          <Plus />
        </PressButton>
      </Card>
    </motion.div>
  )
}

export default ProductCard
