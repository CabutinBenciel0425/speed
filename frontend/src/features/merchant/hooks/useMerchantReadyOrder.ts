// "/merchant/:merchantId/orders/:orderId/ready"

import axios from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

const merchantReadyOrder = async ({
  merchantId,
  orderId,
}: {
  merchantId: string
  orderId: string
}) => {
  const { data } = await axios.patch(
    `/merchant/${merchantId}/orders/${orderId}/ready`
  )
  console.log(data)
  return data
}

export const useMerchantReadyOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: merchantReadyOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchantOrders"] })
      toast.success(`Order is ready to pick up`)
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.")
    },
  })
}
