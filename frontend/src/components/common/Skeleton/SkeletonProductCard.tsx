import { Card, CardDescription, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

export function SkeletonProductCard() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="h-full w-full"
    >
      <Card className="mx-auto w-full max-w-2xs overflow-hidden pt-0">
        <div className="aspect-video w-full">
          <Skeleton className="h-full w-full" />
        </div>

        <CardHeader className="flex flex-col items-center justify-start gap-3">
          <CardDescription className="flex flex-col items-start gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-60" />
            <Skeleton className="h-4 w-10" />
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  )
}
