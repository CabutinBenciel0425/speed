import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { NavLink, useSearchParams } from "react-router-dom"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { ChevronRight, MapPin, PhilippinePeso } from "lucide-react"

type OrderMerchant =
  | {
      _id: string
      merchantName?: string
      logo: string
      isOpen: boolean
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
type CustomerOrder = {
  _id: string
  orderNumber: string
  merchant: OrderMerchant
  items: Array<{
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
    notes?: string
  }>
  deliveryAddress: {
    houseOrUnitNumber: string
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

const fetchOrders = async (userId: string): Promise<CustomerOrder[]> => {
  const { data } = await axios.get<{ data: CustomerOrder[] }>(
    `/auth/${userId}/orders`
  )

  return data.data
}

function CustomerOrdersPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const focusedOrderId = searchParams.get("orderId")
  const negativeStatus = ["Cancelled", "Rejected", "NoDriverFound"]
  const isStatusNegative = (value: OrderStatus) => {
    return negativeStatus.includes(value)
  }

  const userId = user?.id
  const ordersQuery = useQuery({
    queryKey: ["customerOrders", userId],
    queryFn: () => fetchOrders(userId!),
    enabled: Boolean(userId),
    refetchInterval: 30_000,
  })
  useEffect(() => {
    if (!focusedOrderId || !ordersQuery.data) return
    document
      .getElementById(`order-${focusedOrderId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [focusedOrderId, ordersQuery.data])

  if (ordersQuery.isLoading) {
    return (
      <main className="w-full p-6 text-muted-foreground">Loading orders…</main>
    )
  }
  if (ordersQuery.isError) {
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
  return (
    <main className="w-full p-6 2xl:px-20">
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
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${isStatusNegative(order.status) ? "bg-red-200 text-red-700" : "bg-green-200 text-green-700"}`}
                  >
                    {order.status}
                  </span>
                </div>

                <ul className="my-4 mb-10 divide-y">
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

                {typeof order.merchant !== "string" && (
                  <div className="mb-2 flex min-w-0 items-center gap-1 lg:-mt-2 2xl:-mt-6">
                    <img
                      src={order.merchant.logo}
                      alt={order.merchant.merchantName}
                      className="m-0 -ml-2.5 size-10 shrink-0 rounded-md object-cover p-0 sm:size-10 2xl:size-14"
                    />

                    <NavLink
                      to={`/merchant/${order.merchant._id}`}
                      className="flex min-w-0 items-center gap-1 text-xs font-semibold sm:text-sm"
                    >
                      <span className="text-base">
                        {order.merchant.merchantName}
                      </span>

                      <ChevronRight className="size-4 shrink-0" />
                    </NavLink>
                  </div>
                )}

                <div className="">
                  <div className="mb-5 grid gap-1 text-sm text-muted-foreground sm:grid-cols-[1fr_2fr]">
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
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Total: ₱{order.pricing.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default CustomerOrdersPage
