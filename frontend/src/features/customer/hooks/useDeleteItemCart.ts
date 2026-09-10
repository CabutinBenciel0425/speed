import axios from "@/lib/axios"
import type { CartResult } from "../types/cart"
import { useCartStore } from "@/store/cartStore"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export const deleteItemCart = async (
  productId: string
): Promise<CartResult> => {
  const { data } = await axios.delete("/cart", { data: { productId } })

  return data.data
}

export const useDeleteItemCart = () => {
  const { removeItem } = useCartStore()

  return useMutation({
    mutationFn: deleteItemCart,
    onSuccess: (_, productId) => {
      removeItem(productId)
      toast.success("Item deleted successfully")
    },
    onError: () => {
      toast.error("Something went wrong. Please try again")
    },
  })
}
