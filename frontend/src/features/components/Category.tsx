import { LayoutGrid } from "lucide-react"
import { Button } from "../../components/ui/button"
import ViewAllButton from "../../components/common/ViewAllButton"

function Category() {
  return (
    <div className="flex flex-col gap-3 px-5">
      <div className="flex items-center justify-between">
        <p className="block text-lg font-semibold">Browse by category</p>
        <ViewAllButton />
      </div>
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4">
        <Button
          variant={"outline"}
          className={
            "flex h-25 w-30 cursor-pointer flex-col bg-gray-100 py-2 lg:h-30 lg:w-37 xl:h-35 xl:w-45"
          }
        >
          <LayoutGrid className="size-12 h-2/3 text-primary" fill="#ff6b00" />
          <p className="text-md">All</p>
        </Button>

        <Button
          variant={"outline"}
          className={
            "flex h-25 w-30 cursor-pointer flex-col bg-gray-100 py-2 lg:h-30 lg:w-37 xl:h-35 xl:w-45"
          }
        >
          <img
            src="https://res.cloudinary.com/dwqlvkvup/image/upload/v1784404554/images/category/t7xk2j0cywpihcwsgqn7.png"
            alt="drinks"
            className="h-2/3"
          />
          <p className="text-md">Drinks</p>
        </Button>

        <Button
          variant={"outline"}
          className={
            "flex h-25 w-30 cursor-pointer flex-col bg-gray-100 py-2 lg:h-30 lg:w-37 xl:h-35 xl:w-45"
          }
        >
          <img
            src="https://res.cloudinary.com/dwqlvkvup/image/upload/v1784404463/images/category/hw6mncdsbeifo129ipxo.png"
            alt="soup"
            className="h-2/3"
          />
          <p className="text-md">Soup</p>
        </Button>

        <Button
          variant={"outline"}
          className={
            "flex h-25 w-30 cursor-pointer flex-col bg-gray-100 py-2 lg:h-30 lg:w-37 xl:h-35 xl:w-45"
          }
        >
          <img
            src="https://res.cloudinary.com/dwqlvkvup/image/upload/v1784404417/images/category/xeedwzav6f3jxhqbykgd.png"
            alt="soup"
            className="h-2/3"
          />
          <p className="text-md">Pizza</p>
        </Button>

        <Button
          variant={"outline"}
          className={
            "flex h-25 w-30 cursor-pointer flex-col bg-gray-100 py-2 lg:h-30 lg:w-37 xl:h-35 xl:w-45"
          }
        >
          <img
            src="https://res.cloudinary.com/dwqlvkvup/image/upload/v1784404358/images/category/lkqwfxbxmopf3j4ug3zp.png"
            alt="soup"
            className="h-2/3"
          />
          <p className="text-md">Pasta</p>
        </Button>

        <Button
          variant={"outline"}
          className={
            "flex h-25 w-30 cursor-pointer flex-col bg-gray-100 py-2 lg:h-30 lg:w-37 xl:h-35 xl:w-45"
          }
        >
          <img
            src="https://res.cloudinary.com/dwqlvkvup/image/upload/v1784404275/images/category/bolubbxm0onvs2wgfaj5.png"
            alt="soup"
            className="h-2/3"
          />
          <p className="text-md">Burger</p>
        </Button>

        <Button
          variant={"outline"}
          className={
            "flex h-25 w-30 cursor-pointer flex-col bg-gray-100 py-2 lg:h-30 lg:w-37 xl:h-35 xl:w-45"
          }
        >
          <img
            src="https://res.cloudinary.com/dwqlvkvup/image/upload/v1784403851/images/category/ed4xprgb3ibl5klkisgz.png"
            alt="soup"
            className="h-2/3"
          />
          <p className="text-md">Rice Meal</p>
        </Button>
      </div>
    </div>
  )
}

export default Category
