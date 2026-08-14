import { ArrowRight } from "lucide-react"
import { Button } from "../ui/button"
import heroImage from "@/assets/hero.png"

function Hero() {
  return (
    <div className="flex h-100 flex-row justify-between rounded-lg bg-secondary px-40">
      <div className="flex w-1/2 flex-col items-start justify-center gap-5 py-15">
        <h1 className="text-6xl font-semibold">
          What are you{" "}
          <span className="block text-primary">craving today?</span>
        </h1>
        <p className="text-md">
          Discover the best restaurant and your favorite dishes, <br />
          delivered fast to your door.
        </p>
        <Button className={"h-12 w-fit rounded-xl px-4"}>
          <span className="font-semibold">Order now</span> <ArrowRight />
        </Button>
      </div>
      <div className="flex w-1/2 items-center justify-center overflow-hidden">
        <img src={heroImage} alt="hero" className="h-107" />
      </div>
    </div>
  )
}

export default Hero
