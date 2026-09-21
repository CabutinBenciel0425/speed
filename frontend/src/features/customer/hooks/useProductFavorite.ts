import axios from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"

const getProductFavorite = async (productId: string): Promise<boolean> => {
  const { data } = await axios.get(`/product/favorites/${productId}`)

  return data.data.isFavorite
}

export const useProductFavorite = (productId: string) => {
  const {
    data: isProductFavorite,
    isLoading,
    error,
  } = useQuery<boolean>({
    queryKey: ["isProductFavorite", productId],
    queryFn: () => getProductFavorite(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  })

  return { isProductFavorite, isLoading, error }
}
