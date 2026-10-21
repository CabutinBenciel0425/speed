import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ArrowRight, Star } from "lucide-react"
import { useState, type Dispatch, type SetStateAction } from "react"
import { useCustomerOrder } from "../hooks/useCustomerOrder"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Rating } from "@/components/reui/rating"
import { useSubmitReviewToDriver } from "../hooks/useSubmitReviewToDriver"
import { NavLink } from "react-router-dom"
import { toast } from "sonner"

function ReviewModal({
  isReviewModalOpen,
  setIsReviewModalOpen,
  orderId,
}: {
  isReviewModalOpen: boolean
  setIsReviewModalOpen: Dispatch<SetStateAction<boolean>>
  orderId: string
}) {
  const { order } = useCustomerOrder(orderId)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [isReviewSuccess, setIsReviewSuccess] = useState(false)
  const { mutate: submitReview, isPending: submittingReview } =
    useSubmitReviewToDriver()
  return (
    <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
      <DialogContent
        className={`flex max-w-lg flex-col p-6 text-center ${isReviewSuccess ? "" : "divide-y"}`}
      >
        <div
          className={`${isReviewSuccess ? "hidden" : "flex flex-row items-center justify-start gap-5 py-3"}`}
        >
          <img
            src={order?.driver?.avatar}
            alt={order?.driver?.user.firstName}
            className="h-20 w-20 rounded-full"
          />
          <div className="flex flex-col items-start justify-start gap-1">
            <h3 className="text-base font-semibold">
              {order?.driver?.user.firstName} {order?.driver?.user.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">Driver</p>
            <div className="flex flex-row items-center justify-start gap-2">
              <span className="text-sm font-semibold">
                {order?.driver?.averageRating || 0}
              </span>
              <Star className="size-4" fill="#ffdf00" stroke="#ffdf00" />
              <span>
                ({order?.driver?.completedDeliveries || 0} deliveries)
              </span>
            </div>
          </div>
        </div>
        <div
          className={`space-y-5 ${isReviewSuccess ? "hidden" : "flex flex-col"}`}
        >
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-sm font-semibold">Write a Review</h3>
            <Rating rating={rating} onRatingChange={setRating} editable />
            {rating > 0 && (
              <p className="text-xs text-muted-foreground">
                {rating <= 2
                  ? "We're sorry to hear that"
                  : rating <= 3
                    ? "Thanks for your feedback"
                    : "Glad you enjoyed it!"}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-text" className="text-sm">
              Your review
            </Label>
            <Textarea
              id="review-text"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us what you think..."
              rows={3}
              disabled={submittingReview}
            />
          </div>
          <Button
            disabled={rating === 0}
            size="sm"
            className="w-full"
            onClick={() => {
              if (review === "" || review.length === 0) {
                toast.error("Please add a comment for the driver")
                return
              }
              submitReview(
                {
                  orderId,
                  rating,
                  review,
                },
                {
                  onSuccess: () => setIsReviewSuccess(true),
                }
              )
            }}
          >
            {submittingReview ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
        <div
          className={`success-animation ${isReviewSuccess ? "flex" : "hidden"} flex flex-col items-center gap-8`}
        >
          <div>
            <svg
              className="checkmark"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                className="checkmark__circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className="checkmark__check"
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
          </div>
          <p className="mx-auto text-base text-muted-foreground">
            Thank you for taking the time to share your experience.
          </p>
          <NavLink
            to="/"
            className={"flex flex-row items-center gap-2 hover:underline"}
          >
            <span>Back to Home</span> <ArrowRight className="size-5" />
          </NavLink>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReviewModal
