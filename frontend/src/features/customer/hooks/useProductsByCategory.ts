import axios from "@/lib/axios"
import type { CategoryByProducts } from "../types/products"
import { useQuery } from "@tanstack/react-query"

const fetchProductsByCategories = async (
  categoryId: string,
  page: number,
  tags: string = "",
  sort: string = "-price",
  limit: number
): Promise<CategoryByProducts> => {
  const urlToUse =
    tags !== null && tags !== ""
      ? `/category/${categoryId}?tags=${tags}&sort=${sort}&page=${page}&limit=${limit}`
      : `/category/${categoryId}?sort=${sort}&page=${page}&limit=${limit}`

  const { data } = await axios.get<CategoryByProducts>(urlToUse)

  return data
}

export const useProductsByCategory = (
  categoryId: string,
  page: number = 1,
  tags: string = "",
  sort: string = "",
  limit: number = 5
) => {
  const {
    data: productsByCategory,
    isLoading,
    error,
  } = useQuery<CategoryByProducts>({
    queryKey: ["products", "category", categoryId, page, tags, limit, sort],
    queryFn: () =>
      fetchProductsByCategories(categoryId, page, tags, sort, limit),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 1,
  })

  return {
    productsByCategory,
    isLoading,
    error,
  }
}
