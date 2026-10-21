import { useState } from "react"
import { Activity, Banknote, CircleCheck, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AdminStatCard from "../components/AdminStatCard"
import { useAdminOrderAnalytics, useAdminRevenue } from "../hooks/useAdminData"
import PageError from "@/components/common/PageError"
import PageLoading from "@/components/common/PageLoading"

const periods = ["hour", "day", "week", "month"] as const

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<(typeof periods)[number]>("month")
  const { data, isLoading, isError, refetch, isFetching } = useAdminRevenue(period)
  const orders = useAdminOrderAnalytics()
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Paid order revenue by delivery date.
          </p>
        </div>
        <select
          aria-label="Revenue period"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={period}
          onChange={(event) => setPeriod(event.target.value as typeof period)}
        >
          {periods.map((item) => (
            <option key={item} value={item}>
              {item[0].toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>
      </header>
      {orders.data && (
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
          <AdminStatCard
            label="Active orders"
            value={orders.data.activeOrders.toLocaleString()}
            icon={Activity}
            accent="warning"
          />
          <AdminStatCard
            label="Completed"
            value={orders.data.completedOrders.toLocaleString()}
            icon={CircleCheck}
            accent="success"
          />
          <AdminStatCard
            label="Cancelled"
            value={orders.data.cancelledOrders.toLocaleString()}
            icon={XCircle}
            accent="neutral"
          />
        </div>
      )}
      {isLoading ? (
        <PageLoading label="Loading analytics…" />
      ) : isError ? (
        <PageError
          message="Could not load analytics. Please try again."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">
          No paid, delivered orders for this period.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((item) => (
            <Card
              key={item._id}
              className="border-border/60 py-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 py-3">
                <CardTitle className="text-sm font-medium">
                  {String(item._id)}
                </CardTitle>
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Banknote className="size-4" />
                </span>
              </CardHeader>
              <CardContent className="flex items-end justify-between gap-3 p-4">
                <span className="text-xl font-semibold tracking-tight">
                  ₱{item.revenue.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.orders} orders
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
