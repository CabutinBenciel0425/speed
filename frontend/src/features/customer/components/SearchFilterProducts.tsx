import type { SearchFilterProps } from "../../../components/types/PropTypes"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion"
import { Button } from "../../../components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"

function SearchFilterProducts({
  selectedCategory,
  categories,
  priceRange,
  selectedPrepTimes,
  onHandlePriceRange,
  onHandleCategoryChange,
  onHandlePrepTimeChange,
  onHandleResetFilter,
}: SearchFilterProps) {
  const handlePriceRangeDecreaseButtonMin = () => {
    const currentMin = priceRange[0]
    if (currentMin <= 0) return
    const newMin = currentMin - 100
    if (newMin > priceRange[1]) return
    onHandlePriceRange([newMin, priceRange[1]])
  }

  const handlePriceRangeIncreaseButtonMin = () => {
    const currentMin = priceRange[0]
    if (currentMin >= priceRange[1]) return
    const newMin = Math.min(currentMin + 100, priceRange[1]) // Clamp to max
    onHandlePriceRange([newMin, priceRange[1]])
  }

  const handlePriceRangeDecreaseButtonMax = () => {
    const currentMax = priceRange[1]
    if (currentMax <= priceRange[0]) return
    const newMax = Math.max(currentMax - 100, priceRange[0]) // Clamp to min
    onHandlePriceRange([priceRange[0], newMax])
  }

  const handlePriceRangeIncreaseButtonMax = () => {
    const currentMax = priceRange[1]
    if (currentMax >= 1000) return
    const newMax = Math.min(currentMax + 100, 1000)
    onHandlePriceRange([priceRange[0], newMax])
  }

  return (
    <Accordion
      multiple
      className="min-w-3xs rounded-md bg-muted-foreground/10 px-4"
      defaultValue={["categories", "price-range", "prep-time"]}
    >
      {/* Categories */}
      <AccordionItem key="categories" value={"categories"} className={"py-4"}>
        <AccordionTrigger className={"text-base font-semibold"}>
          Categories
        </AccordionTrigger>

        {categories.map((category) => (
          <AccordionContent key={category._id} className={"mt-2.5"}>
            <label className="flex max-h-2 flex-row items-center justify-start gap-2">
              <input
                className="text-center"
                type="radio"
                name="category"
                value={category._id}
                checked={selectedCategory === category._id}
                onChange={onHandleCategoryChange}
              />
              <span>{category.name}</span>
            </label>
          </AccordionContent>
        ))}
      </AccordionItem>

      {/* Price Range */}
      <AccordionItem
        key={"price-range"}
        value={"price-range"}
        className={"py-4"}
      >
        <AccordionTrigger className={"text-base font-semibold"}>
          Price Range
        </AccordionTrigger>
        <AccordionContent className={"w-full py-2"}>
          {/*Minimum Price*/}
          <div className="flex flex-row items-center justify-start">
            <span>Minimum Price</span>
            <Button
              variant={"ghost"}
              onClick={handlePriceRangeDecreaseButtonMin}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Input
              value={priceRange[0]}
              className="w-15 border-none text-center text-sm font-semibold"
              type="number"
              max="500"
              step="5"
              min="0"
            />
            <Button
              variant={"ghost"}
              onClick={handlePriceRangeIncreaseButtonMin}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>

          {/*Maximum Price*/}
          <div className="flex flex-row items-center justify-start">
            <span>Maximum Price</span>
            <Button
              variant={"ghost"}
              onClick={handlePriceRangeDecreaseButtonMax}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Input
              value={priceRange[1]}
              className="w-15 border-none text-center text-sm font-semibold"
              type="number"
              max="500"
              step="5"
              min="0"
            />
            <Button
              variant={"ghost"}
              onClick={handlePriceRangeIncreaseButtonMax}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Preparation Time */}
      <AccordionItem
        key={"prep-time"}
        value={"prep-time"}
        className={"mb-5 py-4"}
      >
        <AccordionTrigger className={"text-base font-semibold"}>
          Preparation Time
        </AccordionTrigger>

        {/*0-15 mins*/}
        <AccordionContent key={"0-15"} className={"mt-2.5"}>
          <label className="flex max-h-2 flex-row items-center justify-start gap-2">
            <input
              type="checkbox"
              name="prep-time"
              value={"0-15"}
              checked={selectedPrepTimes.includes("0-15")}
              onChange={onHandlePrepTimeChange}
            />
            <span>Up to 15 mins</span>
          </label>
        </AccordionContent>

        {/*15-30 mins*/}
        <AccordionContent key={"15-30"} className={"mt-2.5"}>
          <label className="flex max-h-2 flex-row items-center justify-start gap-2">
            <input
              type="checkbox"
              name="prep-time"
              value={"15-30"}
              checked={selectedPrepTimes.includes("15-30")}
              onChange={onHandlePrepTimeChange}
            />
            <span>15 - 30 mins</span>
          </label>
        </AccordionContent>

        {/*30-45 mins*/}
        <AccordionContent key={"30-45"} className={"mt-2.5"}>
          <label className="flex max-h-2 flex-row items-center justify-start gap-2">
            <input
              type="checkbox"
              name="prep-time"
              value={"30-45"}
              checked={selectedPrepTimes.includes("30-45")}
              onChange={onHandlePrepTimeChange}
            />
            <span>30 - 45 mins</span>
          </label>
        </AccordionContent>

        {/*45+ mins*/}
        <AccordionContent key={"45+"} className={"mt-2.5"}>
          <label className="flex max-h-2 flex-row items-center justify-start gap-2">
            <input
              type="checkbox"
              name="prep-time"
              value={"45+"}
              checked={selectedPrepTimes.includes("45+")}
              onChange={onHandlePrepTimeChange}
            />
            <span>45+ mins</span>
          </label>
        </AccordionContent>
      </AccordionItem>
      <Button
        type="reset"
        className={"mb-5 w-full border border-muted-foreground/10"}
        variant={"ghost"}
        onClick={onHandleResetFilter}
      >
        Clear Filters
      </Button>
    </Accordion>
  )
}

export default SearchFilterProducts
