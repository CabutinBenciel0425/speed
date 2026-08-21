import { memo } from "react"

export const CategoryHeader = memo(function CategoryHeader({
  name,
  description,
  image,
}: {
  name: string
  description: string
  image: string
}) {
  return (
    <div className="mb-5 flex flex-row items-center">
      {image && (
        <img
          src={image}
          alt={name}
          className="h-25 w-25 md:h-30 md:w-30 lg:h-35 lg:w-35"
        />
      )}

      <div>
        <h1 className="mb-2 text-2xl font-bold md:mb-5 md:text-3xl">{name}</h1>
        <p className="md:text-md text-sm text-muted-foreground lg:text-lg">
          {description}
        </p>
      </div>
    </div>
  )
})
