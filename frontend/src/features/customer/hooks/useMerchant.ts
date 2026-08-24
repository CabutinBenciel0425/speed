import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { ApiResponse } from "@/types/types"
import type { Merchant } from "../types/merchant"

const fetchMerchant = async (merchantId: string): Promise<Merchant | null> => {
  if (!merchantId) return null
  const { data } = await axios.get<ApiResponse<Merchant>>(
    `/merchant/${merchantId}/details`
  )

  return data.data
}

export const useMerchant = (merchantId: string) => {
  const {
    data: merchant,
    isLoading,
    error,
  } = useQuery<Merchant | null>({
    queryKey: ["merchant", merchantId],
    queryFn: () => fetchMerchant(merchantId),
    enabled: !!merchantId,
    staleTime: 1000 * 60 * 5,
  })

  return { merchant, isLoading, error }
}
