import axios from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

type ProductFavoriteToggleResult = { success: boolean; isFavorite: boolean }

const toggleProductFavorite = async (
  productId: string
): Promise<ProductFavoriteToggleResult> => {
  const { data } = await axios.post(`product/favorites/${productId}/status`)

  return data
}

export const useToggleProductFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleProductFavorite,

    onMutate: async (productId) => {
      const queryKey = ["isProductFavorite", productId]
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData<boolean>(queryKey)
      queryClient.setQueryData(queryKey, !previous)

      return { previous, queryKey }
    },

    onError: (_err, _productId, context) => {
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previous)
      }
      toast.error("Something went wrong. Please try again.")
    },

    onSuccess: (data, productId) => {
      queryClient.setQueryData(
        ["isMerchantFavorite", productId],
        data.isFavorite
      )
      toast.success(
        data.isFavorite
          ? "Product added to favorites"
          : "Product removed from favorites"
      )
    },
  })
}
