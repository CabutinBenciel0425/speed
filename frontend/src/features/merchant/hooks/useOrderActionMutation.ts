import axios from "@/lib/axios"
import { queryClient } from "@/lib/queryClient"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

const actionMutation = async ({
  merchantId,
  orderId,
  action,
}: {
  merchantId: string
  orderId: string
  action: "accept" | "reject" | "cancel"
}) => {
  if (!merchantId) throw new Error("Merchant profile is unavailable")
  const { data } = await axios.patch(
    `/merchant/${merchantId}/orders/${orderId}/${action}`,
    action === "cancel"
      ? { cancellationReason: "Cancelled by merchant" }
      : undefined
  )
  return data
}

export const useActionMutation = ({
  merchantId,
  orderId,
}: {
  merchantId: string
  orderId: string
}) => {
  return useMutation({
    mutationFn: actionMutation,
    onSuccess: (_data, variables) => {
      toast.success(`Order ${variables.action}ed`)
      void queryClient.invalidateQueries({
        queryKey: ["merchantOrders", merchantId, orderId],
      })
      void queryClient.invalidateQueries({
        queryKey: ["merchantDashboard", merchantId, orderId],
      })
    },
    onError: () => toast.error("Could not update the order. Please try again."),
  })
}
