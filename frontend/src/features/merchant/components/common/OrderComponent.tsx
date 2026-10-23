import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { NavLink, useParams } from "react-router-dom"
import { useOrder } from "../../hooks/useOrder"
import {
  ArrowLeft,
  Clock,
  Clock10,
  CreditCard,
  Hash,
  MapPin,
  NotepadText,
  Phone,
  QrCode,
  Timer,
} from "lucide-react"
import { formatTimeAndDate } from "@/utils/timeUtils"
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter"
import MapComponent from "@/features/customer/components/MapComponent"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import OrderStatusTimeline from "../../../../components/common/OrderStatusTimeline"
import { useMerchantReadyOrder } from "../../hooks/useMerchantReadyOrder"
import { useActionMutation } from "../../hooks/useOrderActionMutation"
import { useState } from "react"
import { DialogTrigger } from "@/components/ui/dialog"
import PickupConfirmationModal from "./PickupConfirmationModal"
import { toast } from "sonner"
import OrderDetailsSkeleton from "@/components/common/OrderDetailsSkeleton"
import PageError from "@/components/common/PageError"

const ADDED_TIME = 15

function OrderComponent() {
  const { orderId } = useParams()
  const { data, isLoading, isError, refetch, isFetching } = useOrder(
    orderId || ""
  )
  const [isPickedupModalOpen, setIsPickedupModalOpen] = useState(false)
  const [isPaymentConfirm, setIsPaymentConfirm] = useState(false)
  const [action, setAction] = useState<
    "accept" | "cancel" | "reject" | "picked-up"
  >("accept")
  const merchantId = data?.merchant._id ?? ""
  const { mutate: readyOrder } = useMerchantReadyOrder()
  const { mutate: actionMutation } = useActionMutation({
    merchantId,
    orderId: orderId || "",
    action,
  })
  const [loading, setLoading] = useState<
    "reject" | "cancel" | "accept" | "picked-up" | null
  >(null)

  if (isLoading) return <OrderDetailsSkeleton />
  if (isError || !data)
    return (
      <main className="page-shell flex min-h-[50vh] max-w-3xl items-center">
        <PageError
          message="We couldn't load this order. Please try again."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      </main>
    )

  const orderDate = data.createdAt

  const customerName = `${capitalizeFirstLetter(
    data.customer ? data.customer.firstName : ""
  )} ${capitalizeFirstLetter(data.customer ? data.customer.lastName : "")}`
  const customerLocation: [number, number] = [
    data.deliveryAddress?.location?.coordinates?.[1] ?? 0,
    data.deliveryAddress?.location?.coordinates?.[0] ?? 0,
  ]

  const responsiveActionCardClassName =
    "fixed inset-x-0 bottom-0 z-30 w-full rounded-t-xl border-x-0 border-b-0 bg-background pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl lg:static lg:z-auto lg:rounded-xl lg:border lg:pb-2 lg:shadow-none"

  let estimatedPrepTime1 = ""
  let estimatedPrepTime2 = ""
  if (data?.preparingAt && data?.estimatedPreparationTime) {
    const baseMs = new Date(data.preparingAt).getTime()
    const MS_PER_MIN = 60_000

    const prepMs = baseMs + data.estimatedPreparationTime * MS_PER_MIN
    const extendedMs = prepMs + ADDED_TIME * MS_PER_MIN

    estimatedPrepTime1 = formatTimeAndDate(prepMs)
    estimatedPrepTime2 = formatTimeAndDate(extendedMs)
  }

  return (
    <div className="relative flex w-full flex-col items-start gap-10 px-4 pb-64 sm:px-6 lg:pb-10 xl:flex-row xl:px-10">
      <div className="flex w-full min-w-0 flex-col gap-4 lg:gap-8 xl:max-w-5xl xl:flex-1">
        <NavLink
          to="/merchant/orders"
          className="flex w-fit flex-row items-center gap-2 py-3 text-muted-foreground"
        >
          <ArrowLeft className="size-5" />
          <span className="text-sm">Back to Orders</span>
        </NavLink>

        <Card className="flex w-full flex-col gap-5 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col justify-around gap-2">
            {data.status === "Pending" && (
              <span className="mb-3 w-fit rounded-lg bg-primary px-3 py-1.5 text-sm text-white sm:mb-5">
                New Order
              </span>
            )}
            <div
              className={`flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3 ${data.status === "Pending" ? "mb-3" : "mb-4 sm:mb-6"}`}
            >
              <h1 className="text-lg font-semibold break-all text-primary">
                #{data.orderNumber}
              </h1>
              <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-4 shrink-0" />
                <span>{orderDate && formatTimeAndDate(orderDate)}</span>
              </div>
            </div>
            <div className="flex flex-row items-center gap-3">
              <img
                src={data.customer.avatar}
                alt={data.customer.firstName}
                className="size-15 shrink-0 rounded-full object-cover sm:size-20"
              />
              <div className="flex min-w-0 flex-col justify-center gap-1 text-sm sm:gap-2">
                <p className="flex flex-row flex-wrap items-center gap-2 text-base font-semibold">
                  <span className="wrap-break-words ml-12">{customerName}</span>
                  <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    Customer
                  </span>
                </p>
                <p className="flex flex-row items-center gap-4 text-muted-foreground/80">
                  <Phone className="size-7 shrink-0" />
                  {data.customer.phoneNumber}
                </p>
                <div className="flex flex-row items-center gap-4 text-muted-foreground/80">
                  <MapPin className="size-7 shrink-0" />
                  <div className="min-w-0">
                    <p className="wrap-break-words text-sm text-muted-foreground">
                      {data.deliveryAddress.houseOrUnitNumber}{" "}
                      {data.deliveryAddress.street}
                    </p>
                    <p className="wrap-break-words text-sm text-muted-foreground">
                      {data.deliveryAddress.barangay},{" "}
                      {data.deliveryAddress.city},
                    </p>
                    <p className="wrap-break-words text-sm text-muted-foreground">
                      {data.deliveryAddress.province || ""}{" "}
                      {data.deliveryAddress.region}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {data.customerNote && (
              <div className="mt-2 flex flex-row items-start gap-2 text-sm text-muted-foreground">
                <NotepadText className="size-5 shrink-0 sm:size-6" />
                <span className="wrap-break-words">{data.customerNote}</span>
              </div>
            )}
          </div>

          <div className="w-full rounded-md border border-muted-foreground/30 p-3 md:w-72 md:shrink-0 lg:w-md">
            <MapComponent position={customerLocation} active height={"180px"} />
          </div>
        </Card>

        {/* Items */}
        <Card className="w-full px-4 sm:px-5">
          <h2 className="text-lg font-bold">Order Items</h2>
          <div className="divide-y divide-muted-foreground/30 rounded-md border border-muted-foreground/30 px-3 sm:px-5">
            {data.items.map((item) => (
              <div
                key={item.product}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0"
              >
                <div className="flex min-w-0 flex-row items-center gap-3 sm:w-1/2">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="size-16 shrink-0 rounded-md object-cover sm:size-20"
                  />
                  <div className="flex min-w-0 flex-col gap-1 sm:gap-2 sm:py-4">
                    <p className="wrap-break-words text-sm font-semibold">
                      {item.productName}
                    </p>
                    <p className="text-muted-foreground">₱ {item.unitPrice}</p>
                    {item.notes && (
                      <div className="flex flex-row items-start gap-1 text-xs text-muted-foreground">
                        <NotepadText className="size-4 shrink-0" />
                        <span className="wrap-break-words">{item.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row items-center px-5 sm:w-1/2 sm:px-0">
                  <div className="w-1/4 sm:w-1/3">
                    <span className="text-sm text-muted-foreground">
                      x{item.quantity}
                    </span>
                  </div>
                  <div className="flex w-3/4 flex-row items-center justify-between sm:w-2/3 sm:px-5">
                    <span className="text-muted-foreground">
                      ₱{item.unitPrice}
                    </span>
                    <span className="text-base font-bold sm:text-lg">
                      ₱{item.subtotal}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Delivery address */}
        {/* <Card className="w-full divide-y px-4 sm:px-5">
          <div className="py-2">
            <p className="flex flex-row items-center gap-2">
              <MapPin className="size-4" />
              <span className="text-base font-semibold">Delivery Address</span>
            </p>
          </div>
          <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-col gap-4">
              <div>
                <p className="mb-2 flex flex-row items-start gap-2">
                  <User className="size-6 shrink-0" />
                  <div className="flex flex-col items-center">
                    <span className="wrap-break-words">
                      <span className="text-sm text-muted-foreground">
                        Customer name:
                      </span>{" "}
                      <span className="text-base">{customerName}</span>
                    </span>
                    {customerName !== data.deliveryAddress.recipientName && (
                      <span className="wrap-break-words text-base">
                        <span className="text-sm text-muted-foreground">
                          Recipient name:
                        </span>{" "}
                        <span className="text-base">
                          {data.deliveryAddress.recipientName}
                        </span>
                      </span>
                    )}
                  </div>
                </p>
                <p className="ml-8 text-xs text-muted-foreground">
                  {data.customer.phoneNumber}
                </p>
              </div>
            </div>
          </div>
        </Card> */}

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          <Card className="min-h-37.5 w-full px-4 sm:px-5">
            <div className="py-2">
              <p className="flex flex-row items-center gap-2">
                <CreditCard className="size-4" />
                <span className="text-base font-semibold">Payment</span>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-row flex-wrap items-center justify-between gap-2">
                {data.payment.method === "Cash" ? (
                  <div className="flex flex-row items-center gap-2">
                    <Timer className="size-4" />
                    <span className="text-sm text-muted-foreground">
                      Cash on Delivery
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-row items-center gap-2">
                    <QrCode className="size-4" />
                    <span className="text-sm text-muted-foreground">
                      QR Ph payment
                    </span>
                  </div>
                )}
                <span
                  className={`w-fit rounded-lg ${data.payment.status === "Cancelled" ? "bg-red-500" : data.payment.status === "Paid" ? "bg-green-400" : "bg-primary"} px-2 py-0.5 text-xs text-white`}
                >
                  {data.payment.method === "Cash"
                    ? isPaymentConfirm
                      ? "Paid"
                      : "Pending"
                    : "Paid"}
                </span>
              </div>
              <div className="flex flex-row items-start gap-2">
                <Hash className="mt-0.5 size-4 shrink-0" />
                <span className="text-sm break-all text-muted-foreground">
                  Transaction ID - {data.payment.transactionId || "--"}
                </span>
              </div>
            </div>
          </Card>

          <Card className="min-h-37.5 w-full px-4 sm:px-5">
            <div className="py-2">
              <p className="flex flex-row items-center gap-2">
                <Clock10 className="size-4" />
                <span className="text-base font-semibold">Estimated Time</span>
              </p>
            </div>

            <div className="flex w-full flex-row items-center justify-center gap-4">
              <div className="flex w-1/3 flex-col items-center justify-center gap-2">
                <p className="text-sm text-muted-foreground">Preparation</p>
                <p className="text-base font-semibold sm:text-lg">
                  {data.estimatedPreparationTime} mins
                </p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="flex w-2/3 flex-col items-center justify-center gap-2">
                <p className="text-sm text-muted-foreground">Delivery</p>
                <p className="text-base font-semibold sm:text-lg">
                  {estimatedPrepTime1} - {estimatedPrepTime2}
                </p>
              </div>
            </div>
          </Card>

          <Card className="min-h-37.5 w-full divide-y px-4 sm:px-5 md:col-span-2 2xl:col-span-1">
            <div className="py-2">
              <p className="flex flex-row items-center gap-2">
                <NotepadText className="size-4" />
                <span className="text-base font-semibold">
                  Additional Notes
                </span>
              </p>
            </div>
            <div className="pt-2">
              <p className="mb-1 text-sm text-muted-foreground">
                Customer note:
              </p>
              <p className="wrap-break-words">{data.customerNote}</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex w-full flex-col items-stretch gap-4 lg:gap-8 xl:mt-15 xl:w-104 xl:shrink-0 2xl:w-lg">
        <OrderStatusTimeline order={data} />

        {!data.driver &&
          !data.driverAssignedAt &&
          !data.cancelledAt &&
          !data.rejectedAt && (
            <Card className={`${responsiveActionCardClassName} divide-y px-2`}>
              <CardHeader>
                <CardTitle className="py-2 text-base text-muted-foreground">
                  Action buttons will show after a driver has accepted this
                  order.
                </CardTitle>
              </CardHeader>
            </Card>
          )}
        {data.status === "Pending" && data.driver && data.driverAssignedAt && (
          <Card className={`${responsiveActionCardClassName} divide-y px-2`}>
            <CardHeader>
              <CardTitle className="py-2 text-base font-semibold">
                Accept or Reject
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 pt-3">
              <CardDescription>
                Review the order before accepting or rejecting the order.
              </CardDescription>
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <Button
                  className="flex-1 cursor-pointer rounded-md border-primary py-4 text-base text-primary hover:text-primary sm:py-6 sm:text-lg"
                  variant="outline"
                  onClick={() => {
                    setLoading("reject")
                    setAction("reject")
                    actionMutation({
                      merchantId,
                      orderId: orderId ?? "",
                      action: "reject",
                    })
                  }}
                >
                  {loading === "reject" ? "Rejecting..." : "Reject"}
                </Button>
                <Button
                  className="flex-1 cursor-pointer rounded-md py-5 text-base sm:py-6 sm:text-lg"
                  disabled={Boolean(!data.driver || !data.driverAssignedAt)}
                  onClick={() => {
                    if (!data.driver || !data.driverAssignedAt) return
                    setLoading("accept")
                    setAction("accept")
                    actionMutation({
                      merchantId,
                      orderId: orderId ?? "",
                      action: "accept",
                    })
                  }}
                >
                  {loading === "accept" ? "Accepting..." : "Accept"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {data.status === "Preparing" && (
          <Card className={`${responsiveActionCardClassName} divide-y px-2`}>
            <CardHeader>
              <CardTitle className="py-2 text-base font-semibold">
                Ready for Pickup or Cancel
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 pt-3">
              <CardDescription>
                You can switch from "Preparing" to "Ready for Pick up" status or
                cancel this order. If cancelled, provide a reason.
              </CardDescription>
              {!!data.driverArrivedAtMerchantAt && (
                <CardDescription>
                  Driver has arrived at merchant. Order cannot be cancel
                </CardDescription>
              )}
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <Button
                  className="flex-1 cursor-pointer rounded-md border-primary py-4 text-base text-primary hover:text-primary sm:py-6 sm:text-lg"
                  disabled={!!data.driverArrivedAtMerchantAt}
                  variant="outline"
                  onClick={() => {
                    setLoading("cancel")
                    setAction("cancel")
                    actionMutation({
                      merchantId,
                      orderId: orderId ?? "",
                      action: "cancel",
                    })
                  }}
                >
                  {loading === "cancel" ? "Cancelling..." : "Cancel"}
                </Button>
                <Button
                  className="flex-1 cursor-pointer rounded-md py-5 text-base sm:py-6 sm:text-lg"
                  onClick={() => {
                    if (orderId) {
                      readyOrder({ merchantId, orderId })
                    }
                  }}
                >
                  Ready for Pick up
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {data.status === "ReadyForPickup" && (
          <Card className={`${responsiveActionCardClassName} divide-y px-2`}>
            <CardHeader>
              <CardTitle className="py-2 text-base font-semibold">
                Pick up Confirmation
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 pt-3">
              {data.merchantConfirmPickedUpAt ? (
                <CardDescription>
                  You confirmed the handover. Waiting for the driver to confirm
                  the pickup.
                </CardDescription>
              ) : (
                <>
                  <CardDescription>
                    {data.driverConfirmPickedUpAt
                      ? "The driver already confirmed the pickup. Confirm to complete the handover."
                      : 'You can switch from "Ready for Pick up" to "Picked up" status.'}
                  </CardDescription>
                  {!!data.driverArrivedAtMerchantAt && (
                    <CardDescription>
                      Driver has arrived at merchant. Order cannot be cancelled.
                    </CardDescription>
                  )}
                  <div className="w-full">
                    <PickupConfirmationModal
                      dialogTrigger={
                        <DialogTrigger>
                          <Button className="flex-1 cursor-pointer rounded-md py-5 text-base sm:py-6 sm:text-lg">
                            Confirm Pick up
                          </Button>
                        </DialogTrigger>
                      }
                      order={data}
                      onHandleClick={() => {
                        if (!isPaymentConfirm) {
                          toast.error(
                            "You must confirm the payment first before submitting the confirmation."
                          )
                          return
                        }

                        if (!data.driver || !data.readyForPickupAt) return
                        setLoading("picked-up")
                        setAction("picked-up")

                        actionMutation(
                          {
                            merchantId,
                            orderId: orderId ?? "",
                            action: "picked-up",
                          },
                          {
                            onSuccess: () => {
                              setIsPickedupModalOpen(false)
                            },
                          }
                        )
                      }}
                      open={isPickedupModalOpen}
                      onOpenChange={setIsPickedupModalOpen}
                      isPaymentConfirm={isPaymentConfirm}
                      setIsPaymentConfirm={setIsPaymentConfirm}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default OrderComponent
