import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { ApiResponse } from "@/types/types"
import type { Merchant } from "@/features/customer/types/merchant"

const fetchMyMerchantProfile = async (): Promise<Merchant | null> => {
  const { data } = await axios.get<ApiResponse<Merchant>>(`/merchant/me`)
  return data.data
}

export const useMyMerchantProfile = () => {
  const {
    data: merchant,
    isLoading,
    error,
  } = useQuery<Merchant | null>({
    queryKey: ["myMerchant"],
    queryFn: fetchMyMerchantProfile,
    staleTime: 1000 * 60 * 5,
  })

  return { merchant, isLoading, error }
}
