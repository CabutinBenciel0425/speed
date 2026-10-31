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
  action: "accept" | "reject" | "cancel" | "picked-up"
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
  action,
}: {
  merchantId: string
  orderId: string
  action: "accept" | "reject" | "cancel" | "picked-up"
}) => {
  return useMutation({
    mutationFn: actionMutation,
    onSuccess: (_data, variables) => {
      toast.success(
        `Order ${variables.action === "picked-up" ? "picked up" : `${action}ed`}`
      )
      void queryClient.invalidateQueries({
        queryKey: ["merchantOrders", merchantId, orderId, action],
      })
      void queryClient.invalidateQueries({
        queryKey: ["merchantDashboard"],
      })
      void queryClient.invalidateQueries({
        queryKey: ["merchantOrder"],
      })
    },
    onError: () => toast.error("Could not update the order. Please try again."),
  })
}
