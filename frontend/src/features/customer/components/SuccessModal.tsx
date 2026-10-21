import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Star } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import deliverySuccess from "@/assets/delivery-success.gif"

function SuccessModal({
  isSuccessModalOpen,
  setIsSuccessModalOpen,
  onHandleShowReviewModal,
}: {
  isSuccessModalOpen: boolean
  setIsSuccessModalOpen: Dispatch<SetStateAction<boolean>>
  orderId: string
  onHandleShowReviewModal: () => void
}) {
  return (
    <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
      <DialogContent className="max-w-md p-6 text-center">
        <img
          src={deliverySuccess}
          alt="Delivery complete"
          className="mx-auto w-48"
        />

        <h2 className="mt-4 text-xl font-bold">
          How was your delivery experience?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your feedback helps us improve and rewards our drivers.
        </p>

        <div className="mt-5 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} aria-label={`Rate ${n} stars`}>
              <Star className="size-8" />
            </button>
          ))}
        </div>

        <button
          className="mt-6 w-full cursor-pointer rounded-md bg-orange-500 py-2.5 font-medium text-white hover:bg-orange-600"
          onClick={onHandleShowReviewModal}
        >
          Write a Review
        </button>
        <button
          onClick={() => setIsSuccessModalOpen(false)}
          className="mt-3 cursor-pointer text-sm text-muted-foreground hover:text-foreground"
        >
          Maybe Later
        </button>
      </DialogContent>
    </Dialog>
  )
}

export default SuccessModal
