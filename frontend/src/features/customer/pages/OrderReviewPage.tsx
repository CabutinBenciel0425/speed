import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  Check,
  Clock3,
  MapPin,
  Phone,
  ShoppingBag,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import axios from "@/lib/axios"
import type { Address } from "@/types/address"
import { useCart } from "../hooks/useCart"

function OrderReviewPage() {
  const { cart, isLoading } = useCart()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addressQuery = useQuery({
    queryKey: ["checkoutAddresses"],
    queryFn: async () => {
      const { data } = await axios.get<{ data: Address[] }>("/address")
      return (
        data.data.find((address) => address.isDefault) ?? data.data[0] ?? null
      )
    },
  })
  const placeOrder = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post("/orders/checkout/cod")
      return data.data as { _id: string }
    },
    onSuccess: async (order) => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] })
      navigate(`/orders/tracking/${order._id}`)
    },
    onError: (error) => {
      console.log(error)
      toast.error("We couldn’t place your order. Please try again.")
    },
  })

  if (isLoading || addressQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl animate-pulse p-5 sm:p-8">
        <div className="h-8 w-56 rounded bg-muted" />
        <div className="mt-6 h-72 rounded-xl bg-muted" />
      </div>
    )
  }
  if (!cart?.items.length) {
    return (
      <main className="mx-auto max-w-3xl p-6 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <Link
          to="/"
          className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Browse menu
        </Link>
      </main>
    )
  }

  const address = addressQuery.data
  const addressLabel = address
    ? `${address.houseOrUnitNumber} ${address.street}, ${address.barangay}, ${address.city}, ${address.province}`
    : `${cart.deliveryAddress.street}, ${cart.deliveryAddress.barangay}, ${cart.deliveryAddress.city}, ${cart.deliveryAddress.province}`

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 p-4 pb-28 sm:space-y-6 sm:p-8 sm:pb-8">
      <header>
        <Link
          to="/cart"
          className="mb-2 -ml-3 inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm hover:bg-muted"
        >
          <ArrowLeft className="size-4" /> Back to cart
        </Link>
        <p className="text-sm font-medium text-primary">Final step</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Review your order
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm the delivery details and items before placing your order.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <Card className="py-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5 text-primary" /> Delivery details
              </CardTitle>
              <Link
                to="/address"
                className="text-sm font-medium text-primary hover:underline"
              >
                Change
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">
                {address?.recipientName ?? "Recipient"}
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4" />
                {address?.phoneNumber ??
                  "Add a phone number to your saved address"}
              </p>
              <p className="text-sm text-muted-foreground">{addressLabel}</p>
              {address?.landmark && (
                <p className="text-sm text-muted-foreground">
                  Landmark: {address.landmark}
                </p>
              )}
              {!address && (
                <Link
                  to="/address"
                  className="inline-flex h-9 items-center rounded-md border px-3 text-sm"
                >
                  Add delivery details
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className="py-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-primary" /> Items from{" "}
                {cart.merchant.merchantName}
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {cart.items.map((item) => (
                <div
                  key={item.product._id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <img
                    src={item.product.image}
                    alt=""
                    className="size-14 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × ₱{item.product.price}
                    </p>
                    {item.note && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Note: {item.note}
                      </p>
                    )}
                  </div>
                  <p className="font-medium">
                    ₱{(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit py-6 lg:sticky lg:top-5">
          <CardHeader>
            <CardTitle>Payment summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₱{cart.pricing.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery fee</span>
              <span>₱{cart.pricing.deliveryFee.toFixed(2)}</span>
            </div>
            {cart.pricing.serviceFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service fee</span>
                <span>₱{cart.pricing.serviceFee.toFixed(2)}</span>
              </div>
            )}
            {cart.pricing.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span>−₱{cart.pricing.discount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-primary">
                ₱{cart.pricing.total.toFixed(2)}
              </span>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Check className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">Cash on delivery</p>
                <p className="text-xs text-muted-foreground">
                  Pay the driver when your order arrives.
                </p>
              </div>
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="size-4" />
              Estimated{" "}
              {cart.estimatedPreparationTime + cart.estimatedDeliveryTime}–
              {cart.estimatedPreparationTime + cart.estimatedDeliveryTime + 15}{" "}
              minutes
            </p>
            <Button
              className="hidden w-full sm:flex"
              size="lg"
              disabled={
                !address?.recipientName ||
                !address.phoneNumber ||
                placeOrder.isPending ||
                !cart.merchant.isOpen
              }
              onClick={() => placeOrder.mutate()}
            >
              {placeOrder.isPending ? "Placing order…" : "Place order"}
            </Button>
            {!cart.merchant.isOpen && (
              <p className="text-sm text-destructive">
                This store is closed right now.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-4 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-semibold text-primary">
              ₱{cart.pricing.total.toFixed(2)}
            </p>
          </div>
          <Button
            className="flex-1"
            disabled={
              !address?.recipientName ||
              !address.phoneNumber ||
              placeOrder.isPending ||
              !cart.merchant.isOpen
            }
            onClick={() => placeOrder.mutate()}
          >
            {placeOrder.isPending ? "Placing…" : "Place order"}
          </Button>
        </div>
      </div>
    </main>
  )
}

export default OrderReviewPage
