import { NavLink } from "react-router-dom"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Badge } from "../ui/badge"
import { Star } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import type { Merchant } from "@/features/customer/types/merchant"

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
        <Card className="relative mx-auto w-full max-w-sm pt-0">
          <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
          <img
            src={merchant.banner}
            alt="merchant cover"
            className="relative z-20 aspect-video w-full object-cover"
          />
          <img
            src={merchant.logo}
            alt="merchant logo"
            className="absolute -top-1 -left-1 z-50 size-15 min-h-20 min-w-20 rounded-full 2xl:h-30 2xl:w-30"
          />
          <CardHeader>
            <CardAction>
              <Badge variant="secondary">
                {merchant.averageRating} <Star fill="#fdc500" />
              </Badge>
            </CardAction>
            <CardTitle>{merchant.merchantName}</CardTitle>
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
