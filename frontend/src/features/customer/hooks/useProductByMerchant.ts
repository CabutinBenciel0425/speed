import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { ApiResponse } from "@/types/types"
import type { Product } from "../types/products"

const fetchProduct = async (productId: string): Promise<Product | null> => {
  if (!productId) return null
  const { data } = await axios.get<ApiResponse<Product>>(
    `/product/${productId}/details`
  )

  return data.data
}

export const useProduct = (productId: string) => {
  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useQuery<Product | null>({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  })

  return { product, isLoading, error, refetch }
}
