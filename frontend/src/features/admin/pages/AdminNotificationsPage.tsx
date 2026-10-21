import {
  Bell,
  ArrowUpRight,
  CheckCheck,
  CircleDollarSign,
  MessageSquareText,
  Store,
  Trash2,
  Truck,
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
import { Skeleton } from "@/components/ui/skeleton"
import PageError from "@/components/common/PageError"
import { useAdminNotifications } from "../hooks/useAdminNotifications"
import type { AdminNotification } from "../types/notification"

const icons = {
  ADMIN_NEW_ORDER: CircleDollarSign,
  ADMIN_NEW_MERCHANT: Store,
  ADMIN_NEW_DRIVER: Truck,
  ADMIN_NEW_REVIEW: MessageSquareText,
} as const

function NotificationItem({
  item,
  onRead,
  onDelete,
}: {
  item: AdminNotification
  onRead: () => void
  onDelete: () => void
}) {
  const Icon = icons[item.type] ?? Bell
  return (
    <article
      className={`flex items-start gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/40 sm:items-center sm:p-4 ${item.isRead ? "" : "bg-primary/[0.035]"}`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border bg-muted/50 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 font-medium">
          {item.title}
          {!item.isRead && (
            <span
              className="size-2 rounded-full bg-primary"
              aria-label="Unread"
            />
          )}
        </div>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          {item.message}
        </p>
        <time
          className="mt-2 block text-xs text-muted-foreground"
          dateTime={item.createdAt}
        >
          {new Date(item.createdAt).toLocaleString()}
        </time>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {item.order && (
          <Link
            to="/admin/orders"
            onClick={onRead}
            aria-label="View orders"
            className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium text-primary hover:bg-muted sm:px-3"
          >
            <ArrowUpRight className="size-4" />
            <span className="sr-only sm:not-sr-only">View orders</span>
          </Link>
        )}
        {!item.isRead && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mark as read"
            onClick={onRead}
          >
            <CheckCheck className="size-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete notification"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </article>
  )
}

export default function AdminNotificationsPage() {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
    markRead,
    markAllRead,
    remove,
    clear,
  } = useAdminNotifications()

  return (
    <main className="page-shell page-stack max-w-6xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Platform activity</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Notifications
            </h1>
            {!!data?.unreadCount && (
              <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                {data.unreadCount} unread
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Updates for new orders, merchant registrations, and customer
            feedback.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
            <CheckCheck className="size-4" /> Mark all read
          </Button>
          <Button
            variant="outline"
            onClick={() => clear.mutate()}
            disabled={!data?.notifications.length || clear.isPending}
          >
            <Trash2 className="size-4" /> Clear all
          </Button>
        </div>
      </header>

      <Card className="overflow-hidden rounded-2xl shadow-sm">
        <CardHeader className="border-b py-4 sm:px-6">
          <CardTitle className="text-base">Recent activity</CardTitle>
          <CardDescription>
            Your latest platform updates appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-5">
          {isLoading ? (
            <div
              className="space-y-3"
              role="status"
              aria-label="Loading notifications"
            >
              {Array.from({ length: 5 }, (_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border p-4"
                >
                  <Skeleton className="size-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48 max-w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <PageError
              message="Could not load admin notifications."
              onRetry={() => void refetch()}
              isRetrying={isFetching}
            />
          ) : data?.notifications.length ? (
            <div className="space-y-1">
              {data.notifications.map((item) => (
                <NotificationItem
                  key={item._id}
                  item={item}
                  onRead={() => {
                    if (!item.isRead) markRead.mutate(item._id)
                  }}
                  onDelete={() => remove.mutate(item._id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <span className="grid size-12 place-items-center rounded-2xl border bg-muted/40 text-muted-foreground">
                <Bell className="size-5" />
              </span>
              <p className="mt-4 font-medium">You’re all caught up</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Important platform activity will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
