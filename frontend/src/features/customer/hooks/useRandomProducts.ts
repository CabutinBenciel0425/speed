import axios from "@/lib/axios"
import type { Product } from "../types/products"
import type { ApiResponse } from "@/types/types"
import { useQuery } from "@tanstack/react-query"

const fetchRandomProducts = async (
  productId: string,
  limit = 5
): Promise<Product[]> => {
  const { data } = await axios.get<ApiResponse<Product[]>>(
    `/product/${productId}/random?limit=${limit}`
  )

  return data.data
}

export const useRandomProducts = (productId: string, limit: number) => {
  const {
    data: randomProducts,
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ["randomProduct", productId, limit],
    queryFn: () => fetchRandomProducts(productId, limit),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  })

  return { randomProducts, isLoading, error }
}
