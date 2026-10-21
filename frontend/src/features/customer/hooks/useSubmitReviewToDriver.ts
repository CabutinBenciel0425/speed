import axios from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Review } from "../types/review"

const submitReviewToDriver = async ({
  orderId,
  rating,
  review,
}: {
  orderId: string
  rating: number
  review: string
}): Promise<Review> => {
  const { data } = await axios.post(`/review/orders/${orderId}/driver`, {
    rating,
    comment: review,
  })
  return data.data
}

export const useSubmitReviewToDriver = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitReviewToDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerOrder"] })
      queryClient.invalidateQueries({ queryKey: ["myReviews"] })
      toast.success("Review submitted successfully")
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.")
    },
  })
}
