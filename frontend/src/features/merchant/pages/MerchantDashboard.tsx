import {
  ArrowRight,
  Banknote,
  Clock3,
  PackageCheck,
  ShoppingBag,
  Store,
  Utensils,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useMerchantDashboard } from "../hooks/useMerchantDashboard"

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

const statusClass = (status: string) => {
  if (status === "Delivered") return "bg-chart-2/15 text-chart-2"
  if (status === "Pending") return "bg-chart-3/15 text-chart-3"
  if (["Cancelled", "Rejected", "NoDriverFound"].includes(status)) {
    return "bg-destructive/10 text-destructive"
  }
  return "bg-muted text-muted-foreground"
}

const formatStatus = (status: string) =>
  status.replace(/([A-Z])/g, " $1").trim()

function MerchantDashboard() {
  const { data, isLoading, isError, refetch, isFetching } =
    useMerchantDashboard()

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="flex flex-col items-start gap-3 p-5">
            <p className="text-sm text-destructive">
              Could not load your store overview.
            </p>
            <Button
              variant="outline"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (isLoading || !data) {
    return (
      <main className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
        <div className="h-20 animate-pulse rounded-xl bg-muted/50" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="h-24 animate-pulse bg-muted/40" />
          ))}
        </div>
        <Card className="h-72 animate-pulse bg-muted/40" />
      </main>
    )
  }

  const cards = [
    {
      label: "Sales today",
      value: currency.format(data.todayRevenue),
      icon: Banknote,
    },
    {
      label: "Orders today",
      value: data.todayOrders.toLocaleString(),
      icon: ShoppingBag,
    },
    {
      label: "Active orders",
      value: data.activeOrders.toLocaleString(),
      icon: PackageCheck,
    },
    {
      label: "Awaiting review",
      value: data.pendingOrders.toLocaleString(),
      icon: Clock3,
    },
  ]

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Store className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Store overview</p>
            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
              {data.merchant.merchantName}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex h-8 items-center gap-2 rounded-full px-3 text-sm ${
              data.merchant.isOpen
                ? "bg-chart-2/15 text-chart-2"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <span className="size-2 rounded-full bg-current" />
            {data.merchant.isOpen ? "Open" : "Closed"}
          </span>
          <Link
            to="/merchant/settings"
            className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Store settings <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/merchant/menu"
            aria-label="Manage menu"
            className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Utensils className="size-4" /> Menu
          </Link>
          <Link
            to="/merchant/analytics"
            className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Banknote className="size-4" /> Analytics
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="gap-0 py-0 shadow-sm">
            <CardContent className="flex items-center justify-between gap-3 p-4 sm:p-5">
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm text-muted-foreground">
                  {label}
                </p>
                <p className="truncate text-2xl font-semibold tracking-tight">
                  {value}
                </p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      {data.pendingOrders > 0 && (
        <Card className="border-primary/25 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Clock3 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-medium">
                  {data.pendingOrders} order
                  {data.pendingOrders === 1 ? "" : "s"} need review
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check the order details and update their status.
                </p>
              </div>
            </div>
            <Link
              to="/merchant/orders"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Review orders <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription className="mt-1">
              A quick look at the latest activity in your store.
            </CardDescription>
          </div>
          <Link
            to="/merchant/orders"
            className="inline-flex h-8 items-center gap-1 self-start text-sm font-medium text-primary hover:underline sm:self-auto"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {data.recentOrders.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <ShoppingBag className="mx-auto mb-3 size-6 text-muted-foreground" />
              <p className="font-medium">No orders yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                New orders will appear here as customers shop your store.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {data.recentOrders.map((order) => {
                const itemCount = order.items.reduce(
                  (total, item) => total + item.quantity,
                  0
                )
                return (
                  <article
                    key={order._id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                        <ShoppingBag className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          Order #{order.orderNumber}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {itemCount} item{itemCount === 1 ? "" : "s"}
                          {order.createdAt &&
                            ` · ${new Date(order.createdAt).toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 pl-[3.25rem] sm:pl-0">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(order.status)}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                      <span className="min-w-20 text-right font-semibold tabular-nums">
                        {currency.format(order.pricing?.total ?? 0)}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

export default MerchantDashboard
