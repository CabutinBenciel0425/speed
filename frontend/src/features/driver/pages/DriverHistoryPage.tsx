import { Link } from "react-router-dom"
import { format } from "date-fns"
import { ClipboardList, PackageCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDriverOrderHistory } from "../hooks/useDriverData"
import PageControls from "@/components/common/PageControls"
import OrderStatusBadge from "@/components/common/OrderStatusBadge"
import { useSearchParams } from "react-router-dom"
import PageError from "@/components/common/PageError"
import { formatDriverOrderAddress } from "../utils/formatDriverOrderAddress"

export default function DriverHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const { data, isLoading, isError, isFetching, refetch } = useDriverOrderHistory(page)
  const orders = data?.data ?? []
  const setPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(nextPage))
    setSearchParams(params)
  }
  return (
    <main className="page-shell page-stack max-w-5xl">
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
        <div className="space-y-3" role="status" aria-label="Loading delivery history">
          {Array.from({ length: 5 }, (_, index) => (
            <Card key={index}>
              <CardContent className="flex items-center gap-3 p-4 sm:p-5">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 max-w-full" />
                  <Skeleton className="h-3 w-64 max-w-full" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <PageError
          message="Could not load delivery history."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
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
                      {formatDriverOrderAddress(order)}
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
                  <OrderStatusBadge status={order.status} />
                  <span className="text-sm font-semibold">
                    ₱{(order.pricing?.deliveryFee ?? 0).toFixed(2)} earned
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <PageControls
        page={data?.pagination.page ?? page}
        pages={data?.pagination.pages ?? 0}
        total={data?.pagination.total ?? 0}
        onPageChange={setPage}
      />
    </main>
  )
}
