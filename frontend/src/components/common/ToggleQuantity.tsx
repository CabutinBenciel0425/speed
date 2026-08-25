import { Minus, Plus } from "lucide-react"
import { Button } from "../ui/button"
import type { ToggleQuantityProps } from "../types/PropTypes"

function ToggleQuantity({
  quantity = 1,
  onQuantityChange,
}: ToggleQuantityProps) {
  const handleSubtractQuantity = () => {
    if (quantity === 1) return
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
        className={"border-none md:p-3"}
        onClick={handleSubtractQuantity}
      >
        <Minus />
      </Button>
      <span className="text-xl font-bold lg:text-2xl">{quantity}</span>
      <Button
        variant={"outline"}
        size="icon"
        className={"border-none md:p-3"}
        onClick={handleAddQuantity}
      >
        <Plus />
      </Button>
    </div>
  )
}

export default ToggleQuantity
