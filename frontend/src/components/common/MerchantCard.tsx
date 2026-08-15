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
import sampleLogo from "@/assets/sample-logo.png"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

function MerchantCard() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <NavLink to="/merchant/:merchantId">
        <Card className="relative mx-auto w-full max-w-sm pt-0">
          <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
          <img
            src="https://res.cloudinary.com/dwqlvkvup/image/upload/v1785734574/images/merchant/banner/s6twrmwomc2gms00hya0.jpg"
            alt="merchant cover"
            className="relative z-20 aspect-video w-full object-cover"
          />
          <img
            src={sampleLogo}
            alt="sample"
            className="absolute top-3 left-3 z-50 size-15 rounded-full"
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
    </motion.div>
  )
}

export default MerchantCard
