import axios from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { toast } from "sonner"

type DeleteProductResponse = {
  success: boolean
  message: string
}

const deleteProduct = async ({
  merchantId,
  productId,
}: {
  merchantId: string
  productId: string
}): Promise<DeleteProductResponse> => {
  console.log(merchantId, productId)
  const { data } = await axios.delete(`/product/${merchantId}/${productId}`)
  return data
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["merchantMenuProducts"] })
    },
    onError: (error: AxiosError) => {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        "Failed to deletes address"
      toast.error(message)
    },
  })
}
