import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { NavLink, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { ChevronRight, MapPin, PhilippinePeso } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { toast } from "sonner"
import type { Socket } from "socket.io-client"
import { io } from "socket.io-client"
import PageControls from "@/components/common/PageControls"
import OrderStatusBadge from "@/components/common/OrderStatusBadge"
import OrderListSkeleton from "@/components/common/OrderListSkeleton"
import PageError from "@/components/common/PageError"
import { useCustomerOrders } from "../hooks/useCustomerOrders"

function CustomerOrdersPage() {
  const { isAuthenticated, user } = useAuth()
  const activeRoleState = useAuthStore((state) => state.activeRole)
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const focusedOrderId = searchParams.get("orderId")
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const socketRef = useRef<Socket | null>(null)
  const ordersQuery = useCustomerOrders(user?.id, page)

  useEffect(() => {
    if (!isAuthenticated || activeRoleState !== "Customer") return
    const socket = io(
      import.meta.env.DEV ? "http://localhost:5050" : undefined,
      { withCredentials: true, auth: { activeRole: activeRoleState } }
    )
    socketRef.current = socket

    const refreshOrder = () => {
      void queryClient.invalidateQueries({ queryKey: ["existingOrder"] })
      void queryClient.invalidateQueries({ queryKey: ["customerOrders"] })
      void queryClient.invalidateQueries({ queryKey: ["customerOrder"] })
    }
    socket.on("order:merchantAccepted", refreshOrder)
    socket.on("driver:arrived-at-merchant", refreshOrder)
    socket.on("order:ready", refreshOrder)
    socket.on("order:pickedUp", refreshOrder)
    socket.on("order:pickupConfirmation", () => {
      toast.info("The store confirmed the handover")
      refreshOrder()
    })
    socket.on("order:delivered", refreshOrder)
    socket.on("order:cancel", refreshOrder)
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

  if (ordersQuery.isLoading) {
    return (
      <OrderListSkeleton />
    )
  }
  if (ordersQuery.isError) {
    return (
      <main className="page-shell page-stack max-w-7xl">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <PageError
          message="Could not load your orders. Please try again."
          onRetry={() => void ordersQuery.refetch()}
          isRetrying={ordersQuery.isFetching}
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
                key={order._id}
                to={`${order._id}`}
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

                  {typeof order.merchant !== "string" && (
                    <div className="mb-2 flex min-w-0 items-center gap-1 lg:-mt-2 2xl:-mt-6">
                      <img
                        src={order.merchant.logo}
                        alt={order.merchant.merchantName}
                        className="m-0 -ml-2.5 size-10 shrink-0 rounded-md object-cover p-0 sm:size-10 2xl:size-14"
                      />

                      <span className="flex min-w-0 items-center gap-1 text-xs font-semibold sm:text-sm">
                        <span className="truncate text-base">
                          {order.merchant.merchantName}
                        </span>
                        <ChevronRight className="size-4 shrink-0" />
                      </span>
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
                          Payment: {order.payment.method} ·{" "}
                          {order.payment.status}
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

export default CustomerOrdersPage
