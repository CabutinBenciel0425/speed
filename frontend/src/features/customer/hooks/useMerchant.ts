import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { ApiResponse } from "@/types/types"
import type { Merchant } from "../types/merchant"

const fetchMerchant = async (): Promise<Merchant[]> => {
  const { data } = await axios.get<ApiResponse<Merchant[]>>("/merchant")

  return data.data
}

export const useMerchants = () => {
  const {
    data: merchants = [],
    isLoading,
    error,
  } = useQuery<Merchant[]>({
    queryKey: ["merchants"],
    queryFn: fetchMerchant,
  })

  return { merchants, isLoading, error }
}
