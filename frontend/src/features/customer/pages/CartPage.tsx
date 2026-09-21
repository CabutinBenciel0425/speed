import { useState } from "react"
import CartItemCard from "../components/CartItemCard"
import OrderSummary from "../components/OrderSummary"
import { useCart } from "../hooks/useCart"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useDeleteItemCart } from "../hooks/useDeleteItemCart"
import { BsCartX } from "react-icons/bs"
import { NavLink } from "react-router-dom"
import { useClearCart } from "../hooks/useClearCart"
import DeleteModal from "@/components/common/DeleteModal"
import RandomProducts from "../components/RandomProducts"

function CartPage() {
  const { cart } = useCart()
  const { mutate: deleteItem } = useDeleteItemCart()
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { mutate: clearCart } = useClearCart()

  const totalEstimatedDeliveryTime =
    cart?.estimatedDeliveryTime && cart?.estimatedPreparationTime
      ? cart?.estimatedDeliveryTime + cart?.estimatedPreparationTime
      : 0

  const handleDelete = (productId: string) => {
    setDeletingProduct(productId)
    deleteItem(productId, {
      onSettled: () => setDeletingProduct(null),
    })
  }

  const handleClearCart = () => {
    clearCart()
  }

  const cartItems = cart?.items
  const cartProductIds = cartItems?.map((item) => item.product._id) || []
  const merchantId =
    typeof cartItems?.[0]?.product?.merchant === "string"
      ? cartItems[0].product.merchant
      : cartItems?.[0]?.product?.merchant?._id
  console.log(cartItems)

  return (
    <div className="relative flex w-full flex-col items-center justify-center px-10 py-5">
      <div className="ml-80 flex w-full flex-col items-start justify-center">
        <h1 className="mb-2 text-2xl font-bold">Your Cart</h1>
        <h3 className="text-md font-normal text-muted-foreground/50">
          Good food is always a good idea
        </h3>
      </div>
      {cartItems && cartItems.length > 0 ? (
        <div className="relative flex w-375 flex-row items-start justify-center gap-5">
          <div className="flex w-7/10 flex-col items-center justify-center gap-3 px-5 py-8">
            {cart?.items?.map((item) => (
              <CartItemCard
                item={item}
                onHandleDelete={handleDelete}
                isDeleting={deletingProduct === item.product._id}
                key={item.product._id}
              />
            ))}
            <div className="mt-2 ml-2 flex w-full items-center justify-start">
              <Button
                variant={"ghost"}
                className={
                  "text-md flex flex-row gap-2 text-muted-foreground/50"
                }
                onClick={() => setIsModalOpen(true)}
              >
                <Trash2 /> <span>Clear Cart</span>
              </Button>
            </div>
          </div>
          <div className="sticky top-0 w-3/10 px-3 py-5">
            <OrderSummary
              subtotal={cart?.pricing.subtotal}
              deliveryFee={cart?.pricing.deliveryFee}
              totalItems={cart?.items.length}
              total={cart?.pricing.total}
              deliveryTime={totalEstimatedDeliveryTime}
              customerNote={cart.customerNote}
              isMerchantOpen={cart?.merchant.isOpen}
              cartId={cart._id}
            />
          </div>
        </div>
      ) : (
        <div className="mt-20 flex w-full flex-col items-center justify-center gap-3">
          <BsCartX className="size-20 text-muted-foreground/50" />
          <p className="text-md text-muted-foreground/50">
            You have no items in your cart.
          </p>
          <NavLink to="/">Go back in Homepage</NavLink>
        </div>
      )}

      {cartItems && cartItems.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold lg:text-2xl">
              You might also like
            </h2>
          </div>
          <RandomProducts
            productIds={cartProductIds}
            limit={5}
            merchantId={merchantId}
          />
        </section>
      )}

      <DeleteModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onConfirm={handleClearCart}
        title="Clear Cart"
        description="Are you sure you want to clear your cart? This action cannot be undone and the data will be permanently removed"
        icon={<BsCartX size={20} />}
      />
    </div>
  )
}

export default CartPage
