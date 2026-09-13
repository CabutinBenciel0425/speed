import { Minus, Plus } from "lucide-react"
import { Button } from "../ui/button"
import type { ToggleQuantityProps } from "../types/PropTypes"
import { Spinner } from "../ui/spinner"

function ToggleQuantity({
  quantity = 1,
  onQuantityChange,
  isPending = false,
}: ToggleQuantityProps) {
  const handleSubtractQuantity = () => {
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
        disabled={isPending}
      >
        {isPending ? <Spinner /> : <Minus />}
      </Button>
      <span className="flex w-4 items-center justify-center text-xl font-bold lg:text-2xl">
        {quantity}
      </span>
      <Button
        variant={"outline"}
        size="icon"
        className={"md:p-3"}
        onClick={handleAddQuantity}
        disabled={isPending}
      >
        {isPending ? <Spinner /> : <Plus />}
      </Button>
    </div>
  )
}

export default ToggleQuantity
