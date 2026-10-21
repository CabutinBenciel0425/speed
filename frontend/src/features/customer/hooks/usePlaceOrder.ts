import { useMutation, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import axios from "@/lib/axios"

export function usePlaceOrder() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post<{ data: { _id: string } }>(
        "/orders/checkout/cod"
      )
      if (!data.data?._id)
        throw new Error("The order was created without an order ID.")
      return data.data
    },
    onSuccess: async (order) => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] })
      navigate(`/orders/tracking/${order._id}`, { replace: true })
    },
    onError: (error) => {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : error instanceof Error
          ? error.message
          : undefined
      toast.error(message ?? "We couldn’t place your order. Please try again.")
    },
  })
}
