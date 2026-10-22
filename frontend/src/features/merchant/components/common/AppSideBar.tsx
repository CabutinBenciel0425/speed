import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { NavLink } from "react-router-dom"
import speedIconSmall from "@/assets/speed-sm.png"
import speedIconLogo from "@/assets/speed-s-logo.png"
import {
  Bell,
  ChartLine,
  House,
  LogOut,
  Settings,
  ShoppingBag,
  Star,
  Utensils,
} from "lucide-react"
import { useMerchantNotifications } from "../../hooks/useMerchantNotifications"
import { useLogout } from "@/features/auth/hooks/useLogout"

function AppSideBar() {
  const { isMobile, state, setOpenMobile } = useSidebar()
  const { data: notificationData } = useMerchantNotifications()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()
  const unreadCount = notificationData?.unreadCount ?? 0
  const iconsOnly = !isMobile && state === "collapsed"

  const navItems = [
    { to: "/merchant/dashboard", label: "Overview", Icon: House },
    { to: "/merchant/orders", label: "Orders", Icon: ShoppingBag },
    { to: "/merchant/reviews", label: "Reviews", Icon: Star },
    { to: "/merchant/menu", label: "Menu", Icon: Utensils },
    { to: "/merchant/analytics", label: "Analytics", Icon: ChartLine },
    { to: "/merchant/notifications", label: "Notifications", Icon: Bell },
    { to: "/merchant/settings", label: "Settings", Icon: Settings },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={iconsOnly ? "mb-2 px-1" : "mb-5"}>
        <div className="flex w-full items-center justify-center py-5">
          <NavLink to="/">
            <img
              src={iconsOnly ? speedIconLogo : speedIconSmall}
              alt="speed small"
              className={`${iconsOnly ? "w-8" : "w-30"} cursor-pointer`}
            />
          </NavLink>
        </div>
      </SidebarHeader>
      <SidebarContent
        className={`flex flex-col gap-3 ${iconsOnly ? "items-center px-1" : "px-5"}`}
      >
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/merchant/dashboard"}
            title={label}
            aria-label={label}
            onClick={() => {
              if (isMobile) setOpenMobile(false)
            }}
            className={({ isActive }) =>
              `relative flex min-h-11 ${iconsOnly ? "w-10 justify-center px-0" : "w-full gap-3 px-2"} items-center rounded-md text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground"
              }`
            }
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            {!iconsOnly && <span className="truncate">{label}</span>}
            {label === "Notifications" && unreadCount > 0 && (
              <span
                className={
                  iconsOnly
                    ? "absolute -top-1 -right-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
                    : "ml-auto grid min-h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground"
                }
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </SidebarContent>
      <SidebarFooter
        className={`border-t ${iconsOnly ? "items-center px-1 py-3" : "px-3 py-3"}`}
      >
        <Button
          type="button"
          variant="ghost"
          title={iconsOnly ? "Sign out" : undefined}
          aria-label="Sign out of merchant account"
          disabled={isLoggingOut}
          onClick={() => {
            if (isMobile) setOpenMobile(false)
            logout()
          }}
          className={`min-h-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive ${iconsOnly ? "size-10 p-0" : "w-full justify-start gap-3 px-3"}`}
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          {!iconsOnly && (
            <span>{isLoggingOut ? "Signing out…" : "Sign out"}</span>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSideBar
