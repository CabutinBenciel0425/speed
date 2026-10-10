import axios from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { CartResult } from "../types/cart"
import { toast } from "sonner"

export const cancelOrder = async ({
  orderId,
  cancellationReason,
}: {
  orderId: string
  cancellationReason?: string
}): Promise<CartResult> => {
  console.log(cancellationReason)
  const { data } = await axios.patch(`/orders/${orderId}/cancel`, {
    cancellationReason: cancellationReason,
  })
  return data.data
}

export const useCancelOrder = ({
  orderId,
  cancellationReason,
}: {
  orderId: string
  cancellationReason?: string
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      toast.info("Order cancelled successfully")
      queryClient.invalidateQueries({
        queryKey: ["customerOrder", orderId, cancellationReason],
      })
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.")
    },
  })
}
