import CategoryCard from "@/components/common/CategoryCard"
import { useCategories } from "../hooks/useCategories"
import { SkeletonCategoryCard } from "@/components/common/Skeleton/SkeletonCategoryCard"
import { NavLink } from "react-router-dom"

function Category() {
  const { categories, isLoading, error } = useCategories()

  return (
    <div className="mb-10 flex flex-col gap-3 px-20">
      <div className="flex items-center justify-start">
        <p className="block text-lg font-semibold">Browse by category</p>
      </div>

      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(100px,3fr))] place-items-center gap-4 lg:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
        {isLoading && (
          <>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <SkeletonCategoryCard key={i} />
            ))}
          </>
        )}

        {error && (
          <div className="col-span-full flex w-full items-center justify-center">
            <p className="text-red-500">Error loading categories</p>
          </div>
        )}

        {!isLoading &&
          !error &&
          categories?.map((category) => (
            <NavLink to={`/category/${category._id}`} key={category._id}>
              <CategoryCard key={category._id}>
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-2/3"
                />
                <p className="text-xs text-wrap lg:text-base">
                  {category.name}
                </p>
              </CategoryCard>
            </NavLink>
          ))}
      </div>
    </div>
  )
}

export default Category
