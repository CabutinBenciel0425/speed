import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { ApiResponse } from "@/types/types"
import type { Product } from "../types/products"

export type FeaturedProducts = {
  featuredProducts: Product[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

const fetchFeaturedProducts = async ({
  page,
  limit = 5,
}: {
  page?: number
  limit?: number
} = {}): Promise<FeaturedProducts> => {
  const { data } = await axios.get<ApiResponse<FeaturedProducts>>(
    `/product/featured?page=${page}&limit=${limit}`
  )

  return data.data
}

export const useFeaturedProducts = ({ page = 1 }: { page?: number } = {}) => {
  const { data, isLoading, error } = useQuery<FeaturedProducts>({
    queryKey: ["featuredProducts", page],
    queryFn: () => fetchFeaturedProducts({ page }),
  })
  return { data, isLoading, error }
}
