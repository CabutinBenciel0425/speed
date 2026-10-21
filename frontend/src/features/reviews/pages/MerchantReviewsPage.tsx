import { MessageSquareText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import ReviewCard from "../components/ReviewCard"
import { useMerchantReviews, useSetReviewVisibility } from "../hooks/useReviews"
import ReviewCardSkeleton from "../components/ReviewCardSkeleton"
import PageError from "@/components/common/PageError"

export default function MerchantReviewsPage() {
  const {
    data: reviews = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useMerchantReviews()
  const visibility = useSetReviewVisibility()
  return (
    <main className="page-shell page-stack max-w-6xl">
      <header>
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <MessageSquareText className="size-4" />
          Merchant feedback
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Customer reviews
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Read customer feedback and control which reviews appear publicly.
        </p>
      </header>
      {isLoading ? (
        <ReviewCardSkeleton count={3} />
      ) : isError ? (
        <PageError
          message="Could not load customer reviews. Please try again."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <MessageSquareText className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No customer reviews yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Feedback will appear here after customers review delivered orders.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              canHide
              onToggleHide={() =>
                visibility.mutate({
                  reviewId: review._id,
                  isHidden: !review.isHidden,
                })
              }
            />
          ))}
        </div>
      )}
    </main>
  )
}
