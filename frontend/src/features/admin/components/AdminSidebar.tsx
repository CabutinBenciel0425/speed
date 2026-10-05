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
} from "lucide-react"

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
  return (
    <nav
      aria-label="Admin navigation"
      className="flex gap-1 overflow-x-auto px-3 py-2 md:w-60 md:shrink-0 md:flex-col md:overflow-visible md:border-r md:px-4 md:py-6"
    >
      <div className="hidden px-3 pb-5 text-lg font-semibold md:block">
        Speed Admin
      </div>
      {links.map(([to, label, Icon]) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${isActive ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground"}`
          }
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
