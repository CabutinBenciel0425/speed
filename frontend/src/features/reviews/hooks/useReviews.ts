import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import axios from "@/lib/axios"
import type { Review } from "../types/review"

export const reviewKeys = {
  mine: ["myReviews"] as const,
  publicMerchant: (merchantId: string) =>
    ["merchantReviews", merchantId] as const,
  merchant: ["merchantOwnReviews"] as const,
}

export function useMyReviews(enabled = true) {
  return useQuery({
    queryKey: reviewKeys.mine,
    queryFn: async () =>
      (await axios.get<{ data: Review[] }>("/review/me")).data.data,
    enabled,
    staleTime: 30_000,
  })
}

export function usePublicMerchantReviews(merchantId: string) {
  return useQuery({
    queryKey: reviewKeys.publicMerchant(merchantId),
    queryFn: async () =>
      (await axios.get<{ data: Review[] }>(`/review/merchant/${merchantId}`))
        .data.data,
    enabled: Boolean(merchantId),
    staleTime: 60_000,
  })
}

export function useMerchantReviews() {
  return useQuery({
    queryKey: reviewKeys.merchant,
    queryFn: async () =>
      (await axios.get<{ data: Review[] }>("/review/merchant")).data.data,
    staleTime: 30_000,
  })
}

function useReviewMutation<TInput>(
  mutationFn: (input: TInput) => Promise<unknown>,
  successMessage: string
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      toast.success(successMessage)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: reviewKeys.mine }),
        queryClient.invalidateQueries({ queryKey: ["merchantReviews"] }),
        queryClient.invalidateQueries({ queryKey: reviewKeys.merchant }),
        queryClient.invalidateQueries({ queryKey: ["merchant"] }),
      ])
    },
    onError: (error) => {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined
      toast.error(message ?? "Could not save the review.")
    },
  })
}

export function useAddMerchantReview() {
  return useReviewMutation(
    ({
      orderId,
      rating,
      comment,
    }: {
      orderId: string
      rating: number
      comment: string
    }) => axios.post(`/review/orders/${orderId}/merchant`, { rating, comment }),
    "Your review has been shared."
  )
}

export function useUpdateMerchantReview() {
  return useReviewMutation(
    ({
      reviewId,
      rating,
      comment,
    }: {
      reviewId: string
      rating: number
      comment: string
    }) => axios.patch(`/review/${reviewId}`, { rating, comment }),
    "Your review has been updated."
  )
}

export function useDeleteMerchantReview() {
  return useReviewMutation(
    (reviewId: string) => axios.delete(`/review/${reviewId}`),
    "Your review has been deleted."
  )
}

export function useSetReviewVisibility() {
  return useReviewMutation(
    ({ reviewId, isHidden }: { reviewId: string; isHidden: boolean }) =>
      axios.patch(`/review/merchant/${reviewId}/visibility`, { isHidden }),
    "Review visibility updated."
  )
}
