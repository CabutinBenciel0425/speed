import axios from "@/lib/axios"
import type { ApiResponse } from "@/types/types"
import type { Product } from "../types/products"
import { useQuery } from "@tanstack/react-query"

const fetchProductsByCategories = async (
  categoryId: string
): Promise<Product[] | []> => {
  try {
    const { data } = await axios.get<ApiResponse<Product[]>>(
      `/category/${categoryId}`
    )

    return data.data
  } catch (error) {
    console.log(error)
    return []
  }
}

export const useProductsByCategory = (categoryId: string) => {
  const {
    data: productsByCategory,
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ["products", "category", categoryId],
    queryFn: () => fetchProductsByCategories(categoryId!),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 1,
  })

  return {
    productsByCategory,
    isLoading,
    error,
  }
}
