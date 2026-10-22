import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useDriverProfile, useDriverReviews } from "../hooks/useDriverData"
import DriverReviewCard from "../components/DriverReviewCard"
import ReviewCardSkeleton from "@/features/reviews/components/ReviewCardSkeleton"
import PageError from "@/components/common/PageError"
import PageControls from "@/components/common/PageControls"
import { useSearchParams } from "react-router-dom"

export default function DriverReviewsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const { data: profile } = useDriverProfile()
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useDriverReviews(page)
  const reviews = data?.data ?? []
  const setPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(nextPage))
    setSearchParams(params)
  }
  return (
    <main className="page-shell page-stack max-w-5xl">
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
        <ReviewCardSkeleton count={2} />
      ) : isError ? (
        <PageError
          message="Could not load your reviews. Please try again."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
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
        <div className="grid items-stretch gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <DriverReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}
      {!isLoading && !isError && reviews.length > 0 && (
        <PageControls
          page={data?.pagination.page ?? page}
          pages={data?.pagination.pages ?? 0}
          total={data?.pagination.total ?? 0}
          onPageChange={setPage}
          label="reviews"
        />
      )}
    </main>
  )
}
