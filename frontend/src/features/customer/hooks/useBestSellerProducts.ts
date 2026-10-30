import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { ApiResponse } from "@/types/types"
import type { Product } from "../types/products"

export type BestSellerProducts = {
  bestSellerProducts: Product[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

const fetchBestSellerProducts = async ({
  page,
  limit = 5,
}: {
  page?: number
  limit?: number
} = {}): Promise<BestSellerProducts> => {
  const { data } = await axios.get<ApiResponse<BestSellerProducts>>(
    `/product/bestsellers?page=${page}&limit=${limit}`
  )

  return data.data
}

export const useBestSellerProducts = ({ page = 1 }: { page?: number } = {}) => {
  const { data, isLoading, error } = useQuery<BestSellerProducts>({
    queryKey: ["bestSellerProducts", page],
    queryFn: () => fetchBestSellerProducts({ page }),
  })

  return { data, isLoading, error }
}
