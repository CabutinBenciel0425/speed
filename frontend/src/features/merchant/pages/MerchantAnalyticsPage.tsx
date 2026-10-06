import { useMemo, useState } from "react"
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js"
import { Bar, Line } from "react-chartjs-2"
import {
  Banknote,
  ChartNoAxesCombined,
  CircleCheck,
  ShoppingCart,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type AnalyticsPeriod,
  useMerchantAnalytics,
} from "../hooks/useMerchantAnalytics"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler
)

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

const periods: Array<{ value: AnalyticsPeriod; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
]

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Banknote
}) {
  return (
    <Card className="gap-0 py-0 shadow-sm">
      <CardContent className="flex items-center justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="truncate text-2xl font-semibold tracking-tight">
            {value}
          </p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  )
}

function MerchantAnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d")
  const { data, isLoading, isError, refetch, isFetching } =
    useMerchantAnalytics(period)

  const trend = useMemo(() => {
    const days = Number(period.slice(0, -1))
    const values = new Map(data?.trend.map((item) => [item._id, item.revenue]))
    const dates = Array.from({ length: days }, (_, index) => {
      const date = new Date()
      date.setUTCHours(0, 0, 0, 0)
      date.setUTCDate(date.getUTCDate() - days + index + 1)
      return date.toISOString().slice(0, 10)
    })

    return {
      labels: dates.map((date) =>
        new Date(`${date}T00:00:00Z`).toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        })
      ),
      values: dates.map((date) => values.get(date) ?? 0),
    }
  }, [data?.trend, period])

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${currency.format(context.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#888", maxTicksLimit: 7, maxRotation: 0 },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(128,128,128,0.12)" },
        ticks: {
          color: "#888",
          callback: (value) => `₱${Number(value).toLocaleString()}`,
        },
        border: { display: false },
      },
    },
  }

  const barOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.parsed.x} sold`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "rgba(128,128,128,0.12)" },
        ticks: { color: "#888", precision: 0 },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#888", autoSkip: false },
        border: { display: false },
      },
    },
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <Card>
          <CardContent className="flex flex-col items-start gap-3 p-5">
            <p className="text-sm text-destructive">
              Could not load merchant analytics.
            </p>
            <button
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              Try again
            </button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your delivered sales and order performance.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="sr-only">Analytics date range</span>
          <select
            aria-label="Analytics date range"
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value as AnalyticsPeriod)
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-foreground sm:w-auto"
          >
            {periods.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="h-24 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : data ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Delivered revenue"
              value={currency.format(data.revenue)}
              icon={Banknote}
            />
            <StatCard
              label="Orders placed"
              value={data.total.toLocaleString()}
              icon={ShoppingCart}
            />
            <StatCard
              label="Average delivered order"
              value={currency.format(data.averageOrderValue)}
              icon={ChartNoAxesCombined}
            />
            <StatCard
              label="Completed orders"
              value={data.completed.toLocaleString()}
              icon={CircleCheck}
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,1fr)]">
            <Card className="min-w-0 shadow-sm">
              <CardHeader>
                <CardTitle>Revenue over time</CardTitle>
                <CardDescription>
                  Revenue from orders delivered during this period.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.revenue === 0 ? (
                  <div className="grid h-64 place-items-center text-sm text-muted-foreground">
                    No delivered sales in this period yet.
                  </div>
                ) : (
                  <div className="h-64 w-full sm:h-80">
                    <Line
                      data={{
                        labels: trend.labels,
                        datasets: [
                          {
                            data: trend.values,
                            borderColor: "#f97316",
                            backgroundColor: "rgba(249,115,22,0.12)",
                            fill: true,
                            tension: 0.35,
                            pointRadius: 2,
                            pointHoverRadius: 5,
                            pointBackgroundColor: "#f97316",
                          },
                        ],
                      }}
                      options={lineOptions}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="min-w-0 shadow-sm">
              <CardHeader>
                <CardTitle>Top products</CardTitle>
                <CardDescription>Ranked by quantity sold.</CardDescription>
              </CardHeader>
              <CardContent>
                {data.topProducts.length === 0 ? (
                  <div className="grid h-64 place-items-center text-sm text-muted-foreground">
                    No product sales in this period yet.
                  </div>
                ) : (
                  <div className="h-64 w-full sm:h-80">
                    <Bar
                      data={{
                        labels: data.topProducts.map((product) => product.name),
                        datasets: [
                          {
                            data: data.topProducts.map(
                              (product) => product.quantity
                            ),
                            backgroundColor: [
                              "rgba(249,115,22,0.85)",
                              "rgba(249,115,22,0.65)",
                              "rgba(249,115,22,0.5)",
                              "rgba(249,115,22,0.38)",
                              "rgba(249,115,22,0.26)",
                            ],
                            borderRadius: 6,
                            barThickness: 20,
                          },
                        ],
                      }}
                      options={barOptions}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Order status</CardTitle>
              <CardDescription>
                Orders created during this period.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Active", value: data.active, color: "bg-chart-3" },
                {
                  label: "Completed",
                  value: data.completed,
                  color: "bg-chart-2",
                },
                {
                  label: "Cancelled or rejected",
                  value: data.cancelled,
                  color: "bg-muted-foreground/50",
                },
              ].map((status) => (
                <div
                  key={status.label}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={`size-2.5 rounded-full ${status.color}`} />
                    {status.label}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {status.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : null}
    </main>
  )
}

export default MerchantAnalyticsPage
