import { useState } from "react"
import CartItemCard from "../components/CartItemCard"
import OrderSummary from "../components/OrderSummary"
import { useCart } from "../hooks/useCart"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

function CartPage() {
  const { cart } = useCart()
  const [orderNote, setOrderNote] = useState<string>(cart?.customerNote || "")
  const totalEstimatedDeliveryTime =
    cart?.estimatedDeliveryTime && cart?.estimatedPreparationTime
      ? cart?.estimatedDeliveryTime + cart?.estimatedPreparationTime
      : 0
  return (
    <div className="relative flex w-full flex-col items-center justify-center px-10 py-5">
      <div className="ml-80 flex w-full flex-col items-start justify-center">
        <h1 className="mb-2 text-2xl font-bold">Your Cart</h1>
        <h3 className="text-md font-normal text-muted-foreground/50">
          Good food is always a good idea
        </h3>
      </div>
      <div className="relative flex w-375 flex-row items-start justify-center gap-5">
        <div className="flex w-7/10 flex-col items-center justify-center gap-3 px-5 py-8">
          {cart?.items?.map((item) => (
            <CartItemCard item={item} />
          ))}
          <div className="mt-2 ml-2 flex w-full items-center justify-start">
            <Button
              variant={"ghost"}
              className={"text-md flex flex-row gap-2 text-muted-foreground/50"}
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
            customerNote={orderNote}
            onChangeCustomerNote={setOrderNote}
            isMerchantOpen={cart?.merchant.isOpen}
          />
        </div>
      </div>
    </div>
  )
}

export default CartPage
