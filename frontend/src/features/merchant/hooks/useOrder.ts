import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { Order } from "@/types/order"

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await axios.get<{ data: Order }>(`/orders/${orderId}`)
      return data.data
    },
    staleTime: 20_000,
    refetchInterval: (query) =>
      ["Delivered", "Rejected", "Cancelled"].includes(
        query.state.data?.status ?? ""
      )
        ? false
        : 5000,
  })
}
