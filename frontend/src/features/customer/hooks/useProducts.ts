import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { ApiResponse } from "@/types/types"
import type { Product } from "../types/products"

const fetchFeaturedProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get<ApiResponse<Product[]>>("/product/featured")

  return data.data
}

export const useFeaturedProducts = () => {
  const {
    data: featuredProducts = [],
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ["featuredProducts"],
    queryFn: fetchFeaturedProducts,
  })

  return { featuredProducts, isLoading, error }
}
