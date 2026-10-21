import {
  Bike,
  ClipboardList,
  LayoutDashboard,
  Star,
  UserRound,
} from "lucide-react"
import { NavLink, Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { getRoleHomePath } from "@/utils/roleRoutes"
import PageLoading from "@/components/common/PageLoading"

const links = [
  ["/driver", "Deliveries", LayoutDashboard],
  ["/driver/history", "History", ClipboardList],
  ["/driver/reviews", "Reviews", Star],
  ["/driver/profile", "Profile", UserRound],
] as const

export default function DriverLayout() {
  const { activeRole, isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <PageLoading label="Checking your session…" className="min-h-screen" />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (activeRole !== "Driver")
    return <Navigate to={getRoleHomePath(activeRole)} replace />

  return (
    <div className="min-h-screen w-full overflow-x-clip">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Bike className="size-5 text-primary" /> Speed Driver
          </div>
          <nav
            aria-label="Driver navigation"
            className="flex gap-1 overflow-x-auto"
          >
            {links.map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/driver"}
                className={({ isActive }) =>
                  `inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
