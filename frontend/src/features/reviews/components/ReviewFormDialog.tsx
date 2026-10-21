import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import type { Review } from "../types/review"
import {
  useAddMerchantReview,
  useUpdateMerchantReview,
} from "../hooks/useReviews"

export default function ReviewFormDialog({
  open,
  onOpenChange,
  orderId,
  review,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId?: string
  review?: Review
}) {
  const [rating, setRating] = useState(review?.rating ?? 0)
  const [comment, setComment] = useState(review?.comment ?? "")
  const addReview = useAddMerchantReview()
  const updateReview = useUpdateMerchantReview()
  const isPending = updateReview.isPending || addReview.isPending
  const ratingLabel = [
    "",
    "Not great",
    "Could be better",
    "Good",
    "Very good",
    "Excellent",
  ][rating]

  useEffect(() => {
    if (!open) return
    setRating(review?.rating ?? 0)
    setComment(review?.comment ?? "")
  }, [open, review])

  const submit = () => {
    if (!rating || !comment.trim()) return
    const onSuccess = () => onOpenChange(false)
    if (review)
      updateReview.mutate(
        { reviewId: review._id, rating, comment: comment.trim() },
        { onSuccess }
      )
    else if (orderId)
      addReview.mutate(
        { orderId, rating, comment: comment.trim() },
        { onSuccess }
      )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {review ? "Update your review" : "Share your experience"}
          </DialogTitle>
          <DialogDescription>
            Your feedback helps neighbors choose with confidence and helps the
            merchant improve.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div
            className="flex flex-wrap justify-center gap-1.5 sm:gap-2"
            role="radiogroup"
            aria-label="Rating"
          >
            {Array.from({ length: 5 }, (_, index) => {
              const value = index + 1
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  onClick={() => setRating(value)}
                  className="grid size-11 place-items-center rounded-full transition-colors hover:bg-amber-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                >
                  <Star
                    className={`size-7 transition-transform ${rating >= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
                  />
                </button>
              )
            })}
          </div>
          <p className="-mt-3 text-center text-sm font-medium text-muted-foreground" aria-live="polite">
            {ratingLabel || "Choose a rating"}
          </p>
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What stood out about the food, service, or overall experience?"
            maxLength={1000}
            rows={5}
          />
          <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <span className="text-xs text-muted-foreground">
              {comment.length}/1000
            </span>
            <Button
              className="w-full sm:w-auto"
              onClick={submit}
              disabled={!rating || !comment.trim() || isPending}
            >
              {isPending
                ? "Saving…"
                : review
                  ? "Save changes"
                  : "Post review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
