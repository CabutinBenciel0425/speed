import axios from "@/lib/axios"
import type { CategoryByProducts } from "../types/products"
import { useQuery } from "@tanstack/react-query"

const fetchProductsByCategories = async (
  categoryId: string,
  page: number,
  limit: number
): Promise<CategoryByProducts> => {
  try {
    const { data } = await axios.get<CategoryByProducts>(
      `/category/${categoryId}?page=${page}&limit=${limit}`
    )

    return data
  } catch (error) {
    console.log(error)
    return {
      success: false,
      data: null,
      pagination: null,
    }
  }
}

export const useProductsByCategory = (
  categoryId: string,
  page: number = 1,
  limit: number = 5
) => {
  const {
    data: productsByCategory,
    isLoading,
    error,
  } = useQuery<CategoryByProducts>({
    queryKey: ["products", "category", categoryId, page],
    queryFn: () => fetchProductsByCategories(categoryId, page, limit),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 1,
  })

  return {
    productsByCategory,
    isLoading,
    error,
  }
}
