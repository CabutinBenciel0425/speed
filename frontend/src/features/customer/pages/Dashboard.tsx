import Category from "../components/Category"
import FeaturedProducts from "../components/FeaturedProducts"
import Hero from "../components/Hero"
import Merchant from "../components/Merchant"

function Dashboard() {
  return (
    <div className="flex w-full flex-col gap-10">
      <Hero />
      <Category />
      <Merchant />
      <FeaturedProducts />
    </div>
  )
}

export default Dashboard
