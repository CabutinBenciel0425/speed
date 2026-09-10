import { Minus, Plus } from "lucide-react"
import { Button } from "../ui/button"
import type { ToggleQuantityProps } from "../types/PropTypes"

function ToggleQuantity({
  minQuantity = 1,
  quantity = 1,
  onQuantityChange,
}: ToggleQuantityProps) {
  const handleSubtractQuantity = () => {
    if (minQuantity !== 0 && quantity === 1) return
    onQuantityChange(quantity - 1)
  }

  const handleAddQuantity = () => {
    onQuantityChange(quantity + 1)
  }
  return (
    <div className="flex flex-row gap-2 lg:gap-5">
      <Button
        variant={"outline"}
        size="icon"
        className={"md:p-3"}
        onClick={handleSubtractQuantity}
      >
        <Minus />
      </Button>
      <span className="flex w-4 items-center justify-center text-xl font-bold lg:text-2xl">
        {quantity}
      </span>
      <Button
        variant={"outline"}
        size="icon"
        className={"md:p-3"}
        onClick={handleAddQuantity}
      >
        <Plus />
      </Button>
    </div>
  )
}

export default ToggleQuantity
