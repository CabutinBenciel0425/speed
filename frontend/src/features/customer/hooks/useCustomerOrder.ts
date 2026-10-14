import axios from "@/lib/axios"
import type { Order } from "@/types/order"
import { useQuery } from "@tanstack/react-query"

const fetchCustomerOrder = async (orderId: string): Promise<Order> => {
  const { data } = await axios.get<{ data: Order }>(`/orders/${orderId}`)

  return data.data
}

export const useCustomerOrder = (orderId: string) => {
  const {
    data: order,
    isLoading,
    error,
  } = useQuery<Order>({
    queryKey: ["customerOrder", orderId],
    queryFn: () => fetchCustomerOrder(orderId!),
    enabled: Boolean(orderId),
    refetchInterval: 30_000,
  })

  return { order, isLoading, error }
}
