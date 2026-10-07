import {
  Bell,
  CheckCheck,
  CircleCheck,
  CircleX,
  MapPin,
  PackageCheck,
  ShoppingBag,
  Truck,
  TriangleAlert,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type MerchantNotification,
  useMerchantNotifications,
} from "../hooks/useMerchantNotifications"

const icons: Record<string, LucideIcon> = {
  NEW_ORDER: ShoppingBag,
  ORDER_CANCELLED: CircleX,
  ORDER_REJECTED: CircleX,
  DRIVER_ASSIGNED: Truck,
  DRIVER_ARRIVED: MapPin,
  DRIVER_PICKED_UP: PackageCheck,
  ORDER_DELIVERED: CircleCheck,
  NO_DRIVER_FOUND: TriangleAlert,
}

function NotificationRow({
  notification,
  onRead,
}: {
  notification: MerchantNotification
  onRead: (notification: MerchantNotification) => void
}) {
  const Icon = icons[notification.type] ?? Bell
  const contents = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{notification.title}</span>
          {!notification.isRead && (
            <span
              className="size-2 rounded-full bg-primary"
              aria-label="Unread"
            />
          )}
        </span>
        <span className="mt-1 block text-sm text-muted-foreground">
          {notification.message}
        </span>
        <span className="mt-2 block text-xs text-muted-foreground">
          {new Date(notification.createdAt).toLocaleString()}
        </span>
      </span>
      {notification.order && (
        <span className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary sm:inline-flex">
          View order <span aria-hidden="true">→</span>
        </span>
      )}
    </>
  )
  const className = `flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/60 sm:items-center sm:p-4 ${
    notification.isRead ? "" : "bg-primary/[0.035]"
  }`

  return notification.order ? (
    <Link
      to={`/merchant/orders?orderId=${notification.order}`}
      onClick={() => onRead(notification)}
      className={className}
    >
      {contents}
    </Link>
  ) : (
    <article className={className}>{contents}</article>
  )
}

function MerchantNotificationsPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    markRead,
    markAllRead,
  } = useMerchantNotifications()

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Notifications
            </h1>
            {!!data?.unreadCount && (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {data.unreadCount} unread
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            New orders and important delivery updates for your store.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => markAllRead.mutate()}
            disabled={!data?.unreadCount || markAllRead.isPending}
          >
            <CheckCheck aria-hidden="true" /> Mark all read
          </Button>
        </div>
      </header>

      <Card className="max-h-[75vh] overflow-y-scroll shadow-sm">
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>
            Notifications are refreshed automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-lg bg-muted/40"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-destructive">
                Could not load notifications.
              </p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                Try again
              </Button>
            </div>
          ) : data?.notifications.length ? (
            <div className="space-y-1">
              {data.notifications.map((notification) => (
                <NotificationRow
                  key={notification._id}
                  notification={notification}
                  onRead={(item) => {
                    if (!item.isRead) markRead.mutate(item._id)
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <span className="mx-auto mb-3 grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground">
                <Bell className="size-5" aria-hidden="true" />
              </span>
              <p className="font-medium">You’re all caught up</p>
              <p className="mt-1 text-sm text-muted-foreground">
                New orders and delivery updates will show up here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

export default MerchantNotificationsPage
