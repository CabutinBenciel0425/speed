import { Clock, Heart } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { NavLink } from "react-router-dom"
import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"

function ProductCard() {
  const [isFavorite, setIsFavorite] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <Card className="relative mx-auto w-full max-w-2xs pt-0">
        <div className="absolute inset-0 z-30 aspect-video bg-black/15" />

        <img
          src="https://res.cloudinary.com/dwqlvkvup/image/upload/v1786688478/images/merchant/products/k61xdeyto2ftw85qpych.jpg"
          alt="product"
          className="z-20 aspect-video w-full object-cover"
        />

        <Button
          variant="ghost"
          onClick={() => setIsFavorite(!isFavorite)}
          className={
            "absolute top-2 right-2 z-40 cursor-pointer hover:bg-transparent"
          }
        >
          <Heart
            className={`size-6 transition-colors ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"
            }`}
          />
        </Button>

        <NavLink to="/merchant/:merchantId/:productId">
          <CardHeader>
            <CardTitle>Cheese Burger</CardTitle>
            <CardDescription>Cheesy yummy burger</CardDescription>
            <CardDescription className="flex flex-row gap-2">
              <Clock className="mt-0.5 size-4" />
              <span>15 mins</span>
            </CardDescription>
          </CardHeader>
        </NavLink>
      </Card>
    </motion.div>
  )
}

export default ProductCard
