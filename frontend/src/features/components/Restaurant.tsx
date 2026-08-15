import ViewAllButton from "@/components/common/ViewAllButton"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Star } from "lucide-react"
import { NavLink } from "react-router-dom"

function Restaurant() {
  return (
    <div className="flex flex-col gap-5 px-5">
      <div className="flex items-center justify-between">
        <p className="block text-lg font-semibold">Popular restaurants</p>
        <ViewAllButton />
      </div>
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-4">
        <NavLink to="/merchant/:merchantId">
          <Card className="relative mx-auto w-full max-w-sm pt-0">
            <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
            <img
              src="https://res.cloudinary.com/dwqlvkvup/image/upload/v1785734574/images/merchant/banner/s6twrmwomc2gms00hya0.jpg"
              alt="merchant cover"
              className="object-fit relative z-20 aspect-video w-full"
            />
            <CardHeader>
              <CardAction>
                <Badge variant="secondary">
                  4.8 <Star fill="#fdc500" />
                </Badge>
              </CardAction>
              <CardTitle>Benciel's Merienda</CardTitle>
              <CardDescription>
                Super delicious and affordable foods
              </CardDescription>
            </CardHeader>
          </Card>
        </NavLink>
        <NavLink to="/merchant/:merchantId">
          <Card className="relative mx-auto w-full max-w-sm pt-0">
            <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
            <img
              src="https://res.cloudinary.com/dwqlvkvup/image/upload/v1785734574/images/merchant/banner/s6twrmwomc2gms00hya0.jpg"
              alt="merchant cover"
              className="relative z-20 aspect-video w-full object-cover"
            />
            <CardHeader>
              <CardAction>
                <Badge variant="secondary">
                  4.8 <Star fill="#fdc500" />
                </Badge>
              </CardAction>
              <CardTitle>Benciel's Merienda</CardTitle>
              <CardDescription>
                Super delicious and affordable foods
              </CardDescription>
            </CardHeader>
          </Card>
        </NavLink>

        <NavLink to="/merchant/:merchantId">
          <Card className="relative mx-auto w-full max-w-sm pt-0">
            <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
            <img
              src="https://res.cloudinary.com/dwqlvkvup/image/upload/v1785734574/images/merchant/banner/s6twrmwomc2gms00hya0.jpg"
              alt="merchant cover"
              className="relative z-20 aspect-video w-full object-cover"
            />
            <CardHeader>
              <CardAction>
                <Badge variant="secondary">
                  4.8 <Star fill="#fdc500" />
                </Badge>
              </CardAction>
              <CardTitle>Benciel's Merienda</CardTitle>
              <CardDescription>
                Super delicious and affordable foods
              </CardDescription>
            </CardHeader>
          </Card>
        </NavLink>

        <NavLink to="/merchant/:merchantId">
          <Card className="relative mx-auto w-full max-w-sm pt-0">
            <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
            <img
              src="https://res.cloudinary.com/dwqlvkvup/image/upload/v1785734574/images/merchant/banner/s6twrmwomc2gms00hya0.jpg"
              alt="merchant cover"
              className="relative z-20 aspect-video w-full object-cover"
            />
            <CardHeader>
              <CardAction>
                <Badge variant="secondary">
                  4.8 <Star fill="#fdc500" />
                </Badge>
              </CardAction>
              <CardTitle>Benciel's Merienda</CardTitle>
              <CardDescription>
                Super delicious and affordable foods
              </CardDescription>
            </CardHeader>
          </Card>
        </NavLink>

        <NavLink to="/merchant/:merchantId">
          <Card className="relative mx-auto w-full max-w-sm pt-0">
            <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
            <img
              src="https://res.cloudinary.com/dwqlvkvup/image/upload/v1785734574/images/merchant/banner/s6twrmwomc2gms00hya0.jpg"
              alt="merchant cover"
              className="relative z-20 aspect-video w-full object-cover"
            />
            <CardHeader>
              <CardAction>
                <Badge variant="secondary">
                  4.8 <Star fill="#fdc500" />
                </Badge>
              </CardAction>
              <CardTitle>Benciel's Merienda</CardTitle>
              <CardDescription>
                Super delicious and affordable foods
              </CardDescription>
            </CardHeader>
          </Card>
        </NavLink>

        <NavLink to="/merchant/:merchantId">
          <Card className="relative mx-auto w-full max-w-sm pt-0">
            <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
            <img
              src="https://res.cloudinary.com/dwqlvkvup/image/upload/v1785734574/images/merchant/banner/s6twrmwomc2gms00hya0.jpg"
              alt="merchant cover"
              className="relative z-20 aspect-video w-full object-cover"
            />
            <CardHeader>
              <CardAction>
                <Badge variant="secondary">
                  4.8 <Star fill="#fdc500" />
                </Badge>
              </CardAction>
              <CardTitle>Benciel's Merienda</CardTitle>
              <CardDescription>
                Super delicious and affordable foods
              </CardDescription>
            </CardHeader>
          </Card>
        </NavLink>

        <NavLink to="/merchant/:merchantId">
          <Card className="relative mx-auto w-full max-w-sm pt-0">
            <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
            <img
              src="https://res.cloudinary.com/dwqlvkvup/image/upload/v1785734574/images/merchant/banner/s6twrmwomc2gms00hya0.jpg"
              alt="merchant cover"
              className="relative z-20 aspect-video w-full object-cover"
            />
            <CardHeader>
              <CardAction>
                <Badge variant="secondary">
                  4.8 <Star fill="#fdc500" />
                </Badge>
              </CardAction>
              <CardTitle>Benciel's Merienda</CardTitle>
              <CardDescription>
                Super delicious and affordable foods
              </CardDescription>
            </CardHeader>
          </Card>
        </NavLink>
      </div>
    </div>
  )
}

export default Restaurant
