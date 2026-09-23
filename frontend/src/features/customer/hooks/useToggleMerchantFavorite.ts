import axios from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

type MerchantFavoriteToggleResult = { success: boolean; isFavorite: boolean }

const toggleMerchantFavorite = async (
  merchantId: string
): Promise<MerchantFavoriteToggleResult> => {
  const { data } = await axios.post(`merchant/favorites/${merchantId}/status`)

  return data
}

export const useToggleMerchantFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleMerchantFavorite,

    onMutate: async (merchantId) => {
      const queryKey = ["isMerchantFavorite", merchantId]
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData<boolean>(queryKey)
      queryClient.setQueryData(queryKey, !previous)

      return { previous, queryKey }
    },

    onError: (_err, _merchantId, context) => {
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previous)
      }
      toast.error("Something went wrong. Please try again.")
    },

    onSuccess: (data, merchantId) => {
      queryClient.setQueryData(
        ["isMerchantFavorite", merchantId],
        data.isFavorite
      )
      toast.success(
        data.isFavorite
          ? "Merchant added to favorites"
          : "Merchant removed from favorites"
      )
      queryClient.invalidateQueries({ queryKey: ["merchantFavoriteList"] })
    },
  })
}
