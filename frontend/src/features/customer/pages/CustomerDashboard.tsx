import Category from "@/features/components/Category"
import FeaturedProducts from "@/features/components/FeaturedProducts"
import Hero from "@/features/components/Hero"
import Restaurant from "@/features/components/Restaurant"

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
