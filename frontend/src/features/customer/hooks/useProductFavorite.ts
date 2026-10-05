import axios from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/store/authStore"

const getProductFavorite = async (productId: string): Promise<boolean> => {
  const { data } = await axios.get(`/product/favorites/${productId}`)

  return data.data.isFavorite
}

export const useProductFavorite = (productId: string) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const {
    data: isProductFavorite,
    isLoading,
    error,
  } = useQuery<boolean>({
    queryKey: ["isProductFavorite", productId],
    queryFn: () => getProductFavorite(productId),
    enabled: !!productId && isAuthenticated,
    staleTime: 1000 * 60 * 5,
  })

  return { isProductFavorite, isLoading, error }
}
