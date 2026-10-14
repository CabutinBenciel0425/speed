import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { Order } from "@/types/order"

const fetchExistingOrder = async () => {
  const { data } = await axios.get<{ success: boolean; order: Order | null }>(
    "/orders/existing"
  )
  return data
}

export const useExistingOrder = () => {
  const {
    data: existingOrder,
    isLoading,
    error,
  } = useQuery<{ success: boolean; order: Order | null }>({
    queryKey: ["existingOrder"],
    queryFn: fetchExistingOrder,
  })

  return { existingOrder, isLoading, error }
}
