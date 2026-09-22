import { ChevronRight, Trash2 } from "lucide-react"
import type { CartItemWithId } from "../types/cart"
import { NavLink } from "react-router-dom"
import ToggleQuantity from "@/components/common/ToggleQuantity"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useItemToggleQuantity } from "../hooks/useItemToggleQuantity"
import { Spinner } from "@/components/ui/spinner"
import DeleteModal from "@/components/common/DeleteModal"
import { useAddProductNote } from "../hooks/useAddProductNote"

function CartItemCard({
  item,
  onHandleDelete,
  isDeleting,
}: {
  item: CartItemWithId
  onHandleDelete: (value: string) => void
  isDeleting: boolean
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [note, setNote] = useState(item.note || "")

  const productId = item.product._id
  const quantity = item.quantity
  const product = item.product

  const { mutate: toggleQuantity, isPending: isLoadingQuantity } =
    useItemToggleQuantity()

  const { mutate: addNote, isPending: isSavingNote } = useAddProductNote()

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity === 0) {
      setIsModalOpen(true)
      return
    }

    toggleQuantity({
      productId,
      quantity: newQuantity,
    })
  }

  const handleSaveNote = () => {
    const cleanNote = note.trim()

    if (cleanNote.length === 0) return

    addNote({
      productId,
      note: cleanNote,
    })
  }

  const handleConfirmDelete = () => {
    onHandleDelete(productId)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNote(item.note || "")
  }, [item.note])

  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border border-muted-foreground/10 bg-background/20 p-3 shadow-xs sm:p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:p-4 2xl:h-50 2xl:gap-8 2xl:px-5">
      <div className="flex w-full min-w-0 gap-3 lg:w-1/2 2xl:gap-4">
        <div className="shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="size-20 rounded-lg border border-muted-foreground/10 object-cover sm:size-24 lg:size-25 2xl:size-35"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="mb-2 flex min-w-0 items-center gap-2 lg:-mt-2 2xl:-mt-6">
            <img
              src={product.merchantLogo}
              alt={product.merchantName}
              className="size-9 shrink-0 rounded-md object-cover sm:size-10 2xl:size-14"
            />

            <NavLink
              to={`/merchant/${product.merchant}`}
              className="flex min-w-0 items-center gap-1 text-xs font-semibold sm:text-sm"
            >
              <span className="truncate">{product.merchantName}</span>

              <ChevronRight className="size-4 shrink-0" />
            </NavLink>
          </div>

          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold sm:text-base">
              {product.name}
            </h4>

            <p className="mt-1 line-clamp-1 text-xs font-medium text-muted-foreground sm:text-sm">
              {product.ingredients.join(", ")}
            </p>

            <p className="mt-1 text-base font-semibold text-primary sm:text-lg">
              ₱{product.price}
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 lg:w-1/2 lg:gap-4">
        <div className="flex w-full items-center lg:justify-end">
          <div className="flex flex-1 items-center justify-start lg:w-1/3 lg:flex-none lg:justify-center">
            <ToggleQuantity
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              isPending={isLoadingQuantity}
            />
          </div>

          <div className="flex flex-1 justify-center lg:w-1/3 lg:flex-none">
            <p className="text-lg font-semibold sm:text-xl 2xl:text-2xl">
              ₱{product.price * quantity}
            </p>
          </div>

          <div className="flex flex-1 justify-end lg:w-1/3 lg:flex-none">
            <Button
              size="icon-lg"
              variant="destructive"
              onClick={() => setIsModalOpen(true)}
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner /> : <Trash2 className="text-white" />}
            </Button>
          </div>
        </div>

        <div className="flex w-full gap-2">
          <Input
            className="min-w-0 text-xs sm:text-sm"
            placeholder="Add a note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isSavingNote}
          />

          <Button
            variant="secondary"
            className="shrink-0"
            onClick={handleSaveNote}
            disabled={isSavingNote}
          >
            {isSavingNote ? "Saving" : "Save"}
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
