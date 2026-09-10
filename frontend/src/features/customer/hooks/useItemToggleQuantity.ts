import axios from "@/lib/axios"
import type { CartResult } from "../types/cart"
import { useCartStore } from "@/store/cartStore"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const itemToggleQuantity = async ({
  quantity,
  productId,
}: {
  quantity: number
  productId: string
}): Promise<CartResult> => {
  const { data } = await axios.post("/cart/toggle-quantity", {
    quantity,
    productId,
  })
  return data.data
}

export const useItemToggleQuantity = ({
  quantity,
  productId,
}: {
  quantity: number
  productId: string
}) => {
  const { updateQuantity } = useCartStore()
  const queryClient = useQueryClient()
  console.log("MUTATION FN", quantity, productId)
  return useMutation({
    mutationFn: itemToggleQuantity,
    onSuccess: () => {
      updateQuantity(productId, quantity)
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      toast.success("Item quantity updated")
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.")
    },
  })
}
