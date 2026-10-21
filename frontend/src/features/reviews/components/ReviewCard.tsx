import { format } from "date-fns"
import {
  CalendarDays,
  BadgeCheck,
  Eye,
  EyeOff,
  MessageSquareText,
  PackageCheck,
  Star,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Review } from "../types/review"

export default function ReviewCard({
  review,
  editable = false,
  canHide = false,
  onEdit,
  onDelete,
  onToggleHide,
}: {
  review: Review
  editable?: boolean
  canHide?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onToggleHide?: () => void
}) {
  const reviewer =
    typeof review.reviewer === "string" ? undefined : review.reviewer
  const order = typeof review.order === "string" ? undefined : review.order
  const reviewee =
    typeof review.reviewee === "string" ? undefined : review.reviewee
  const name =
    `${reviewer?.firstName ?? "Speed"} ${reviewer?.lastName ?? "customer"}`.trim()
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  const date = review.createdAt ? new Date(review.createdAt) : null
  const dateLabel = date && !Number.isNaN(date.getTime())
    ? format(date, "MMM d, yyyy")
    : "Recent review"
  const rating = Math.max(0, Math.min(5, review.rating))

  return (
    <Card className="group h-full overflow-hidden rounded-2xl border-border/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-11 ring-2 ring-background shadow-sm sm:size-12">
              <AvatarImage src={reviewer?.avatar} alt={name} />
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight sm:text-base">
                {name}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" />
                  {dateLabel}
                </span>
              </div>
              {review.targetType === "Merchant" && reviewee?.merchantName && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {reviewee.merchantName}
                </p>
              )}
              {review.targetType === "Driver" &&
                reviewee &&
                typeof reviewee !== "string" && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  Driver: {reviewee.firstName} {reviewee.lastName}
                </p>
              )}
            </div>
          </div>
          {canHide && (
            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${review.isHidden ? "border-border bg-muted text-muted-foreground" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"}`}
            >
              {review.isHidden ? "Hidden" : "Visible"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              className={`size-4 ${index < rating ? "fill-amber-400 text-amber-500" : "text-muted-foreground/25"}`}
            />
          ))}
          <span className="ml-2 text-xs font-medium text-muted-foreground">
            {rating === 5
              ? "Excellent"
              : rating >= 4
                ? "Great"
                : rating >= 3
                  ? "Good"
                  : "Customer rating"}
          </span>
        </div>
        <p className="min-h-10 flex-1 text-sm leading-6 break-words whitespace-pre-wrap text-foreground/85">
          {review.comment || "The customer left a rating without a comment."}
        </p>
        {order?.orderNumber && (
          <div className="flex items-center gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PackageCheck className="size-4" />
            </span>
            <span className="min-w-0 truncate">
              <span className="font-medium text-foreground/80">
                Verified order
              </span>
              <span className="mx-1.5 text-border">·</span>
              #{order.orderNumber}
            </span>
            <BadgeCheck className="ml-auto size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          </div>
        )}
        {(editable || canHide) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
            {editable && (
              <Button
                size="sm"
                variant="outline"
                className="h-10 flex-1 rounded-xl font-medium shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                onClick={onEdit}
              >
                <MessageSquareText className="size-4" />
                Edit review
              </Button>
            )}
            {editable && (
              <Button
                size="sm"
                variant="outline"
                className="h-10 flex-1 rounded-xl border-destructive/25 font-medium text-destructive shadow-sm transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="size-4" />
                Delete review
              </Button>
            )}
            {canHide && (
              <Button
                size="sm"
                variant="outline"
                className="h-10 w-full rounded-xl font-medium shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                onClick={onToggleHide}
              >
                {review.isHidden ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
                {review.isHidden ? "Show to customers" : "Hide from customers"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
