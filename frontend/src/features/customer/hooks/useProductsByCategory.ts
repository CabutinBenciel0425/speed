import axios from "@/lib/axios"
import type { CategoryByProducts } from "../types/products"
import { useQuery } from "@tanstack/react-query"

const fetchProductsByCategories = async (
  categoryId: string,
  page: number,
  tags: string,
  sort: string = "-price",
  limit: number
): Promise<CategoryByProducts> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort: sort || "-price",
  })
  if (tags) params.set("tags", tags)

  const { data } = await axios.get<CategoryByProducts>(
    `/category/${categoryId}?${params.toString()}`
  )

  return data
}

export const useProductsByCategory = (
  categoryId: string,
  page: number = 1,
  tags: string = "",
  sort: string = "-price",
  limit: number = 5
) => {
  const {
    data: productsByCategory,
    isLoading,
    error,
  } = useQuery<CategoryByProducts>({
    queryKey: [
      "products",
      "category",
      categoryId,
      page,
      tags,
      limit,
      sort || "-price",
    ],
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
