import { Button } from "../ui/button"
import type React from "react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

function CategoryCard({ children }: { children: React.ReactNode }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <Button
        variant={"outline"}
        className={
          "flex h-24 w-28 cursor-pointer flex-col bg-gray-100 py-2 lg:h-32 lg:w-36 xl:h-36 xl:w-44"
        }
      >
        {children}
      </Button>
    </motion.div>
  )
}

export default CategoryCard
