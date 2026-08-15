import { useState } from "react"
import { NavLink } from "react-router-dom"
import { Clock, Heart } from "lucide-react"

import ViewAllButton from "@/components/common/ViewAllButton"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function FeaturedProducts() {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="flex flex-col gap-5 px-5">
      <div className="flex items-center justify-between">
        <p className="block text-lg font-semibold">Featured Products</p>
        <ViewAllButton />
      </div>
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-4">
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
      </div>
    </div>
  )
}

export default FeaturedProducts
