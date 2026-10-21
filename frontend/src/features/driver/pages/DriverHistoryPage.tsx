import { Link } from "react-router-dom"
import { format } from "date-fns"
import { ClipboardList, PackageCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useDriverOrderHistory } from "../hooks/useDriverData"
import type { DriverOrder } from "../types/driver"

function address(order: DriverOrder) {
  const merchant =
    typeof order.merchant === "string" ? "Store" : order.merchant.merchantName
  return `${merchant} · ${[order.deliveryAddress?.barangay, order.deliveryAddress?.city].filter(Boolean).join(", ")}`
}

export default function DriverHistoryPage() {
  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useDriverOrderHistory()
  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 p-4 sm:p-8">
      <header>
        <p className="text-sm font-medium text-primary">Your activity</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Delivery history
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review completed and closed deliveries.
        </p>
      </header>
      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading delivery history…
        </p>
      ) : isError ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Could not load delivery history.
            </p>
            <button
              className="mt-2 text-sm text-primary underline"
              onClick={() => void refetch()}
            >
              Try again
            </button>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center p-10 text-center">
            <ClipboardList className="size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No completed deliveries yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your finished and cancelled orders will appear here.
            </p>
            <Link
              to="/driver"
              className="mt-4 text-sm text-primary hover:underline"
            >
              Back to deliveries
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <PackageCheck className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">Order #{order.orderNumber}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {address(order)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.createdAt
                        ? format(
                            new Date(order.createdAt),
                            "MMM d, yyyy · h:mm a"
                          )
                        : "Date unavailable"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <span className="rounded-full border px-2.5 py-1 text-xs">
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold">
                    ₱{(order.pricing?.deliveryFee ?? 0).toFixed(2)} earned
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
