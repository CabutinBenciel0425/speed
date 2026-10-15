import axios from "@/lib/axios"
import type { Order } from "@/types/order"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { toast } from "sonner"

type CancelOrderResponse = {
  success: boolean
  data: Order
}

const customerCancelOrder = async ({
  orderId,
  cancellationReason,
}: {
  orderId: string
  cancellationReason: string
}): Promise<CancelOrderResponse> => {
  const { data } = await axios.patch(`/orders/${orderId}/cancel`, {
    cancellationReason: cancellationReason,
  })
  return data
}

export const useCustomerCancelOrder = (orderId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: customerCancelOrder,
    onSuccess: () => {
      toast.success("This order has been cancelled")
      queryClient.invalidateQueries({ queryKey: ["customerOrders"] })
      queryClient.invalidateQueries({ queryKey: ["customerOrder", orderId] })
      queryClient.invalidateQueries({ queryKey: ["existingOrder"] })
    },
    onError: (error: AxiosError) => {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        "Failed to cancel this order"
      toast.error(message)
    },
  })
}
