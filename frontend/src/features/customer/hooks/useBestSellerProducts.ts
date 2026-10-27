import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { ApiResponse } from "@/types/types"
import type { Product } from "../types/products"

const fetchBestSellerProducts = async (): Promise<Product[]> => {
  const { data } =
    await axios.get<ApiResponse<Product[]>>(`/product/bestsellers`)

  return data.data
}

export const useBestSellerProducts = () => {
  const { data, isLoading, error } = useQuery<Product[]>({
    queryKey: ["bestSellerProducts"],
    queryFn: fetchBestSellerProducts,
  })

  return { data, isLoading, error }
}
