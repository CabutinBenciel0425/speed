import axios from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/store/authStore"

const getMerchantFavorite = async (merchantId: string): Promise<boolean> => {
  const { data } = await axios.get(`/merchant/favorites/${merchantId}`)

  return data.data.isFavorite
}

export const useMerchantFavorite = (merchantId: string) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const {
    data: isMerchantFavorite,
    isLoading,
    error,
  } = useQuery<boolean>({
    queryKey: ["isMerchantFavorite", merchantId],
    queryFn: () => getMerchantFavorite(merchantId),
    enabled: !!merchantId && isAuthenticated,
    staleTime: 1000 * 60 * 5,
  })

  return { isMerchantFavorite, isLoading, error }
}
