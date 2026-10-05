import axios from "@/lib/axios"
import type { Product } from "../types/products"
import type { ApiResponse } from "@/types/types"
import { useQuery } from "@tanstack/react-query"

const fetchRandomProductsFromMerchant = async (
  productIds: string[],
  limit = 5,
  merchantId: string
): Promise<Product[]> => {
  const { data } = await axios.post<ApiResponse<Product[]>>(
    `/product/random-cart?limit=${limit}`,
    { productIds, merchantId }
  )

  return data.data
}

export const useRandomProductsFromMerchant = (
  productIds: string[],
  limit = 5,
  merchantId: string
) => {
  const validIds = productIds.filter((id) => id && id.length > 0)

  return useQuery({
    queryKey: ["randomProducts", validIds, limit, merchantId],
    queryFn: () => fetchRandomProductsFromMerchant(validIds, limit, merchantId),
    enabled: Boolean(merchantId),
    staleTime: 5 * 60 * 1000,
  })
}
