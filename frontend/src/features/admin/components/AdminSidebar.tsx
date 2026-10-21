import { NavLink } from "react-router-dom"
import {
  Activity,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Package,
  Store,
  Tags,
  Truck,
  Users,
  Bell,
} from "lucide-react"
import { useAdminNotifications } from "../hooks/useAdminNotifications"

const links = [
  ["/admin/dashboard", "Overview", LayoutDashboard],
  ["/admin/orders", "Orders", ClipboardList],
  ["/admin/merchants", "Merchants", Store],
  ["/admin/drivers", "Drivers", Truck],
  ["/admin/users", "Users", Users],
  ["/admin/products", "Products", Package],
  ["/admin/categories", "Categories", Tags],
  ["/admin/reviews", "Reviews", MessageSquare],
  ["/admin/analytics", "Analytics", Activity],
] as const

export default function AdminSidebar() {
  const { data } = useAdminNotifications()
  const unreadCount = data?.unreadCount ?? 0
  const navigation = [
    ...links.slice(0, 8),
    ["/admin/notifications", "Notifications", Bell] as const,
    ...links.slice(8),
  ]
  return (
    <nav
      aria-label="Admin navigation"
      className="flex gap-1 overflow-x-auto border-b bg-background px-3 py-2 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:flex-col md:overflow-visible md:border-r md:border-b-0 md:px-4 md:py-6"
    >
      <div className="hidden px-3 pb-6 md:block">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Speed
        </p>
        <p className="mt-1 text-lg font-semibold tracking-tight">
          Administration
        </p>
      </div>
      <div className="flex gap-1 md:flex-col">
        {navigation.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted/70 hover:text-foreground md:w-full ${isActive ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"}`
            }
          >
            <Icon className="size-[18px] shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
            {label === "Notifications" && unreadCount > 0 && (
              <span className="ml-auto hidden min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[11px] leading-4 font-semibold text-primary-foreground sm:inline-block">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
