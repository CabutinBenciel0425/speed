import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

export function SkeletonCategoryCard() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <Card className="flex h-24 w-28 cursor-pointer flex-col py-2 lg:h-32 lg:w-36 xl:h-36 xl:w-44">
        <CardHeader className="flex items-center justify-center p-2">
          <Skeleton className="h-16 w-16 rounded-full" />
        </CardHeader>
        <CardContent className="flex items-center justify-center p-2">
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    </motion.div>
  )
}
