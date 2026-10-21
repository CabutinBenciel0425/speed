import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { NavLink, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Clock,
  Clock10,
  CreditCard,
  Hash,
  MapPin,
  NotepadText,
  Phone,
  Timer,
  User,
} from "lucide-react"
import { formatTimeAndDate } from "@/utils/timeUtils"
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter"
import MapComponent from "@/features/customer/components/MapComponent"
import { Separator } from "@/components/ui/separator"
import { useCustomerOrder } from "../hooks/useCustomerOrder"
import OrderStatusTimeline from "@/components/common/OrderStatusTimeline"
import { Button } from "@/components/ui/button"
import { useCustomerCancelOrder } from "../hooks/useCustomerCancelOrder"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const ADDED_TIME = 15

function CustomerOrderComponent() {
  const { orderId } = useParams()
  const { order, isLoading, error } = useCustomerOrder(orderId || "")
  const { mutate: cancelOrder } = useCustomerCancelOrder(orderId || "")
  const [cancellationReason, setCancellationReason] = useState("")

  const [openTextArea, setOpenTextArea] = useState(false)

  if (isLoading)
    return <p className="p-5 text-muted-foreground">Loading order…</p>
  if (error || !order)
    return <p className="p-5 text-destructive">Order not found.</p>

  const orderDate = order.createdAt

  const customerName = `${capitalizeFirstLetter(
    order.customer ? order.customer.firstName : ""
  )} ${capitalizeFirstLetter(order.customer ? order.customer.lastName : "")}`
  const customerLocation: [number, number] = [
    order.deliveryAddress?.location?.coordinates?.[1] ?? 0,
    order.deliveryAddress?.location?.coordinates?.[0] ?? 0,
  ]

  const handleCancelOrder = () => {
    if (
      !["Pending", "NoDriverFound"].includes(order?.status) &&
      order?.driverArrivedAtMerchantAt
    ) {
      toast.info(
        "Order cannot be cancel. Driver has arrived at the merchant location."
      )
    }
    if (orderId) {
      cancelOrder({ orderId, cancellationReason })
    }
  }
  let estimatedPrepTime1 = ""
  let estimatedPrepTime2 = ""
  if (order?.preparingAt && order?.estimatedPreparationTime) {
    const baseMs = new Date(order.preparingAt).getTime()
    const MS_PER_MIN = 60_000

    const prepMs = baseMs + order.estimatedPreparationTime * MS_PER_MIN
    const extendedMs = prepMs + ADDED_TIME * MS_PER_MIN

    estimatedPrepTime1 = formatTimeAndDate(prepMs)
    estimatedPrepTime2 = formatTimeAndDate(extendedMs)
  }
  return (
    <div className="flex w-full flex-col items-start gap-5 px-4 pb-10 sm:px-6 xl:flex-row xl:px-10">
      <div className="flex w-full min-w-0 flex-col gap-4 xl:max-w-7xl xl:flex-1">
        <NavLink
          to="/orders"
          className="flex w-fit flex-row items-center gap-2 py-3 text-muted-foreground"
        >
          <ArrowLeft className="size-5" />
          <span className="text-sm">Back to Orders</span>
        </NavLink>

        <Card className="flex w-full flex-col gap-5 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col justify-around gap-2">
            {order.status === "Pending" && (
              <span className="mb-3 w-fit rounded-lg bg-primary px-3 py-1.5 text-sm text-white sm:mb-5">
                New Order
              </span>
            )}
            <div
              className={`flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3 ${order.status === "Pending" ? "mb-3" : "mb-4 sm:mb-6"}`}
            >
              <h1 className="text-lg font-semibold break-all text-primary">
                #{order.orderNumber}
              </h1>
              <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-4 shrink-0" />
                <span>{orderDate && formatTimeAndDate(orderDate)}</span>
              </div>
            </div>
            <div className="flex flex-row items-center gap-3">
              <img
                src={order.customer.avatar}
                alt={order.customer.firstName}
                className="size-12 shrink-0 rounded-full object-cover sm:size-15"
              />
              <div className="flex min-w-0 flex-col justify-center gap-1 text-sm sm:gap-2">
                <p className="flex flex-row flex-wrap items-center gap-2 text-base font-semibold">
                  <span className="wrap-break-words">{customerName}</span>
                  <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    Customer
                  </span>
                </p>
                <p className="flex flex-row items-center gap-2 text-muted-foreground/80">
                  <Phone className="size-4 shrink-0" />
                  {order.customer.phoneNumber}
                </p>
              </div>
            </div>
            {order.customerNote && (
              <div className="mt-2 flex flex-row items-start gap-2 text-sm text-muted-foreground">
                <NotepadText className="size-5 shrink-0 sm:size-6" />
                <span className="wrap-break-words">{order.customerNote}</span>
              </div>
            )}
          </div>

          <div className="w-full rounded-md border border-muted-foreground/30 p-3 lg:w-80 lg:shrink-0">
            <div className="border-b border-b-muted-foreground/30 pb-2">
              <h2 className="text-sm font-semibold">Order Summary</h2>
              <p className="flex flex-row items-center justify-between">
                <span className="text-muted-foreground">
                  {(order.items?.length ?? 0) > 1
                    ? `${order.items?.length ?? 0} items`
                    : `${order.items?.length ?? 0} item`}
                </span>
                <span className="text-base font-bold">
                  ₱ {order.pricing?.total}
                </span>
              </p>
            </div>

            <div className="border-b border-b-muted-foreground/30 py-2">
              <p className="flex flex-row items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ₱ {order.pricing.subtotal}
                </span>
              </p>
              <p className="flex flex-row items-center justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ₱ {order.pricing?.deliveryFee}
                </span>
              </p>
            </div>

            <div className="pt-2">
              <p className="flex flex-row items-center justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-xl font-bold text-primary sm:text-2xl">
                  ₱ {order.pricing?.total}
                </span>
              </p>
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card className="w-full px-4 sm:px-5">
          <h2 className="text-lg font-bold">Order Items</h2>
          <div className="divide-y divide-muted-foreground/30 rounded-md border border-muted-foreground/30 px-3 sm:px-5">
            {order.items.map((item) => (
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
        <Card className="w-full divide-y px-4 sm:px-5">
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
                    {customerName !== order.deliveryAddress.recipientName && (
                      <span className="wrap-break-words text-base">
                        <span className="text-sm text-muted-foreground">
                          Recipient name:
                        </span>{" "}
                        <span className="text-base">
                          {order.deliveryAddress.recipientName}
                        </span>
                      </span>
                    )}
                  </div>
                </p>
                <p className="ml-8 text-xs text-muted-foreground">
                  {order.customer.phoneNumber}
                </p>
              </div>

              <div className="flex flex-row gap-2">
                <MapPin className="size-6 shrink-0" />
                <div className="min-w-0">
                  <p className="wrap-break-words text-sm text-muted-foreground">
                    {order.deliveryAddress.houseOrUnitNumber}{" "}
                    {order.deliveryAddress.street}
                  </p>
                  <p className="wrap-break-words text-sm text-muted-foreground">
                    {order.deliveryAddress.barangay},{" "}
                    {order.deliveryAddress.city},
                  </p>
                  <p className="wrap-break-words text-sm text-muted-foreground">
                    {order.deliveryAddress.province || ""}{" "}
                    {order.deliveryAddress.region}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full rounded-md border border-muted-foreground/30 p-3 md:w-72 md:shrink-0 lg:w-md">
              <MapComponent
                position={customerLocation}
                active
                height={"120px"}
              />
            </div>
          </div>
        </Card>

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
                {order.payment.method === "Cash" ? (
                  <div className="flex flex-row items-center gap-2">
                    <Timer className="size-4" />
                    <span className="text-sm text-muted-foreground">
                      Cash on Delivery
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-row items-center gap-2">
                    <CreditCard className="size-4" />
                    <span className="text-sm text-muted-foreground">
                      Online Payment
                    </span>
                  </div>
                )}
                <span
                  className={`w-fit rounded-lg ${order.payment.status === "Cancelled" ? "bg-red-500" : order.payment.status === "Paid" ? "bg-green-400" : "bg-primary"} px-2 py-0.5 text-xs text-white`}
                >
                  {order.payment.status}
                </span>
              </div>
              <div className="flex flex-row items-start gap-2">
                <Hash className="mt-0.5 size-4 shrink-0" />
                <span className="text-sm break-all text-muted-foreground">
                  Transaction ID - {order.payment.transactionId || "--"}
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
              <div
                className={`flex ${order?.deliveredAt && order.status === "Delivered" ? "w-1/2" : "w-1/3"} flex-col items-center justify-center gap-2`}
              >
                <p className="text-sm text-muted-foreground">Preparation</p>
                <p className="text-base font-semibold sm:text-lg">
                  {order.estimatedPreparationTime} mins
                </p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div
                className={`flex ${order?.deliveredAt && order.status === "Delivered" ? "w-1/2" : "w-2/3"} flex-col items-center justify-center gap-2`}
              >
                <p className="text-sm text-muted-foreground">Delivery</p>
                <p className="text-base font-semibold sm:text-lg">
                  {!order.deliveredAt &&
                  order.status !== "Delivered" &&
                  order.status !== "Cancelled" &&
                  order.status !== "Rejected"
                    ? `${estimatedPrepTime1} - ${estimatedPrepTime2}`
                    : order.deliveredAt
                      ? formatTimeAndDate(order.deliveredAt)
                      : "—"}
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
              <p className="wrap-break-words">{order.customerNote}</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex w-full flex-col items-stretch gap-4 xl:mt-15 xl:w-104 xl:shrink-0 2xl:w-lg">
        <OrderStatusTimeline order={order} />

        {["Pending", "NoDriverFound"].includes(order?.status) &&
          !order?.driverArrivedAtMerchantAt && (
            <Card className="w-full divide-y px-2">
              <CardHeader>
                <CardTitle className="py-2 text-base font-semibold">
                  {order.driverMatchingStatus === "NoDriverFound"
                    ? "Retry Searching for driver or cancel this order"
                    : order.driverMatchingStatus === "Assigned" &&
                        !order.preparingAt
                      ? "Merchant is reviewing your order. Once accepted, driver can go to the merchant's location."
                      : "Once driver has arrived at the merchant location, you cannot cancel this order anymore."}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-3 pt-3">
                {/* {!!order.driverArrivedAtMerchantAt && (
                <CardDescription>
                  Driver has arrived at merchant. Order cannot be cancel
                </CardDescription>
              )} */}
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <Button
                    className="flex-1 cursor-pointer rounded-md border border-primary/50 py-4 text-base text-primary hover:text-primary/50 sm:py-6 sm:text-lg"
                    disabled={
                      !!(
                        !["Pending", "NoDriverFound"].includes(order?.status) &&
                        order?.driverArrivedAtMerchantAt
                      )
                    }
                    variant="ghost"
                    onClick={() => setOpenTextArea(true)}
                  >
                    Cancel this order
                  </Button>
                  {order.driverMatchingStatus === "NoDriverFound" && (
                    <Button className="flex-1 cursor-pointer rounded-md py-5 text-base sm:py-6 sm:text-lg">
                      <NavLink to={`/orders/tracking/${orderId}`}>
                        Retry searching
                      </NavLink>
                    </Button>
                  )}
                  {order.driverMatchingStatus === "Searching" && (
                    <Button className="flex-1 cursor-pointer rounded-md py-5 text-base sm:py-6 sm:text-lg">
                      <NavLink to={`/orders/tracking/${orderId}`}>
                        Order Tracking Page
                      </NavLink>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {openTextArea &&
          ["Pending", "NoDriverFound"].includes(order?.status) &&
          !order?.driverArrivedAtMerchantAt && (
            <Card className="w-full divide-y px-2">
              <CardHeader>
                <CardTitle className="py-2">Cancellation Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={cancellationReason}
                  placeholder="Type here..."
                  className="h-25 w-full resize-none"
                  onChange={(e) => setCancellationReason(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex w-full flex-row items-center gap-2">
                <Button
                  variant={"outline"}
                  className={"flex-1 rounded-md py-4"}
                  onClick={() => setCancellationReason("")}
                >
                  Reset
                </Button>
                <Button
                  className={"flex-1 rounded-md py-4"}
                  onClick={handleCancelOrder}
                >
                  Confirm Cancel
                </Button>
              </CardFooter>
            </Card>
          )}
      </div>
    </div>
  )
}

export default CustomerOrderComponent
