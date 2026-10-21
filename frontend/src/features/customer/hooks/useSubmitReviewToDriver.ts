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
  console.log(data)
  return data.data
}

export const useSubmitReviewToDriver = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitReviewToDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerOrder"] })
      toast.success("Review submitted successfully")
    },
    onError: (error) => {
      console.error(error)
      toast.error("Something went wrong. Please try again.")
    },
  })
}
