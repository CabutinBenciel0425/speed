import axios from "@/lib/axios"
import type { Cart } from "../types/cart"
import { useCartStore } from "@/store/cartStore"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export const itemToggleQuantity = async ({
  quantity,
  productId,
}: {
  quantity: number
  productId: string
}): Promise<Cart> => {
  const { data } = await axios.post("/cart/toggle-quantity", {
    quantity,
    productId,
  })
  return data.data
}

export const useItemToggleQuantity = () => {
  const { updateQuantity, setCart } = useCartStore()
  return useMutation({
    mutationFn: itemToggleQuantity,
    onMutate: (variables) => {
      updateQuantity(variables.productId, variables.quantity)
    },
    onSuccess: (data) => {
      setCart(data)

      toast.success("Item quantity updated")
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.")
    },
  })
}
