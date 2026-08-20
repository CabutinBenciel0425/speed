import axios from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import type { TopProductTag } from "../types/products"

const fetchProductsTopTags = async (
  categoryId: string
): Promise<TopProductTag[]> => {
  const { data } = await axios.get<{
    success: boolean
    data: TopProductTag[]
  }>(`/category/${categoryId}/tags`)
  return data.data
}

export const useProductTopTags = (categoryId: string) => {
  const {
    data: tags = [],
    isLoading,
    error,
  } = useQuery<TopProductTag[]>({
    queryKey: ["top-tags", categoryId],
    queryFn: () => fetchProductsTopTags(categoryId),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 1,
  })

  return { tags, isLoading, error }
}
