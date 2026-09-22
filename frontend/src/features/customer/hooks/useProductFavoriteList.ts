import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { ApiResponse } from "@/types/types"
import type { ProductFavorite } from "../types/favorites"

const getProductFavoriteList = async (): Promise<ProductFavorite[]> => {
  const { data } =
    await axios.get<ApiResponse<ProductFavorite[]>>("/product/favorites")

  return data.data
}

export const useProductFavoriteList = () => {
  const {
    data: productFavoriteList = [],
    isLoading,
    error,
  } = useQuery<ProductFavorite[]>({
    queryKey: ["productFavoriteList"],
    queryFn: getProductFavoriteList,
  })

  return { productFavoriteList, isLoading, error }
}
