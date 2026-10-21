import { format } from "date-fns"
import { BadgeCheck, CalendarDays, PackageCheck, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { DriverReview } from "../types/driver"

export default function DriverReviewCard({
  review,
}: {
  review: DriverReview
}) {
  const reviewerName =
    `${review.reviewer?.firstName ?? "Customer"} ${review.reviewer?.lastName ?? ""}`.trim()
  const initials = reviewerName
    .split(/\s+/)
    .map((namePart) => namePart[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  const createdAt = new Date(review.createdAt)
  const dateLabel = Number.isNaN(createdAt.getTime())
    ? "Recent review"
    : format(createdAt, "MMM d, yyyy")
  const order = typeof review.order === "object" ? review.order : undefined
  const rating = Math.max(0, Math.min(5, review.rating))

  return (
    <article className="group h-full rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-5">
      <div className="flex h-full flex-col gap-4">
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-11 ring-2 ring-background shadow-sm sm:size-12">
              <AvatarImage
                src={review.reviewer?.avatar}
                alt={reviewerName}
              />
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold tracking-tight sm:text-base">
                {reviewerName}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" />
                <time dateTime={review.createdAt}>{dateLabel}</time>
              </p>
            </div>
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5 text-sm font-semibold tabular-nums"
            aria-label={`${rating} out of 5 stars`}
          >
            <Star className="size-4 fill-amber-500 text-amber-500" />
            {rating.toFixed(1)}
          </span>
        </header>

        <div className="flex items-center gap-0.5" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              className={`size-4 ${index < rating ? "fill-amber-400 text-amber-500" : "text-muted-foreground/25"}`}
            />
          ))}
          <span className="ml-2 text-xs font-medium text-muted-foreground">
            {rating === 5 ? "Excellent" : rating >= 4 ? "Great" : rating >= 3 ? "Good" : "Customer rating"}
          </span>
        </div>

        <p className="min-h-12 flex-1 text-sm leading-6 break-words whitespace-pre-wrap text-foreground/85">
          {review.comment || "The customer left a rating without a comment."}
        </p>

        {order?.orderNumber && (
          <footer className="flex items-center gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PackageCheck className="size-4" />
            </span>
            <span className="min-w-0 truncate">
              <span className="font-medium text-foreground/80">Verified delivery</span>
              <span className="mx-1.5 text-border">·</span>
              Order #{order.orderNumber}
            </span>
            <BadgeCheck className="ml-auto size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          </footer>
        )}
      </div>
    </article>
  )
}
