import { ChevronRight, Trash2 } from "lucide-react"
import type { CartItemWithId } from "../types/cart"
import { NavLink } from "react-router-dom"
import ToggleQuantity from "@/components/common/ToggleQuantity"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useItemToggleQuantity } from "../hooks/useItemToggleQuantity"
import { Spinner } from "@/components/ui/spinner"
import DeleteModal from "@/components/common/DeleteModal"

function CartItemCard({
  item,
  onHandleDelete,
  isDeleting,
}: {
  item: CartItemWithId
  onHandleDelete: (value: string) => void
  isDeleting: boolean
}) {
  const [quantity, setQuantity] = useState(item.quantity)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const productId = item.product._id

  const { mutate } = useItemToggleQuantity({
    productId,
    quantity,
  })

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity)
    mutate({ productId: item.product._id, quantity: newQuantity })
  }

  const handleConfirmDelete = () => {
    onHandleDelete(productId)
  }

  const product = item.product

  return (
    <div className="flex h-50 min-w-80 flex-row items-center justify-between gap-2 rounded-md border border-muted-foreground/10 bg-background/20 px-5 shadow-xs lg:gap-5 xl:min-w-237.5 2xl:gap-10">
      <div className="flex w-1/2 flex-row">
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="h-15 w-15 rounded-md border border-muted-foreground/10 2xl:h-35 2xl:w-35"
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className="-mt-6 mb-3 flex flex-row items-center gap-2 rounded-md px-6">
            <img
              src={product.merchantLogo}
              alt={product.merchantName}
              className="-ml-6 h-18 w-18 rounded-md"
            />
            <NavLink
              to={`/merchant/${product.merchant}`}
              className={"-ml-4 flex flex-row items-center"}
            >
              <span className="text-sm">{product.merchantName}</span>

              <ChevronRight className="size-5" />
            </NavLink>
          </div>

          <div className="-mt-3 ml-5 flex flex-col gap-1">
            <h4 className="text-md font-semibold">{product.name}</h4>
            <p className="mb-2 line-clamp-1 truncate text-sm text-muted-foreground">
              {product.ingredients.join(", ")}
            </p>
            <p className="text-lg font-semibold text-primary">
              ₱{product.price}
            </p>
          </div>
        </div>
      </div>
      <div className="flex w-1/2 flex-col gap-5">
        <div className="flex w-full flex-row">
          <div className="flex w-1/3 items-center justify-center">
            <ToggleQuantity
              minQuantity={0}
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
            />
          </div>
          <div className="flex w-1/3 items-center justify-center">
            <p className="text-2xl font-semibold">
              ₱{product.price * quantity}
            </p>
          </div>
          <div className="flex w-1/3 items-center justify-end">
            <Button
              size="icon-lg"
              variant={"destructive"}
              onClick={() => setIsModalOpen(true)}
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner /> : <Trash2 color="#D70040" />}
            </Button>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <Input
            className="resize-none text-sm"
            placeholder="Type your notes for this product here..."
            value={item.notes}
          />
          <Button className={""} variant={"secondary"}>
            Save
          </Button>
        </div>
      </div>
      <DeleteModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default CartItemCard
