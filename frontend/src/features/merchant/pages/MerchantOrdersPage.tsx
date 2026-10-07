import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { MapPin, PhilippinePeso } from "lucide-react"

type Merchant = { _id: string; merchantName: string }
type OrderCustomer =
  | {
      firstName?: string
      lastName?: string
      phoneNumber?: string
    }
  | string
type OrderStatus =
  | "Pending"
  | "Preparing"
  | "ReadyForPickup"
  | "PickedUp"
  | "Delivered"
  | "Cancelled"
  | "Rejected"
  | "NoDriverFound"
type MerchantOrder = {
  _id: string
  orderNumber: string
  customer: OrderCustomer
  items: Array<{
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
    notes?: string
  }>
  deliveryAddress: {
    street: string
    barangay: string
    city: string
    province: string
  }
  pricing: { total: number }
  payment: { method: string; status: string; transactionId?: string | null }
  status: OrderStatus
  driver: { _id: string; workingStatus: string } | string | null
  acceptedAt?: string | null
  driverAssignedAt?: string | null
  merchantReceivedAt?: string | null
  createdAt?: string
}

const terminalStatuses = ["Delivered", "PickedUp", "Cancelled", "Rejected"]

const fetchMerchant = async (): Promise<Merchant> => {
  const { data } = await axios.get<{ data: Merchant }>("/merchant/me")
  return data.data
}

const fetchOrders = async (merchantId: string): Promise<MerchantOrder[]> => {
  const { data } = await axios.get<{ data: MerchantOrder[] }>(
    `/merchant/${merchantId}/orders`
  )
  return data.data
}

function MerchantOrdersPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const focusedOrderId = searchParams.get("orderId")
  const negativeStatus = ["Cancelled", "Rejected", "NoDriverFound"]
  const isStatusNegative = (value: OrderStatus) => {
    return negativeStatus.includes(value)
  }
  const queryClient = useQueryClient()
  const merchantQuery = useQuery({
    queryKey: ["merchantProfile", user?.id],
    queryFn: fetchMerchant,
    enabled: Boolean(user?.id),
  })
  const merchantId = merchantQuery.data?._id
  const ordersQuery = useQuery({
    queryKey: ["merchantOrders", merchantId],
    queryFn: () => fetchOrders(merchantId!),
    enabled: Boolean(merchantId),
    refetchInterval: 30_000,
  })
  useEffect(() => {
    if (!focusedOrderId || !ordersQuery.data) return
    document
      .getElementById(`order-${focusedOrderId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [focusedOrderId, ordersQuery.data])

  const actionMutation = useMutation({
    mutationFn: async ({
      orderId,
      action,
    }: {
      orderId: string
      action: "accept" | "reject" | "cancel"
    }) => {
      if (!merchantId) throw new Error("Merchant profile is unavailable")
      const { data } = await axios.patch(
        `/merchant/${merchantId}/orders/${orderId}/${action}`,
        action === "cancel"
          ? { cancellationReason: "Cancelled by merchant" }
          : undefined
      )
      return data
    },
    onSuccess: (_data, variables) => {
      toast.success(`Order ${variables.action}ed`)
      void queryClient.invalidateQueries({
        queryKey: ["merchantOrders", merchantId],
      })
      void queryClient.invalidateQueries({ queryKey: ["merchantDashboard"] })
    },
    onError: () => toast.error("Could not update the order. Please try again."),
  })

  if (merchantQuery.isLoading || ordersQuery.isLoading) {
    return (
      <main className="w-full p-6 text-muted-foreground">Loading orders…</main>
    )
  }
  if (merchantQuery.isError || ordersQuery.isError) {
    return (
      <main className="w-full p-6">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="mt-3 text-destructive">
          Could not load orders. Refresh the page to try again.
        </p>
      </main>
    )
  }

  const orders = ordersQuery.data ?? []
  const customerName = (customer: OrderCustomer) =>
    typeof customer === "string"
      ? "Customer"
      : `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
        "Customer"

  return (
    <main className="w-full p-6 xl:px-20">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review incoming orders and manage their status.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void ordersQuery.refetch()}
          disabled={ordersQuery.isFetching}
        >
          Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No orders yet.
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4">
          {orders.map((order) => {
            const canRespond =
              order.status === "Pending" &&
              Boolean(
                order.driver && order.acceptedAt && order.driverAssignedAt
              ) &&
              (order.payment.method === "Cash" ||
                Boolean(order.payment.transactionId))
            const driverStatus =
              typeof order.driver === "object" && order.driver
                ? order.driver.workingStatus
                : undefined
            const canCancel =
              !terminalStatuses.includes(order.status) &&
              driverStatus !== "ArrivedAtMerchant" &&
              driverStatus !== "Delivering"
            const address = order.deliveryAddress
            return (
              <article
                key={order._id}
                id={`order-${order._id}`}
                className={`max-w-200 rounded-lg border bg-card p-5 ${
                  order._id === focusedOrderId ? "ring-2 ring-primary/50" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-primary">
                      Order #{order.orderNumber}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {customerName(order.customer)}
                      {order.createdAt &&
                        ` · ${new Date(order.createdAt).toLocaleString()}`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${isStatusNegative(order.status) ? "bg-red-200 text-red-700" : "bg-green-200 text-green-700"}`}
                  >
                    {order.status}
                  </span>
                </div>

                <ul className="my-4 divide-y">
                  {order.items.map((item, index) => (
                    <li
                      key={`${item.productName}-${index}`}
                      className="flex justify-between gap-4 py-2 text-sm"
                    >
                      <span>
                        {item.quantity} × {item.productName}
                        {item.notes && (
                          <span className="block text-muted-foreground">
                            Note: {item.notes}
                          </span>
                        )}
                      </span>
                      <span>₱{item.subtotal.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-[1fr_2fr]">
                  <div className="flex flex-row items-center justify-start gap-2">
                    <MapPin className="size-6 shrink-0 text-primary" />
                    <p>
                      Deliver to: {address.street}, {address.barangay},{" "}
                      {address.city}, {address.province}
                    </p>
                  </div>
                  <div className="flex flex-row items-center justify-start gap-2">
                    <PhilippinePeso className="size-6 text-primary" />
                    <p>
                      Payment: {order.payment.method} · {order.payment.status}
                    </p>
                  </div>
                  <p className="font-medium text-foreground">
                    Total: ₱{order.pricing.total.toFixed(2)}
                  </p>
                </div>

                {(canRespond || canCancel) && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                    {canRespond && (
                      <>
                        <Button
                          disabled={actionMutation.isPending}
                          onClick={() =>
                            actionMutation.mutate({
                              orderId: order._id,
                              action: "accept",
                            })
                          }
                        >
                          Accept order
                        </Button>
                        <Button
                          variant="outline"
                          disabled={actionMutation.isPending}
                          onClick={() =>
                            actionMutation.mutate({
                              orderId: order._id,
                              action: "reject",
                            })
                          }
                        >
                          Reject order
                        </Button>
                      </>
                    )}
                    {canCancel && (
                      <Button
                        variant="destructive"
                        disabled={actionMutation.isPending}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Cancel this order? The customer will be notified."
                            )
                          ) {
                            actionMutation.mutate({
                              orderId: order._id,
                              action: "cancel",
                            })
                          }
                        }}
                      >
                        Cancel order
                      </Button>
                    )}
                  </div>
                )}
                {order.status === "Pending" && !canRespond && (
                  <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">
                    Accept or reject becomes available after a driver has
                    accepted the delivery and any online payment is confirmed.
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default MerchantOrdersPage
