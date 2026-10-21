import { Star } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { useDriverProfile, useDriverReviews } from "../hooks/useDriverData"

export default function DriverReviewsPage() {
  const { data: profile } = useDriverProfile()
  const { data: reviews = [], isLoading, isError, refetch } = useDriverReviews()
  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 p-4 sm:p-8">
      <header>
        <p className="text-sm font-medium text-primary">Customer feedback</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Your reviews
        </h1>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          {profile?.averageRating?.toFixed(1) ?? "0.0"} average ·{" "}
          {profile?.ratingCount ?? 0} ratings
        </p>
      </header>
      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading reviews…
        </p>
      ) : isError ? (
        <Card>
          <CardContent className="p-6 text-center text-sm">
            <p className="text-muted-foreground">Could not load reviews.</p>
            <button
              className="mt-2 text-primary underline"
              onClick={() => void refetch()}
            >
              Try again
            </button>
          </CardContent>
        </Card>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Star className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No reviews yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Customer feedback will show here after deliveries.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {review.reviewer
                      ? `${review.reviewer.firstName ?? "Customer"} ${review.reviewer.lastName ?? ""}`
                      : "Customer"}
                  </p>
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    {review.rating}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {review.comment || "No comment left."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(review.createdAt), "MMM d, yyyy")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
