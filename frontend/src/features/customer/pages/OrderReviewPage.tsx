import { ArrowLeft, Clock3, MapPin, Phone, ShoppingBag } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "../hooks/useCart"
import { usePlaceOrderCod } from "../hooks/usePlaceOrderCod"
import { useCheckoutAddress } from "../hooks/useCheckoutAddress"
import PageError from "@/components/common/PageError"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { useEffect, useState } from "react"
import {
  usePendingQRPhPayment,
  usePlaceOrderQRPh,
  type QRPhPaymentResponseType,
} from "../hooks/usePlaceOrderQRPh"
import QRPhPaymentDialog from "../components/QRPhPaymentDialog"

function OrderReviewPage() {
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "QRPh">("Cash")
  const { cart, isLoading } = useCart()
  const placeOrderCod = usePlaceOrderCod()
  const placeOrderQRPh = usePlaceOrderQRPh()
  const pendingQRPh = usePendingQRPhPayment()
  const [qrPayment, setQrPayment] = useState<QRPhPaymentResponseType | null>(
    null
  )
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const addressQuery = useCheckoutAddress()

  useEffect(() => {
    if (pendingQRPh.data && !qrPayment && !pendingQRPh.isFetching) {
      setQrPayment(pendingQRPh.data)
      setQrDialogOpen(true)
    }
  }, [pendingQRPh.data, pendingQRPh.isFetching, qrPayment])

  const closeQRPayment = () => {
    setQrDialogOpen(false)
    setQrPayment(null)
    void pendingQRPh.refetch()
  }
  const generateReplacementQR = () => {
    placeOrderQRPh.mutate(undefined, {
      onSuccess: (payment) => {
        setQrPayment(payment)
        setQrDialogOpen(true)
      },
    })
  }
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
        <QRPhPaymentDialog
          payment={qrPayment}
          open={qrDialogOpen}
          onDismiss={() => setQrDialogOpen(false)}
          onClose={closeQRPayment}
          onGenerateNewQR={generateReplacementQR}
          isGeneratingQR={placeOrderQRPh.isPending}
        />
      </main>
    )
  }
  if (addressQuery.isError) {
    return (
      <main className="page-shell max-w-5xl">
        <PageError
          message="Could not load your delivery details. Please try again."
          onRetry={() => void addressQuery.refetch()}
          isRetrying={addressQuery.isFetching}
        />
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
            <div className="flex flex-col gap-5">
              <p className="text-base font-semibold">Payment Method</p>
              <RadioGroup
                defaultValue={paymentMethod}
                className="flex max-w-4xl flex-row 2xl:flex-col"
                onValueChange={(v) => {
                  if (v === "Cash" || v === "QRPh") setPaymentMethod(v)
                }}
              >
                <FieldLabel htmlFor="Cash">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle className="text-sm font-normal">
                        Cash on Delivery (COD)
                      </FieldTitle>
                      <FieldDescription className="text-xs text-muted-foreground">
                        Pay with cash when your order arrives.
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem value="Cash" id="Cash" />
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="QRPh">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle className="text-sm font-normal">
                        QRPh
                      </FieldTitle>
                      <FieldDescription className="text-xs text-muted-foreground">
                        Scan and pay using any QR Ph–enabled app.
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem value="QRPh" id="QRPh" />
                  </Field>
                </FieldLabel>
              </RadioGroup>
            </div>
            {qrPayment && !qrDialogOpen && (
              <div className="space-y-2 rounded-lg border p-3 text-sm">
                <p className="font-medium">
                  Payment confirmation is still pending
                </p>
                <p className="text-muted-foreground">
                  The QR window is closed. We’ll keep checking, and this
                  checkout will stay locked until the payment is confirmed or
                  expires.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQrDialogOpen(true)}
                >
                  View payment status
                </Button>
              </div>
            )}
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
                !address?.recipientName?.trim() ||
                !address.phoneNumber?.trim() ||
                placeOrderCod.isPending ||
                placeOrderQRPh.isPending ||
                !!qrPayment ||
                !cart.merchant.isOpen
              }
              onClick={() => {
                if (paymentMethod === "Cash") placeOrderCod.mutate()
                if (paymentMethod === "QRPh")
                  placeOrderQRPh.mutate(undefined, {
                    onSuccess: (payment) => {
                      setQrPayment(payment)
                      setQrDialogOpen(true)
                    },
                  })
              }}
            >
              {placeOrderCod.isPending
                ? "Placing order…"
                : placeOrderQRPh.isPending
                  ? "Generating QR…"
                  : paymentMethod === "QRPh"
                    ? "Continue to payment"
                    : "Place order"}
            </Button>
            {(!address?.recipientName?.trim() ||
              !address.phoneNumber?.trim()) && (
              <p className="text-xs text-muted-foreground">
                Select a default delivery address with a recipient name and
                phone number.
              </p>
            )}
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
              !address?.recipientName?.trim() ||
              !address.phoneNumber?.trim() ||
              placeOrderCod.isPending ||
              placeOrderQRPh.isPending ||
              !!qrPayment ||
              !cart.merchant.isOpen
            }
            onClick={() => {
              if (paymentMethod === "Cash") placeOrderCod.mutate()
              if (paymentMethod === "QRPh")
                placeOrderQRPh.mutate(undefined, {
                  onSuccess: (payment) => {
                    setQrPayment(payment)
                    setQrDialogOpen(true)
                  },
                })
            }}
          >
            {placeOrderCod.isPending
              ? "Placing order…"
              : placeOrderQRPh.isPending
                ? "Generating QR…"
                : paymentMethod === "QRPh"
                  ? "Continue to payment"
                  : "Place order"}
          </Button>
        </div>
      </div>
      <QRPhPaymentDialog
        payment={qrPayment}
        open={qrDialogOpen}
        onDismiss={() => setQrDialogOpen(false)}
        onClose={closeQRPayment}
        onGenerateNewQR={generateReplacementQR}
        isGeneratingQR={placeOrderQRPh.isPending}
      />
    </main>
  )
}

export default OrderReviewPage
