import Category from "../components/Category"
import FeaturedProducts from "../components/FeaturedProducts"
import Hero from "../components/Hero"
import Restaurant from "../components/Restaurant"

function CustomerDashboard() {
  return (
    <div className="mb-10 flex flex-col gap-5">
      <Hero />
      <Category />
      <Restaurant />
      <FeaturedProducts />
    </div>
  )
}

export default CustomerDashboard
