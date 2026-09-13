import axios from "@/lib/axios"
import type { Product } from "../types/products"
import type { ApiResponse } from "@/types/types"
import { useQuery } from "@tanstack/react-query"

const fetchRandomProducts = async (
  productIds: string[],
  limit = 5
): Promise<Product[]> => {
  const { data } = await axios.post<ApiResponse<Product[]>>(
    `/product/random?limit=${limit}`,
    { productIds }
  )

  return data.data
}

export const useRandomProducts = (productIds: string[], limit = 5) => {
  const validIds = productIds.filter((id) => id && id.length > 0)

  return useQuery({
    queryKey: ["randomProducts", validIds, limit],
    queryFn: () => fetchRandomProducts(validIds, limit),
    staleTime: 5 * 60 * 1000,
  })
}
