import { Link } from "react-router-dom"
import {
  ArrowRight,
  Banknote,
  CircleCheck,
  Clock3,
  Package,
  ShoppingBag,
  Store,
  Tags,
  Truck,
  Users,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AdminStatCard from "../components/AdminStatCard"
import { useAdminDashboard } from "../hooks/useAdminData"
import PageError from "@/components/common/PageError"
import PageLoading from "@/components/common/PageLoading"

const metrics = [
  { label: "Customers", key: "totalCustomer", icon: Users, accent: "brand" },
  { label: "Merchants", key: "totalMerchants", icon: Store, accent: "brand" },
  { label: "Drivers", key: "totalDrivers", icon: Truck, accent: "neutral" },
  { label: "Orders", key: "totalOrders", icon: ShoppingBag, accent: "brand" },
  {
    label: "Pending orders",
    key: "pendingOrders",
    icon: Clock3,
    accent: "warning",
  },
  {
    label: "Completed orders",
    key: "completedOrders",
    icon: CircleCheck,
    accent: "success",
  },
  { label: "Products", key: "totalProducts", icon: Package, accent: "neutral" },
  {
    label: "Categories",
    key: "totalCategories",
    icon: Tags,
    accent: "neutral",
  },
] as const

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useAdminDashboard()
  return (
    <main className="page-shell page-stack max-w-7xl">
      <header>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Platform activity at a glance.
        </p>
      </header>
      {isLoading ? (
        <PageLoading label="Loading overview…" />
      ) : isError || !data ? (
        <PageError
          message="Could not load dashboard data. Please try again."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-5">
            {metrics.map(({ label, key, icon, accent }) => (
              <AdminStatCard
                key={key}
                label={label}
                value={data[key].toLocaleString()}
                icon={icon}
                accent={accent}
              />
            ))}
            <AdminStatCard
              label="Revenue"
              value={`₱${data.totalRevenue.toLocaleString()}`}
              icon={Banknote}
              accent="success"
            />
            <AdminStatCard
              label="Cancelled orders"
              value={data.cancelledOrders.toLocaleString()}
              icon={XCircle}
              accent="warning"
            />
          </div>
          <Card className="border-border/60 py-0 shadow-sm">
            <CardHeader className="border-b border-border/60 py-4">
              <CardTitle className="text-base">Quick access</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Review orders", "/admin/orders"],
                ["Review merchants", "/admin/merchants"],
                ["Manage categories", "/admin/categories"],
                ["View analytics", "/admin/analytics"],
              ].map(([label, to]) => (
                <Link
                  className="group flex min-h-11 items-center justify-between rounded-lg border border-border/60 px-3 text-sm transition-colors hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
                  key={to}
                  to={to}
                >
                  <span>{label}</span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </main>
  )
}
