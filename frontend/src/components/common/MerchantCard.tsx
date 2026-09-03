import { NavLink } from "react-router-dom"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Badge } from "../ui/badge"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import type { Merchant } from "@/features/customer/types/merchant"
import { AiFillStar } from "react-icons/ai"

function MerchantCard({ merchant }: { merchant: Merchant }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <NavLink
        to={`/merchant/${merchant._id}`}
        style={{ textDecoration: "none" }}
      >
        <Card className="relative mx-auto w-full max-w-sm min-w-45 pt-0">
          <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
          <img
            src={merchant.banner}
            alt="merchant cover"
            className="relative z-20 aspect-video w-full object-cover"
          />
          <img
            src={merchant.logo}
            alt="merchant logo"
            className="absolute -top-1 -left-1 z-50 size-20 rounded-full 2xl:h-30 2xl:w-30"
          />
          <CardHeader>
            <CardAction>
              <Badge variant="secondary">
                {merchant.averageRating}{" "}
                <AiFillStar className="text-lg text-yellow-500" />
              </Badge>
            </CardAction>
            <CardTitle className={"lg:text-md text-sm font-semibold"}>
              {merchant.merchantName}
            </CardTitle>
            <CardDescription className="line-clamp-1">
              {merchant.description}
            </CardDescription>
          </CardHeader>
        </Card>
      </NavLink>
    </motion.div>
  )
}

export default MerchantCard
