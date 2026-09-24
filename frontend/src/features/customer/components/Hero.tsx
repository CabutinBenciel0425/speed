import { ArrowRight } from "lucide-react"
import heroImage from "@/assets/hero.png"
import { motion } from "framer-motion"
import PressButton from "@/components/common/PressButton"

function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-10">
      <motion.div
        className="flex min-h-100 w-full flex-col overflow-hidden rounded-3xl bg-secondary lg:flex-row"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
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

          <PressButton className="h-8 w-fit rounded-xl bg-primary px-2 text-white lg:h-12 lg:px-4">
            <span className="text-xs font-normal lg:text-base xl:text-lg">
              Order now
            </span>
            <ArrowRight className="size-4 md:size-5 lg:size-6" />
          </PressButton>
        </div>

        <div className="flex w-full items-center justify-center overflow-hidden lg:w-1/2">
          <img
            src={heroImage}
            alt="Food delivery"
            className="h-auto w-80 object-contain sm:w-80 lg:w-162.5"
          />
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
