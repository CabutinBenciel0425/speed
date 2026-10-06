import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { apiErrorMessage } from "../utils/apiErrorMessage"

export function useUpdateMerchantProduct(merchantId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: string
      payload: FormData
    }) => {
      if (!merchantId) throw new Error("Merchant profile is unavailable")
      return axios.patch(`/product/${merchantId}/${productId}`, payload)
    },
    onSuccess: () => {
      toast.success("Product updated")
      void queryClient.invalidateQueries({
        queryKey: ["merchantMenuProducts", merchantId],
      })
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Could not update this product.")),
  })
}
