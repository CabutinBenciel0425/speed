import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { MessageSquare, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import axios from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
import type { PaginatedResponse } from "@/types/pagination"
import type { Order } from "@/types/order"
import ReviewCard from "./ReviewCard"
import ReviewFormDialog from "./ReviewFormDialog"
import {
  useDeleteMerchantReview,
  useMyReviews,
  usePublicMerchantReviews,
} from "../hooks/useReviews"
import type { Review } from "../types/review"
import ReviewCardSkeleton from "./ReviewCardSkeleton"
import PageError from "@/components/common/PageError"

export default function MerchantReviewsSection({
  merchantId,
}: {
  merchantId: string
}) {
  const user = useAuthStore((state) => state.user)
  const authenticated = useAuthStore((state) => state.isAuthenticated)
  const {
    data: reviews = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = usePublicMerchantReviews(merchantId)
  const { data: myReviews = [] } = useMyReviews(authenticated)
  const deleteReview = useDeleteMerchantReview()
  const [selectedReview, setSelectedReview] = useState<Review>()
  const [orderToReview, setOrderToReview] = useState<string>()
  const ownMerchantReviews = useMemo(
    () =>
      myReviews.filter(
        (review) =>
          review.targetType === "Merchant" &&
          (typeof review.reviewee === "string"
            ? review.reviewee
            : review.reviewee._id) === merchantId
      ),
    [merchantId, myReviews]
  )
  const ownReviewByOrder = new Set(
    ownMerchantReviews.map((review) =>
      typeof review.order === "string" ? review.order : review.order._id
    )
  )
  const ordersQuery = useQuery({
    queryKey: ["customerMerchantOrdersForReview", user?.id, merchantId],
    queryFn: async () =>
      (
        await axios.get<PaginatedResponse<Order>>(
          "/orders?page=1&limit=50&sort=-createdAt"
        )
      ).data.data,
    enabled: authenticated && Boolean(user?.id),
    staleTime: 60_000,
  })
  const eligibleOrders = (ordersQuery.data ?? []).filter((order) => {
    const orderMerchant =
      typeof order.merchant === "string" ? order.merchant : order.merchant?._id
    return (
      orderMerchant === merchantId &&
      order.status === "Delivered" &&
      !ownReviewByOrder.has(order._id)
    )
  })

  return (
    <section
      className="mx-auto w-full max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8"
      id="reviews"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <MessageSquare className="size-4" />
            Customer feedback
          </p>
          <h2 className="mt-1 text-2xl font-semibold">
            Reviews{" "}
            <span className="text-base font-normal text-muted-foreground">
              ({reviews.length})
            </span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Experiences shared by customers who ordered here.
          </p>
        </div>
        {authenticated && ownMerchantReviews.length > 0 && (
          <Link
            to="/reviews"
            className="rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Manage my reviews
          </Link>
        )}
      </div>

      {authenticated && eligibleOrders.length > 0 && (
        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <CardContent className="grid gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-center">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="size-5" />
              </span>
              <div>
                <p className="font-semibold tracking-tight">Share your experience</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your delivered orders are ready for a review.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              {eligibleOrders.slice(0, 3).map((order) => (
                <Button
                  key={order._id}
                  variant="outline"
                  size="sm"
                  className="min-h-9 rounded-full border-border/80 bg-background px-3 text-xs shadow-sm hover:border-primary/40 hover:bg-primary/5 sm:text-sm"
                  onClick={() => setOrderToReview(order._id)}
                >
                  <Star className="size-4 fill-amber-400 text-amber-500" />
                  <span className="whitespace-nowrap">Review order #{order.orderNumber}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <ReviewCardSkeleton count={3} />
      ) : isError ? (
        <PageError
          message="Reviews could not be loaded right now. Please try again."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No reviews yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to share your experience after ordering.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => {
            const isMine = Boolean(
              user?.id &&
              typeof review.reviewer !== "string" &&
              review.reviewer._id === user.id
            )
            return (
              <ReviewCard
                key={review._id}
                review={review}
                editable={isMine}
                onEdit={() => setSelectedReview(review)}
                onDelete={() => deleteReview.mutate(review._id)}
              />
            )
          })}
        </div>
      )}

      <ReviewFormDialog
        open={Boolean(orderToReview || selectedReview)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReview(undefined)
            setOrderToReview(undefined)
          }
        }}
        orderId={orderToReview}
        review={selectedReview}
      />
    </section>
  )
}
