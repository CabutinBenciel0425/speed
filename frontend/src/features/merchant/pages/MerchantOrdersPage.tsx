import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { NavLink, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import getSocketUrl from "@/utils/socketUrl"

import { MapPin, PhilippinePeso } from "lucide-react"
import type { Socket } from "socket.io-client"
import { useAuthStore } from "@/store/authStore"
import { io } from "socket.io-client"
import { toast } from "sonner"
import PageControls from "@/components/common/PageControls"
import OrderStatusBadge from "@/components/common/OrderStatusBadge"
import OrderListSkeleton from "@/components/common/OrderListSkeleton"
import PageError from "@/components/common/PageError"
import { useMerchantOrders } from "../hooks/useMerchantOrders"
import { formatOrderCustomer } from "../utils/formatOrderCustomer"

function MerchantOrdersPage() {
  const { isAuthenticated, user } = useAuth()
  const activeRoleState = useAuthStore((state) => state.activeRole)
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const focusedOrderId = searchParams.get("orderId")
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const socketRef = useRef<Socket | null>(null)
  const { merchantQuery, merchantId, ordersQuery } = useMerchantOrders(
    user?.id,
    page
  )

  useEffect(() => {
    if (!isAuthenticated || activeRoleState !== "Merchant") return
    const socket = io(getSocketUrl(), {
      withCredentials: true,
      auth: { activeRole: activeRoleState },
    })
    socketRef.current = socket

    const refreshOrder = () => {
      void queryClient.invalidateQueries({ queryKey: ["merchantDashboard"] })
      void queryClient.invalidateQueries({ queryKey: ["merchantOrders"] })
      void queryClient.invalidateQueries({ queryKey: ["merchantOrder"] })
    }
    socket.on("order:merchantAccepted", refreshOrder)
    socket.on("driver:arrived-at-merchant", refreshOrder)
    socket.on("order:ready", () => {
      refreshOrder()
    })
    socket.on("order:pickedUp", () => {
      refreshOrder()
    })
    socket.on("order:delivered", () => {
      refreshOrder()
    })
    socket.on("order:cancel", () => {
      refreshOrder()
    })
    socket.on("order:rejected", refreshOrder)

    socket.on("socket:error", ({ message }: { message?: string }) =>
      toast.error(message ?? "A driver action failed.")
    )
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [activeRoleState, isAuthenticated, queryClient])

  useEffect(() => {
    if (!focusedOrderId || !ordersQuery.data) return
    document
      .getElementById(`order-${focusedOrderId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [focusedOrderId, ordersQuery.data])

  if (merchantQuery.isLoading || ordersQuery.isLoading) {
    return <OrderListSkeleton />
  }
  if (merchantQuery.isError || ordersQuery.isError) {
    return (
      <main className="page-shell page-stack max-w-7xl">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <PageError
          message="Could not load your orders. Please try again."
          onRetry={() => {
            void merchantQuery.refetch()
            if (merchantId) void ordersQuery.refetch()
          }}
          isRetrying={merchantQuery.isFetching || ordersQuery.isFetching}
        />
      </main>
    )
  }

  const orders = ordersQuery.data?.data ?? []
  const setPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(nextPage))
    setSearchParams(params)
  }
  return (
    <main className="page-shell page-stack max-w-7xl">
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
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
          {orders.map((order) => {
            const address = order.deliveryAddress
            return (
              <NavLink
                to={`/merchant/orders/${order._id}`}
                key={order._id}
                className="block w-full"
              >
                <article
                  id={`order-${order._id}`}
                  className={`w-full rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:p-5 ${
                    order._id === focusedOrderId ? "ring-2 ring-primary/50" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-primary">
                        Order #{order.orderNumber}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {formatOrderCustomer(order.customer)}
                        {order.createdAt &&
                          ` · ${new Date(order.createdAt).toLocaleString()}`}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
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
                        Payment:{" "}
                        {order.payment.method === "QRPh"
                          ? "QR Ph"
                          : "Cash on delivery"}{" "}
                        · {order.payment.status}
                      </p>
                    </div>
                    <p className="font-medium text-foreground">
                      Total: ₱{order.pricing.total.toFixed(2)}
                    </p>
                  </div>
                </article>
              </NavLink>
            )
          })}
        </div>
      )}
      <PageControls
        page={ordersQuery.data?.pagination.page ?? page}
        pages={ordersQuery.data?.pagination.pages ?? 0}
        total={ordersQuery.data?.pagination.total ?? 0}
        onPageChange={setPage}
      />
    </main>
  )
}

export default MerchantOrdersPage
