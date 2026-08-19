import { ArrowRight } from "lucide-react"
import heroImage from "@/assets/hero.png"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

function Hero() {
  return (
    <section className="w-full px-6 md:px-12 lg:px-20 xl:px-30">
      <motion.div
        className="flex min-h-100 w-full flex-col overflow-hidden rounded-3xl bg-secondary lg:flex-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex w-full flex-col items-start justify-center gap-4 px-8 py-6 lg:w-1/2 lg:gap-8 lg:px-12 xl:px-16">
          <h1 className="text-3xl font-semibold text-balance md:text-4xl lg:text-5xl xl:text-6xl">
            What are you{" "}
            <span className="text-primary xl:block">craving today?</span>
          </h1>

          <p className="text-xs text-balance md:text-sm lg:text-base">
            Discover the best restaurant and your favorite dishes,
            <br className="hidden xl:block" />
            delivered fast to your door.
          </p>

          <Button className="h-12 w-fit rounded-xl px-4">
            <span className="font-semibold">Order now</span>
            <ArrowRight />
          </Button>
        </div>

        <div className="flex w-full items-center justify-center overflow-hidden lg:w-1/2">
          <img
            src={heroImage}
            alt="Food delivery"
            className="h-auto w-full object-contain sm:w-100 lg:w-162.5"
          />
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
