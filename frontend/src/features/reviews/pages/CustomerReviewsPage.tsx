import { useState } from "react"
import { MessageSquareText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import ReviewCard from "../components/ReviewCard"
import ReviewFormDialog from "../components/ReviewFormDialog"
import { useDeleteMerchantReview, useMyReviews } from "../hooks/useReviews"
import type { Review } from "../types/review"
import ReviewCardSkeleton from "../components/ReviewCardSkeleton"
import PageError from "@/components/common/PageError"

export default function CustomerReviewsPage() {
  const {
    data: reviews = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useMyReviews()
  const deleteReview = useDeleteMerchantReview()
  const [editingReview, setEditingReview] = useState<Review>()
  return (
    <main className="page-shell page-stack max-w-5xl">
      <header>
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <MessageSquareText className="size-4" />
          Your voice
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Your reviews
          </h1>
          {reviews.length > 0 && (
            <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Feedback you’ve shared after delivered orders.
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
            <MessageSquareText className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No reviews yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              After an order is delivered, you can share your experience from
              the merchant’s page.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid items-stretch gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              editable={review.targetType === "Merchant"}
              onEdit={() => setEditingReview(review)}
              onDelete={() => deleteReview.mutate(review._id)}
            />
          ))}
        </div>
      )}
      <ReviewFormDialog
        open={Boolean(editingReview)}
        onOpenChange={(open) => {
          if (!open) setEditingReview(undefined)
        }}
        review={editingReview}
      />
    </main>
  )
}
