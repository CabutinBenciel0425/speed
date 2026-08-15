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
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <Button
        variant={"outline"}
        className={
          "flex h-25 w-30 cursor-pointer flex-col bg-gray-100 py-2 lg:h-30 lg:w-37 xl:h-35 xl:w-45"
        }
      >
        {children}
      </Button>
    </motion.div>
  )
}

export default CategoryCard
