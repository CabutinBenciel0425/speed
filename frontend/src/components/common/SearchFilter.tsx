import { accordionItems } from "@/features/customer/utils/constants"
import type { SearchFilterProps } from "../types/PropTypes"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { Button } from "../ui/button"
import { Slider } from "../ui/slider"

function SearchFilter({
  selectedCategory,
  priceRange,
  selectedPrepTimes,
  onHandlePriceRange,
  onHandleCategoryChange,
  onHandlePrepTimeChange,
  onHandleResetFilter,
}: SearchFilterProps) {
  const categoriesContent = accordionItems[0].content
  const prepTimeContent = accordionItems[2].content

  return (
    <Accordion
      multiple
      className="max-w-3xs rounded-md bg-muted-foreground/10 p-4"
      defaultValue={["categories", "price-range", "prep-time"]}
    >
      {/* Categories */}
      <AccordionItem
        key={accordionItems[0].value}
        value={accordionItems[0].value}
      >
        <AccordionTrigger className={"text-md font-semibold"}>
          {accordionItems[0].trigger}
        </AccordionTrigger>
        {Array.isArray(categoriesContent) &&
          categoriesContent.map((item) => (
            <AccordionContent key={item} className={"mt-2.5"}>
              <label className="flex max-h-2 flex-row items-center justify-start gap-2">
                <input
                  type="radio"
                  name="category"
                  value={item}
                  checked={selectedCategory === item}
                  onChange={onHandleCategoryChange}
                />
                <span>{item}</span>
              </label>
            </AccordionContent>
          ))}
      </AccordionItem>

      {/* Price Range */}
      <AccordionItem
        key={accordionItems[1].value}
        value={accordionItems[1].value}
      >
        <AccordionTrigger className={"text-md font-semibold"}>
          {accordionItems[1].trigger}
        </AccordionTrigger>
        <AccordionContent className={"w-full py-2"}>
          <Slider
            value={priceRange}
            max={500}
            step={5}
            className="mx-auto mb-3 w-full max-w-xs"
            onValueChange={onHandlePriceRange}
          />
          <div className="flex w-full flex-row items-center justify-between">
            <span className="text-sm font-semibold text-primary">
              ₱{priceRange[0]}
            </span>
            <span className="text-sm font-semibold text-primary">
              ₱{priceRange[1] >= 500 ? "500+" : priceRange[1]}
            </span>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Preparation Time */}
      <AccordionItem
        key={accordionItems[2].value}
        value={accordionItems[2].value}
        className={"mb-5"}
      >
        <AccordionTrigger className={"text-md font-semibold"}>
          {accordionItems[2].trigger}
        </AccordionTrigger>
        {Array.isArray(prepTimeContent) &&
          prepTimeContent.map((item) => (
            <AccordionContent key={item} className={"mt-2.5"}>
              <label className="flex max-h-2 flex-row items-center justify-start gap-2">
                <input
                  type="checkbox"
                  name="prep-time"
                  value={item}
                  checked={selectedPrepTimes.includes(item)}
                  onChange={onHandlePrepTimeChange}
                />
                <span>{item}</span>
              </label>
            </AccordionContent>
          ))}
      </AccordionItem>

      <Button type="button" onClick={onHandleResetFilter}>
        Clear Filters
      </Button>
    </Accordion>
  )
}

export default SearchFilter
