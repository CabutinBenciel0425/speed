import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { apiErrorMessage } from "../utils/apiErrorMessage"

export function useAddMerchantProduct(merchantId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: FormData) => {
      if (!merchantId) throw new Error("Merchant profile is unavailable")
      return axios.post(`/product/${merchantId}`, payload)
    },
    onSuccess: () => {
      toast.success("Product added")
      void queryClient.invalidateQueries({
        queryKey: ["merchantMenuProducts", merchantId],
      })
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, "Could not add this product."))
    },
  })
}
