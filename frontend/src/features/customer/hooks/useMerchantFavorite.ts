import axios from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"

const getMerchantFavorite = async (merchantId: string): Promise<boolean> => {
  const { data } = await axios.get(`/merchant/favorites/${merchantId}`)

  return data.data.isFavorite
}

export const useMerchantFavorite = (merchantId: string) => {
  const {
    data: isMerchantFavorite,
    isLoading,
    error,
  } = useQuery<boolean>({
    queryKey: ["isMerchantFavorite", merchantId],
    queryFn: () => getMerchantFavorite(merchantId),
    enabled: !!merchantId,
    staleTime: 1000 * 60 * 5,
  })

  return { isMerchantFavorite, isLoading, error }
}
