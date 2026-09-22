import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { ApiResponse } from "@/types/types"
import type { MerchantFavorite } from "../types/favorites"

const getMerchantFavoriteList = async (): Promise<MerchantFavorite[]> => {
  const { data } = await axios.get<ApiResponse<MerchantFavorite[]>>(
    "/merchant/favorites"
  )
  return data.data
}

export const useMerchantFavoriteList = () => {
  const {
    data: merchantFavoriteList = [],
    isLoading,
    error,
  } = useQuery<MerchantFavorite[]>({
    queryKey: ["merchantFavoriteList"],
    queryFn: getMerchantFavoriteList,
  })

  return { merchantFavoriteList, isLoading, error }
}
